'use client'

import { useState, Suspense, useCallback, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { ProductGrid } from '@/components/inventory/ProductGrid'
import { ProductFilters, FilterState } from '@/components/inventory/ProductFilters'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { FilteredItem } from '@/types'
import { filterItems } from '@/services/api/items'
import { toast } from 'sonner'
import { Filter } from 'lucide-react'

function InventoryPageContent() {
  const [filteredItems, setFilteredItems] = useState<FilteredItem[]>([])
  const [allItems, setAllItems] = useState<FilteredItem[]>([]) // Almacenar todos los items filtrados por API
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [descriptionSearch, setDescriptionSearch] = useState('')
  const allItemsRef = useRef<FilteredItem[]>([])
  
  // Mantener allItemsRef actualizado
  useEffect(() => {
    allItemsRef.current = allItems
  }, [allItems])

  const handleFilterChange = async (filters: FilterState) => {
    setLoading(true)
    setHasSearched(true)
    try {
      const result = await filterItems({
        size: filters.size,
        primaryColor: filters.primaryColor,
        secondaryColor: filters.secondaryColor,
        hoodieType: filters.hoodieType,
      })
      setAllItems(result)
      // Aplicar filtro de descripción si existe
      applyDescriptionFilter(result, descriptionSearch)
    } catch (error) {
      console.error('Error filtering items:', error)
      toast.error('Error al filtrar productos. Intenta nuevamente.')
      setAllItems([])
      setFilteredItems([])
    } finally {
      setLoading(false)
    }
  }

  const applyDescriptionFilter = useCallback((items: FilteredItem[], searchText: string) => {
    let filtered = items
    
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase().trim()
      filtered = items.filter(item =>
        item.description?.toLowerCase().includes(lowerSearch) ||
        item.sku?.toLowerCase().includes(lowerSearch)
      )
    }

    // Ordenar por talla según el orden especificado
    const sizeOrder: Record<string, number> = {
      'MN': 1,
      'IT': 2,
      'XS': 3,
      'S': 4,
      'M': 5,
      'L': 6,
    }

    const sortedItems = [...filtered].sort((a, b) => {
      const orderA = sizeOrder[a.size] ?? 999
      const orderB = sizeOrder[b.size] ?? 999

      // Si ambas tallas están en el orden definido, ordenar por ese orden
      if (orderA !== 999 && orderB !== 999) {
        return orderA - orderB
      }

      // Si solo una está en el orden definido, esa va primero
      if (orderA !== 999) return -1
      if (orderB !== 999) return 1

      // Si ninguna está en el orden definido, ordenar alfabéticamente
      return a.size.localeCompare(b.size)
    })

    setFilteredItems(sortedItems)
  }, [])

  const handleDescriptionSearch = useCallback((searchText: string) => {
    setDescriptionSearch(searchText)
    // Si ya hay items cargados, filtrar localmente usando la referencia
    if (allItemsRef.current.length > 0) {
      applyDescriptionFilter(allItemsRef.current, searchText)
    }
    // Si hay texto de búsqueda pero no hay items, marcar como buscado
    if (searchText.trim()) {
      setHasSearched(true)
    }
  }, [applyDescriptionFilter])


  if (loading) {
    return (
      <div>
        <Header title="Inventario" showSearch={false} />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Inventario" showSearch={false} />
      <div className="space-y-6">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold mb-2">Inventario</h1>
          <p className="text-muted-foreground mb-6">
            Gestiona tus productos y stock
          </p>
        </div>

        <ProductFilters 
          onFilterChange={handleFilterChange}
          onDescriptionSearch={handleDescriptionSearch}
        />

        {!hasSearched ? (
          <EmptyState
            icon={Filter}
            title="Se requiere al menos un filtro para mostrar resultados"
            description="Selecciona al menos un filtro y haz clic en 'Filtrar' para ver los productos disponibles"
          />
        ) : (
          <ProductGrid
            items={filteredItems}
          />
        )}
      </div>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div>
        <Header title="Inventario" showSearch />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    }>
      <InventoryPageContent />
    </Suspense>
  )
}

