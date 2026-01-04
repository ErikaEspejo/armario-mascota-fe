'use client'

import { ReservedOrder, ReservedOrderItem, ReservedOrderLine, ReservedOrderLineItem } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Eye } from 'lucide-react'
import { useMemo } from 'react'

interface SeparatedOrderDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: ReservedOrder | null
  onViewBusos: (item: ReservedOrderItem) => void
}

const statusLabels = {
  reserved: 'Reservado',
  canceled: 'Cancelado',
  completed: 'Completado',
}

// Función para convertir código de talla a nombre completo
function getTallaName(sizeCode: string): string {
  const tallaMap: Record<string, string> = {
    'MN': 'Mini',
    'IT': 'Intermedio',
  }
  
  // Si hay un mapeo, usarlo, sino retornar el código original
  return tallaMap[sizeCode] || sizeCode
}

// Función para capitalizar cada palabra
function capitalizeWords(str: string): string {
  if (!str) return ''
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Función para obtener el tipo de buso desde el item
function getTipoBuso(item: ReservedOrderLineItem): string {
  // Usar hoodieTypeLabel si está disponible, sino usar un fallback
  const tipoBuso = item.hoodieTypeLabel || item.hoodieType || 'Buso'
  return capitalizeWords(tipoBuso)
}

// Función para construir la URL completa de la imagen
function getImageUrl(imageUrlThumb: string): string {
  if (!imageUrlThumb) return ''
  // Si ya es una URL completa, retornarla
  if (imageUrlThumb.startsWith('http')) return imageUrlThumb
  // Si es una ruta relativa, construir la URL completa
  return `http://localhost:8080${imageUrlThumb}`
}

// Función para agrupar líneas por tipo de buso y talla
function groupLinesByTypeAndSize(lines: ReservedOrderLine[]): ReservedOrderItem[] {
  const grouped = new Map<string, ReservedOrderItem>()

  lines.forEach((line) => {
    const tipoBuso = getTipoBuso(line.item)
    const tallaCode = line.item.size
    const talla = getTallaName(tallaCode)
    const key = `${tipoBuso}-${tallaCode}` // Usar código para agrupar, pero mostrar nombre

    if (grouped.has(key)) {
      const existing = grouped.get(key)!
      existing.cantidad += line.qty
      existing.precioTotal += line.qty * line.unitPrice
      existing.busos.push({
        id: line.item.id,
        imageUrl: getImageUrl(line.item.imageUrlThumb),
        qty: line.qty,
      })
    } else {
      grouped.set(key, {
        tipoBuso,
        talla, // Guardar el nombre completo de la talla
        precioUnitario: line.unitPrice,
        cantidad: line.qty,
        precioTotal: line.qty * line.unitPrice,
        busos: [{
          id: line.item.id,
          imageUrl: getImageUrl(line.item.imageUrlThumb),
          qty: line.qty,
        }],
      })
    }
  })

  return Array.from(grouped.values())
}

export function SeparatedOrderDetailModal({
  open,
  onOpenChange,
  order,
  onViewBusos,
}: SeparatedOrderDetailModalProps) {
  const groupedItems = useMemo(() => {
    if (!order?.lines || order.lines.length === 0) return []
    return groupLinesByTypeAndSize(order.lines)
  }, [order?.lines])

  if (!order) return null

  const statusKey = order.status as keyof typeof statusLabels
  const statusLabel = statusLabels[statusKey] || order.status

  const totalQuantity = groupedItems.reduce((sum, item) => sum + item.cantidad, 0)
  const totalPrice = order.total || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Detalle del Pedido #{order.id}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Información completa del pedido
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Datos principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Cliente</p>
              <p className="text-sm sm:text-base font-semibold">{order.customerName || 'Sin nombre'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Teléfono</p>
              <p className="text-sm sm:text-base font-semibold">{order.customerPhone || 'Sin teléfono'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Tipo de Pedido</p>
              <p className="text-sm sm:text-base font-semibold">{capitalizeWords(order.orderType || 'N/A')}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Estado</p>
              <p className="text-sm sm:text-base font-semibold">{statusLabel}</p>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
              <p className="text-lg sm:text-xl font-bold text-primary">{formatCurrency(totalPrice)}</p>
            </div>
          </div>

          {/* Tabla de items */}
          {groupedItems.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-green-900 text-white">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Tipo de buso</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Talla</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold">Precio unitario</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold">Cantidad</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold">Precio total</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedItems.map((item, index) => (
                      <tr
                        key={`${item.tipoBuso}-${item.talla}-${index}`}
                        className={index % 2 === 0 ? 'bg-amber-50' : 'bg-white'}
                      >
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{item.tipoBuso}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{item.talla}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right">{formatCurrency(item.precioUnitario)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right">{item.cantidad}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right font-semibold">{formatCurrency(item.precioTotal)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewBusos(item)}
                            className="text-xs px-2 py-1 h-auto"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Ver detalle</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {/* Fila de totales */}
                    <tr className="bg-green-50 font-bold">
                      <td colSpan={2} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                        Total*
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right"></td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right">{totalQuantity}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right">{formatCurrency(totalPrice)}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground p-2 sm:p-4 italic">
                *No incluye el costo de envío, los productos no tienen cambio
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay items en este pedido
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

