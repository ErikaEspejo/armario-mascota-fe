'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useCart } from '@/context/CartContext'
import { Header } from '@/components/layout/Header'
import { SearchBar } from '@/components/common/SearchBar'
import { ProductGrid } from '@/components/inventory/ProductGrid'
import { ProductFilters, FilterState } from '@/components/inventory/ProductFilters'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Product } from '@/types'
import * as productService from '@/services/mock/products'
import { toast } from 'sonner'

function InventoryPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { products, loading: contextLoading } = useApp()
  const { addItem } = useCart()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  useEffect(() => {
    loadProducts()
  }, [searchQuery])

  const loadProducts = async () => {
    setLoading(true)
    try {
      let result: Product[]
      if (searchQuery.trim()) {
        result = await productService.searchProducts(searchQuery)
      } else {
        result = await productService.getProducts()
      }
      setFilteredProducts(result)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set('search', query.trim())
    } else {
      params.delete('search')
    }
    router.push(`/inventory?${params.toString()}`)
  }

  const handleFilterChange = async (filters: FilterState) => {
    setLoading(true)
    try {
      const result = await productService.filterProducts(filters)
      let filtered = result

      // Apply search query if exists
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase()
        filtered = filtered.filter(
          p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.sku.toLowerCase().includes(lowerQuery) ||
            p.subtitle.toLowerCase().includes(lowerQuery)
        )
      }

      setFilteredProducts(filtered)
    } catch (error) {
      console.error('Error filtering products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToOrder = (product: Product) => {
    // Add first available variant to cart
    const availableVariant = product.variants.find(
      v => v.stockTotal - v.stockReserved > 0
    )

    if (!availableVariant) {
      toast.error('No hay stock disponible para este producto')
      return
    }

    addItem({
      productId: product.id,
      productName: product.name,
      variantId: availableVariant.id,
      size: availableVariant.size,
      color: availableVariant.color,
      quantity: 1,
      price: availableVariant.price,
      subtotal: availableVariant.price,
      productImageUrl: product.imageUrl,
    })

    toast.success('Producto agregado al carrito')
    router.push('/separate')
  }

  if (contextLoading || loading) {
    return (
      <div>
        <Header title="Inventario" showSearch />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Inventario" showSearch />
      <div className="space-y-6">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold mb-2">Inventario</h1>
          <p className="text-muted-foreground mb-6">
            Gestiona tus productos y stock
          </p>
        </div>

        <SearchBar
          onSearch={handleSearch}
          defaultValue={searchQuery}
          className="max-w-2xl"
        />

        <ProductFilters
          products={products}
          onFilterChange={handleFilterChange}
        />

        <ProductGrid
          products={filteredProducts}
          onAddToOrder={handleAddToOrder}
        />
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

