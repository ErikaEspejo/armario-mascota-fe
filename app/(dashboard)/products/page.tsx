'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SearchBar } from '@/components/common/SearchBar'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Product } from '@/types'
import * as productService from '@/services/mock/products'
import { loadDesignAssets } from '@/services/api/design-assets'
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, Settings } from 'lucide-react'
import { toast } from 'sonner'

export default function ProductsPage() {
  const router = useRouter()
  const { products, loading: contextLoading } = useApp()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingImages, setLoadingImages] = useState(false)
  const [editDecorationsOpen, setEditDecorationsOpen] = useState(false)

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
              onClick={() => setEditDecorationsOpen(true)}
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
        <Dialog open={editDecorationsOpen} onOpenChange={setEditDecorationsOpen}>
          <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 top-[50%] sm:top-[50%] left-[50%] sm:left-[50%] translate-x-[-50%] translate-y-[-50%] m-0">
            <DialogHeader>
              <DialogTitle className="pr-6 sm:pr-0 text-base sm:text-lg">Editar Decoraciones</DialogTitle>
            </DialogHeader>
            <div className="py-2 sm:py-4">
              <p className="text-sm text-muted-foreground">
                Contenido del editor de decoraciones próximamente...
              </p>
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

