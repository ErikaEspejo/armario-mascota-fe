'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { LazyImage } from '@/components/common/LazyImage'
import { BACKEND_BASE_URL } from '@/lib/constants'
import { 
  loadDesignAssets, 
  getPendingDesignAssets,
  saveDesignAsset, 
  filterDesignAssets,
  getDesignAssetById,
  assignStockToDesignAsset,
  DesignAsset,
  DesignAssetFilters
} from '@/services/api/design-assets'
import { 
  DECORATION_COLORS, 
  BUSO_TYPES, 
  IMAGE_TYPES, 
  DECO_BASE_OPTIONS,
  AVAILABLE_SIZES,
  getAvailableSizes,
  mapColorFromAPI,
  mapHoodieTypeFromAPI,
  mapImageTypeFromAPI,
  mapDecoBaseFromAPI,
  parseImageTypeToSizes,
  sizesToImageTypeString
} from '@/lib/decoration-constants'
import { Upload, Image as ImageIcon, Settings, Save, CheckCircle2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

export default function ProductsPage() {
  const [loadingImages, setLoadingImages] = useState(false)
  const [editDecorationsOpen, setEditDecorationsOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<DesignAsset | null>(null)
  const [loadingDesignAsset, setLoadingDesignAsset] = useState(false)
  const [savedAssets, setSavedAssets] = useState<Set<string>>(new Set())
  const [allPendingAssets, setAllPendingAssets] = useState<DesignAsset[]>([])
  const [loadingPendingAssets, setLoadingPendingAssets] = useState(false)
  const [showAllPending, setShowAllPending] = useState(false)
  
  // Filtros
  const [filters, setFilters] = useState<DesignAssetFilters>({})
  const [filteredDesignAssets, setFilteredDesignAssets] = useState<DesignAsset[]>([])
  const [loadingFilters, setLoadingFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Asignaciones por card
  const [assignments, setAssignments] = useState<Record<string, { size: string; quantity: number }>>({})
  
  // Tallas seleccionadas para el modal de edición
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  // Tallas seleccionadas por asset en la vista de pendientes
  const [selectedSizesByAsset, setSelectedSizesByAsset] = useState<Record<string, string[]>>({})

  const handleLoadImages = async () => {
    setLoadingImages(true)
    console.log('🟢 Botón "Cargar Imágenes" clickeado')
    
    try {
      console.log('🟡 Llamando a loadDesignAssets...')
      const data = await loadDesignAssets()
      console.log('✅ loadDesignAssets completado exitosamente:', data)
      toast.success('Imágenes cargadas exitosamente')
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

  const handleFilterDesigns = async () => {
    setLoadingFilters(true)
    try {
      console.log('🔵 Aplicando filtros:', filters)
      const data = await filterDesignAssets(filters)
      console.log('✅ Diseños filtrados recibidos:', data)
      // Mapear valores de la API a las constantes para que coincidan con los dropdowns
      const assetsWithDefaults = data.map(asset => {
        const mappedColorPrimary = mapColorFromAPI(asset.colorPrimary || '')
        const mappedColorSecondary = mapColorFromAPI(asset.colorSecondary || '') || mappedColorPrimary
        
        return {
          ...asset,
          colorPrimary: mappedColorPrimary,
          colorSecondary: mappedColorSecondary,
          hoodieType: mapHoodieTypeFromAPI(asset.hoodieType || ''),
          imageType: mapImageTypeFromAPI(asset.imageType || ''),
          decoBase: mapDecoBaseFromAPI(asset.decoBase || ''),
        }
      })
      setFilteredDesignAssets(assetsWithDefaults)
      toast.success(`${assetsWithDefaults.length} diseño(s) encontrado(s)`)
    } catch (error) {
      console.error('🔴 Error filtrando diseños:', error)
      let errorMessage = 'Error al filtrar los diseños'
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

  // Filtrar diseños por búsqueda en tiempo real
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
    console.log('🟡 Iniciando carga de design assets pendientes...')
    setLoadingPendingAssets(true)
    try {
      console.log('🟡 Llamando a getPendingDesignAssets...')
      const data = await getPendingDesignAssets()
      console.log('✅ Design assets pendientes recibidos:', data)
      // Mapear valores de la API a las constantes para que coincidan con los dropdowns
      const assetsWithDefaults = data.map(asset => {
        const mappedColorPrimary = mapColorFromAPI(asset.colorPrimary || '')
        const mappedColorSecondary = mapColorFromAPI(asset.colorSecondary || '') || mappedColorPrimary
        
        return {
          ...asset,
          colorPrimary: mappedColorPrimary,
          colorSecondary: mappedColorSecondary,
          hoodieType: mapHoodieTypeFromAPI(asset.hoodieType || ''),
          imageType: asset.imageType || '', // Mantener el formato del backend (concatenado por comas)
          decoBase: mapDecoBaseFromAPI(asset.decoBase || ''),
        }
      })
      setAllPendingAssets(assetsWithDefaults)
      // Inicializar las tallas seleccionadas para cada asset
      const initialSizes: Record<string, string[]> = {}
      assetsWithDefaults.forEach(asset => {
        if (asset.id) {
          initialSizes[asset.id] = parseImageTypeToSizes(asset.imageType || '')
        }
      })
      setSelectedSizesByAsset(initialSizes)
      setShowAllPending(true)
    } catch (error) {
      console.error('🔴 Error cargando design assets pendientes:', error)
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

  const loadDesignAssetForEdit = async (id: string) => {
    setShowAllPending(false)
    
    // Primero buscar en los diseños filtrados (estado local)
    const localAsset = filteredDesignAssets.find(asset => asset.id === id)
    
    if (localAsset) {
      // Usar la información que ya tenemos y mapear valores de la API a las constantes
      const mappedColorPrimary = mapColorFromAPI(localAsset.colorPrimary || '')
      const mappedColorSecondary = mapColorFromAPI(localAsset.colorSecondary || '') || mappedColorPrimary
      
      const assetWithDefaults: DesignAsset = {
        ...localAsset,
        description: localAsset.description || '',
        colorPrimary: mappedColorPrimary,
        colorSecondary: mappedColorSecondary,
        hoodieType: mapHoodieTypeFromAPI(localAsset.hoodieType || ''),
        imageType: localAsset.imageType || '', // Mantener el formato del backend
        decoBase: mapDecoBaseFromAPI(localAsset.decoBase || ''),
        hasHighlights: localAsset.hasHighlights ?? false,
        imageUrl: localAsset.imageUrl || '',
      }
      setEditingAsset(assetWithDefaults)
      // Parsear imageType a array de tallas para los checkboxes
      setSelectedSizes(parseImageTypeToSizes(localAsset.imageType || ''))
      setEditDecorationsOpen(true)
      return
    }
    
    // Si no está en el estado local, hacer llamada a la API
    setLoadingDesignAsset(true)
    try {
      const asset = await getDesignAssetById(id)
      if (asset) {
        // Mapear valores de la API a las constantes para que coincidan con los dropdowns
        const mappedColorPrimary = mapColorFromAPI(asset.colorPrimary || '')
        const mappedColorSecondary = mapColorFromAPI(asset.colorSecondary || '') || mappedColorPrimary
        
        const assetWithDefaults: DesignAsset = {
          ...asset,
          description: asset.description || '',
          colorPrimary: mappedColorPrimary,
          colorSecondary: mappedColorSecondary,
          hoodieType: mapHoodieTypeFromAPI(asset.hoodieType || ''),
          imageType: asset.imageType || '', // Mantener el formato del backend
          decoBase: mapDecoBaseFromAPI(asset.decoBase || ''),
          hasHighlights: asset.hasHighlights ?? false,
          imageUrl: asset.imageUrl || '',
        }
        setEditingAsset(assetWithDefaults)
        // Parsear imageType a array de tallas para los checkboxes
        setSelectedSizes(parseImageTypeToSizes(asset.imageType || ''))
        setEditDecorationsOpen(true)
      } else {
        toast.error('No se encontró el diseño')
      }
    } catch (error) {
      console.error('🔴 Error cargando design asset:', error)
      let errorMessage = 'Error al cargar el diseño'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    } finally {
      setLoadingDesignAsset(false)
    }
  }

  const handleSaveAsset = async (asset: DesignAsset) => {
    try {
      console.log('💾 Guardando asset:', asset)
      
      // Validar campos requeridos
      if (!asset.description || !asset.description.trim()) {
        toast.error('La descripción es requerida')
        return
      }
      
      if (!asset.colorPrimary || !asset.colorPrimary.trim()) {
        toast.error('El color primario es requerido')
        return
      }
      
      if (!asset.hoodieType || !asset.hoodieType.trim()) {
        toast.error('El tipo de buso es requerido')
        return
      }
      
      if (!asset.decoBase || !asset.decoBase.trim()) {
        toast.error('La base de decoración es requerida')
        return
      }
      
      // Validar que al menos una talla esté seleccionada
      // Si viene del modal principal, usar selectedSizes; si viene de la vista de pendientes, parsear del asset
      let imageTypeString: string
      if (showAllPending && asset.id) {
        // Vista de pendientes: usar las tallas del estado o parsear del asset
        const sizes = selectedSizesByAsset[asset.id] || parseImageTypeToSizes(asset.imageType || '')
        if (sizes.length === 0) {
          toast.error('Debe seleccionar al menos una talla')
          return
        }
        imageTypeString = sizesToImageTypeString(sizes)
      } else {
        // Modal principal: usar selectedSizes
        if (!selectedSizes || selectedSizes.length === 0) {
          toast.error('Debe seleccionar al menos una talla')
          return
        }
        imageTypeString = sizesToImageTypeString(selectedSizes)
      }
      
      // Si colorSecondary está vacío, asignar el mismo que colorPrimary
      const assetToSave = {
        ...asset,
        imageType: imageTypeString,
        colorSecondary: asset.colorSecondary && asset.colorSecondary.trim() 
          ? asset.colorSecondary 
          : asset.colorPrimary,
      }
      
      // Enviar al backend
      await saveDesignAsset(assetToSave)
      
      // Si el backend devuelve 200 (éxito), marcar como guardado
      if (assetToSave.id) {
        setSavedAssets(prev => new Set(prev).add(assetToSave.id!))
      }
      
      // Actualizar el asset en la lista filtrada si existe
      setFilteredDesignAssets(prev => 
        prev.map(a => a.id === assetToSave.id ? assetToSave : a)
      )
      
      // Actualizar también en la lista de pendientes si existe
      setAllPendingAssets(prev => 
        prev.map(a => a.id === assetToSave.id ? assetToSave : a)
      )
      
      // Actualizar las tallas seleccionadas si estamos en la vista de pendientes
      if (showAllPending && assetToSave.id) {
        setSelectedSizesByAsset(prev => ({
          ...prev,
          [assetToSave.id!]: parseImageTypeToSizes(imageTypeString)
        }))
      }
      
      setEditingAsset(null)
      setSelectedSizes([])
      if (!showAllPending) {
        setEditDecorationsOpen(false)
      }
      
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
      <Header title="Creación de productos" />
      <div className="space-y-6">
        {/* Subheader */}
        <div className="hidden md:block">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creación de productos</h1>
            <p className="text-muted-foreground">
              Esta vista está diseñada para crear productos mediante la asignación de diseños y tallas
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
              {loadingImages ? 'Cargando...' : 'Cargar Imágenes'}
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
              Editar Decoraciones
            </Button>
          </div>
        </div>

        {/* Línea horizontal */}
        <hr className="border-t" />

        {/* Sección de Creación de Productos */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Sección de creación de productos</h2>
          
          {/* Filtros */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Color Primario</Label>
                    <Combobox
                      value={filters.colorPrimary}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, colorPrimary: value }))}
                      options={DECORATION_COLORS}
                      placeholder="Todos"
                      searchPlaceholder="Buscar color..."
                      allowClear
                      clearLabel="Todos"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Color Secundario</Label>
                    <Combobox
                      value={filters.colorSecondary}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, colorSecondary: value }))}
                      options={DECORATION_COLORS}
                      placeholder="Todos"
                      searchPlaceholder="Buscar color..."
                      allowClear
                      clearLabel="Todos"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de Buso</Label>
                    <Combobox
                      value={filters.hoodieType}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, hoodieType: value }))}
                      options={BUSO_TYPES}
                      placeholder="Todos"
                      searchPlaceholder="Buscar tipo..."
                      allowClear
                      clearLabel="Todos"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de Imagen</Label>
                    <Combobox
                      value={filters.imageType}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, imageType: value }))}
                      options={IMAGE_TYPES}
                      placeholder="Todos"
                      searchPlaceholder="Buscar tipo..."
                      allowClear
                      clearLabel="Todos"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Base de Decoración</Label>
                    <Combobox
                      value={filters.decoBase}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, decoBase: value }))}
                      options={DECO_BASE_OPTIONS}
                      placeholder="Todos"
                      searchPlaceholder="Buscar base..."
                      allowClear
                      clearLabel="Todos"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleFilterDesigns}
                  disabled={loadingFilters}
                  className="w-full sm:w-auto"
                >
                  {loadingFilters ? 'Filtrando...' : 'Filtrar diseños'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Barra de búsqueda */}
          <div className="max-w-2xl">
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar diseños por código o descripción..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Cards de Diseños */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Diseños</h3>
            
            {searchFilteredAssets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {filteredDesignAssets.length === 0 
                      ? 'No hay diseños filtrados. Usa los filtros para buscar diseños.'
                      : 'No se encontraron diseños que coincidan con la búsqueda'}
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
                      {/* Botón editar */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 left-2 z-10 h-8 w-8"
                        onClick={() => {
                          if (asset.id) {
                            loadDesignAssetForEdit(asset.id)
                          }
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
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
          setSelectedSizes([])
          setSelectedSizesByAsset({})
          setShowAllPending(false)
          setAllPendingAssets([])
        }
      }}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="pr-6 sm:pr-0 text-base sm:text-lg">Editar Decoraciones</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {loadingDesignAsset || loadingPendingAssets ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : showAllPending && allPendingAssets.length > 0 ? (
              <div className="space-y-6">
                {allPendingAssets.map((asset, index) => {
                  const baseAsset = editingAsset?.id === asset.id && editingAsset ? editingAsset : asset
                  const assetToEdit: DesignAsset = {
                    ...baseAsset,
                    decoBase: baseAsset.decoBase && baseAsset.decoBase.trim() ? baseAsset.decoBase : 'N/A',
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

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`colorPrimary-${index}`}>Color Primario <span className="text-red-500">*</span></Label>
                                  <Combobox
                                    value={assetToEdit.colorPrimary}
                                    onValueChange={(value) => {
                                      if (!value) return // No permitir limpiar campos requeridos
                                      const updatedAsset = { ...assetToEdit, colorPrimary: value }
                                      if (!updatedAsset.colorSecondary || !updatedAsset.colorSecondary.trim()) {
                                        updatedAsset.colorSecondary = value
                                      }
                                      setEditingAsset(updatedAsset)
                                    }}
                                    options={DECORATION_COLORS}
                                    placeholder="Seleccione un color"
                                    searchPlaceholder="Buscar color..."
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`colorSecondary-${index}`}>Color Secundario</Label>
                                  <Combobox
                                    value={assetToEdit.colorSecondary}
                                    onValueChange={(value) => {
                                      setEditingAsset({ ...assetToEdit, colorSecondary: value || '' })
                                    }}
                                    options={DECORATION_COLORS}
                                    placeholder="Seleccione un color"
                                    searchPlaceholder="Buscar color..."
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`hoodieType-${index}`}>Tipo de Buso <span className="text-red-500">*</span></Label>
                                  <Combobox
                                    value={assetToEdit.hoodieType}
                                    onValueChange={(value) => {
                                      if (!value) return // No permitir limpiar campos requeridos
                                      setEditingAsset({ ...assetToEdit, hoodieType: value })
                                    }}
                                    options={BUSO_TYPES}
                                    placeholder="Seleccione un tipo"
                                    searchPlaceholder="Buscar tipo..."
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
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`decoBase-${index}`}>Base de Decoración <span className="text-red-500">*</span></Label>
                                <Combobox
                                  value={assetToEdit.decoBase || 'N/A'}
                                  onValueChange={(value) => {
                                    if (!value) return // No permitir limpiar campos requeridos
                                    setEditingAsset({ ...assetToEdit, decoBase: value })
                                  }}
                                  options={DECO_BASE_OPTIONS}
                                  placeholder="Seleccione una base"
                                  searchPlaceholder="Buscar base..."
                                />
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`hasHighlights-${index}`}
                                  checked={assetToEdit.hasHighlights}
                                  onCheckedChange={(checked) => {
                                    setEditingAsset({ ...assetToEdit, hasHighlights: checked === true })
                                  }}
                                />
                                <Label htmlFor={`hasHighlights-${index}`} className="cursor-pointer">
                                  Tiene brillante
                                </Label>
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
            ) : editingAsset ? (
              <div className="space-y-6">
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Imagen */}
                      <div className="space-y-4">
                        <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                          {(() => {
                            const imagePath = editingAsset.optimizedImageUrl || editingAsset.imageUrl
                            if (!imagePath) {
                              return (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                  <ImageIcon className="h-12 w-12" />
                                </div>
                              )
                            }
                            
                            const fullUrl = editingAsset.optimizedImageUrl
                              ? imagePath.startsWith('http') 
                                ? imagePath 
                                : `${BACKEND_BASE_URL}${imagePath}`
                              : imagePath
                            
                            return (
                              <LazyImage
                                src={fullUrl}
                                alt={editingAsset.description || 'Decoración'}
                                className="max-w-full max-h-full w-full h-full object-contain"
                                placeholderClassName="w-full h-full"
                                errorPlaceholderClassName="w-full h-full"
                              />
                            )
                          })()}
                        </div>
                      </div>

                      {/* Formulario de edición */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="description">Descripción <span className="text-red-500">*</span></Label>
                          <Input
                            id="description"
                            value={editingAsset.description}
                            onChange={(e) => {
                              setEditingAsset({ ...editingAsset, description: e.target.value })
                            }}
                            placeholder="Descripción de la decoración"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="colorPrimary">Color Primario <span className="text-red-500">*</span></Label>
                            <Combobox
                              value={editingAsset.colorPrimary}
                              onValueChange={(value) => {
                                if (!value) return // No permitir limpiar campos requeridos
                                const updatedAsset = { ...editingAsset, colorPrimary: value }
                                if (!updatedAsset.colorSecondary || !updatedAsset.colorSecondary.trim()) {
                                  updatedAsset.colorSecondary = value
                                }
                                setEditingAsset(updatedAsset)
                              }}
                              options={DECORATION_COLORS}
                              placeholder="Seleccione un color"
                              searchPlaceholder="Buscar color..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="colorSecondary">Color Secundario</Label>
                            <Combobox
                              value={editingAsset.colorSecondary}
                              onValueChange={(value) => {
                                setEditingAsset({ ...editingAsset, colorSecondary: value || '' })
                              }}
                              options={DECORATION_COLORS}
                              placeholder="Seleccione un color"
                              searchPlaceholder="Buscar color..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="hoodieType">Tipo de Buso <span className="text-red-500">*</span></Label>
                            <Combobox
                              value={editingAsset.hoodieType}
                              onValueChange={(value) => {
                                if (!value) return // No permitir limpiar campos requeridos
                                setEditingAsset({ ...editingAsset, hoodieType: value })
                              }}
                              options={BUSO_TYPES}
                              placeholder="Seleccione un tipo"
                              searchPlaceholder="Buscar tipo..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Imagen válida para: <span className="text-red-500">*</span></Label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              {AVAILABLE_SIZES.map((size) => (
                                <div key={size} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`size-${size}`}
                                    checked={selectedSizes.includes(size)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedSizes([...selectedSizes, size])
                                      } else {
                                        setSelectedSizes(selectedSizes.filter(s => s !== size))
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`size-${size}`} className="cursor-pointer text-sm font-normal">
                                    {size}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="decoBase">Base de Decoración <span className="text-red-500">*</span></Label>
                          <Combobox
                            value={editingAsset.decoBase || 'N/A'}
                            onValueChange={(value) => {
                              if (!value) return // No permitir limpiar campos requeridos
                              setEditingAsset({ ...editingAsset, decoBase: value })
                            }}
                            options={DECO_BASE_OPTIONS}
                            placeholder="Seleccione una base"
                            searchPlaceholder="Buscar base..."
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasHighlights"
                            checked={editingAsset.hasHighlights}
                            onCheckedChange={(checked) => {
                              setEditingAsset({ ...editingAsset, hasHighlights: checked === true })
                            }}
                          />
                          <Label htmlFor="hasHighlights" className="cursor-pointer">
                            Tiene brillante
                          </Label>
                        </div>

                        <Button
                          onClick={() => handleSaveAsset(editingAsset)}
                          className="w-full"
                          size="sm"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Cambios
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : showAllPending && allPendingAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay decoraciones pendientes
              </p>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Selecciona un diseño para editar o usa el botón &quot;Editar Decoraciones&quot; para ver todos los pendientes
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
