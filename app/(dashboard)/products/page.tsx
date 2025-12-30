'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { SearchBar } from '@/components/common/SearchBar'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { LazyImage } from '@/components/common/LazyImage'
import { BACKEND_BASE_URL } from '@/lib/constants'
import { Product } from '@/types'
import * as productService from '@/services/mock/products'
import { loadDesignAssets, getPendingDesignAssets, DesignAsset } from '@/services/api/design-assets'
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, Settings, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function ProductsPage() {
  const router = useRouter()
  const { products, loading: contextLoading } = useApp()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingImages, setLoadingImages] = useState(false)
  const [editDecorationsOpen, setEditDecorationsOpen] = useState(false)
  const [designAssets, setDesignAssets] = useState<DesignAsset[]>([])
  const [loadingDesignAssets, setLoadingDesignAssets] = useState(false)
  const [editingAsset, setEditingAsset] = useState<DesignAsset | null>(null)

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, products])

  const loadProducts = async () => {
    setLoading(true)
    try {
      let result: Product[]
      if (searchQuery.trim()) {
        result = await productService.searchProducts(searchQuery)
      } else {
        result = products.length > 0 ? products : await productService.getProducts()
      }
      setFilteredProducts(result)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleEdit = (product: Product) => {
    // TODO: Implementar edición de producto
    toast.info(`Edición de ${product.name} próximamente`)
    // router.push(`/admin/products/${product.id}/edit`)
  }

  const handleDelete = async (product: Product) => {
    // TODO: Implementar eliminación de producto
    toast.info(`Eliminación de ${product.name} próximamente`)
  }

  const handleLoadImages = async () => {
    setLoadingImages(true)
    console.log('🟢 Botón "Cargar Imágenes" clickeado')
    
    try {
      console.log('🟡 Llamando a loadDesignAssets...')
      const data = await loadDesignAssets()
      console.log('✅ loadDesignAssets completado exitosamente:', data)
      toast.success('Imágenes cargadas exitosamente')
      // Aquí puedes procesar los datos recibidos según la estructura de la respuesta
    } catch (error) {
      console.error('🔴 Error en handleLoadImages:', error)
      
      // Mostrar mensaje de error más descriptivo
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

  const loadPendingDesignAssets = async () => {
    console.log('🟡 Iniciando carga de design assets pendientes...')
    setLoadingDesignAssets(true)
    try {
      console.log('🟡 Llamando a getPendingDesignAssets...')
      const data = await getPendingDesignAssets()
      console.log('✅ Design assets pendientes recibidos:', data)
      setDesignAssets(data)
    } catch (error) {
      console.error('🔴 Error cargando design assets pendientes:', error)
      let errorMessage = 'Error al cargar las decoraciones pendientes'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
      setDesignAssets([])
    } finally {
      setLoadingDesignAssets(false)
      console.log('🟢 loadPendingDesignAssets finalizado')
    }
  }

  const handleSaveAsset = async (asset: DesignAsset, index: number) => {
    try {
      // TODO: Implementar guardado en el backend
      console.log('💾 Guardando asset:', asset)
      
      // Actualizar el estado local
      const updatedAssets = [...designAssets]
      updatedAssets[index] = asset
      setDesignAssets(updatedAssets)
      setEditingAsset(null)
      
      toast.success('Decoración guardada exitosamente')
    } catch (error) {
      console.error('🔴 Error guardando asset:', error)
      toast.error('Error al guardar la decoración')
    }
  }

  if (contextLoading || loading) {
    return (
      <div>
        <Header title="Productos" />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Productos" />
      <div className="space-y-6">
        <div className="hidden md:block">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Productos</h1>
              <p className="text-muted-foreground">
                Gestiona tu catálogo de productos
              </p>
            </div>
            <Button onClick={() => router.push('/admin/products/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Producto
            </Button>
          </div>
        </div>

        <div className="md:hidden mb-4">
          <Button 
            onClick={() => router.push('/admin/products/create')}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Producto
          </Button>
        </div>

        <SearchBar
          onSearch={handleSearch}
          defaultValue={searchQuery}
          placeholder="Buscar productos por nombre o SKU..."
          className="max-w-2xl"
        />

        {/* Sección de Decoraciones (Imágenes) */}
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

        {/* Modal de Editar Decoraciones */}
        <Dialog open={editDecorationsOpen} onOpenChange={(open) => {
          setEditDecorationsOpen(open)
          if (open) {
            loadPendingDesignAssets()
          } else {
            setEditingAsset(null)
          }
        }}>
          <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="pr-6 sm:pr-0 text-base sm:text-lg">Editar Decoraciones</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {loadingDesignAssets ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : designAssets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay decoraciones pendientes
                </p>
              ) : (
                <div className="space-y-6">
                  {designAssets.map((asset, index) => {
                    const assetToEdit: DesignAsset = editingAsset?.id === asset.id && editingAsset ? editingAsset : asset
                    return (
                      <Card key={asset.id || index} className="overflow-hidden">
                        <CardContent className="p-4 sm:p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Imagen */}
                            <div className="space-y-4">
                              <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                                {(() => {
                                  // Usar optimizedImageUrl si está disponible, sino fallback a imageUrl
                                  const imagePath = asset.optimizedImageUrl || asset.imageUrl
                                  if (!imagePath) {
                                    return (
                                      <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <ImageIcon className="h-12 w-12" />
                                      </div>
                                    )
                                  }
                                  
                                  // Construir URL completa: si optimizedImageUrl es relativo, agregar base URL
                                  // Si imageUrl ya es completa (http/https), usarla directamente
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

                            {/* Formulario de edición */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor={`description-${index}`}>Descripción</Label>
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
                                  <Label htmlFor={`colorPrimary-${index}`}>Color Primario</Label>
                                  <Select
                                    value={assetToEdit.colorPrimary}
                                    onValueChange={(value) => {
                                      setEditingAsset({ ...assetToEdit, colorPrimary: value })
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Negro">Negro</SelectItem>
                                      <SelectItem value="Blanco">Blanco</SelectItem>
                                      <SelectItem value="Azul">Azul</SelectItem>
                                      <SelectItem value="Rojo">Rojo</SelectItem>
                                      <SelectItem value="Verde">Verde</SelectItem>
                                      <SelectItem value="Gris">Gris</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`colorSecondary-${index}`}>Color Secundario</Label>
                                  <Select
                                    value={assetToEdit.colorSecondary}
                                    onValueChange={(value) => {
                                      setEditingAsset({ ...assetToEdit, colorSecondary: value })
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Negro">Negro</SelectItem>
                                      <SelectItem value="Blanco">Blanco</SelectItem>
                                      <SelectItem value="Azul">Azul</SelectItem>
                                      <SelectItem value="Rojo">Rojo</SelectItem>
                                      <SelectItem value="Verde">Verde</SelectItem>
                                      <SelectItem value="Gris">Gris</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`hoodieType-${index}`}>Tipo de Buso</Label>
                                  <Select
                                    value={assetToEdit.hoodieType}
                                    onValueChange={(value) => {
                                      setEditingAsset({ ...assetToEdit, hoodieType: value })
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Con Mangas">Con Mangas</SelectItem>
                                      <SelectItem value="Sin Mangas">Sin Mangas</SelectItem>
                                      <SelectItem value="Canguro">Canguro</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`imageType-${index}`}>Tipo de Imagen</Label>
                                  <Select
                                    value={assetToEdit.imageType}
                                    onValueChange={(value) => {
                                      setEditingAsset({ ...assetToEdit, imageType: value })
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PNG">PNG</SelectItem>
                                      <SelectItem value="JPG">JPG</SelectItem>
                                      <SelectItem value="SVG">SVG</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`decoBase-${index}`}>Base de Decoración</Label>
                                <Select
                                  value={assetToEdit.decoBase}
                                  onValueChange={(value) => {
                                    setEditingAsset({ ...assetToEdit, decoBase: value })
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Base 1">Base 1</SelectItem>
                                    <SelectItem value="Base 2">Base 2</SelectItem>
                                    <SelectItem value="Base 3">Base 3</SelectItem>
                                  </SelectContent>
                                </Select>
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
                                  Tiene Resaltados
                                </Label>
                              </div>

                              <Button
                                onClick={() => handleSaveAsset(assetToEdit, index)}
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
                    )
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No se encontraron productos' : 'No hay productos registrados'}
              </p>
              <Button onClick={() => router.push('/admin/products/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Producto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-1">{product.subtitle}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Precio:</span>
                    <span className="font-semibold">${product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="font-semibold">
                      {product.stockTotal - product.stockReserved} disponible
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Variantes:</span>
                    <span className="font-semibold">{product.variants.length}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product)}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

