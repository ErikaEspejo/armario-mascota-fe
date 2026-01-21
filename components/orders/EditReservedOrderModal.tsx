'use client'

import { useState, useEffect } from 'react'
import { ReservedOrder } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QuantitySelector } from '@/components/inventory/QuantitySelector'
import { updateReservedOrder } from '@/services/api/reserved-orders'
import { toast } from 'sonner'

interface EditReservedOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: ReservedOrder | null
  onSuccess?: () => void
}

export function EditReservedOrderModal({
  open,
  onOpenChange,
  order,
  onSuccess,
}: EditReservedOrderModalProps) {
  const [assignedTo, setAssignedTo] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<Array<{ id: number; reservedOrderId: number; itemId: number; qty: number }>>([])
  const [loading, setLoading] = useState(false)

  // Inicializar valores cuando se abre el modal o cambia el order
  useEffect(() => {
    if (order && open) {
      setAssignedTo(order.assignedTo || '')
      setCustomerName(order.customerName || '')
      setCustomerPhone(order.customerPhone || '')
      setNotes(order.notes || '')
      
      // Inicializar lines desde order.lines
      if (order.lines && order.lines.length > 0) {
        setLines(order.lines.map(line => ({
          id: line.id,
          reservedOrderId: line.reservedOrderId,
          itemId: line.itemId,
          qty: line.qty,
        })))
      } else {
        setLines([])
      }
    } else if (!open) {
      // Resetear estado cuando el modal se cierra
      setAssignedTo('')
      setCustomerName('')
      setCustomerPhone('')
      setNotes('')
      setLines([])
    }
  }, [order, open])

  const handleQuantityChange = (lineId: number, newQty: number) => {
    setLines(prevLines =>
      prevLines.map(line =>
        line.id === lineId ? { ...line, qty: newQty } : line
      )
    )
  }

  const handleSave = async () => {
    if (!order) return

    setLoading(true)
    try {
      const payload = {
        id: order.id,
        status: 'reserved' as const,
        assignedTo,
        orderType: order.orderType || 'Detal',
        customerName,
        customerPhone,
        notes,
        lines,
      }

      await updateReservedOrder(order.id, payload)
      toast.success('Pedido actualizado correctamente')
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error updating reserved order:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el pedido')
    } finally {
      setLoading(false)
    }
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Pedido #{order.id}</DialogTitle>
          <DialogDescription>
            Modifica la información del pedido reservado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información del cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Asignado a</Label>
              <Input
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Nombre del vendedor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre del cliente</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Teléfono del cliente</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Teléfono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Items del pedido */}
          {order.lines && order.lines.length > 0 && (
            <div className="space-y-4">
              <Label>Items del pedido</Label>
              <div className="border rounded-lg divide-y">
                {order.lines.map((line, index) => {
                  const editedLine = lines.find(l => l.id === line.id)
                  const currentQty = editedLine?.qty ?? line.qty
                  
                  const hasCustomCode = !!line.customCode
                  const colorPrimary = line.item?.colorPrimaryLabel || line.item?.colorPrimary
                  const hoodieType = line.item?.hoodieTypeLabel || line.item?.hoodieType
                  
                  return (
                    <div key={line.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {line.item?.description || `Item ${index + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {line.item?.sku || 'N/A'} | Talla: {line.item?.size || 'N/A'}
                          {hoodieType && ` | Tipo: ${hoodieType}`}
                        </p>
                        {hasCustomCode && colorPrimary && (
                          <p className="text-xs text-primary font-medium">
                            Color Principal: {colorPrimary}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Precio unitario: ${line.unitPrice?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Label className="text-xs text-muted-foreground">Cantidad</Label>
                          <QuantitySelector
                            value={currentQty}
                            onChange={(newQty) => handleQuantityChange(line.id, newQty)}
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

