'use client'

import { useState } from 'react'
import { FilteredItem } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { LazyImage } from '@/components/common/LazyImage'
import { BACKEND_BASE_URL } from '@/lib/constants'
import { QuantitySelector } from './QuantitySelector'
import { ShoppingCart, Loader2 } from 'lucide-react'

interface ProductCardProps {
  item: FilteredItem
  activeReservedOrderId: number | null
  onAddToCart: (orderId: number, itemId: number, qty: number) => Promise<void>
  onSelectCart: () => void
}

export function ProductCard({ item, activeReservedOrderId, onAddToCart, onSelectCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const available = item.stockTotal - item.stockReserved
  
  // Handle relative image URLs by prepending backend base URL if needed
  const imageUrl = item.imageUrl.startsWith('http') 
    ? item.imageUrl 
    : `${BACKEND_BASE_URL}${item.imageUrl}`

  // Mapear códigos de talla a nombres legibles
  const getDisplaySize = (size: string): string => {
    if (size === 'MN') return 'Mini'
    if (size === 'IT') return 'Intermedio'
    return size
  }

  const displaySize = getDisplaySize(item.size)

  const handleAddToCart = async () => {
    if (!activeReservedOrderId) {
      onSelectCart()
      return
    }

    if (quantity <= 0) {
      return
    }

    setAddingToCart(true)
    try {
      await onAddToCart(activeReservedOrderId, item.id, quantity)
    } catch {
      // Error handling is done in parent component
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative w-full h-48 bg-muted">
        <LazyImage
          src={imageUrl}
          alt={item.description || item.sku}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <h3 className="font-semibold text-base">{item.sku}</h3>
        <p className="text-xs text-muted-foreground">{item.description || 'Sin descripción'}</p>
        <p className="text-sm text-muted-foreground">Talla: {displaySize}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Disponible:</span>
            <span className={`font-semibold ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {available}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Reservado:</span>
            <span>{item.stockReserved}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span>{item.stockTotal}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Precio:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(item.price)}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cantidad:</span>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={available > 0 ? available : undefined}
                disabled={addingToCart || available === 0}
              />
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={addingToCart || available === 0 || quantity <= 0}
              className="w-full"
              size="sm"
            >
              {addingToCart ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Agregando...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar al carrito
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

