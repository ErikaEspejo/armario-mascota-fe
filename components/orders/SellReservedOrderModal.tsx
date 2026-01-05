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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { sellReservedOrder } from '@/services/api/reserved-orders'
import { toast } from 'sonner'

interface SellReservedOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: ReservedOrder | null
  onSuccess?: () => void
}

export function SellReservedOrderModal({
  open,
  onOpenChange,
  order,
  onSuccess,
}: SellReservedOrderModalProps) {
  const [amountPaid, setAmountPaid] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')
  const [paymentDestination, setPaymentDestination] = useState<'Cash' | 'Nequi' | 'Daviplata'>('Cash')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Inicializar valores cuando se abre el modal o cambia el order
  useEffect(() => {
    if (order && open) {
      // Valor por defecto del total pagado es el total del pedido
      setAmountPaid(String(order.total || 0))
      setPaymentMethod('cash')
      setPaymentDestination('Cash')
      setNotes('')
    } else if (!open) {
      // Resetear estado cuando el modal se cierra
      setAmountPaid('')
      setPaymentMethod('cash')
      setPaymentDestination('Cash')
      setNotes('')
    }
  }, [order, open])

  const handleSell = async () => {
    if (!order) return

    // Validaciones
    const amountPaidNum = parseInt(amountPaid, 10)
    if (!amountPaid || isNaN(amountPaidNum) || amountPaidNum <= 0) {
      toast.error('El total pagado debe ser un número entero mayor a 0')
      return
    }

    if (!paymentMethod) {
      toast.error('Debe seleccionar un método de pago')
      return
    }

    if (!paymentDestination) {
      toast.error('Debe seleccionar un destino de pago')
      return
    }

    setLoading(true)
    try {
      const payload = {
        amountPaid: amountPaidNum,
        paymentMethod,
        paymentDestination,
        notes: notes || undefined,
      }

      await sellReservedOrder(order.id, payload)
      toast.success('Venta registrada exitosamente')
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error selling reserved order:', error)
      toast.error(error instanceof Error ? error.message : 'Error al registrar la venta')
    } finally {
      setLoading(false)
    }
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Vender Pedido #{order.id}</DialogTitle>
          <DialogDescription>
            Registra la información de pago para completar la venta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amountPaid">
              Total pagado <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amountPaid"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0"
              min="1"
              step="1"
              required
            />
            <p className="text-xs text-muted-foreground">
              Valor por defecto: {order.total ? `$${order.total.toLocaleString()}` : '$0'} (COP)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">
              Método de pago <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as 'cash' | 'transfer')}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDestination">
              Destino de pago <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={paymentDestination} 
              onValueChange={(value) => setPaymentDestination(value as 'Cash' | 'Nequi' | 'Daviplata')}
            >
              <SelectTrigger id="paymentDestination">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Efectivo</SelectItem>
                <SelectItem value="Nequi">Nequi</SelectItem>
                <SelectItem value="Daviplata">Daviplata</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales (opcional)"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSell} disabled={loading}>
            {loading ? 'Vendiendo...' : 'Vender'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


