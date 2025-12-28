import { CatalogExport } from '@/types'
import { mockCatalogs } from './data'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getCatalogs(): Promise<CatalogExport[]> {
  await delay(200)
  return [...mockCatalogs]
}

export async function getCatalogById(id: string): Promise<CatalogExport | null> {
  await delay(150)
  return mockCatalogs.find(c => c.id === id) || null
}

export async function getCatalogsBySaleId(saleId: string): Promise<CatalogExport[]> {
  await delay(150)
  return mockCatalogs.filter(c => c.saleId === saleId)
}

export async function createCatalog(saleId: string, templateVersion: 'v1' | 'v2'): Promise<CatalogExport> {
  await delay(500)

  const pageCount = templateVersion === 'v1' ? 3 : 2
  const pngUrls = Array.from({ length: pageCount }, (_, i) =>
    `https://example.com/catalogs/cat-${Date.now()}-page${i + 1}.png`
  )

  const newCatalog: CatalogExport = {
    id: `cat-${Date.now()}`,
    saleId,
    templateVersion,
    pdfUrl: `https://example.com/catalogs/cat-${Date.now()}.pdf`,
    pngUrls,
    createdAt: new Date().toISOString(),
  }

  mockCatalogs.push(newCatalog)
  return newCatalog
}

