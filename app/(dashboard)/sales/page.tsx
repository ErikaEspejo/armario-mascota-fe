'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Sale } from '@/types'
import * as saleService from '@/services/mock/sales'
import { DollarSign, FileText, Eye } from 'lucide-react'

export default function SalesPage() {
  const router = useRouter()
  const { sales, loading } = useApp()
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [customerName, setCustomerName] = useState('')

  useEffect(() => {
    filterSales()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales, dateFrom, dateTo, customerName])

  const filterSales = async () => {
    try {
      const filters: { dateFrom?: string; dateTo?: string; customerName?: string } = {}
      if (dateFrom) filters.dateFrom = dateFrom
      if (dateTo) filters.dateTo = dateTo
      if (customerName) filters.customerName = customerName

      const result = await saleService.filterSales(filters)
      setFilteredSales(result)
    } catch (error) {
      console.error('Error filtering sales:', error)
    }
  }

  const paymentMethodLabels = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    other: 'Otro',
  }

  if (loading) {
    return (
      <div>
        <Header title="Ventas" />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="customerName">Cliente</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Nombre del cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredSales.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No hay ventas"
            description="Aún no se han registrado ventas"
          />
        ) : (
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <Card key={sale.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Venta #{sale.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(sale.totals.total)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {paymentMethodLabels[sale.paymentMethod]}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground">
                      Items: {sale.items.length}
                    </p>
                    {sale.orderId && (
                      <p className="text-sm text-muted-foreground">
                        Pedido: {sale.orderId}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/sales/${sale.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Mock: Open receipt
                        window.open(`/api/receipts/${sale.id}`, '_blank')
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Comprobante
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

