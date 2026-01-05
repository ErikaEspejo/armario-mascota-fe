'use client'

import { useState, useEffect } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionFilters as TransactionFiltersType, Transaction } from '@/types'
import { X } from 'lucide-react'

interface TransactionFiltersProps {
  filters: TransactionFiltersType
  onFiltersChange: (filters: TransactionFiltersType) => void
  transactions: Transaction[]
}

// Mapeo de destinos para mostrar en UI
const mapDestinationToUI = (destination: string): string => {
  if (destination === 'Cash') return 'Efectivo'
  return destination
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  transactions,
}: TransactionFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TransactionFiltersType>(filters)

  // Obtener valores únicos de destino y categoría de las transacciones
  const uniqueDestinations = Array.from(
    new Set((transactions || []).map((t) => t.destination))
  ).sort()

  const uniqueCategories = Array.from(
    new Set((transactions || []).map((t) => t.category).filter(Boolean))
  ).sort()

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilter = (key: keyof TransactionFiltersType, value: string | undefined) => {
    const newFilters = { ...localFilters }
    if (value === '' || value === undefined) {
      delete newFilters[key]
    } else {
      // Type assertion needed because TransactionFiltersType has union types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      newFilters[key] = value as any
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: TransactionFiltersType = {}
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasAnyFilter = Object.keys(localFilters).length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filtros</CardTitle>
          {hasAnyFilter && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtro por tipo */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={localFilters.type || '__all__'}
              onValueChange={(value) => updateFilter('type', value === '__all__' ? undefined : value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                <SelectItem value="income">Ingresos</SelectItem>
                <SelectItem value="expense">Egresos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por fecha desde */}
          <div className="space-y-2">
            <Label htmlFor="from">Desde</Label>
            <Input
              id="from"
              type="date"
              value={localFilters.from || ''}
              onChange={(e) => updateFilter('from', e.target.value || undefined)}
            />
          </div>

          {/* Filtro por fecha hasta */}
          <div className="space-y-2">
            <Label htmlFor="to">Hasta</Label>
            <Input
              id="to"
              type="date"
              value={localFilters.to || ''}
              onChange={(e) => updateFilter('to', e.target.value || undefined)}
            />
          </div>

          {/* Filtro por método de registro */}
          <div className="space-y-2">
            <Label htmlFor="source">Método de Registro</Label>
            <Select
              value={localFilters.source || '__all__'}
              onValueChange={(value) => updateFilter('source', value === '__all__' ? undefined : value)}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="sale">Ventas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por destino */}
          <div className="space-y-2">
            <Label htmlFor="destination">Destino</Label>
            <Select
              value={localFilters.destination || '__all__'}
              onValueChange={(value) => updateFilter('destination', value === '__all__' ? undefined : value)}
            >
              <SelectTrigger id="destination">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                {uniqueDestinations.map((dest) => (
                  <SelectItem key={dest} value={dest}>
                    {mapDestinationToUI(dest)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={localFilters.category || '__all__'}
              onValueChange={(value) => updateFilter('category', value === '__all__' ? undefined : value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

