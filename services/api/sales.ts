import { SalesResponse, SaleItem } from '@/types'

/**
 * Obtiene las ventas con filtros opcionales de fecha
 * @param from - Fecha desde (formato: YYYY-MM-DD)
 * @param to - Fecha hasta (formato: YYYY-MM-DD)
 */
export async function getSales(from?: string, to?: string): Promise<SaleItem[]> {
  const urlParams = new URLSearchParams()
  if (from) {
    urlParams.append('from', from)
  }
  if (to) {
    urlParams.append('to', to)
  }
  
  const queryString = urlParams.toString()
  const url = queryString ? `/api/sales?${queryString}` : '/api/sales'
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Error fetching sales: ${response.status} ${response.statusText}`)
    }

    const data: SalesResponse = await response.json()
    return data.sales || []
  } catch (error) {
    console.error('Error fetching sales:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al obtener las ventas')
  }
}





