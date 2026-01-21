'use client'

import { FilteredItem } from '@/types'
import { CustomProductCard } from './CustomProductCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Package } from 'lucide-react'

interface CustomProductGridProps {
  items: FilteredItem[]
  activeReservedOrderId: number | null
  onAddToCart: (
    orderId: number,
    itemId: number,
    qty: number,
    primaryColor?: string,
    secondaryColor?: string,
    hoodieType?: string
  ) => Promise<void>
  onSelectCart: () => void
}

export function CustomProductGrid({
  items,
  activeReservedOrderId,
  onAddToCart,
  onSelectCart,
}: CustomProductGridProps) {
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
        <CustomProductCard
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

