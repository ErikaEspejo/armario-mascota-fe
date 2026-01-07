'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLabel && (
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {isDark ? 'Oscuro' : 'Claro'}
        </span>
      )}
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <Switch
          checked={isDark}
          onCheckedChange={handleToggle}
          aria-label="Cambiar tema"
        />
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}

