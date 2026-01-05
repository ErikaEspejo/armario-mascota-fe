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
  status: 'reserved' | 'canceled' | 'completed'
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

export interface SaleItem {
  id: number
  soldAt: string
  reservedOrderId: number
  customerName: string
  amountPaid: number
  paymentDestination: string
  paymentMethod: string
}

export interface SalesResponse {
  sales: SaleItem[]
}

export type OrderStatus = Order['status']
export type PaymentMethod = Sale['paymentMethod']
export type TemplateVersion = CatalogExport['templateVersion']

// Finance Types
export interface Transaction {
  id: number
  type: 'income' | 'expense'
  amount: number
  destination: string
  category: string
  counterparty?: string | null
  notes?: string | null
  source: 'manual' | 'sale'
  occurredAt: string
  createdAt: string
}

export interface TransactionsResponse {
  transactions: Transaction[]
  cursor?: string | null
  hasMore: boolean
}

export interface CreateTransactionPayload {
  type: 'income' | 'expense'
  amount: number
  destination: string
  category: string
  counterparty?: string
  notes?: string
  occurredAt?: string
}

export interface TransactionFilters {
  type?: 'income' | 'expense'
  from?: string
  to?: string
  source?: 'manual' | 'sale'
  destination?: string
  category?: string
  limit?: number
  cursor?: string
}

export interface DestinationBalance {
  destination: string
  balance: number
}

export interface DestinationRangeBalance {
  destination: string
  income: number
  expense: number
  net: number
}

export interface FinanceSummary {
  currency: string
  balanceAllTime: number
  byDestinationAllTime: DestinationBalance[]
  range?: {
    from: string
    to: string
    openingBalance: number
    income: number
    expense: number
    net: number
    closingBalance: number
  }
  byDestinationRange?: DestinationRangeBalance[]
}

export interface PeriodInfo {
  type: 'month' | 'quarter' | 'year'
  from: string
  to: string
  label: string
}

export interface PeriodMetrics {
  income: number
  expense: number
  net: number
  transactionCount: number
  averageTransaction: number
  profitMargin: number
}

export interface ComparisonData {
  type: 'previous' | 'last_year'
  previousPeriod: PeriodMetrics
  previousPeriodInfo: PeriodInfo
  changes: {
    incomeChange: number
    expenseChange: number
    netChange: number
    profitMarginChange: number
  }
}

export interface CashFlowDataPoint {
  date: string
  income: number
  expense: number
  net: number
}

export interface WeeklyCashFlow {
  week: string
  income: number
  expense: number
  net: number
}

export interface MonthlyCashFlow {
  month: string
  income: number
  expense: number
  net: number
}

export interface CashFlow {
  daily: CashFlowDataPoint[]
  weekly: WeeklyCashFlow[]
  monthly: MonthlyCashFlow[]
}

export interface CategoryData {
  category: string
  amount: number
  percentage: number
  count: number
}

export interface ByCategory {
  income: CategoryData[]
  expense: CategoryData[]
}

export interface CounterpartyData {
  counterparty: string
  amount: number
  count: number
}

export interface ByCounterparty {
  topExpenses: CounterpartyData[]
  topIncomes: CounterpartyData[]
}

export interface DestinationData {
  destination: string
  income: number
  expense: number
  net: number
  percentage: number
}

export interface ByDestination {
  destinations: DestinationData[]
  totalNet: number
}

export interface TopTransaction {
  id: number
  amount: number
  destination: string
  category: string
  occurredAt: string
}

export interface TopTransactions {
  largestIncomes: TopTransaction[]
  largestExpenses: TopTransaction[]
}

export interface KPIs {
  profitMargin: number
  expenseRatio: number
  averageDailyNet: number
  averageTransactionSize: number
  transactionsPerDay: number
  largestExpenseCategory: string
  largestIncomeCategory: string
}

export interface Trends {
  incomeTrend: 'increasing' | 'decreasing' | 'stable'
  expenseTrend: 'increasing' | 'decreasing' | 'stable'
  netTrend: 'increasing' | 'decreasing' | 'stable'
  profitMarginTrend: 'improving' | 'declining' | 'stable'
}

export interface FinanceDashboard {
  currency: string
  period: PeriodInfo
  currentPeriod: PeriodMetrics
  comparison?: ComparisonData
  cashFlow: CashFlow
  byCategory: ByCategory
  byCounterparty: ByCounterparty
  byDestination: ByDestination
  topTransactions: TopTransactions
  kpis: KPIs
  trends: Trends
}

