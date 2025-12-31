'use client'

import * as React from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import * as SelectPrimitive from '@radix-ui/react-select'

interface ComboboxProps {
  value?: string
  onValueChange: (value: string | undefined) => void
  options: readonly string[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  allowClear?: boolean
  clearLabel?: string
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = 'Seleccione una opción',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No se encontraron resultados',
  allowClear = false,
  clearLabel = 'Todos',
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options
    const query = searchQuery.toLowerCase()
    return options.filter(option => option.toLowerCase().includes(query))
  }, [options, searchQuery])

  const selectedOption = options.find(opt => opt === value)
  
  // Valor especial para limpiar selección
  const CLEAR_VALUE = '__CLEAR__'

  const handleValueChange = (newValue: string) => {
    if (newValue === CLEAR_VALUE) {
      onValueChange(undefined)
    } else {
      onValueChange(newValue)
    }
  }

  return (
    <SelectPrimitive.Root
      value={value ? value : undefined}
      onValueChange={handleValueChange}
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          setSearchQuery('')
        }
      }}
    >
      <SelectPrimitive.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            'w-full justify-between h-10',
            !value && 'text-muted-foreground'
          )}
        >
          <span className="truncate">
            {selectedOption || placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
          position="popper"
        >
          <div className="p-2 border-b" onPointerDown={(e) => e.preventDefault()}>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  e.stopPropagation()
                  setSearchQuery(e.target.value)
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="pl-8 h-8"
                autoFocus
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key === 'Escape') {
                    setOpen(false)
                  }
                  // Prevenir que Enter cierre el dropdown
                  if (e.key === 'Enter' && filteredOptions.length > 0) {
                    e.preventDefault()
                    onValueChange(filteredOptions[0])
                    setOpen(false)
                    setSearchQuery('')
                  }
                }}
              />
            </div>
          </div>
          <SelectPrimitive.Viewport className="p-1">
            {allowClear && (
              <SelectPrimitive.Item
                value={CLEAR_VALUE}
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground',
                  !value && 'bg-accent'
                )}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{clearLabel}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            )}
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <SelectPrimitive.Item
                  key={option}
                  value={option}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground',
                    value === option && 'bg-accent'
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

