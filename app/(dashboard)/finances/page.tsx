'use client'

import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export default function FinancesPage() {
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

        <Card>
          <CardHeader>
            <CardTitle>Vista de Finanzas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                La funcionalidad de finanzas se implementará próximamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

