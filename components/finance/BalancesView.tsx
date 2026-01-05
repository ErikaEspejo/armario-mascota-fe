'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { DashboardMetrics } from './DashboardMetrics'
import { CashFlowChart } from './CashFlowChart'
import { CategoryChart } from './CategoryChart'
import { DestinationChart } from './DestinationChart'
import { getFinanceSummary, getFinanceDashboard } from '@/services/api/finance'
import { FinanceSummary, FinanceDashboard } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface BalancesViewProps {
  onBack: () => void
}

export function BalancesView({ onBack }: BalancesViewProps) {
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadData = useCallback(async (useDateFilters = false) => {
    setLoading(true)
    setSummary(null)
    setDashboard(null)
    try {
      // Solo enviar fechas si ambas están presentes y se solicitan explícitamente
      const fromDate = useDateFilters && dateFrom && dateTo ? dateFrom : undefined
      const toDate = useDateFilters && dateFrom && dateTo ? dateTo : undefined
      
      const [summaryData, dashboardData] = await Promise.all([
        getFinanceSummary(fromDate, toDate),
        getFinanceDashboard(
          'month',
          fromDate,
          toDate,
          'previous'
        ),
      ])
      
      console.log('Summary data:', summaryData)
      console.log('Dashboard data:', dashboardData)
      
      // Validar que los datos tengan la estructura esperada
      if (!summaryData) {
        console.error('Summary data is null or undefined')
        toast.error('No se pudo cargar el resumen financiero')
        return
      }
      
      if (!dashboardData || !dashboardData.period) {
        console.error('Dashboard data is missing period:', dashboardData)
        toast.error('Los datos del dashboard no tienen la estructura esperada')
        return
      }
      
      // Si summary no tiene range, crear uno por defecto basado en los datos disponibles
      if (!summaryData.range) {
        console.warn('Summary data missing range, creating default range')
        summaryData.range = {
          from: dateFrom || new Date().toISOString().split('T')[0],
          to: dateTo || new Date().toISOString().split('T')[0],
          openingBalance: summaryData.balanceAllTime || 0,
          income: 0,
          expense: 0,
          net: 0,
          closingBalance: summaryData.balanceAllTime || 0,
        }
      }
      
      // Asegurar que los arrays existan (no sean null)
      if (!summaryData.byDestinationAllTime) {
        summaryData.byDestinationAllTime = []
      }
      if (!summaryData.byDestinationRange) {
        summaryData.byDestinationRange = []
      }
      
      // Asegurar que los arrays del dashboard existan
      if (!dashboardData.cashFlow) {
        dashboardData.cashFlow = { daily: [], weekly: [], monthly: [] }
      } else {
        dashboardData.cashFlow.daily = dashboardData.cashFlow.daily || []
        dashboardData.cashFlow.weekly = dashboardData.cashFlow.weekly || []
        dashboardData.cashFlow.monthly = dashboardData.cashFlow.monthly || []
      }
      
      if (!dashboardData.byCategory) {
        dashboardData.byCategory = { income: [], expense: [] }
      } else {
        dashboardData.byCategory.income = dashboardData.byCategory.income || []
        dashboardData.byCategory.expense = dashboardData.byCategory.expense || []
      }
      
      if (!dashboardData.byDestination) {
        dashboardData.byDestination = { destinations: [], totalNet: 0 }
      } else {
        dashboardData.byDestination.destinations = dashboardData.byDestination.destinations || []
      }
      
      if (!dashboardData.topTransactions) {
        dashboardData.topTransactions = { largestIncomes: [], largestExpenses: [] }
      } else {
        dashboardData.topTransactions.largestIncomes = dashboardData.topTransactions.largestIncomes || []
        dashboardData.topTransactions.largestExpenses = dashboardData.topTransactions.largestExpenses || []
      }
      
      if (!dashboardData.byCounterparty) {
        dashboardData.byCounterparty = { topIncomes: [], topExpenses: [] }
      } else {
        dashboardData.byCounterparty.topIncomes = dashboardData.byCounterparty.topIncomes || []
        dashboardData.byCounterparty.topExpenses = dashboardData.byCounterparty.topExpenses || []
      }
      
      setSummary(summaryData)
      setDashboard(dashboardData)
    } catch (error) {
      console.error('Error loading balances data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los datos de balances'
      console.error('Error details:', errorMessage)
      toast.error(errorMessage)
      setSummary(null)
      setDashboard(null)
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  // Cargar datos iniciales sin filtros de fecha
  useEffect(() => {
    loadData(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilter = () => {
    if (!dateFrom || !dateTo) {
      toast.error('Por favor selecciona ambas fechas (desde y hasta)')
      return
    }
    loadData(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!summary || !dashboard) {
    return (
      <div className="space-y-6">
        {/* Header con botón volver */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
            className="shrink-0"
            aria-label="Volver a finanzas"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Balances y Dashboard</h1>
          </div>
        </div>

        {/* Mensaje de error */}
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">No se pudieron cargar los datos</p>
          <p className="text-sm text-muted-foreground">
            {!summary && 'No se pudo cargar el resumen financiero'}
            {summary && !dashboard && 'No se pudo cargar el dashboard'}
          </p>
          <Button variant="outline" onClick={() => loadData(false)}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  // Asegurar que summary.range existe, si no crear uno por defecto
  const summaryRange = summary.range || {
    from: dateFrom || new Date().toISOString().split('T')[0],
    to: dateTo || new Date().toISOString().split('T')[0],
    openingBalance: summary.balanceAllTime || 0,
    income: 0,
    expense: 0,
    net: 0,
    closingBalance: summary.balanceAllTime || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header con botón volver y filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
            className="shrink-0"
            aria-label="Volver a finanzas"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Balances y Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {dashboard.period.label}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="space-y-1">
            <Label htmlFor="balanceFrom" className="text-xs">Desde</Label>
            <Input
              id="balanceFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="balanceTo" className="text-xs">Hasta</Label>
            <Input
              id="balanceTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9"
            />
          </div>
          <Button 
            onClick={handleFilter}
            disabled={!dateFrom || !dateTo || loading}
            className="h-9"
          >
            Filtrar
          </Button>
        </div>
      </div>

      {/* Resumen de balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.balanceAllTime)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Balance de todos los tiempos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance de Apertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryRange.openingBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(summaryRange.from)} - {formatDate(summaryRange.to)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance de Cierre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryRange.closingBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Balance al final del período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neto del Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summaryRange.net >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(summaryRange.net)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ingresos: {formatCurrency(summaryRange.income)} | Egresos:{' '}
              {formatCurrency(summaryRange.expense)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Balances por destino */}
      <Card>
        <CardHeader>
          <CardTitle>Balances por Destino (Todos los Tiempos)</CardTitle>
        </CardHeader>
        <CardContent>
          {(summary.byDestinationAllTime && summary.byDestinationAllTime.length > 0) ? (
            <div className="space-y-2">
              {summary.byDestinationAllTime.map((dest) => (
                <div
                  key={dest.destination}
                  className="flex items-center justify-between p-3 bg-muted rounded"
                >
                  <span className="font-medium">
                    {dest.destination === 'Cash' ? 'Efectivo' : dest.destination}
                  </span>
                  <span className="text-lg font-bold">
                    {formatCurrency(dest.balance)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay datos de destinos disponibles
            </p>
          )}
        </CardContent>
      </Card>

      {/* Balances por destino del período */}
      <Card>
        <CardHeader>
          <CardTitle>Balances por Destino (Período)</CardTitle>
        </CardHeader>
        <CardContent>
          {(summary.byDestinationRange && summary.byDestinationRange.length > 0) ? (
            <div className="space-y-2">
              {summary.byDestinationRange.map((dest) => (
                <div
                  key={dest.destination}
                  className="flex items-center justify-between p-3 bg-muted rounded"
                >
                  <span className="font-medium">
                    {dest.destination === 'Cash' ? 'Efectivo' : dest.destination}
                  </span>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Ingresos</div>
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(dest.income)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Egresos</div>
                      <div className="text-sm font-semibold text-red-600">
                        {formatCurrency(dest.expense)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Neto</div>
                      <div
                        className={`text-sm font-semibold ${
                          dest.net >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(dest.net)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay datos de destinos en este período
            </p>
          )}
        </CardContent>
      </Card>

      {/* Métricas del dashboard */}
      <DashboardMetrics dashboard={dashboard} />

      {/* Gráfico de flujo de caja */}
      {dashboard.cashFlow && <CashFlowChart cashFlow={dashboard.cashFlow} />}

      {/* Gráficos de categorías */}
      {dashboard.byCategory && <CategoryChart byCategory={dashboard.byCategory} />}

      {/* Gráfico de destinos */}
      {dashboard.byDestination && <DestinationChart byDestination={dashboard.byDestination} />}

      {/* Top transacciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Mayores Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            {(!dashboard.topTransactions?.largestIncomes || dashboard.topTransactions.largestIncomes.length === 0) ? (
              <p className="text-muted-foreground text-sm">No hay ingresos registrados</p>
            ) : (
              <div className="space-y-2">
                {(dashboard.topTransactions.largestIncomes || []).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div>
                      <div className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.category} •{' '}
                        {transaction.destination === 'Cash'
                          ? 'Efectivo'
                          : transaction.destination}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(transaction.occurredAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mayores Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            {(!dashboard.topTransactions?.largestExpenses || dashboard.topTransactions.largestExpenses.length === 0) ? (
              <p className="text-muted-foreground text-sm">No hay egresos registrados</p>
            ) : (
              <div className="space-y-2">
                {(dashboard.topTransactions.largestExpenses || []).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div>
                      <div className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.category} •{' '}
                        {transaction.destination === 'Cash'
                          ? 'Efectivo'
                          : transaction.destination}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(transaction.occurredAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contrapartes principales */}
      {((dashboard.byCounterparty?.topIncomes?.length || 0) > 0 ||
        (dashboard.byCounterparty?.topExpenses?.length || 0) > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Principales Contrapartes (Ingresos)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(dashboard.byCounterparty.topIncomes || []).map((item) => (
                  <div
                    key={item.counterparty}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div>
                      <div className="font-medium">{item.counterparty}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.count} transacción{item.count !== 1 ? 'es' : ''}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Principales Contrapartes (Egresos)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(dashboard.byCounterparty.topExpenses || []).map((item) => (
                  <div
                    key={item.counterparty}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div>
                      <div className="font-medium">{item.counterparty}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.count} transacción{item.count !== 1 ? 'es' : ''}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

