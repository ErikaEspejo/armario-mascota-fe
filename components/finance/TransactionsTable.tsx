'use client'

import { Transaction } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'

interface TransactionsTableProps {
  transactions: Transaction[]
  loading: boolean
  hasMore: boolean
  cursor?: string | null
  onLoadMore: (cursor: string) => void
  onLoadPrevious?: () => void
}

// Mapeo de destinos para mostrar en UI
const mapDestinationToUI = (destination: string): string => {
  if (destination === 'Cash') return 'Efectivo'
  return destination
}

// Mapeo de tipos
const mapTypeToUI = (type: string): string => {
  return type === 'income' ? 'Ingreso' : 'Egreso'
}

// Mapeo de fuente
const mapSourceToUI = (source: string): string => {
  return source === 'manual' ? 'Manual' : 'Ventas'
}

export function TransactionsTable({
  transactions,
  loading,
  hasMore,
  cursor,
  onLoadMore,
  onLoadPrevious,
}: TransactionsTableProps) {
  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No hay transacciones"
        description="No se encontraron transacciones con los filtros aplicados"
      />
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Monto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Destino</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Método</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Contraparte</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Notas</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={index % 2 === 0 ? 'bg-card' : 'bg-muted/50'}
                >
                  <td className="px-4 py-3 text-sm">
                    {formatDate(transaction.occurredAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {mapTypeToUI(transaction.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    <span
                      className={
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {mapDestinationToUI(transaction.destination)}
                  </td>
                  <td className="px-4 py-3 text-sm">{transaction.category}</td>
                  <td className="px-4 py-3 text-sm">
                    {mapSourceToUI(transaction.source)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {transaction.counterparty || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                    {transaction.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {(hasMore || cursor) && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando {transactions.length} transacción{transactions.length !== 1 ? 'es' : ''}
            </div>
            <div className="flex gap-2">
              {onLoadPrevious && cursor && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadPrevious}
                  disabled={loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              {hasMore && cursor && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadMore(cursor)}
                  disabled={loading}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

