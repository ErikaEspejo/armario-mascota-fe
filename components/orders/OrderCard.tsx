'use client'

import { useRouter } from 'next/navigation'
import { Order } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Eye, DollarSign, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface OrderCardProps {
  order: Order
  onSell?: (order: Order) => void
  onCancel?: (order: Order) => void
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  reserved: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  sold: 'bg-green-100 text-green-800',
}

const statusLabels = {
  pending: 'Pendiente',
  reserved: 'Reservado',
  expired: 'Expirado',
  cancelled: 'Cancelado',
  sold: 'Vendido',
}

export function OrderCard({ order, onSell, onCancel }: OrderCardProps) {
  const router = useRouter()
  const isExpired = order.expiresAt && new Date(order.expiresAt) < new Date()
  const status = isExpired && order.status !== 'sold' && order.status !== 'cancelled' ? 'expired' : order.status

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{order.customerName}</h3>
            <p className="text-sm text-muted-foreground">{order.phone}</p>
          </div>
          <Badge className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items:</span>
          <span>{order.items.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Fecha:</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        {order.expiresAt && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Expira:</span>
            <span className={isExpired ? 'text-destructive' : ''}>
              {formatDate(order.expiresAt)}
            </span>
          </div>
        )}
        <div className="pt-2 border-t">
          <div className="flex justify-between">
            <span className="font-semibold">Total:</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(order.totals.total)}
            </span>
          </div>
        </div>
        {order.notes && (
          <p className="text-sm text-muted-foreground italic mt-2">
            {order.notes}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className={status === 'reserved' ? "flex-1" : "w-full"}
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Abrir
          </Button>
          {status === 'reserved' && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onSell?.(order)}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Vender
            </Button>
          )}
        </div>
        {status === 'reserved' && (
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onCancel?.(order)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

