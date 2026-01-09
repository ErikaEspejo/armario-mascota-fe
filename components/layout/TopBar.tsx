'use client'

import { ThemeToggle } from './ThemeToggle'
import { PingButton } from '@/components/common/PingButton'

export function TopBar() {
  return (
    <header className="hidden md:flex h-16 items-center justify-end px-6 border-b bg-background sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <PingButton />
        <ThemeToggle />
        <span className="text-sm text-muted-foreground">Usuario</span>
      </div>
    </header>
  )
}

