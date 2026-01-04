'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DECORATION_COLORS, BUSO_TYPES } from '@/lib/decoration-constants'
import { X, Filter, Search } from 'lucide-react'

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void
  onDescriptionSearch?: (searchText: string) => void
}

export interface FilterState {
  size?: string
  primaryColor?: string
  secondaryColor?: string
  hoodieType?: string
  descriptionSearch?: string
}

const SIZES = ['Mini', 'Intermedio', 'XS', 'S', 'M', 'L', 'XL'] as const

export function ProductFilters({ onFilterChange, onDescriptionSearch }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({})
  const [descriptionSearch, setDescriptionSearch] = useState('')
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const updateFilter = (key: keyof FilterState, value: string) => {
    // Si el valor es '__clear__', lo tratamos como undefined para limpiar el filtro
    if (value === '__clear__') {
      setFilters(prev => {
        const newFilters = { ...prev }
        delete newFilters[key]
        return newFilters
      })
    } else {
      setFilters(prev => ({ ...prev, [key]: value }))
    }
  }

  const clearFilters = () => {
    setFilters({})
    setDescriptionSearch('')
  }

  const handleFilter = () => {
    onFilterChange(filters)
  }

  // Manejar búsqueda de descripción con debounce
  useEffect(() => {
    // Limpiar timer anterior si existe
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Si hay texto de búsqueda, aplicar después de 300ms
    if (descriptionSearch.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        if (onDescriptionSearch) {
          onDescriptionSearch(descriptionSearch.trim())
        }
      }, 300)
    } else {
      // Si está vacío, aplicar inmediatamente para limpiar
      if (onDescriptionSearch) {
        onDescriptionSearch('')
      }
    }

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [descriptionSearch, onDescriptionSearch])

  const handleDescriptionSearchChange = (value: string) => {
    setDescriptionSearch(value)
  }

  const hasAnyFilter = Object.values(filters).some(v => v !== undefined && v !== '') || descriptionSearch.trim() !== ''

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtros</h3>
        {hasAnyFilter && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      {!hasAnyFilter && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Se requiere al menos un filtro para mostrar resultados
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2 flex-1 min-w-[150px]">
          <Label>Talla</Label>
          <Select
            value={filters.size || undefined}
            onValueChange={(value) => updateFilter('size', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar talla" />
            </SelectTrigger>
            <SelectContent>
              {filters.size && (
                <SelectItem value="__clear__">
                  <span className="text-muted-foreground">Limpiar selección</span>
                </SelectItem>
              )}
              {SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-1 min-w-[150px]">
          <Label>Color Principal</Label>
          <Select
            value={filters.primaryColor || undefined}
            onValueChange={(value) => updateFilter('primaryColor', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar color" />
            </SelectTrigger>
            <SelectContent>
              {filters.primaryColor && (
                <SelectItem value="__clear__">
                  <span className="text-muted-foreground">Limpiar selección</span>
                </SelectItem>
              )}
              {DECORATION_COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-1 min-w-[150px]">
          <Label>Color Secundario</Label>
          <Select
            value={filters.secondaryColor || undefined}
            onValueChange={(value) => updateFilter('secondaryColor', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar color" />
            </SelectTrigger>
            <SelectContent>
              {filters.secondaryColor && (
                <SelectItem value="__clear__">
                  <span className="text-muted-foreground">Limpiar selección</span>
                </SelectItem>
              )}
              {DECORATION_COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-1 min-w-[150px]">
          <Label>Tipo de Buso</Label>
          <Select
            value={filters.hoodieType || undefined}
            onValueChange={(value) => updateFilter('hoodieType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {filters.hoodieType && (
                <SelectItem value="__clear__">
                  <span className="text-muted-foreground">Limpiar selección</span>
                </SelectItem>
              )}
              {BUSO_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

          <div className="space-y-2">
            <Label className="opacity-0">Filtrar</Label>
            <Button
              onClick={handleFilter}
              disabled={!hasAnyFilter}
              className="min-w-[100px]"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Buscar por descripción</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder="Escribe para buscar en las descripciones..."
              value={descriptionSearch}
              onChange={(e) => handleDescriptionSearchChange(e.target.value)}
              onInput={(e) => handleDescriptionSearchChange((e.target as HTMLInputElement).value)}
              className="pl-9 w-full"
              style={{ WebkitAppearance: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

