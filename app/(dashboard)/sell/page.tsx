'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import { PaymentMethod, OrderItem } from '@/types'
import * as orderService from '@/services/mock/orders'
import * as saleService from '@/services/mock/sales'
import * as catalogService from '@/services/mock/catalogs'
import { DollarSign } from 'lucide-react'
import { toast } from 'sonner'

function SellPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { orders, addSale, addCatalog, refreshOrders, refreshSales, refreshCatalogs } = useApp()
  const [orderId] = useState<string | null>(searchParams.get('orderId'))
  const [items, setItems] = useState<OrderItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [shipping, setShipping] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  useEffect(() => {
    if (orderId) {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        setItems(order.items)
      }
    }
  }, [orderId, orders])

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const total = subtotal - discount + shipping

  const handleConfirm = async () => {
    if (items.length === 0) {
      toast.error('No hay items para vender')
      return
    }

    setLoading(true)
    try {
      // Create sale
      const sale = await saleService.createSale({
        orderId: orderId || undefined,
        items,
        paymentMethod,
        shipping,
        discount: discount > 0 ? discount : undefined,
      })
      addSale(sale)

      // Update order status if exists
      if (orderId) {
        await orderService.updateOrderStatus(orderId, 'sold')
        await refreshOrders()
      }

      // Generate catalog
      const catalog = await catalogService.createCatalog(sale.id, 'v1')
      addCatalog(catalog)

      await Promise.all([refreshSales(), refreshCatalogs()])

      toast.success('Venta confirmada exitosamente')
      router.push(`/sales/${sale.id}`)
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error('Error al confirmar la venta')
    } finally {
      setLoading(false)
      setConfirmDialogOpen(false)
    }
  }

  return (
    <div>
      <Header title="Vender" />
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Items a Vender</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay items seleccionados. {orderId ? 'El pedido está vacío.' : 'Agrega items desde el inventario.'}
              </p>
            ) : (
              items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.size} - {item.color}
                    </p>
                    <p className="text-sm">
                      {item.quantity} × {formatCurrency(item.price)} = {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de Pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shipping">Envío (ARS)</Label>
              <Input
                id="shipping"
                type="number"
                min="0"
                value={shipping}
                onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Descuento (ARS)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max={subtotal}
                value={discount}
                onChange={(e) => setDiscount(Math.min(parseFloat(e.target.value) || 0, subtotal))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Descuento:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            {shipping > 0 && (
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
            )}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => setConfirmDialogOpen(true)}
            disabled={items.length === 0 || loading}
            className="flex-1"
            size="lg"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Confirmar Venta
          </Button>
        </div>

        <ConfirmDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          title="Confirmar Venta"
          description={`¿Estás seguro de que deseas confirmar esta venta por ${formatCurrency(total)}?`}
          confirmText="Confirmar"
          cancelText="Cancelar"
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  )
}

export default function SellPage() {
  return (
    <Suspense fallback={
      <div>
        <Header title="Vender" />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    }>
      <SellPageContent />
    </Suspense>
  )
}

