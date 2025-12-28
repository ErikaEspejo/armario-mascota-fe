'use client'

import { useRouter } from 'next/navigation'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchBar } from '@/components/common/SearchBar'
import { Header } from '@/components/layout/Header'
import {
  ShoppingCart,
  Package,
  FileText,
  DollarSign,
  BookOpen,
  Search,
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/inventory?search=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/inventory')
    }
  }

  const quickActions = [
    {
      title: 'Separar Pedido',
      description: 'Crear un nuevo pedido separado',
      icon: ShoppingCart,
      href: '/separate',
      color: 'bg-blue-500',
    },
    {
      title: 'Buscar Producto',
      description: 'Buscar en el inventario',
      icon: Search,
      href: '/inventory',
      color: 'bg-green-500',
    },
    {
      title: 'Pedidos Separados',
      description: 'Ver pedidos pendientes',
      icon: FileText,
      href: '/orders',
      color: 'bg-orange-500',
    },
    {
      title: 'Nueva Venta',
      description: 'Procesar una venta',
      icon: DollarSign,
      href: '/sell',
      color: 'bg-purple-500',
    },
    {
      title: 'Catálogos Recientes',
      description: 'Ver catálogos generados',
      icon: BookOpen,
      href: '/catalogs',
      color: 'bg-pink-500',
    },
    {
      title: 'Inventario',
      description: 'Gestionar productos',
      icon: Package,
      href: '/inventory',
      color: 'bg-indigo-500',
    },
  ]

  return (
    <div>
      <Header title="Inicio" showSearch />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold mb-2">Bienvenido</h1>
          <p className="text-muted-foreground mb-6">
            Accede rápidamente a las funciones principales
          </p>
        </div>

        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar por SKU o nombre de producto..."
            className="max-w-2xl"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.href}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(action.href)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`${action.color} p-3 rounded-lg text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

