import { FilteredItem } from '@/types'

export interface FilterParams {
  size?: string
  primaryColor?: string
  secondaryColor?: string
  hoodieType?: string
  type?: string
}

/**
 * Filtra items para crear pedidos usando el endpoint de filtrado via Next.js API route (proxy)
 * Esto evita problemas de CORS haciendo la petición desde el servidor
 */
export async function filterItems(params: FilterParams): Promise<FilteredItem[]> {
  const url = '/api/items/filter'
  
  console.log('🔵 Filtrando items desde API route:', url)
  console.log('🔵 Filtros aplicados:', params)
  
  try {
    // Construir query params
    const queryParams = new URLSearchParams()
    if (params.size) queryParams.append('size', params.size)
    if (params.primaryColor) queryParams.append('primaryColor', params.primaryColor)
    if (params.secondaryColor) queryParams.append('secondaryColor', params.secondaryColor)
    if (params.hoodieType) queryParams.append('hoodieType', params.hoodieType)
    if (params.type) queryParams.append('type', params.type)
    
    const queryString = queryParams.toString()
    const fullUrl = queryString ? `${url}?${queryString}` : url
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('🔴 Error en respuesta:', errorData)
      throw new Error(errorData.error || `Error filtering items: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Items filtrados recibidos:', data)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('🔴 Error completo al filtrar items:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el servidor esté corriendo')
    }
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Error desconocido al filtrar los productos')
  }
}

