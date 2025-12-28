import { Sale, OrderItem } from '@/types'
import { mockSales } from './data'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getSales(): Promise<Sale[]> {
  await delay(200)
  return [...mockSales]
}

export async function getSaleById(id: string): Promise<Sale | null> {
  await delay(150)
  return mockSales.find(s => s.id === id) || null
}

export async function createSale(saleData: {
  orderId?: string
  items: OrderItem[]
  paymentMethod: Sale['paymentMethod']
  shipping: number
  discount?: number
}): Promise<Sale> {
  await delay(400)

  const subtotal = saleData.items.reduce((sum, item) => sum + item.subtotal, 0)
  const discount = saleData.discount || 0
  const totals = {
    subtotal,
    discount,
    shipping: saleData.shipping,
    total: subtotal - discount + saleData.shipping,
  }

  const newSale: Sale = {
    id: `sale-${Date.now()}`,
    orderId: saleData.orderId,
    items: saleData.items,
    totals,
    paymentMethod: saleData.paymentMethod,
    shipping: saleData.shipping,
    createdAt: new Date().toISOString(),
  }

  mockSales.push(newSale)
  return newSale
}

export async function filterSales(filters: {
  dateFrom?: string
  dateTo?: string
  customerName?: string
}): Promise<Sale[]> {
  await delay(200)
  let filtered = [...mockSales]

  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom)
    filtered = filtered.filter(s => new Date(s.createdAt) >= fromDate)
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo)
    filtered = filtered.filter(s => new Date(s.createdAt) <= toDate)
  }

  // Note: customerName filter would require joining with orders
  // For mock, we'll skip this or implement a simple check

  return filtered
}

