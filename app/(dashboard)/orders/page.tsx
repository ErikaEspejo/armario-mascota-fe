'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Header } from '@/components/layout/Header'
import { OrderCard } from '@/components/orders/OrderCard'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Order } from '@/types'
import * as orderService from '@/services/mock/orders'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'

export default function OrdersPage() {
  const router = useRouter()
  const { orders, loading, refreshOrders, updateOrder } = useApp()
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)

  useEffect(() => {
    filterOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, statusFilter])

  const filterOrders = async () => {
    try {
      const filters: { status?: Order['status'] } = {}
      if (statusFilter !== 'all') {
        filters.status = statusFilter as Order['status']
      }
      const result = await orderService.filterOrders(filters)
      setFilteredOrders(result)
    } catch (error) {
      console.error('Error filtering orders:', error)
    }
  }

  const handleSell = (order: Order) => {
    router.push(`/sell?orderId=${order.id}`)
  }

  const handleCancel = (order: Order) => {
    setOrderToCancel(order)
    setCancelDialogOpen(true)
  }

  const confirmCancel = async () => {
    if (!orderToCancel) return
    try {
      await orderService.cancelOrder(orderToCancel.id)
      updateOrder(orderToCancel.id, { status: 'cancelled' })
      await refreshOrders()
      toast.success('Pedido cancelado')
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Error al cancelar el pedido')
    }
    setCancelDialogOpen(false)
    setOrderToCancel(null)
  }

  if (loading) {
    return (
      <div>
        <Header title="Pedidos Separados" />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Pedidos Separados" />
      <div className="space-y-6">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold mb-2">Pedidos Separados</h1>
          <p className="text-muted-foreground mb-6">
            Gestiona los pedidos reservados
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="reserved">Reservado</SelectItem>
              <SelectItem value="expired">Expirado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No hay pedidos"
            description="Aún no hay pedidos separados"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSell={handleSell}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}

        <ConfirmDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          title="Cancelar Pedido"
          description="¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer."
          confirmText="Cancelar Pedido"
          cancelText="Mantener"
          onConfirm={confirmCancel}
          variant="destructive"
        />
      </div>
    </div>
  )
}

