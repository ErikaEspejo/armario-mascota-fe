'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Filter } from 'lucide-react'

interface CustomProductFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  size?: string
}

const SIZES = ['Mini', 'Intermedio', 'XS', 'S', 'M', 'L', 'XL'] as const

export function CustomProductFilters({ onFilterChange }: CustomProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({})

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
  }

  const handleFilter = () => {
    onFilterChange(filters)
  }

  const hasAnyFilter = Object.values(filters).some(v => v !== undefined && v !== '')

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
      </div>
    </div>
  )
}

