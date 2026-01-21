/* eslint-disable no-console */
'use client'

import { useEffect, useRef } from 'react'

function isChunkLoadError(err: unknown): boolean {
  const e = err as {
    name?: unknown
    message?: unknown
    toString?: unknown
  }

  const message =
    typeof e?.message === 'string'
      ? e.message
      : typeof e?.toString === 'function'
        ? String(e.toString())
        : ''

  // Common patterns across webpack/Next.js for missing chunk files
  return (
    e?.name === 'ChunkLoadError' ||
    message.includes('ChunkLoadError') ||
    message.includes('Loading chunk') ||
    message.includes('Loading CSS chunk') ||
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed')
  )
}

async function clearCachesAndServiceWorkers(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
  } catch (e) {
    console.warn('[ChunkLoadRecovery] Failed to unregister service workers', e)
  }

  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } catch (e) {
    console.warn('[ChunkLoadRecovery] Failed to clear caches', e)
  }
}

/**
 * When a new deploy happens, users with an older cached app shell (PWA/SW) can
 * attempt to load JS chunks that no longer exist, causing ChunkLoadError + 404s.
 *
 * This component detects that scenario and performs a one-time hard refresh after
 * clearing SW + caches to self-heal.
 */
export function ChunkLoadRecovery() {
  const didRecoverRef = useRef(false)

  useEffect(() => {
    const key = 'chunk-load-recovery-attempted'

    const tryRecover = async () => {
      if (didRecoverRef.current) return
      didRecoverRef.current = true

      // Prevent infinite reload loops (e.g. if the real issue is server-side).
      const attemptedAt = sessionStorage.getItem(key)
      if (attemptedAt) return

      sessionStorage.setItem(key, String(Date.now()))
      await clearCachesAndServiceWorkers()

      // Prefer full reload to re-fetch HTML + manifests.
      window.location.reload()
    }

    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error) || isChunkLoadError(event.message)) {
        void tryRecover()
      }
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        void tryRecover()
      }
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [])

  return null
}


