'use client'

import { useState, Suspense, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { CustomProductGrid } from '@/components/inventory/CustomProductGrid'
import { CustomProductFilters, FilterState } from '@/components/inventory/CustomProductFilters'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { SelectCartModal } from '@/components/inventory/SelectCartModal'
import { FilteredItem } from '@/types'
import { filterItems } from '@/services/api/items'
import { addItemToReservedOrder } from '@/services/api/reserved-orders'
import { toast } from 'sonner'
import { Filter, ShoppingCart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEYS = {
  ACTIVE_RESERVED_ORDER_ID: 'activeReservedOrderId',
  ACTIVE_RESERVED_ORDER_LABEL: 'activeReservedOrderLabel',
}

function CustomProductsPageContent() {
  const router = useRouter()
  const [filteredItems, setFilteredItems] = useState<FilteredItem[]>([])
  const [allItems, setAllItems] = useState<FilteredItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const allItemsRef = useRef<FilteredItem[]>([])

  // Reserved order state
  const [activeReservedOrderId, setActiveReservedOrderId] = useState<number | null>(null)
  const [activeReservedOrderLabel, setActiveReservedOrderLabel] = useState<string>('')
  const [selectCartModalOpen, setSelectCartModalOpen] = useState(false)

  // Mantener allItemsRef actualizado
  useEffect(() => {
    allItemsRef.current = allItems
  }, [allItems])

  // Load active reserved order from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_RESERVED_ORDER_ID)
      const storedLabel = localStorage.getItem(STORAGE_KEYS.ACTIVE_RESERVED_ORDER_LABEL)

      if (storedId) {
        const orderId = parseInt(storedId, 10)
        if (!isNaN(orderId)) {
          setActiveReservedOrderId(orderId)
          setActiveReservedOrderLabel(storedLabel || '')
        }
      }
    }
  }, [])

  // Save active reserved order to localStorage
  const saveActiveReservedOrder = useCallback((orderId: number, label: string) => {
    setActiveReservedOrderId(orderId)
    setActiveReservedOrderLabel(label)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_RESERVED_ORDER_ID, orderId.toString())
      localStorage.setItem(STORAGE_KEYS.ACTIVE_RESERVED_ORDER_LABEL, label)
    }
  }, [])

  // Handle cart selection
  const handleSelectCart = useCallback(
    (orderId: number, label: string) => {
      saveActiveReservedOrder(orderId, label)
      setSelectCartModalOpen(false)
    },
    [saveActiveReservedOrder]
  )

  // Handle add to cart with custom fields
  const handleAddToCart = useCallback(
    async (
      orderId: number,
      itemId: number,
      qty: number,
      primaryColor?: string,
      secondaryColor?: string,
      hoodieType?: string
    ) => {
      try {
        await addItemToReservedOrder(orderId, {
          itemId,
          qty,
          primaryColor,
          secondaryColor,
          hoodieType,
          type: 'custom',
        })
        toast.success('Producto agregado al carrito exitosamente')
      } catch (error) {
        console.error('Error adding item to cart:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Error al agregar el producto al carrito'
        )
        throw error
      }
    },
    []
  )

  const handleFilterChange = async (filters: FilterState) => {
    setLoading(true)
    setHasSearched(true)
    try {
      const result = await filterItems({
        size: filters.size,
        type: 'custom',
      })
      setAllItems(result)
      setFilteredItems(result)
    } catch (error) {
      console.error('Error filtering items:', error)
      toast.error('Error al filtrar productos. Intenta nuevamente.')
      setAllItems([])
      setFilteredItems([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Header title="Productos personalizados" />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Productos personalizados" />
      <div className="space-y-6">
        <div className="hidden md:block">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/inventory')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a todos los productos
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Productos personalizados</h1>
          <p className="text-muted-foreground mb-6">
            Selecciona productos y personaliza colores y tipo de buso
          </p>
        </div>

        {/* Mobile back button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/inventory')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>

        {/* Cart selection and active cart indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex-1">
            {activeReservedOrderId ? (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span className="font-semibold">Carrito activo:</span>
                <span className="text-primary">
                  {activeReservedOrderLabel || `#${activeReservedOrderId}`}
                </span>
              </div>
            ) : (
              <div className="text-muted-foreground">No hay carrito activo</div>
            )}
          </div>
          <Button
            onClick={() => setSelectCartModalOpen(true)}
            variant={activeReservedOrderId ? 'outline' : 'default'}
            size="sm"
          >
            {activeReservedOrderId ? 'Cambiar carrito' : 'Seleccionar carrito'}
          </Button>
        </div>

        <CustomProductFilters onFilterChange={handleFilterChange} />

        {!hasSearched ? (
          <EmptyState
            icon={Filter}
            title="Se requiere al menos un filtro para mostrar resultados"
            description="Selecciona una talla y haz clic en 'Filtrar' para ver los productos disponibles"
          />
        ) : (
          <CustomProductGrid
            items={filteredItems}
            activeReservedOrderId={activeReservedOrderId}
            onAddToCart={handleAddToCart}
            onSelectCart={() => setSelectCartModalOpen(true)}
          />
        )}
      </div>

      <SelectCartModal
        open={selectCartModalOpen}
        onOpenChange={setSelectCartModalOpen}
        onSelectCart={handleSelectCart}
      />
    </div>
  )
}

export default function CustomProductsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <Header title="Productos personalizados" />
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      }
    >
      <CustomProductsPageContent />
    </Suspense>
  )
}

