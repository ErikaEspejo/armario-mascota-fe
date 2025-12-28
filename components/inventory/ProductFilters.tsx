'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Product } from '@/types'
import { X } from 'lucide-react'

interface ProductFiltersProps {
  products: Product[]
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  size?: string
  color?: string
  onlyAvailable?: boolean
  lowStock?: boolean
}

export function ProductFilters({ products, onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({})
  const isInitialMount = React.useRef(true)

  // Extract unique sizes and colors from products
  const sizes = Array.from(
    new Set(products.flatMap(p => p.variants.map(v => v.size)))
  ).sort()

  const colors = Array.from(
    new Set(products.flatMap(p => p.variants.map(v => v.color)))
  ).sort()

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    onFilterChange(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const updateFilter = (key: keyof FilterState, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== false)

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtros</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Talla</Label>
          <Select
            value={filters.size || undefined}
            onValueChange={(value) => updateFilter('size', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las tallas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las tallas</SelectItem>
              {sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <Select
            value={filters.color || undefined}
            onValueChange={(value) => updateFilter('color', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los colores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los colores</SelectItem>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlyAvailable || false}
                onChange={(e) => updateFilter('onlyAvailable', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Solo disponibles</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.lowStock || false}
                onChange={(e) => updateFilter('lowStock', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Bajo stock</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

