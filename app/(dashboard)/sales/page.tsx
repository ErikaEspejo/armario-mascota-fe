'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { SaleItem, ReservedOrder, ReservedOrderItem } from '@/types'
import { getSales } from '@/services/api/sales'
import { getReservedOrderById } from '@/services/api/reserved-orders'
import { SalesDetailModal } from '@/components/orders/SalesDetailModal'
import { BusosBySizeModal } from '@/components/orders/BusosBySizeModal'
import { DollarSign, Eye } from 'lucide-react'
import { toast } from 'sonner'

export default function SalesPage() {
  const [sales, setSales] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<ReservedOrder | null>(null)
  const [selectedItem, setSelectedItem] = useState<ReservedOrderItem | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [busosModalOpen, setBusosModalOpen] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(false)

  useEffect(() => {
    loadSales()
  }, [dateFrom, dateTo])

  const loadSales = async () => {
    setLoading(true)
    try {
      const salesData = await getSales(dateFrom || undefined, dateTo || undefined)
      setSales(salesData)
    } catch (error) {
      console.error('Error loading sales:', error)
      toast.error(error instanceof Error ? error.message : 'Error al cargar las ventas')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (sale: SaleItem) => {
    setLoadingOrder(true)
    setDetailModalOpen(true)
    try {
      const order = await getReservedOrderById(sale.reservedOrderId)
      setSelectedOrder(order)
    } catch (error) {
      console.error('Error loading order details:', error)
      toast.error(error instanceof Error ? error.message : 'Error al cargar los detalles del pedido')
      setDetailModalOpen(false)
    } finally {
      setLoadingOrder(false)
    }
  }

  const handleViewBusos = (item: ReservedOrderItem) => {
    setSelectedItem(item)
    setBusosModalOpen(true)
  }

  const paymentMethodLabels: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    other: 'Otro',
  }

  const formatSaleDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div>
      <Header title="Ventas" />
      <div className="space-y-6">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold mb-2">Historial de Ventas</h1>
          <p className="text-muted-foreground mb-6">
            Revisa todas las ventas realizadas
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Desde</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Hasta</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : sales.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No hay ventas"
            description="Aún no se han registrado ventas"
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Valor Pagado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Destino</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Método de Pago</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale, index) => (
                      <tr
                        key={sale.id}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-muted/50'}
                      >
                        <td className="px-4 py-3 text-sm">{formatSaleDate(sale.soldAt)}</td>
                        <td className="px-4 py-3 text-sm font-medium">{sale.customerName}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          {formatCurrency(sale.amountPaid)}
                        </td>
                        <td className="px-4 py-3 text-sm">{sale.paymentDestination}</td>
                        <td className="px-4 py-3 text-sm">
                          {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(sale)}
                            disabled={loadingOrder}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <SalesDetailModal
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

