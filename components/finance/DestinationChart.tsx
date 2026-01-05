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
import { ByDestination } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface DestinationChartProps {
  byDestination: ByDestination
}

// Mapeo de destinos para mostrar en UI
const mapDestinationToUI = (destination: string): string => {
  if (destination === 'Cash') return 'Efectivo'
  return destination
}

export function DestinationChart({ byDestination }: DestinationChartProps) {
  const formatCurrencyTooltip = (value: number) => {
    return formatCurrency(value)
  }

  const chartData = byDestination.destinations.map((dest) => ({
    ...dest,
    destination: mapDestinationToUI(dest.destination),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Destino</CardTitle>
      </CardHeader>
      <CardContent>
        {(!chartData || chartData.length === 0) ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No hay datos de destinos disponibles
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="destination"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={formatCurrencyTooltip} />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Ingresos" />
                <Bar dataKey="expense" fill="#ef4444" name="Egresos" />
                <Bar dataKey="net" fill="#3b82f6" name="Neto" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {chartData.map((item) => (
                <div
                  key={item.destination}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <span className="font-medium">{item.destination}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Ingresos</div>
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(item.income)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Egresos</div>
                      <div className="text-sm font-semibold text-red-600">
                        {formatCurrency(item.expense)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Neto</div>
                      <div
                        className={`text-sm font-semibold ${
                          item.net >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(item.net)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">%</div>
                      <div className="text-sm font-semibold">
                        {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-2 bg-primary/10 rounded border-t-2 border-primary mt-2">
                <span className="font-bold">Total Neto</span>
                <span
                  className={`font-bold ${
                    byDestination.totalNet >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(byDestination.totalNet)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

