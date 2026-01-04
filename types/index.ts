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

export interface FilteredItem {
  id: number
  sku: string
  size: string
  price: number
  stockTotal: number
  stockReserved: number
  designAssetId: number
  description: string
  imageUrl: string
}

export interface Buso {
  id: number
  imageUrl: string
  qty: number
}

export interface ReservedOrderLineItem {
  id: number
  sku: string
  size: string
  price: number
  stockTotal: number
  stockReserved: number
  designAssetId: number
  description: string
  colorPrimary: string
  colorSecondary: string
  hoodieType: string
  hoodieTypeLabel?: string
  imageType: string
  decoId: string
  decoBase: string
  imageUrlThumb: string
  imageUrlMedium: string
}

export interface ReservedOrderLine {
  id: number
  reservedOrderId: number
  itemId: number
  qty: number
  unitPrice: number
  createdAt: string
  item: ReservedOrderLineItem
}

export interface ReservedOrderItem {
  tipoBuso: string
  talla: string
  precioUnitario: number
  cantidad: number
  precioTotal: number
  busos: Buso[]
}

export interface ReservedOrder {
  id: number
  status: 'reserved' | 'expired' | 'cancelled' | 'sold' | 'completed'
  assignedTo: string
  customerName: string | null
  customerPhone?: string | null
  notes?: string | null
  orderType?: 'Detal' | 'Mayorista'
  createdAt: string
  updatedAt: string
  lineCount?: number
  total?: number
  lines?: ReservedOrderLine[]
  items?: ReservedOrderItem[] // Para compatibilidad con el procesamiento agrupado
}

export interface CreateReservedOrderPayload {
  assignedTo: string
  customerName?: string
  customerPhone?: string
  notes?: string
  orderType: 'Detal' | 'Mayorista'
}

export interface AddItemToReservedOrderPayload {
  itemId: number
  qty: number
}

export interface ReservedOrdersResponse {
  orders: ReservedOrder[]
}

export interface SeparatedOrdersResponse {
  carts: ReservedOrder[]
}

export type OrderStatus = Order['status']
export type PaymentMethod = Sale['paymentMethod']
export type TemplateVersion = CatalogExport['templateVersion']

