'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { loadDesignAssets, DesignAsset, assignStockToDesignAsset } from '@/services/api/design-assets'
import { getAvailableSizes } from '@/lib/decoration-constants'
import { BACKEND_BASE_URL } from '@/lib/constants'
import { LazyImage } from '@/components/common/LazyImage'
import { toast } from 'sonner'
import { Upload, ArrowLeft, Image as ImageIcon } from 'lucide-react'

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
  const [designAssets, setDesignAssets] = useState<DesignAsset[]>([])
  const [assignments, setAssignments] = useState<Record<string, { size: string; quantity: number }>>({})
  const [assigning, setAssigning] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    sku: '',
    imageUrl: '',
    price: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLoadImages = async () => {
    setLoadingImages(true)
    try {
      const data = await loadDesignAssets()
      console.log('Design assets loaded:', data)
      
      // Procesar los datos recibidos según la estructura de la respuesta
      let assets: DesignAsset[] = []
      if (Array.isArray(data)) {
        assets = data
      } else if (data && typeof data === 'object' && 'items' in data) {
        assets = (data as { items: DesignAsset[] }).items
      } else if (data && typeof data === 'object' && 'data' in data) {
        assets = (data as { data: DesignAsset[] }).data
      }
      
      setDesignAssets(assets)
      toast.success(`Imágenes cargadas exitosamente (${assets.length} diseños)`)
    } catch (error) {
      console.error('Error loading images:', error)
      let errorMessage = 'Error al cargar las imágenes'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    } finally {
      setLoadingImages(false)
    }
  }

  const updateAssignment = (assetId: string, field: 'size' | 'quantity', value: string | number) => {
    console.log('🟡 [handleAssign] Actualizando asignación:', { assetId, field, value })
    setAssignments(prev => {
      const updated = {
        ...prev,
        [assetId]: {
          ...prev[assetId],
          [field]: value,
        }
      }
      console.log('🟡 [handleAssign] Estado de asignaciones actualizado:', updated[assetId])
      return updated
    })
  }

  const handleAssign = async (assetId: string) => {
    console.log('🟢 [handleAssign] Botón "Asignar" clickeado para assetId:', assetId)
    console.log('🟢 [handleAssign] Estado actual de assignments:', assignments)
    
    if (!assetId) {
      console.error('🔴 [handleAssign] ID de diseño no válido:', assetId)
      toast.error('ID de diseño no válido')
      return
    }
    
    const assignment = assignments[assetId]
    console.log('🟢 [handleAssign] Assignment encontrado:', assignment)
    
    if (!assignment) {
      console.error('🔴 [handleAssign] No hay asignación para este asset')
      toast.error('Por favor selecciona una talla y cantidad')
      return
    }
    
    if (!assignment.size) {
      console.error('🔴 [handleAssign] No hay talla seleccionada')
      toast.error('Por favor selecciona una talla')
      return
    }
    
    if (!assignment.quantity || assignment.quantity <= 0) {
      console.error('🔴 [handleAssign] Cantidad inválida:', assignment.quantity)
      toast.error('Por favor ingresa una cantidad válida')
      return
    }
    
    console.log('🟢 [handleAssign] Validaciones pasadas. Datos a enviar:', {
      assetId,
      size: assignment.size,
      quantity: assignment.quantity
    })
    
    setAssigning(prev => ({ ...prev, [assetId]: true }))
    console.log('🟢 [handleAssign] Estado de asignación actualizado, llamando a assignStockToDesignAsset...')
    
    try {
      console.log('🟢 [handleAssign] Llamando a assignStockToDesignAsset con:', {
        designAssetId: assetId,
        size: assignment.size,
        quantity: assignment.quantity
      })
      
      await assignStockToDesignAsset(assetId, assignment.size, assignment.quantity)
      
      console.log('✅ [handleAssign] assignStockToDesignAsset completado exitosamente')
      toast.success(`Stock asignado: ${assignment.quantity} unidades en talla ${assignment.size}`)
      
      // Limpiar asignación después de guardar
      setAssignments(prev => {
        const newAssignments = { ...prev }
        delete newAssignments[assetId]
        console.log('✅ [handleAssign] Asignación limpiada para assetId:', assetId)
        return newAssignments
      })
    } catch (error) {
      console.error('🔴 [handleAssign] Error en el bloque catch:', error)
      console.error('🔴 [handleAssign] Tipo de error:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('🔴 [handleAssign] Mensaje de error:', error instanceof Error ? error.message : String(error))
      console.error('🔴 [handleAssign] Stack trace:', error instanceof Error ? error.stack : 'N/A')
      
      let errorMessage = 'Error al guardar la asignación'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    } finally {
      console.log('🟢 [handleAssign] Finalizando, desactivando estado de asignación')
      setAssigning(prev => ({ ...prev, [assetId]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Aquí iría la lógica para crear el producto
      toast.success('Producto creado exitosamente')
      router.push('/inventory')
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header title="Crear Producto" />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Crear Producto</h1>
            <p className="text-muted-foreground">
              Completa los datos para crear un nuevo producto
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Buso con Capucha"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Ej: Buso / Con mangas"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Ej: BUSO-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Ej: 15000"
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de Imagen</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLoadImages}
                  disabled={loadingImages}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {loadingImages ? 'Cargando...' : 'Cargar Imágenes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Design Assets con asignación de tallas */}
          {designAssets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Asignar Stock a Diseños</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {designAssets.map((asset) => {
                    const availableSizes = getAvailableSizes(asset.imageType)
                    const assignment = assignments[asset.id || ''] || { size: '', quantity: 0 }
                    const isAssigning = assigning[asset.id || ''] || false
                    
                    return (
                      <Card key={asset.id || asset.code} className="relative hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 space-y-4">
                          {/* Imagen */}
                          <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                            {(() => {
                              const imagePath = asset.optimizedImageUrl || asset.imageUrl
                              if (!imagePath) {
                                return (
                                  <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <ImageIcon className="h-12 w-12" />
                                  </div>
                                )
                              }
                              
                              const fullUrl = asset.optimizedImageUrl
                                ? imagePath.startsWith('http') 
                                  ? imagePath 
                                  : `${BACKEND_BASE_URL}${imagePath}`
                                : imagePath
                              
                              return (
                                <LazyImage
                                  src={fullUrl}
                                  alt={asset.description || 'Diseño'}
                                  className="max-w-full max-h-full w-full h-full object-contain"
                                  placeholderClassName="w-full h-full"
                                  errorPlaceholderClassName="w-full h-full"
                                />
                              )
                            })()}
                          </div>
                          
                          {/* ID (code) */}
                          {asset.code && (
                            <div>
                              <p className="text-sm font-medium">ID: <span className="text-muted-foreground">{asset.code}</span></p>
                            </div>
                          )}
                          
                          {/* Descripción */}
                          <div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Descripción:</span> {asset.description || 'Sin descripción'}
                            </p>
                          </div>
                          
                          {/* Asignación de talla */}
                          <div className="space-y-2 pt-2 border-t">
                            <p className="text-sm font-medium">Asignación de talla</p>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Select
                                value={assignment.size}
                                onValueChange={(value) => updateAssignment(asset.id || '', 'size', value)}
                                disabled={isAssigning}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona talla" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableSizes.map((size) => (
                                    <SelectItem key={size} value={size}>
                                      {size}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Input
                                type="number"
                                min="1"
                                placeholder="Cantidad"
                                value={assignment.quantity || ''}
                                onChange={(e) => updateAssignment(asset.id || '', 'quantity', parseInt(e.target.value) || 0)}
                                disabled={isAssigning}
                              />
                            </div>
                            
                            <Button
                              onClick={() => handleAssign(asset.id || '')}
                              className="w-full"
                              size="sm"
                              disabled={isAssigning || !asset.id || !assignment.size || !assignment.quantity || assignment.quantity <= 0}
                            >
                              {isAssigning ? 'Asignando...' : 'Asignar'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creando...' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


