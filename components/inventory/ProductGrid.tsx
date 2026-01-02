'use client'

import { FilteredItem } from '@/types'
import { ProductCard } from './ProductCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Package } from 'lucide-react'

interface ProductGridProps {
  items: FilteredItem[]
  activeReservedOrderId: number | null
  onAddToCart: (orderId: number, itemId: number, qty: number) => Promise<void>
  onSelectCart: () => void
}

export function ProductGrid({ items, activeReservedOrderId, onAddToCart, onSelectCart }: ProductGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No se encontraron productos"
        description="Intenta ajustar los filtros de búsqueda"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <ProductCard
          key={`${item.id}-${item.sku}`}
          item={item}
          activeReservedOrderId={activeReservedOrderId}
          onAddToCart={onAddToCart}
          onSelectCart={onSelectCart}
        />
      ))}
    </div>
  )
}

