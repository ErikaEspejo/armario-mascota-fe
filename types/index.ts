export interface ProductVariant {
  id: string
  size: string
  color: string
  stockTotal: number
  stockReserved: number
  price: number
}

export interface Product {
  id: string
  name: string
  subtitle: string
  sku: string
  imageUrl: string
  variants: ProductVariant[]
  stockTotal: number
  stockReserved: number
  price: number
}

export interface OrderItem {
  productId: string
  productName: string
  variantId: string
  size: string
  color: string
  quantity: number
  price: number
  subtotal: number
}

export interface OrderTotals {
  subtotal: number
  discount: number
  shipping: number
  total: number
}

export interface Order {
  id: string
  customerName: string
  phone: string
  notes?: string
  items: OrderItem[]
  status: 'pending' | 'reserved' | 'expired' | 'cancelled' | 'sold'
  createdAt: string
  expiresAt?: string
  totals: OrderTotals
}

export interface Sale {
  id: string
  orderId?: string
  items: OrderItem[]
  totals: OrderTotals
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other'
  shipping: number
  createdAt: string
}

export interface CatalogExport {
  id: string
  saleId: string
  templateVersion: 'v1' | 'v2'
  pdfUrl: string
  pngUrls: string[]
  createdAt: string
}

export type OrderStatus = Order['status']
export type PaymentMethod = Sale['paymentMethod']
export type TemplateVersion = CatalogExport['templateVersion']

