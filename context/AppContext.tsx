'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, Order, Sale, CatalogExport } from '@/types'
import * as productService from '@/services/mock/products'
import * as orderService from '@/services/mock/orders'
import * as saleService from '@/services/mock/sales'
import * as catalogService from '@/services/mock/catalogs'

interface AppContextType {
  products: Product[]
  orders: Order[]
  sales: Sale[]
  catalogs: CatalogExport[]
  loading: boolean
  refreshProducts: () => Promise<void>
  refreshOrders: () => Promise<void>
  refreshSales: () => Promise<void>
  refreshCatalogs: () => Promise<void>
  addOrder: (order: Order) => void
  updateOrder: (id: string, order: Partial<Order>) => void
  addSale: (sale: Sale) => void
  addCatalog: (catalog: CatalogExport) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [catalogs, setCatalogs] = useState<CatalogExport[]>([])
  const [loading, setLoading] = useState(true)

  const refreshProducts = async () => {
    try {
      const data = await productService.getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const refreshOrders = async () => {
    try {
      const data = await orderService.getOrders()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const refreshSales = async () => {
    try {
      const data = await saleService.getSales()
      setSales(data)
    } catch (error) {
      console.error('Error loading sales:', error)
    }
  }

  const refreshCatalogs = async () => {
    try {
      const data = await catalogService.getCatalogs()
      setCatalogs(data)
    } catch (error) {
      console.error('Error loading catalogs:', error)
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([
        refreshProducts(),
        refreshOrders(),
        refreshSales(),
        refreshCatalogs(),
      ])
      setLoading(false)
    }
    loadAll()
  }, [])

  const addOrder = (order: Order) => {
    setOrders(prev => [...prev, order])
  }

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev =>
      prev.map(order => (order.id === id ? { ...order, ...updates } : order))
    )
  }

  const addSale = (sale: Sale) => {
    setSales(prev => [...prev, sale])
  }

  const addCatalog = (catalog: CatalogExport) => {
    setCatalogs(prev => [...prev, catalog])
  }

  return (
    <AppContext.Provider
      value={{
        products,
        orders,
        sales,
        catalogs,
        loading,
        refreshProducts,
        refreshOrders,
        refreshSales,
        refreshCatalogs,
        addOrder,
        updateOrder,
        addSale,
        addCatalog,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

