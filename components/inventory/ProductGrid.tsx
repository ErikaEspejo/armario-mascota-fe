'use client'

import { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Package } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  onAddToOrder?: (product: Product) => void
}

export function ProductGrid({ products, onAddToOrder }: ProductGridProps) {
  if (products.length === 0) {
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
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToOrder={onAddToOrder}
        />
      ))}
    </div>
  )
}

