import { Order, OrderItem } from '@/types'
import { mockOrders } from './data'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getOrders(): Promise<Order[]> {
  await delay(200)
  return [...mockOrders]
}

export async function getOrderById(id: string): Promise<Order | null> {
  await delay(150)
  return mockOrders.find(o => o.id === id) || null
}

export async function createOrder(orderData: {
  customerName: string
  phone: string
  notes?: string
  items: OrderItem[]
  reservationHours?: number
}): Promise<Order> {
  await delay(300)

  const subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0)
  const totals = {
    subtotal,
    discount: 0,
    shipping: 0,
    total: subtotal,
  }

  const expiresAt = orderData.reservationHours
    ? new Date(Date.now() + orderData.reservationHours * 60 * 60 * 1000).toISOString()
    : undefined

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    customerName: orderData.customerName,
    phone: orderData.phone,
    notes: orderData.notes,
    items: orderData.items,
    status: 'reserved',
    createdAt: new Date().toISOString(),
    expiresAt,
    totals,
  }

  mockOrders.push(newOrder)
  return newOrder
}

export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<Order | null> {
  await delay(200)
  const order = mockOrders.find(o => o.id === id)
  if (!order) return null

  order.status = status
  return order
}

export async function cancelOrder(id: string): Promise<boolean> {
  await delay(200)
  const order = mockOrders.find(o => o.id === id)
  if (!order) return false

  order.status = 'cancelled'
  return true
}

export async function filterOrders(filters: {
  status?: Order['status']
  dateFrom?: string
  dateTo?: string
}): Promise<Order[]> {
  await delay(200)
  let filtered = [...mockOrders]

  if (filters.status) {
    filtered = filtered.filter(o => o.status === filters.status)
  }

  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom)
    filtered = filtered.filter(o => new Date(o.createdAt) >= fromDate)
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo)
    filtered = filtered.filter(o => new Date(o.createdAt) <= toDate)
  }

  return filtered
}

