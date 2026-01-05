'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CashFlow } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CashFlowChartProps {
  cashFlow: CashFlow
}

type ViewType = 'daily' | 'weekly' | 'monthly'

export function CashFlowChart({ cashFlow }: CashFlowChartProps) {
  const [viewType, setViewType] = useState<ViewType>('daily')

  const formatCurrencyTooltip = (value: number) => {
    return formatCurrency(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatWeek = (weekString: string) => {
    return weekString.replace('W', ' Semana ')
  }

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('es-AR', {
      month: 'short',
      year: 'numeric',
    })
  }

  const renderChart = () => {
    switch (viewType) {
      case 'daily':
        if (!cashFlow.daily || cashFlow.daily.length === 0) {
          return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No hay datos diarios disponibles
            </div>
          )
        }
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlow.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickFormatter={formatCurrencyTooltip} />
              <Tooltip
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                name="Ingresos"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                name="Egresos"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Neto"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'weekly':
        if (!cashFlow.weekly || cashFlow.weekly.length === 0) {
          return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No hay datos semanales disponibles
            </div>
          )
        }
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlow.weekly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tickFormatter={formatWeek}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickFormatter={formatCurrencyTooltip} />
              <Tooltip
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                labelFormatter={(label) => formatWeek(label)}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Ingresos" />
              <Bar dataKey="expense" fill="#ef4444" name="Egresos" />
              <Bar dataKey="net" fill="#3b82f6" name="Neto" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'monthly':
        if (!cashFlow.monthly || cashFlow.monthly.length === 0) {
          return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No hay datos mensuales disponibles
            </div>
          )
        }
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlow.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickFormatter={formatCurrencyTooltip} />
              <Tooltip
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                labelFormatter={(label) => formatMonth(label)}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Ingresos" />
              <Bar dataKey="expense" fill="#ef4444" name="Egresos" />
              <Bar dataKey="net" fill="#3b82f6" name="Neto" />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Flujo de Caja</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewType === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('daily')}
            >
              Diario
            </Button>
            <Button
              variant={viewType === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('weekly')}
            >
              Semanal
            </Button>
            <Button
              variant={viewType === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('monthly')}
            >
              Mensual
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}

