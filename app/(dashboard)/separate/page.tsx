'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { SeparatedOrderCard } from '@/components/orders/SeparatedOrderCard'
import { SeparatedOrderDetailModal } from '@/components/orders/SeparatedOrderDetailModal'
import { BusosBySizeModal } from '@/components/orders/BusosBySizeModal'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ReservedOrder, ReservedOrderItem } from '@/types'
import { getSeparatedOrders } from '@/services/api/reserved-orders'
import { toast } from 'sonner'
import { ShoppingBag } from 'lucide-react'

export default function SeparateOrderPage() {
  const [orders, setOrders] = useState<ReservedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ReservedOrder | null>(null)
  const [selectedItem, setSelectedItem] = useState<ReservedOrderItem | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [busosModalOpen, setBusosModalOpen] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const separatedOrders = await getSeparatedOrders()
      
      // Ordenar: primero reserved, luego cancelled, luego completed
      const statusOrder: Record<string, number> = {
        reserved: 0,
        cancelled: 1,
        completed: 2,
        expired: 1,
        sold: 2,
      }
      
      const sortedOrders = separatedOrders.sort((a, b) => {
        const statusA = a.status === 'sold' ? 'completed' : a.status
        const statusB = b.status === 'sold' ? 'completed' : b.status
        return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99)
      })
      
      setOrders(sortedOrders)
    } catch (error) {
      console.error('Error loading separated orders:', error)
      toast.error(error instanceof Error ? error.message : 'Error al cargar los pedidos separados')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (order: ReservedOrder) => {
    setSelectedOrder(order)
    setDetailModalOpen(true)
  }

  const handleViewBusos = (item: ReservedOrderItem) => {
    setSelectedItem(item)
    setBusosModalOpen(true)
  }

  if (loading) {
    return (
      <div>
        <Header title="Pedidos separados" />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div>
        <Header title="Pedidos separados" />
        <EmptyState
          icon={ShoppingBag}
          title="No hay pedidos separados"
          description="No se encontraron pedidos separados en el sistema"
        />
      </div>
    )
  }

  return (
    <div>
      <Header title="Pedidos separados" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <SeparatedOrderCard
            key={order.id}
            order={order}
            onViewDetail={handleViewDetail}
          />
        ))}
      </div>

      <SeparatedOrderDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        order={selectedOrder}
        onViewBusos={handleViewBusos}
      />

      <BusosBySizeModal
        open={busosModalOpen}
        onOpenChange={setBusosModalOpen}
        item={selectedItem}
      />
    </div>
  )
}
