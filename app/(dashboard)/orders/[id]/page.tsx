'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Order } from '@/types'
import * as orderService from '@/services/mock/orders'
import { DollarSign, Edit, X, Share2, FileText } from 'lucide-react'
import { toast } from 'sonner'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { updateOrder, refreshOrders } = useApp()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [params.id])

  const loadOrder = async () => {
    if (typeof params.id !== 'string') return
    setLoading(true)
    try {
      const data = await orderService.getOrderById(params.id)
      setOrder(data)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSell = () => {
    router.push(`/sell?orderId=${order?.id}`)
  }

  const handleCancel = async () => {
    if (!order) return
    try {
      await orderService.cancelOrder(order.id)
      updateOrder(order.id, { status: 'cancelled' })
      await refreshOrders()
      toast.success('Pedido cancelado')
      router.push('/orders')
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Error al cancelar el pedido')
    }
    setCancelDialogOpen(false)
  }

  const handleShareQuote = () => {
    // Mock share functionality
    const quoteText = `Cotización - ${order?.customerName}\n\n${order?.items.map(item => 
      `${item.productName} (${item.size} - ${item.color}) x${item.quantity}: ${formatCurrency(item.subtotal)}`
    ).join('\n')}\n\nTotal: ${order ? formatCurrency(order.totals.total) : ''}`
    
    if (navigator.share) {
      navigator.share({
        title: `Cotización - ${order?.customerName}`,
        text: quoteText,
      })
    } else {
      navigator.clipboard.writeText(quoteText)
      toast.success('Cotización copiada al portapapeles')
    }
  }

  if (loading) {
    return (
      <div>
        <Header title="Detalle de Pedido" />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div>
        <Header title="Pedido no encontrado" />
        <EmptyState
          icon={FileText}
          title="Pedido no encontrado"
          description="El pedido que buscas no existe"
        />
      </div>
    )
  }

  const isExpired = order.expiresAt && new Date(order.expiresAt) < new Date()
  const status = isExpired && order.status !== 'sold' && order.status !== 'cancelled' ? 'expired' : order.status
  const canEdit = status === 'reserved' || status === 'pending'

  return (
    <div>
      <Header title="Detalle de Pedido" />
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{order.customerName}</CardTitle>
                <p className="text-muted-foreground mt-1">{order.phone}</p>
              </div>
              <Badge className={`${
                status === 'reserved' ? 'bg-blue-100 text-blue-800' :
                status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                status === 'sold' ? 'bg-green-100 text-green-800' :
                status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {status === 'reserved' ? 'Reservado' :
                 status === 'pending' ? 'Pendiente' :
                 status === 'sold' ? 'Vendido' :
                 status === 'cancelled' ? 'Cancelado' :
                 'Expirado'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Fecha:</span>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              {order.expiresAt && (
                <div>
                  <span className="text-muted-foreground">Expira:</span>
                  <p className={`font-medium ${isExpired ? 'text-destructive' : ''}`}>
                    {formatDate(order.expiresAt)}
                  </p>
                </div>
              )}
            </div>
            {order.notes && (
              <div>
                <span className="text-muted-foreground text-sm">Notas:</span>
                <p className="mt-1">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, index) => (
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
                    Cantidad: {item.quantity} × {formatCurrency(item.price)} = {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(order.totals.subtotal)}</span>
              </div>
              {order.totals.discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Descuento:</span>
                  <span>-{formatCurrency(order.totals.discount)}</span>
                </div>
              )}
              {order.totals.shipping > 0 && (
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>{formatCurrency(order.totals.shipping)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(order.totals.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {canEdit && (
            <>
              <div className="flex gap-4">
                <Button
                  onClick={handleSell}
                  className="flex-1"
                  size="lg"
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  Vender
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/orders/${order.id}/edit`)}
                  className="flex-1"
                  size="lg"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Editar
                </Button>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleShareQuote}
                  className="flex-1"
                  size="lg"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Compartir Cotización
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setCancelDialogOpen(true)}
                  className="flex-1"
                  size="lg"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancelar Separación
                </Button>
              </div>
            </>
          )}
          {!canEdit && (
            <Button
              variant="outline"
              onClick={() => router.push('/orders')}
              className="w-full"
            >
              Volver a Pedidos
            </Button>
          )}
        </div>

        <ConfirmDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          title="Cancelar Separación"
          description="¿Estás seguro de que deseas cancelar esta separación? Esta acción no se puede deshacer."
          confirmText="Cancelar Separación"
          cancelText="Mantener"
          onConfirm={handleCancel}
          variant="destructive"
        />
      </div>
    </div>
  )
}

