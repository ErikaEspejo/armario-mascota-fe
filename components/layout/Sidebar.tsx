'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  DollarSign,
  BookOpen,
  Boxes,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/products', label: 'Productos', icon: Boxes },
  { href: '/inventory', label: 'Inventario', icon: Package },
  { href: '/separate', label: 'Separar Pedido', icon: ShoppingCart },
  { href: '/orders', label: 'Pedidos', icon: FileText },
  { href: '/sell', label: 'Vender', icon: DollarSign },
  { href: '/sales', label: 'Ventas', icon: DollarSign },
  { href: '/catalogs', label: 'Catálogos', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:left-0 bg-card border-r">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <h1 className="text-xl font-bold text-primary">Armario Mascota</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

