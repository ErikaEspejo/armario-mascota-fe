'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { formatCurrency } from '@/lib/utils'
import { Product, ProductVariant } from '@/types'
import * as productService from '@/services/mock/products'
import { ShoppingCart, Minus, Plus, Package } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    if (typeof params.id !== 'string') return
    setLoading(true)
    try {
      const data = await productService.getProductById(params.id)
      if (data) {
        setProduct(data)
        // Select first available variant
        const available = data.variants.find(v => v.stockTotal - v.stockReserved > 0)
        setSelectedVariant(available || data.variants[0] || null)
      }
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return

    const available = selectedVariant.stockTotal - selectedVariant.stockReserved
    if (quantity > available) {
      toast.error(`Solo hay ${available} unidades disponibles`)
      return
    }

    addItem({
      productId: product.id,
      productName: product.name,
      variantId: selectedVariant.id,
      size: selectedVariant.size,
      color: selectedVariant.color,
      quantity,
      price: selectedVariant.price,
      subtotal: selectedVariant.price * quantity,
      productImageUrl: product.imageUrl,
    })

    toast.success('Producto agregado al carrito')
    router.push('/separate')
  }

  if (loading) {
    return (
      <div>
        <Header title="Detalle de Producto" />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div>
        <Header title="Producto no encontrado" />
        <EmptyState
          icon={Package}
          title="Producto no encontrado"
          description="El producto que buscas no existe"
        />
      </div>
    )
  }

  const available = selectedVariant
    ? selectedVariant.stockTotal - selectedVariant.stockReserved
    : 0

  return (
    <div>
      <Header title={product.name} />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-lg text-muted-foreground mb-2">{product.subtitle}</p>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Variantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selecciona una variante:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map((variant) => {
                      const variantAvailable = variant.stockTotal - variant.stockReserved
                      const isSelected = selectedVariant?.id === variant.id
                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          disabled={variantAvailable === 0}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          } ${variantAvailable === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="font-medium">
                            {variant.size} - {variant.color}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Disponible: {variantAvailable}
                          </div>
                          <div className="text-sm font-semibold text-primary mt-1">
                            {formatCurrency(variant.price)}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {selectedVariant && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Cantidad:</span>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.min(available, quantity + 1))}
                          disabled={quantity >= available}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Precio unitario:</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedVariant.price)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-primary">
                          {formatCurrency(selectedVariant.price * quantity)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={available === 0}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Agregar al Pedido
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

