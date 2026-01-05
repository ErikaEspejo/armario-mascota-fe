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
import { createTransaction } from '@/services/api/finance'
import { CreateTransactionPayload } from '@/types'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// Mapeo de destinos para mostrar en UI
const mapDestinationToUI = (destination: string): string => {
  if (destination === 'Cash') return 'Efectivo'
  return destination
}

// Mapeo inverso: de UI a API
const mapDestinationToAPI = (destination: string): string => {
  if (destination === 'Efectivo') return 'Cash'
  return destination
}

const DESTINATION_OPTIONS = ['Nequi', 'Daviplata', 'Efectivo']

export function AddTransactionModal({
  open,
  onOpenChange,
  onSuccess,
}: AddTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState<string>('0')
  const [destination, setDestination] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [counterparty, setCounterparty] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [occurredAt, setOccurredAt] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setType('expense')
      setAmount('0')
      setDestination('')
      setCategory('')
      setCounterparty('')
      setNotes('')
      setOccurredAt('')
    }
  }, [open])

  const handleSubmit = async () => {
    // Validación
    if (!destination) {
      toast.error('El destino es requerido')
      return
    }
    if (!category.trim()) {
      toast.error('La categoría es requerida')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    setLoading(true)
    try {
      const payload: CreateTransactionPayload = {
        type,
        amount: parseFloat(amount),
        destination: mapDestinationToAPI(destination),
        category: category.trim(),
        counterparty: counterparty.trim() || undefined,
        notes: notes.trim() || undefined,
        occurredAt: occurredAt || undefined,
      }

      await createTransaction(payload)
      toast.success('Transacción creada exitosamente')
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear la transacción')
    } finally {
      setLoading(false)
    }
  }

  // Obtener fecha/hora actual en formato datetime-local
  const getCurrentDateTimeLocal = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Registro</DialogTitle>
          <DialogDescription>
            Completa los campos para registrar una nueva transacción financiera
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Tipo <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Ingreso</SelectItem>
                <SelectItem value="expense">Egreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Cantidad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Destino */}
          <div className="space-y-2">
            <Label htmlFor="destination">
              Destino <span className="text-red-500">*</span>
            </Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger id="destination">
                <SelectValue placeholder="Seleccionar destino" />
              </SelectTrigger>
              <SelectContent>
                {DESTINATION_OPTIONS.map((dest) => (
                  <SelectItem key={dest} value={dest}>
                    {mapDestinationToUI(dest)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Categoría <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: materiales, pago_personal, envios"
            />
          </div>

          {/* Contraparte */}
          <div className="space-y-2">
            <Label htmlFor="counterparty">Contraparte</Label>
            <Input
              id="counterparty"
              type="text"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales (opcional)"
            />
          </div>

          {/* Fecha/Hora */}
          <div className="space-y-2">
            <Label htmlFor="occurredAt">Fecha y Hora</Label>
            <Input
              id="occurredAt"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              placeholder={getCurrentDateTimeLocal()}
            />
            <p className="text-xs text-muted-foreground">
              Si se deja vacío, se usará la fecha y hora actual
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

