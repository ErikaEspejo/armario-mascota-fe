'use client'

import { useState } from 'react'
import { FilteredItem } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { LazyImage } from '@/components/common/LazyImage'
import { BACKEND_BASE_URL } from '@/lib/constants'
import { DECORATION_COLORS, BUSO_TYPES } from '@/lib/decoration-constants'
import { QuantitySelector } from './QuantitySelector'
import { ShoppingCart, Loader2 } from 'lucide-react'

interface CustomProductCardProps {
  item: FilteredItem
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

// Filtrar solo los tipos de buso permitidos
const ALLOWED_HOODIE_TYPES = BUSO_TYPES.filter(
  type => type === 'Buso Estándar' || type === 'Buso Tipo Esqueleto'
)

export function CustomProductCard({
  item,
  activeReservedOrderId,
  onAddToCart,
  onSelectCart,
}: CustomProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [primaryColor, setPrimaryColor] = useState<string>('')
  const [secondaryColor, setSecondaryColor] = useState<string>('')
  const [hoodieType, setHoodieType] = useState<string>('')
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

    if (!primaryColor || !secondaryColor || !hoodieType) {
      return
    }

    setAddingToCart(true)
    try {
      await onAddToCart(
        activeReservedOrderId,
        item.id,
        quantity,
        primaryColor,
        secondaryColor,
        hoodieType
      )
    } catch {
      // Error handling is done in parent component
    } finally {
      setAddingToCart(false)
    }
  }

  const canAddToCart =
    activeReservedOrderId &&
    quantity > 0 &&
    available > 0 &&
    primaryColor &&
    secondaryColor &&
    hoodieType

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
        <div className="space-y-3">
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

            <div className="space-y-2">
              <Label className="text-sm">Color Principal</Label>
              <Select value={primaryColor} onValueChange={setPrimaryColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar color" />
                </SelectTrigger>
                <SelectContent>
                  {DECORATION_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Color Secundario</Label>
              <Select value={secondaryColor} onValueChange={setSecondaryColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar color" />
                </SelectTrigger>
                <SelectContent>
                  {DECORATION_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Tipo de Buso</Label>
              <Select value={hoodieType} onValueChange={setHoodieType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_HOODIE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart || addingToCart}
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

