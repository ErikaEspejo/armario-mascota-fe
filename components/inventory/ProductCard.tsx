'use client'

import { useRouter } from 'next/navigation'
import { Product } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'

interface ProductCardProps {
  product: Product
  onAddToOrder?: (product: Product) => void
}

export function ProductCard({ product, onAddToOrder }: ProductCardProps) {
  const router = useRouter()
  const available = product.stockTotal - product.stockReserved

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative w-full h-48 bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.subtitle}</p>
        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
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
            <span>{product.stockReserved}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span>{product.stockTotal}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Precio:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => router.push(`/inventory/${product.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalle
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onAddToOrder?.(product)}
          disabled={available === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </CardFooter>
    </Card>
  )
}

