'use client'

import { FilteredItem } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { LazyImage } from '@/components/common/LazyImage'
import { BACKEND_BASE_URL } from '@/lib/constants'

interface ProductCardProps {
  item: FilteredItem
}

export function ProductCard({ item }: ProductCardProps) {
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
        </div>
      </CardContent>
    </Card>
  )
}

