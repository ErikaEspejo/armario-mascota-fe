'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ADMIN_API_BASE_URL } from '@/lib/constants'
import { Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PingButtonProps {
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'icon'
}

export function PingButton({ className, variant = 'ghost', size = 'icon' }: PingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePing = async () => {
    setIsLoading(true)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos de timeout

    try {
      // Construir URL correctamente manejando slashes
      const pingUrl = new URL('/ping', ADMIN_API_BASE_URL).toString()
      
      const response = await fetch(pingUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        toast.success('Servicio activado')
      } else {
        toast.error(`Servicio no disponible (${response.status})`)
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Tiempo de espera agotado')
      } else {
        toast.error('Servicio no disponible')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePing}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={cn(className)}
      aria-label="Verificar estado del servicio"
      title="Verificar estado del servicio"
    >
      <Activity className={cn('h-4 w-4', isLoading && 'animate-pulse')} />
      {size !== 'icon' && (
        <span className="ml-2">{isLoading ? 'Verificando...' : 'Ping'}</span>
      )}
    </Button>
  )
}

