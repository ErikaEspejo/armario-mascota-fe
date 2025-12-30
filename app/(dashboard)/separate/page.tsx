'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useApp } from '@/context/AppContext'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/common/EmptyState'
import { formatCurrency } from '@/lib/utils'
import * as orderService from '@/services/mock/orders'
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function SeparateOrderPage() {
  const router = useRouter()
  const { items, customerName, phone, notes, reservationHours, updateQuantity, removeItem, updateCustomer, updateReservationHours, clearCart, getTotal } = useCart()
  const { addOrder, refreshOrders } = useApp()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('El carrito está vacío')
      return
    }
    if (!customerName || !phone) {
      toast.error('Completa los datos del cliente')
      return
    }

    setLoading(true)
    try {
      const order = await orderService.createOrder({
        customerName,
        phone,
        notes,
        items,
        reservationHours,
      })
      addOrder(order)
      await refreshOrders()
      clearCart()
      toast.success('Pedido separado exitosamente')
      router.push('/orders')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Error al crear el pedido')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div>
        <Header title="Separar Pedido" />
        <EmptyState
          icon={ShoppingCart}
          title="Carrito vacío"
          description="Agrega productos desde el inventario"
          action={
            <Button onClick={() => router.push('/inventory')}>
              Ir al Inventario
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <Header title="Separar Pedido" />
      <div className="max-w-4xl mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {item.productImageUrl && (
                    <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={item.productImageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.size} - {item.color}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(item.price)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.productId, item.variantId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(getTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nombre del Cliente *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => updateCustomer(e.target.value, phone)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => updateCustomer(customerName, e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => updateCustomer(customerName, phone, e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reservationHours">Tiempo de Reserva</Label>
                <Select
                  value={reservationHours.toString()}
                  onValueChange={(value) => updateReservationHours(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 horas</SelectItem>
                    <SelectItem value="48">48 horas</SelectItem>
                    <SelectItem value="72">72 horas</SelectItem>
                    <SelectItem value="168">1 semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/inventory')}
              className="flex-1"
            >
              Agregar Más Productos
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Separando...' : 'Separar Pedido'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

