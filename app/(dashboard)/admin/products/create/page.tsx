'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadDesignAssets } from '@/services/api/design-assets'
import { toast } from 'sonner'
import { Upload, ArrowLeft } from 'lucide-react'

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
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
      toast.success('Imágenes cargadas exitosamente')
      console.log('Design assets loaded:', data)
      // Aquí puedes procesar los datos recibidos según la estructura de la respuesta
    } catch (error) {
      console.error('Error loading images:', error)
      toast.error('Error al cargar las imágenes')
    } finally {
      setLoadingImages(false)
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


