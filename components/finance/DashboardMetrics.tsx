'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FinanceDashboard } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react'

interface DashboardMetricsProps {
  dashboard: FinanceDashboard
}

export function DashboardMetrics({ dashboard }: DashboardMetricsProps) {
  const { currentPeriod, comparison, kpis } = dashboard

  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return null
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Ingresos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentPeriod.income)}</div>
          {comparison && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${getChangeColor(comparison.changes.incomeChange)}`}>
              {getTrendIcon(comparison.changes.incomeChange)}
              <span>
                {comparison.changes.incomeChange > 0 ? '+' : ''}
                {comparison.changes.incomeChange.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Egresos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Egresos</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentPeriod.expense)}</div>
          {comparison && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${getChangeColor(comparison.changes.expenseChange)}`}>
              {getTrendIcon(comparison.changes.expenseChange)}
              <span>
                {comparison.changes.expenseChange > 0 ? '+' : ''}
                {comparison.changes.expenseChange.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Neto */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Neto</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              currentPeriod.net >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(currentPeriod.net)}
          </div>
          {comparison && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${getChangeColor(comparison.changes.netChange)}`}>
              {getTrendIcon(comparison.changes.netChange)}
              <span>
                {comparison.changes.netChange > 0 ? '+' : ''}
                {comparison.changes.netChange.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Margen de Ganancia */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentPeriod.profitMargin.toFixed(1)}%</div>
          {comparison && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${getChangeColor(comparison.changes.profitMarginChange)}`}>
              {getTrendIcon(comparison.changes.profitMarginChange)}
              <span>
                {comparison.changes.profitMarginChange > 0 ? '+' : ''}
                {comparison.changes.profitMarginChange.toFixed(2)}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transacciones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentPeriod.transactionCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Promedio: {formatCurrency(currentPeriod.averageTransaction)}
          </p>
        </CardContent>
      </Card>

      {/* Ratio de Gastos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ratio de Gastos</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.expenseRatio.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Promedio diario neto: {formatCurrency(kpis.averageDailyNet)}
          </p>
        </CardContent>
      </Card>

      {/* Transacciones por Día */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transacciones/Día</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.transactionsPerDay.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Tamaño promedio: {formatCurrency(kpis.averageTransactionSize)}
          </p>
        </CardContent>
      </Card>

      {/* Categorías Principales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categorías Principales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-muted-foreground">Ingresos: </span>
              <span className="font-semibold">{kpis.largestIncomeCategory}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Egresos: </span>
              <span className="font-semibold">{kpis.largestExpenseCategory}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

