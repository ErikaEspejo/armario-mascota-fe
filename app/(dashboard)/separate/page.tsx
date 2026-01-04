'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { SeparatedOrderCard } from '@/components/orders/SeparatedOrderCard'
import { SeparatedOrderDetailModal } from '@/components/orders/SeparatedOrderDetailModal'
import { BusosBySizeModal } from '@/components/orders/BusosBySizeModal'
import { EditReservedOrderModal } from '@/components/orders/EditReservedOrderModal'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ReservedOrder, ReservedOrderItem } from '@/types'
import { getSeparatedOrders, cancelReservedOrder } from '@/services/api/reserved-orders'
import { toast } from 'sonner'
import { ShoppingBag, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type StatusFilter = 'reserved' | 'canceled' | 'completed' | 'all'
type OrderTypeFilter = 'Detal' | 'Mayorista' | 'all'
type SortOrder = 'asc' | 'desc' | null

export default function SeparateOrderPage() {
  const [orders, setOrders] = useState<ReservedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ReservedOrder | null>(null)
  const [selectedItem, setSelectedItem] = useState<ReservedOrderItem | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [busosModalOpen, setBusosModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState<ReservedOrder | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<ReservedOrder | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderTypeFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [allOrders, setAllOrders] = useState<ReservedOrder[]>([])

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  useEffect(() => {
    // Aplicar filtros y ordenamiento cuando cambian orderTypeFilter, sortOrder o allOrders
    applyFiltersAndSorting()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTypeFilter, sortOrder, allOrders])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const filterStatus = statusFilter === 'all' ? undefined : statusFilter
      const separatedOrders = await getSeparatedOrders(filterStatus)
      
      setAllOrders(separatedOrders)
    } catch (error) {
      console.error('Error loading separated orders:', error)
      toast.error(error instanceof Error ? error.message : 'Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSorting = () => {
    let filtered = [...allOrders]
    
    // Aplicar filtro de tipo de pedido (frontend)
    if (orderTypeFilter !== 'all') {
      filtered = filtered.filter(order => {
        const orderType = order.orderType
        
        // Si no tiene orderType, no coincide
        if (!orderType) {
          return false
        }
        
        // Comparación exacta
        return orderType === orderTypeFilter
      })
    }
    
    // Aplicar ordenamiento
    const sorted = applySorting(filtered)
    
    setOrders(sorted)
  }

  const applySorting = (ordersToSort: ReservedOrder[]): ReservedOrder[] => {
    const sorted = [...ordersToSort]
    
    if (sortOrder) {
      // Ordenar por fecha
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      })
    } else {
      // Ordenar por defecto: primero reserved, luego canceled, luego completed
      const statusOrder: Record<string, number> = {
        reserved: 0,
        canceled: 1,
        completed: 2,
      }
      
      sorted.sort((a, b) => {
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
      })
    }
    
    return sorted
  }

  const handleSortToggle = () => {
    if (sortOrder === null) {
      setSortOrder('desc') // Primero más recientes
    } else if (sortOrder === 'desc') {
      setSortOrder('asc') // Más antiguos primero
    } else {
      setSortOrder(null) // Sin ordenamiento
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

  const handleEdit = (order: ReservedOrder) => {
    setOrderToEdit(order)
    setEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    loadOrders()
  }

  const handleOrderTypeFilterChange = (value: string) => {
    setOrderTypeFilter(value as OrderTypeFilter)
  }

  const handleCancel = (order: ReservedOrder) => {
    setOrderToCancel(order)
    setCancelDialogOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return

    try {
      await cancelReservedOrder(orderToCancel.id)
      toast.success('Pedido cancelado exitosamente')
      loadOrders()
    } catch (error) {
      console.error('Error canceling order:', error)
      toast.error(error instanceof Error ? error.message : 'Error al cancelar el pedido')
    } finally {
      setCancelDialogOpen(false)
      setOrderToCancel(null)
    }
  }

  return (
    <div>
      <Header title="Pedidos" />
      
      {/* Filtros y controles */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter" className="whitespace-nowrap">Filtrar por estado:</Label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger id="status-filter" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="reserved">Reservados</SelectItem>
                <SelectItem value="canceled">Cancelados</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="order-type-filter" className="whitespace-nowrap">Filtrar por tipo:</Label>
            <Select 
              value={orderTypeFilter} 
              onValueChange={handleOrderTypeFilterChange}
            >
              <SelectTrigger id="order-type-filter" className="w-[180px]">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Detal">Detal</SelectItem>
                <SelectItem value="Mayorista">Mayorista</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={handleSortToggle}
          className="w-full sm:w-auto"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {sortOrder === null && 'Ordenar por fecha'}
          {sortOrder === 'desc' && 'Más recientes primero'}
          {sortOrder === 'asc' && 'Más antiguos primero'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No hay pedidos"
          description="No se encontraron pedidos con los filtros seleccionados"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <SeparatedOrderCard
              key={order.id}
              order={order}
              onViewDetail={handleViewDetail}
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

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

      <EditReservedOrderModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        order={orderToEdit}
        onSuccess={handleEditSuccess}
      />

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancelar pedido"
        description={`¿Estás seguro de que deseas cancelar el pedido #${orderToCancel?.id}? Esta acción no se puede deshacer.`}
        confirmText="Cancelar pedido"
        cancelText="No cancelar"
        onConfirm={handleConfirmCancel}
        variant="destructive"
      />
    </div>
  )
}
