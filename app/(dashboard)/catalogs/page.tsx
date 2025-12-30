'use client'

import { useApp } from '@/context/AppContext'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import { BookOpen, Download, FileDown } from 'lucide-react'
import { toast } from 'sonner'

export default function CatalogsPage() {
  const { catalogs, sales, loading } = useApp()

  const handleDownloadPDF = (_catalogId: string, pdfUrl: string) => {
    // Mock download
    toast.success('Descargando PDF...')
    // In real implementation: window.open(pdfUrl, '_blank')
    console.log('PDF URL:', pdfUrl)
  }

  const handleDownloadPNGs = (catalogId: string, pngUrls: string[]) => {
    // Mock download
    toast.success(`Descargando ${pngUrls.length} imágenes...`)
    // In real implementation: download all PNGs
  }

  if (loading) {
    return (
      <div>
        <Header title="Catálogos" />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Catálogos" />
      <div className="space-y-6">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold mb-2">Catálogos Generados</h1>
          <p className="text-muted-foreground mb-6">
            Gestiona los catálogos generados por venta
          </p>
        </div>

        {catalogs.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No hay catálogos"
            description="Los catálogos se generan automáticamente al confirmar una venta"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalogs.map((catalog) => {
              const sale = sales.find(s => s.id === catalog.saleId)
              return (
                <Card key={catalog.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Catálogo #{catalog.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(catalog.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {catalog.templateVersion === 'v1' ? '3x3' : '2x2'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sale && (
                      <div>
                        <p className="text-sm text-muted-foreground">Venta:</p>
                        <p className="font-semibold">#{sale.id}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Páginas: {catalog.pngUrls.length}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(catalog.id, catalog.pdfUrl)}
                        className="w-full"
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Descargar PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPNGs(catalog.id, catalog.pngUrls)}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PNGs ({catalog.pngUrls.length})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

