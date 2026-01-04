'use client'

import { ReservedOrder } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Eye, Pencil, X, DollarSign } from 'lucide-react'

interface SeparatedOrderCardProps {
  order: ReservedOrder
  onViewDetail: (order: ReservedOrder) => void
  onEdit?: (order: ReservedOrder) => void
  onCancel?: (order: ReservedOrder) => void
  onSell?: (order: ReservedOrder) => void
}

const statusColors = {
  reserved: 'bg-yellow-100 text-yellow-800',
  canceled: 'bg-gray-100 text-gray-800',
  completed: 'bg-green-100 text-green-800',
}

const statusLabels = {
  reserved: 'Reservado',
  canceled: 'Cancelado',
  completed: 'Completado',
}

function capitalizeWords(str: string | null | undefined): string {
  if (!str) return 'N/A'
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function SeparatedOrderCard({ order, onViewDetail, onEdit, onCancel, onSell }: SeparatedOrderCardProps) {
  const statusKey = order.status as keyof typeof statusLabels
  const statusLabel = statusLabels[statusKey] || order.status
  const statusColor = statusColors[statusKey] || 'bg-gray-100 text-gray-800'
  const orderType = capitalizeWords(order.orderType)
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">#{order.id}</h3>
              <Badge className={statusColor}>
                {statusLabel}
              </Badge>
            </div>
            <p className="font-medium">{order.customerName || 'Sin nombre'}</p>
            <p className="text-sm text-muted-foreground">{order.customerPhone || 'Sin teléfono'}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Tipo:</span>
          <Badge variant="outline">{orderType}</Badge>
        </div>
        <div className="pt-2 border-t">
          <div className="flex justify-between">
            <span className="font-semibold">Total:</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(order.total || 0)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className={order.status === 'reserved' && (onEdit || onSell) ? "flex-1" : "w-full"}
            onClick={() => onViewDetail(order)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver detalle
          </Button>
          {order.status === 'reserved' && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(order)}
              className="flex-1"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
        {order.status === 'reserved' && onSell && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onSell(order)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Vender
          </Button>
        )}
        {order.status === 'reserved' && onCancel && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onCancel(order)}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

