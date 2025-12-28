import { Product } from '@/types'
import { mockProducts } from './data'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getProducts(): Promise<Product[]> {
  await delay(200)
  return [...mockProducts]
}

export async function getProductById(id: string): Promise<Product | null> {
  await delay(150)
  return mockProducts.find(p => p.id === id) || null
}

export async function searchProducts(query: string): Promise<Product[]> {
  await delay(250)
  const lowerQuery = query.toLowerCase()
  return mockProducts.filter(
    p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.sku.toLowerCase().includes(lowerQuery) ||
      p.subtitle.toLowerCase().includes(lowerQuery)
  )
}

export async function filterProducts(filters: {
  size?: string
  color?: string
  onlyAvailable?: boolean
  lowStock?: boolean
}): Promise<Product[]> {
  await delay(200)
  let filtered = [...mockProducts]

  if (filters.size) {
    filtered = filtered.filter(p =>
      p.variants.some(v => v.size === filters.size)
    )
  }

  if (filters.color) {
    filtered = filtered.filter(p =>
      p.variants.some(v => v.color.toLowerCase() === filters.color?.toLowerCase())
    )
  }

  if (filters.onlyAvailable) {
    filtered = filtered.filter(p => {
      return p.variants.some(v => v.stockTotal - v.stockReserved > 0)
    })
  }

  if (filters.lowStock) {
    filtered = filtered.filter(p => {
      return p.variants.some(v => v.stockTotal - v.stockReserved <= 5)
    })
  }

  return filtered
}

