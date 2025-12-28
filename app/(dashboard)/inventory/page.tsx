'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
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

function InventoryContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { products, loading: contextLoading } = useApp()
  const { addItem } = useCart()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [activeFilters, setActiveFilters] = useState<FilterState>({})

  // Apply filters locally on products
  const applyFilters = useCallback((productsToFilter: Product[], filters: FilterState): Product[] => {
    let filtered = [...productsToFilter]

    if (filters.size) {
      filtered = filtered.filter(p =>
        p.variants.some(v => v.size === filters.size)
      )
    }

    if (filters.color) {
      filtered = filtered.filter(p =>
        p.variants.some(v => v.color.toLowerCase() === filters.color?.toLowerCase())
      )
    }

    if (filters.onlyAvailable) {
      filtered = filtered.filter(p => {
        return p.variants.some(v => v.stockTotal - v.stockReserved > 0)
      })
    }

    if (filters.lowStock) {
      filtered = filtered.filter(p => {
        return p.variants.some(v => v.stockTotal - v.stockReserved <= 5)
      })
    }

    return filtered
  }, [])

  // Load and filter products when dependencies change
  useEffect(() => {
    if (contextLoading) return

    const loadAndFilter = async () => {
      setLoading(true)
      try {
        // First, get base products (search or all)
        let baseProducts: Product[]
        if (searchQuery.trim()) {
          baseProducts = await productService.searchProducts(searchQuery)
        } else {
          baseProducts = products.length > 0 ? products : await productService.getProducts()
        }

        // Then apply filters locally
        const hasFilters = Object.values(activeFilters).some(v => v !== undefined && v !== false)
        if (hasFilters) {
          const filtered = applyFilters(baseProducts, activeFilters)
          setFilteredProducts(filtered)
        } else {
          setFilteredProducts(baseProducts)
        }
      } catch (error) {
        console.error('Error loading products:', error)
        toast.error('Error al cargar productos')
      } finally {
        setLoading(false)
      }
    }

    loadAndFilter()
  }, [searchQuery, contextLoading, products, activeFilters, applyFilters])

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

  const handleFilterChange = useCallback((filters: FilterState) => {
    setActiveFilters(filters)
  }, [])

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
      <InventoryContent />
    </Suspense>
  )
}

