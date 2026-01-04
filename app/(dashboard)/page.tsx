'use client'

import { useRouter } from 'next/navigation'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import {
  ShoppingCart,
  Package,
  DollarSign,
  BookOpen,
  Boxes,
  TrendingUp,
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  const quickActions = [
    {
      title: 'Productos',
      description: 'Gestionar catálogo de productos',
      icon: Boxes,
      href: '/products',
      color: 'bg-indigo-500',
    },
    {
      title: 'Inventario',
      description: 'Ver productos disponibles',
      icon: Package,
      href: '/inventory',
      color: 'bg-teal-500',
    },
    {
      title: 'Pedidos',
      description: 'Gestionar pedidos',
      icon: ShoppingCart,
      href: '/separate',
      color: 'bg-blue-500',
    },
    {
      title: 'Ventas',
      description: 'Ver ventas realizadas',
      icon: DollarSign,
      href: '/sales',
      color: 'bg-green-500',
    },
    {
      title: 'Finanzas',
      description: 'Gestionar información financiera',
      icon: TrendingUp,
      href: '/finances',
      color: 'bg-purple-500',
    },
    {
      title: 'Catálogos',
      description: 'Ver catálogos generados',
      icon: BookOpen,
      href: '/catalogs',
      color: 'bg-pink-500',
    },
  ]

  return (
    <div>
      <Header title="Inicio" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold mb-2">Bienvenido</h1>
          <p className="text-muted-foreground mb-6">
            Accede rápidamente a las funciones principales
          </p>
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

