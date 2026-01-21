'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { LazyImage } from '@/components/common/LazyImage'
import { BACKEND_BASE_URL } from '@/lib/constants'
import { 
  getCustomPendingDesignAssets,
  saveDesignAsset, 
  filterDesignAssets,
  loadDesignAssets,
  assignStockToDesignAsset,
  DesignAsset,
  DesignAssetFilters
} from '@/services/api/design-assets'
import { 
  AVAILABLE_SIZES,
  getAvailableSizes,
  parseImageTypeToSizes,
  sizesToImageTypeString
} from '@/lib/decoration-constants'
import { Upload, Image as ImageIcon, Settings, Save, CheckCircle2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function CustomizableProductsPage() {
  const router = useRouter()
  const [loadingImages, setLoadingImages] = useState(false)
  const [editDecorationsOpen, setEditDecorationsOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<DesignAsset | null>(null)
  const [savedAssets, setSavedAssets] = useState<Set<string>>(new Set())
  const [allPendingAssets, setAllPendingAssets] = useState<DesignAsset[]>([])
  const [loadingPendingAssets, setLoadingPendingAssets] = useState(false)
  const [showAllPending, setShowAllPending] = useState(false)
  
  // Productos filtrados
  const [filteredDesignAssets, setFilteredDesignAssets] = useState<DesignAsset[]>([])
  const [loadingFilters, setLoadingFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Asignaciones por card
  const [assignments, setAssignments] = useState<Record<string, { size: string; quantity: number }>>({})
  
  // Tallas seleccionadas por asset en la vista de pendientes
  const [selectedSizesByAsset, setSelectedSizesByAsset] = useState<Record<string, string[]>>({})

  const handleLoadImages = async () => {
    setLoadingImages(true)
    console.log('🟢 Botón "Cargar decoraciones" clickeado')
    
    try {
      console.log('🟡 Llamando a loadDesignAssets con type=customizable...')
      const response = await loadDesignAssets('customizable')
      console.log('✅ loadDesignAssets(type=customizable) completado exitosamente:', response)

      const inserted = typeof response === 'object' && response !== null && 'inserted' in response 
        ? (response as { inserted?: number }).inserted || 0 
        : 0
      toast.success(`Imágenes cargadas exitosamente (insertadas: ${inserted})`)
    } catch (error) {
      console.error('🔴 Error en handleLoadImages:', error)
      let errorMessage = 'Error al cargar las imágenes'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage, {
        duration: 5000,
      })
    } finally {
      setLoadingImages(false)
      console.log('🟢 handleLoadImages finalizado')
    }
  }

  const handleLoadProducts = async () => {
    setLoadingFilters(true)
    try {
      console.log('🔵 Cargando productos con status=custom-ready...')
      const filters: DesignAssetFilters = {
        status: 'custom-ready'
      }
      const data = await filterDesignAssets(filters)
      console.log('✅ Productos personalizados recibidos:', data)
      setFilteredDesignAssets(data)
      toast.success(`${data.length} producto(s) encontrado(s)`)
    } catch (error) {
      console.error('🔴 Error cargando productos:', error)
      let errorMessage = 'Error al cargar los productos'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
      setFilteredDesignAssets([])
    } finally {
      setLoadingFilters(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Filtrar productos por búsqueda en tiempo real
  const searchFilteredAssets = filteredDesignAssets.filter(asset => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      asset.code?.toLowerCase().includes(query) ||
      asset.description?.toLowerCase().includes(query) ||
      (asset.id ? String(asset.id).toLowerCase().includes(query) : false)
    )
  })

  const loadPendingDesignAssets = async () => {
    console.log('🟡 Iniciando carga de design assets personalizados pendientes...')
    setLoadingPendingAssets(true)
    try {
      console.log('🟡 Llamando a getCustomPendingDesignAssets...')
      const data = await getCustomPendingDesignAssets()
      console.log('✅ Design assets personalizados pendientes recibidos:', data)
      setAllPendingAssets(data)
      // Inicializar las tallas seleccionadas para cada asset
      const initialSizes: Record<string, string[]> = {}
      data.forEach(asset => {
        if (asset.id) {
          initialSizes[asset.id] = parseImageTypeToSizes(asset.imageType || '')
        }
      })
      setSelectedSizesByAsset(initialSizes)
      setShowAllPending(true)
    } catch (error) {
      console.error('🔴 Error cargando design assets personalizados pendientes:', error)
      let errorMessage = 'Error al cargar las decoraciones pendientes'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
      setAllPendingAssets([])
    } finally {
      setLoadingPendingAssets(false)
      console.log('🟢 loadPendingDesignAssets finalizado')
    }
  }

  const handleSaveAsset = async (asset: DesignAsset) => {
    try {
      console.log('💾 Guardando asset personalizado:', asset)
      
      // Validar campos requeridos
      if (!asset.description || !asset.description.trim()) {
        toast.error('La descripción es requerida')
        return
      }
      
      // Validar que al menos una talla esté seleccionada
      const sizes = selectedSizesByAsset[asset.id || ''] || parseImageTypeToSizes(asset.imageType || '')
      if (sizes.length === 0) {
        toast.error('Debe seleccionar al menos una talla')
        return
      }
      const imageTypeString = sizesToImageTypeString(sizes)
      
      // Preparar asset con valores fijos para productos personalizados
      const assetToSave: DesignAsset = {
        ...asset,
        colorPrimary: 'custom',
        colorSecondary: 'custom',
        hoodieType: 'custom',
        hasHighlights: false,
        decoBase: '0',
        imageType: imageTypeString,
      }
      
      // Enviar al backend
      await saveDesignAsset(assetToSave)
      
      // Si el backend devuelve 200 (éxito), marcar como guardado
      if (assetToSave.id) {
        setSavedAssets(prev => new Set(prev).add(assetToSave.id!))
      }
      
      // Actualizar el asset en la lista de pendientes si existe
      setAllPendingAssets(prev => 
        prev.map(a => a.id === assetToSave.id ? assetToSave : a)
      )
      
      // Actualizar las tallas seleccionadas
      if (assetToSave.id) {
        setSelectedSizesByAsset(prev => ({
          ...prev,
          [assetToSave.id!]: parseImageTypeToSizes(imageTypeString)
        }))
      }
      
      setEditingAsset(null)
      
      toast.success('Decoración guardada exitosamente')
    } catch (error) {
      console.error('🔴 Error guardando asset:', error)
      let errorMessage = 'Error al guardar la decoración'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    }
  }

  const handleAssign = async (assetId: string) => {
    console.log('🟢 [handleAssign] Botón "Asignar" clickeado para assetId:', assetId)
    
    if (!assetId) {
      console.error('🔴 [handleAssign] ID de diseño no válido:', assetId)
      toast.error('ID de diseño no válido')
      return
    }
    
    const assignment = assignments[assetId]
    
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
      
      let errorMessage = 'Error al guardar la asignación'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    }
  }

  const updateAssignment = (assetId: string, field: 'size' | 'quantity', value: string | number) => {
    console.log('🟡 [updateAssignment] Actualizando asignación:', { assetId, field, value })
    setAssignments(prev => {
      const updated = {
        ...prev,
        [assetId]: {
          ...prev[assetId],
          [field]: value,
        }
      }
      console.log('🟡 [updateAssignment] Estado de asignaciones actualizado:', updated[assetId])
      return updated
    })
  }

  return (
    <div>
      <Header title="Productos personalizados" />
      <div className="space-y-6">
        {/* Header con botón volver */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/products')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Productos personalizados</h1>
            <p className="text-muted-foreground">
              Gestión de productos personalizados
            </p>
          </div>
        </div>

        {/* Sección de Decoraciones */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Decoraciones:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleLoadImages}
              disabled={loadingImages}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Upload className="mr-2 h-3 w-3" />
              {loadingImages ? 'Cargando...' : 'Cargar decoraciones'}
            </Button>
            <Button
              onClick={() => {
                console.log('🟢 Botón "Editar Decoraciones" clickeado')
                setEditDecorationsOpen(true)
                loadPendingDesignAssets()
              }}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Settings className="mr-2 h-3 w-3" />
              Editar decoraciones
            </Button>
          </div>
        </div>

        {/* Línea horizontal */}
        <hr className="border-t" />

        {/* Sección de Creación de Productos */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Sección de creación de productos</h2>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleLoadProducts}
              disabled={loadingFilters}
              className="w-full sm:w-auto"
            >
              {loadingFilters ? 'Cargando...' : 'Cargar productos'}
            </Button>
          </div>

          {/* Barra de búsqueda */}
          {filteredDesignAssets.length > 0 && (
            <div className="max-w-2xl">
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar productos por código o descripción..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Cards de Productos */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Productos</h3>
            
            {searchFilteredAssets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {filteredDesignAssets.length === 0 
                      ? 'No hay productos cargados. Usa el botón "Cargar productos" para buscar productos.'
                      : 'No se encontraron productos que coincidan con la búsqueda'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchFilteredAssets.map((asset) => {
                  const availableSizes = getAvailableSizes(asset.imageType)
                  const assignment = assignments[asset.id || ''] || { size: '', quantity: 0 }
                  
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
                            />
                          </div>
                          
                          <Button
                            onClick={() => handleAssign(asset.id || '')}
                            className="w-full"
                            size="sm"
                          >
                            Asignar
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
      </div>

      {/* Modal de Editar Decoraciones */}
      <Dialog open={editDecorationsOpen} onOpenChange={(open) => {
        setEditDecorationsOpen(open)
        if (!open) {
          setEditingAsset(null)
          setSelectedSizesByAsset({})
          setShowAllPending(false)
          setAllPendingAssets([])
        }
      }}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="pr-6 sm:pr-0 text-base sm:text-lg">Editar Decoraciones Personalizadas</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {loadingPendingAssets ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : showAllPending && allPendingAssets.length > 0 ? (
              <div className="space-y-6">
                {allPendingAssets.map((asset, index) => {
                  const baseAsset = editingAsset?.id === asset.id && editingAsset ? editingAsset : asset
                  const assetToEdit: DesignAsset = {
                    ...baseAsset,
                    description: baseAsset.description || '',
                  }
                  const isSaved = asset.id && savedAssets.has(asset.id)
                  
                  return (
                    <Card key={asset.id || index} className="overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        {isSaved ? (
                          <div className="flex items-center gap-4">
                            <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                              {(() => {
                                const imagePath = asset.optimizedImageUrl || asset.imageUrl
                                if (!imagePath) {
                                  return (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                      <ImageIcon className="h-8 w-8" />
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
                                    alt={asset.description || 'Decoración'}
                                    className="max-w-full max-h-full w-full h-full object-contain"
                                    placeholderClassName="w-full h-full"
                                    errorPlaceholderClassName="w-full h-full"
                                  />
                                )
                              })()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm font-medium text-green-600">Guardado exitosamente</p>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{asset.description || 'Sin descripción'}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
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
                                      alt={asset.description || 'Decoración'}
                                      className="max-w-full max-h-full w-full h-full object-contain"
                                      placeholderClassName="w-full h-full"
                                      errorPlaceholderClassName="w-full h-full"
                                    />
                                  )
                                })()}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor={`description-${index}`}>Descripción <span className="text-red-500">*</span></Label>
                                <Input
                                  id={`description-${index}`}
                                  value={assetToEdit.description}
                                  onChange={(e) => {
                                    setEditingAsset({ ...assetToEdit, description: e.target.value })
                                  }}
                                  placeholder="Descripción de la decoración"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Imagen válida para: <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  {AVAILABLE_SIZES.map((size) => {
                                    const assetId = asset.id || `temp-${index}`
                                    const currentSizes = selectedSizesByAsset[assetId] || parseImageTypeToSizes(assetToEdit.imageType || '')
                                    return (
                                      <div key={size} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`size-${assetId}-${size}`}
                                          checked={currentSizes.includes(size)}
                                          onCheckedChange={(checked) => {
                                            const assetId = asset.id || `temp-${index}`
                                            const currentSizes = selectedSizesByAsset[assetId] || parseImageTypeToSizes(assetToEdit.imageType || '')
                                            let newSizes: string[]
                                            if (checked) {
                                              newSizes = [...currentSizes, size]
                                            } else {
                                              newSizes = currentSizes.filter(s => s !== size)
                                            }
                                            setSelectedSizesByAsset({ ...selectedSizesByAsset, [assetId]: newSizes })
                                            // Actualizar también el imageType en editingAsset
                                            const imageTypeString = sizesToImageTypeString(newSizes)
                                            setEditingAsset({ ...assetToEdit, imageType: imageTypeString })
                                          }}
                                        />
                                        <Label htmlFor={`size-${assetId}-${size}`} className="cursor-pointer text-sm font-normal">
                                          {size}
                                        </Label>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              <Button
                                onClick={() => handleSaveAsset(assetToEdit)}
                                className="w-full"
                                size="sm"
                              >
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Cambios
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : showAllPending && allPendingAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay decoraciones pendientes
              </p>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Usa el botón &quot;Editar decoraciones&quot; para ver las decoraciones pendientes
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

