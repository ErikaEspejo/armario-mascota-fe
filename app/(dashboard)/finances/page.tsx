'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { TransactionFilters } from '@/components/finance/TransactionFilters'
import { TransactionsTable } from '@/components/finance/TransactionsTable'
import { AddTransactionModal } from '@/components/finance/AddTransactionModal'
import { BalancesView } from '@/components/finance/BalancesView'
import { getTransactions } from '@/services/api/finance'
import { Transaction, TransactionsResponse, TransactionFilters as TransactionFiltersType } from '@/types'
import { Plus, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

type ViewMode = 'transactions' | 'balances'

export default function FinancesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('transactions')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]) // Para obtener valores únicos
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TransactionFiltersType>({})
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [previousCursors, setPreviousCursors] = useState<string[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)

  // Cargar transacciones
  const loadTransactions = useCallback(async (newFilters?: TransactionFiltersType, newCursor?: string | null) => {
    setLoading(true)
    try {
      const filtersToUse = newFilters !== undefined ? newFilters : filters
      const cursorToUse = newCursor !== undefined ? newCursor : cursor

      const response: TransactionsResponse = await getTransactions({
        ...filtersToUse,
        limit: 50,
        cursor: cursorToUse || undefined,
      })

      const transactionsList = response.transactions || []

      if (cursorToUse) {
        // Si hay cursor, estamos cargando más resultados
        setTransactions((prev) => [...prev, ...transactionsList])
      } else {
        // Primera carga o cambio de filtros
        setTransactions(transactionsList)
        setPreviousCursors([])
      }

      setCursor(response.cursor || null)
      setHasMore(response.hasMore || false)

      // Cargar todas las transacciones para obtener valores únicos (solo en primera carga sin cursor)
      if (!cursorToUse && !newCursor) {
        try {
          const allResponse = await getTransactions({
            ...filtersToUse,
            limit: 1000, // Cargar más para obtener valores únicos
          })
          setAllTransactions(allResponse.transactions || [])
        } catch {
          // Si falla, usar las transacciones actuales
          setAllTransactions(transactionsList)
        }
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al cargar las transacciones'
      )
    } finally {
      setLoading(false)
    }
  }, [filters, cursor])

  // Cargar transacciones cuando cambian los filtros
  useEffect(() => {
    if (viewMode === 'transactions') {
      loadTransactions(filters, null)
    }
  }, [filters, viewMode, loadTransactions])

  const handleFiltersChange = (newFilters: TransactionFiltersType) => {
    setFilters(newFilters)
    setCursor(null)
    setPreviousCursors([])
  }

  const handleLoadMore = (nextCursor: string) => {
    setPreviousCursors((prev) => [...prev, cursor || ''])
    loadTransactions(filters, nextCursor)
  }

  const handleLoadPrevious = () => {
    if (previousCursors.length > 0) {
      const prevCursor = previousCursors[previousCursors.length - 1]
      const newPreviousCursors = previousCursors.slice(0, -1)
      setPreviousCursors(newPreviousCursors)
      setCursor(prevCursor)
      // Recargar desde el cursor anterior
      loadTransactions(filters, prevCursor || null)
    }
  }

  const handleTransactionCreated = () => {
    // Recargar transacciones después de crear una nueva
    loadTransactions(filters, null)
  }

  return (
    <div>
      <Header title="Finanzas" />
      <div className="space-y-6">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold mb-2">Finanzas</h1>
          <p className="text-muted-foreground mb-6">
            Gestiona y visualiza la información financiera
          </p>
        </div>

        {viewMode === 'transactions' ? (
          <>
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex gap-2">
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Nuevo Registro
                </Button>
                <Button variant="outline" onClick={() => setViewMode('balances')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Balances
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <TransactionFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              transactions={allTransactions}
            />

            {/* Tabla de transacciones */}
            <TransactionsTable
              transactions={transactions}
              loading={loading}
              hasMore={hasMore}
              cursor={cursor || undefined}
              onLoadMore={handleLoadMore}
              onLoadPrevious={
                previousCursors.length > 0 ? handleLoadPrevious : undefined
              }
            />
          </>
        ) : (
          <BalancesView onBack={() => setViewMode('transactions')} />
        )}
      </div>

      {/* Modal para agregar transacción */}
      <AddTransactionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleTransactionCreated}
      />
    </div>
  )
}
