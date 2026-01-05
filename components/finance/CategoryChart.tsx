'use client'

import {
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
import { ByCategory } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CategoryChartProps {
  byCategory: ByCategory
}

const COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
]

export function CategoryChart({ byCategory }: CategoryChartProps) {
  const formatCurrencyTooltip = (value: number) => {
    return formatCurrency(value)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Ingresos por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          {(!byCategory.income || byCategory.income.length === 0) ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No hay datos de ingresos disponibles
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={byCategory.income} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={formatCurrencyTooltip} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''} />
                  <Legend />
                  <Bar dataKey="amount" fill="#22c55e" name="Monto" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {byCategory.income.map((item, index) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </span>
                      <span className="font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Egresos por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Egresos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          {(!byCategory.expense || byCategory.expense.length === 0) ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No hay datos de egresos disponibles
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={byCategory.expense} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={formatCurrencyTooltip} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''} />
                  <Legend />
                  <Bar dataKey="amount" fill="#ef4444" name="Monto" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {byCategory.expense.map((item, index) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </span>
                      <span className="font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

