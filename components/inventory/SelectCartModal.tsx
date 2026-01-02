'use client'

import { useState, useEffect } from 'react'
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
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ReservedOrder, CreateReservedOrderPayload } from '@/types'
import { getReservedOrdersReserved, createReservedOrder } from '@/services/api/reserved-orders'
import { toast } from 'sonner'
import { ShoppingCart } from 'lucide-react'

interface SelectCartModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectCart: (orderId: number, label: string) => void
}

export function SelectCartModal({ open, onOpenChange, onSelectCart }: SelectCartModalProps) {
  const [orders, setOrders] = useState<ReservedOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<CreateReservedOrderPayload>({
    assignedTo: 'Erika',
    customerName: '',
    customerPhone: '',
    notes: '',
    orderType: 'Detal',
  })

  // Load orders when modal opens
  useEffect(() => {
    if (open && !showCreateForm) {
      loadOrders()
    }
  }, [open, showCreateForm])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const reservedOrders = await getReservedOrdersReserved()
      setOrders(reservedOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error(error instanceof Error ? error.message : 'Error al cargar los carritos separados')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectExisting = (orderId: number) => {
    setSelectedOrderId(orderId)
  }

  const handleConfirmExisting = () => {
    if (!selectedOrderId) {
      toast.error('Por favor selecciona un carrito')
      return
    }

    const order = orders.find(o => o.id === selectedOrderId)
    if (!order) {
      toast.error('Carrito no encontrado')
      return
    }

    const customerName = order.customerName || 'Sin nombre'
    const label = `#${order.id} - ${customerName}`
    onSelectCart(order.id, label)
    onOpenChange(false)
    setSelectedOrderId(null)
  }

  const handleCreateCart = async () => {
    if (!formData.assignedTo.trim()) {
      toast.error('El campo "Asignado a" es requerido')
      return
    }

    setCreating(true)
    try {
      const payload: CreateReservedOrderPayload = {
        assignedTo: formData.assignedTo.trim(),
        orderType: formData.orderType || 'Detal', // Ensure it always has a value
        ...(formData.customerName?.trim() && { customerName: formData.customerName.trim() }),
        ...(formData.customerPhone?.trim() && { customerPhone: formData.customerPhone.trim() }),
        ...(formData.notes?.trim() && { notes: formData.notes.trim() }),
      }

      const newOrder = await createReservedOrder(payload)
      const customerName = newOrder.customerName || 'Sin nombre'
      const label = `#${newOrder.id} - ${customerName}`
      
      toast.success('Carrito creado exitosamente')
      onSelectCart(newOrder.id, label)
      onOpenChange(false)
      
      // Reset form
      setFormData({
        assignedTo: 'Erika',
        customerName: '',
        customerPhone: '',
        notes: '',
        orderType: 'Detal',
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating cart:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el carrito')
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setShowCreateForm(false)
    setSelectedOrderId(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Seleccionar Carrito
          </DialogTitle>
          <DialogDescription>
            Usa un carrito existente o crea uno nuevo
          </DialogDescription>
        </DialogHeader>

        {!showCreateForm ? (
          <>
            {/* Usar carrito existente */}
            {orders.length > 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="existingCart" className="font-semibold mb-2 block">
                    Usar carrito existente
                  </Label>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <Select
                      value={selectedOrderId?.toString() || ''}
                      onValueChange={(value) => handleSelectExisting(parseInt(value, 10))}
                    >
                      <SelectTrigger id="existingCart">
                        <SelectValue placeholder="Selecciona un carrito" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.map((order) => {
                          const customerName = order.customerName || 'Sin nombre'
                          const displayText = `#${order.id} - ${customerName}${
                            order.lineCount !== undefined
                              ? ` (${order.lineCount} items${
                                  order.total !== undefined
                                    ? ` • ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(order.total)}`
                                    : ''
                                })`
                              : ''
                          }`
                          return (
                            <SelectItem key={order.id} value={order.id.toString()}>
                              {displayText}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {!loading && orders.length > 0 && (
                  <Button
                    onClick={handleConfirmExisting}
                    disabled={!selectedOrderId}
                    className="w-full"
                  >
                    Usar este carrito
                  </Button>
                )}
              </div>
            )}

            {/* Crear nuevo carrito */}
            <div className="space-y-4">
              {orders.length > 0 && <div className="border-t pt-4" />}
              <div>
                <h3 className="font-semibold mb-3">Crear nuevo carrito</h3>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="outline"
                  className="w-full"
                >
                  Crear nuevo carrito
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Formulario crear nuevo */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Asignado a *</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="Erika"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderType">Tipo de orden *</Label>
              <Select
                value={formData.orderType}
                onValueChange={(value: 'Detal' | 'Mayorista') => 
                  setFormData({ ...formData, orderType: value })
                }
              >
                <SelectTrigger id="orderType">
                  <SelectValue placeholder="Selecciona tipo de orden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Detal">Detal</SelectItem>
                  <SelectItem value="Mayorista">Mayorista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre del cliente</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Teléfono</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Cliente VIP"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCart}
                disabled={creating || !formData.assignedTo.trim()}
              >
                {creating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  'Guardar carrito'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

