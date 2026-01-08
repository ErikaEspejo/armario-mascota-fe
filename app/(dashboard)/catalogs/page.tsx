'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import JSZip from 'jszip'

const SIZES = ['Mini', 'Intermedio', 'XS', 'S', 'M', 'L', 'XL'] as const
const FORMATS = ['PNG', 'PDF'] as const

type Size = typeof SIZES[number]
type Format = typeof FORMATS[number]

interface CatalogPage {
  page: number
  url: string
  filename: string
}

interface CatalogPagesResponse {
  pages: CatalogPage[]
  sessionId: string
  size: string
  totalPages: number
}

/**
 * Mapea el nombre de talla al código usado por la API
 */
function getSizeCode(sizeName: Size): string {
  const sizeMap: Record<string, string> = {
    'Mini': 'MN',
    'Intermedio': 'IT',
  }
  return sizeMap[sizeName] || sizeName
}

export default function CatalogsPage() {
  const [selectedSize, setSelectedSize] = useState<Size | ''>('')
  const [selectedFormat, setSelectedFormat] = useState<Format | ''>('')
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!selectedSize || !selectedFormat) {
      toast.error('Por favor selecciona una talla y un formato')
      return
    }

    setIsDownloading(true)
    const sizeCode = getSizeCode(selectedSize as Size)
    const format = selectedFormat.toLowerCase()
    
    try {
      // Usar la API route de Next.js como proxy para evitar problemas de CORS
      const url = `/api/catalog?size=${sizeCode}&format=${format}`
      
      console.log('🔵 [Client] Calling API route:', url)
      
      const response = await fetch(url, {
        method: 'GET',
      })
      
      console.log('🔵 [Client] Response status:', response.status)

      if (response.status === 404) {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'No hay productos en dicha talla')
        setIsDownloading(false)
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error al descargar el catálogo: ${response.status} ${response.statusText}`)
      }

      // Verificar si la respuesta es JSON (para PNG multi-página)
      const contentType = response.headers.get('Content-Type') || ''
      
      if (format === 'png' && contentType.includes('application/json')) {
        // Manejar respuesta JSON con múltiples páginas PNG
        const data: CatalogPagesResponse = await response.json()
        console.log('🔵 [Client] PNG catalog with pages:', data.pages.length)
        
        if (!data.pages || data.pages.length === 0) {
          toast.error('No se encontraron páginas para descargar')
          setIsDownloading(false)
          return
        }

        // Crear instancia de JSZip
        const zip = new JSZip()
        
        // Descargar cada página y agregarla al ZIP
        toast.info(`Descargando ${data.pages.length} página(s)...`)
        
        for (const page of data.pages) {
          try {
            // Extraer parámetros de la URL del backend
            // La URL viene como: /admin/catalog/png-page?session=L_1767890074203864500&page=1
            const urlObj = new URL(page.url, 'http://dummy.com') // URL dummy solo para parsear
            const session = urlObj.searchParams.get('session')
            const pageNum = urlObj.searchParams.get('page')
            
            if (!session || !pageNum) {
              throw new Error(`URL de página inválida: ${page.url}`)
            }
            
            // Usar la API route de Next.js como proxy para evitar CORS
            const pageUrl = `/api/catalog/png-page?session=${session}&page=${pageNum}`
            console.log('🔵 [Client] Downloading page via API route:', pageUrl)
            
            const pageResponse = await fetch(pageUrl)
            
            if (!pageResponse.ok) {
              const errorData = await pageResponse.json().catch(() => ({}))
              throw new Error(errorData.error || `Error al descargar página ${page.page}: ${pageResponse.statusText}`)
            }
            
            const pageBlob = await pageResponse.blob()
            zip.file(page.filename, pageBlob)
          } catch (error) {
            console.error(`Error al descargar página ${page.page}:`, error)
            toast.error(`Error al descargar página ${page.page}`)
            throw error
          }
        }
        
        // Generar el archivo ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        
        // Crear URL temporal para el ZIP
        const zipUrl = URL.createObjectURL(zipBlob)
        
        // Crear un elemento <a> temporal para descargar
        const link = document.createElement('a')
        link.href = zipUrl
        link.download = `catalogo-${selectedSize}-${Date.now()}.zip`
        document.body.appendChild(link)
        link.click()
        
        // Limpiar
        document.body.removeChild(link)
        URL.revokeObjectURL(zipUrl)
        
        toast.success(`Catálogo descargado exitosamente (${data.pages.length} página(s))`)
      } else {
        // Para PDF o PNG legacy (blob), mantener comportamiento actual
        const blob = await response.blob()
        
        // Determinar la extensión según el formato
        const extension = format === 'png' ? 'png' : 'pdf'
        
        // Crear URL temporal para el blob
        const blobUrl = URL.createObjectURL(blob)
        
        // Crear un elemento <a> temporal para descargar
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `catalogo-${selectedSize}-${Date.now()}.${extension}`
        document.body.appendChild(link)
        link.click()
        
        // Limpiar
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
        
        toast.success(`Catálogo descargado exitosamente`)
      }
    } catch (error) {
      console.error('Error al descargar catálogo:', error)
      toast.error(error instanceof Error ? error.message : 'Error al descargar el catálogo')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div>
      <Header title="Crear catalogo" />
      <div className="space-y-6">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold mb-2">Crear catalogo</h1>
          <p className="text-muted-foreground mb-6">
            Selecciona la talla y el formato para generar y descargar el catálogo
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Configuración del catálogo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="size-select">Talla</Label>
              <Select
                value={selectedSize}
                onValueChange={(value) => setSelectedSize(value as Size)}
              >
                <SelectTrigger id="size-select">
                  <SelectValue placeholder="Seleccionar talla" />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format-select">Formato de salida</Label>
              <Select
                value={selectedFormat}
                onValueChange={(value) => setSelectedFormat(value as Format)}
              >
                <SelectTrigger id="format-select">
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleDownload}
              disabled={!selectedSize || !selectedFormat || isDownloading}
              className="w-full"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Descargando...' : 'Descargar'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

