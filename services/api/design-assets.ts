import { BACKEND_BASE_URL } from '@/lib/constants'

export interface DesignAsset {
  id?: string
  code?: string
  description: string
  colorPrimary: string
  colorSecondary: string
  hoodieType: string
  imageType: string
  decoBase: string
  hasHighlights: boolean
  imageUrl: string
  optimizedImageUrl?: string
}

/**
 * Loads design assets from the admin endpoint via Next.js API route (proxy)
 * This avoids CORS issues by making the request from the server
 * @param type Optional type parameter (e.g., 'customizable')
 * @returns Promise with the loaded design assets data
 */
export async function loadDesignAssets(type?: string): Promise<unknown> {
  // Usar el API route de Next.js como proxy para evitar CORS
  const params = new URLSearchParams()
  params.append('stats', '1')
  if (type) params.append('type', type)
  
  const queryString = params.toString()
  const url = `/api/design-assets/load?${queryString}`
  
  console.log('🔵 Iniciando carga de imágenes desde API route:', url)
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('🔵 Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('🔴 Error en respuesta:', errorData)
      throw new Error(errorData.error || `Error loading design assets: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Datos recibidos exitosamente:', data)
    return data
  } catch (error) {
    console.error('🔴 Error completo al cargar design assets:', error)
    
    // Mejorar el mensaje de error para el usuario
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el servidor esté corriendo')
    }
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Error desconocido al cargar las imágenes')
  }
}

/**
 * Gets custom pending design assets from the admin endpoint via Next.js API route (proxy)
 * @returns Promise with the custom pending design assets array
 */
export async function getCustomPendingDesignAssets(): Promise<DesignAsset[]> {
  const url = '/api/design-assets/custom-pending'
  
  console.log('🔵 Obteniendo design assets personalizados pendientes desde API route:', url)
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('🔴 Error en respuesta:', errorData)
      throw new Error(errorData.error || `Error loading custom pending design assets: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Design assets personalizados pendientes recibidos:', data)
    // Si la respuesta es un array, retornarlo directamente, si es un objeto con un array, extraerlo
    return Array.isArray(data) ? data : (data.items || data.data || [])
  } catch (error) {
    console.error('🔴 Error completo al obtener design assets personalizados pendientes:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el servidor esté corriendo')
    }
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Error desconocido al obtener las decoraciones personalizadas pendientes')
  }
}

/**
 * Gets pending design assets from the admin endpoint via Next.js API route (proxy)
 * @returns Promise with the pending design assets array
 */
export async function getPendingDesignAssets(): Promise<DesignAsset[]> {
  const url = '/api/design-assets/pending'
  
  console.log('🔵 Obteniendo design assets pendientes desde API route:', url)
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('🔴 Error en respuesta:', errorData)
      throw new Error(errorData.error || `Error loading pending design assets: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Design assets pendientes recibidos:', data)
    // Si la respuesta es un array, retornarlo directamente, si es un objeto con un array, extraerlo
    return Array.isArray(data) ? data : (data.items || data.data || [])
  } catch (error) {
    console.error('🔴 Error completo al obtener design assets pendientes:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el servidor esté corriendo')
    }
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Error desconocido al obtener las decoraciones pendientes')
  }
}

/**
 * Filters design assets based on provided filters via Next.js API route (proxy)
 * @param filters Object containing optional filter parameters
 * @returns Promise with the filtered design assets array
 */
export interface DesignAssetFilters {
  colorPrimary?: string
  colorSecondary?: string
  hoodieType?: string
  imageType?: string
  decoBase?: string
  status?: string
}

export async function filterDesignAssets(filters: DesignAssetFilters): Promise<DesignAsset[]> {
  const url = '/api/design-assets/filter'
  
  console.log('🔵 Filtrando design assets desde API route:', url)
  console.log('🔵 Filtros aplicados:', filters)
  
  try {
    // Construir query params
    const params = new URLSearchParams()
    if (filters.colorPrimary) params.append('colorPrimary', filters.colorPrimary)
    if (filters.colorSecondary) params.append('colorSecondary', filters.colorSecondary)
    if (filters.hoodieType) params.append('hoodieType', filters.hoodieType)
    if (filters.imageType) params.append('imageType', filters.imageType)
    if (filters.decoBase) params.append('decoBase', filters.decoBase)
    if (filters.status) params.append('status', filters.status)
    
    const queryString = params.toString()
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
      throw new Error(errorData.error || `Error filtering design assets: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Design assets filtrados recibidos:', data)
    // Si la respuesta es un array, retornarlo directamente, si es un objeto con un array, extraerlo
    return Array.isArray(data) ? data : (data.items || data.data || [])
  } catch (error) {
    console.error('🔴 Error completo al filtrar design assets:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el servidor esté corriendo')
    }
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Error desconocido al filtrar los diseños')
  }
}

/**
 * Gets a single design asset by ID from the admin endpoint via Next.js API route (proxy)
 * @param id The design asset ID
 * @returns Promise with the design asset
 */
export async function getDesignAssetById(id: string): Promise<DesignAsset | null> {
  const url = `/api/design-assets/${id}`
  
  console.log('🔵 Obteniendo design asset por ID desde API route:', url)
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('🔴 Error en respuesta:', errorData)
      throw new Error(errorData.error || `Error loading design asset: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Design asset recibido:', data)
    return data
  } catch (error) {
    console.error('🔴 Error completo al obtener design asset:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el servidor esté corriendo')
    }
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Error desconocido al obtener el diseño')
  }
}

/**
 * Saves a design asset to the backend via Next.js API route (proxy)
 * @param asset The design asset to save
 * @returns Promise that resolves when the asset is saved successfully
 */
export async function saveDesignAsset(asset: DesignAsset): Promise<void> {
  const url = '/api/design-assets/save'
  
  console.log('🔵 Guardando design asset desde API route:', url)
  
  try {
    // Asegurar que el id sea string si existe (el backend espera string)
    const assetToSend = {
      ...asset,
      id: asset.id ? String(asset.id) : undefined,
    }
    
    const body = JSON.stringify(assetToSend)
    console.log('🔵 [Client] Request body:', body)
    console.log('🔵 [Client] Request body (parsed):', assetToSend)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('🔴 Error en respuesta:', errorData)
      throw new Error(errorData.error || `Error saving design asset: ${response.status} ${response.statusText}`)
    }

    console.log('✅ Design asset guardado exitosamente')
  } catch (error) {
    console.error('🔴 Error completo al guardar design asset:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el servidor esté corriendo')
    }
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Error desconocido al guardar la decoración')
  }
}

/**
 * Assigns stock to a design asset with a specific size and quantity via Next.js API route (proxy)
 * @param designAssetId The ID of the design asset
 * @param size The size to assign stock to
 * @param quantity The quantity of stock to assign
 * @returns Promise that resolves when the stock is assigned successfully
 */
export async function assignStockToDesignAsset(
  designAssetId: number | string,
  size: string,
  quantity: number
): Promise<void> {
  // Usar el API route de Next.js como proxy para evitar CORS
  const url = '/api/design-assets/stock'
  
  console.log('🔵 [assignStockToDesignAsset] Iniciando asignación de stock')
  console.log('🔵 [assignStockToDesignAsset] URL:', url)
  console.log('🔵 [assignStockToDesignAsset] Parámetros recibidos:', { 
    designAssetId, 
    designAssetIdType: typeof designAssetId,
    size, 
    quantity 
  })
  
  try {
    // Convertir designAssetId a número si es string
    console.log('🔵 [assignStockToDesignAsset] Convirtiendo designAssetId a número...')
    const assetId = typeof designAssetId === 'string' ? parseInt(designAssetId, 10) : designAssetId
    console.log('🔵 [assignStockToDesignAsset] assetId convertido:', assetId, 'tipo:', typeof assetId)
    
    if (isNaN(assetId)) {
      console.error('🔴 [assignStockToDesignAsset] ID inválido después de conversión:', assetId)
      throw new Error('ID de design asset inválido')
    }
    
    const requestBody = {
      design_asset_id: assetId,
      size,
      quantity,
    }
    
    const body = JSON.stringify(requestBody)
    console.log('🔵 [assignStockToDesignAsset] Request body (objeto):', requestBody)
    console.log('🔵 [assignStockToDesignAsset] Request body (JSON string):', body)
    
    console.log('🔵 [assignStockToDesignAsset] Haciendo fetch a:', url)
    console.log('🔵 [assignStockToDesignAsset] Opciones de fetch:', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body.substring(0, 100) + '...' // Mostrar solo primeros 100 caracteres
    })
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })

    console.log('🔵 [assignStockToDesignAsset] Fetch completado')
    console.log('🔵 [assignStockToDesignAsset] Response status:', response.status)
    console.log('🔵 [assignStockToDesignAsset] Response statusText:', response.statusText)
    console.log('🔵 [assignStockToDesignAsset] Response ok:', response.ok)
    console.log('🔵 [assignStockToDesignAsset] Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.error('🔴 [assignStockToDesignAsset] Response no es OK, leyendo error...')
      const errorText = await response.text()
      console.error('🔴 [assignStockToDesignAsset] Error text:', errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
        console.error('🔴 [assignStockToDesignAsset] Error data (parsed):', errorData)
      } catch (e) {
        errorData = { error: errorText }
        console.error('🔴 [assignStockToDesignAsset] No se pudo parsear error como JSON, usando texto')
      }
      
      throw new Error(errorData.error || `Error assigning stock: ${response.status} ${response.statusText}`)
    }

    const responseData = await response.json().catch(() => ({}))
    console.log('✅ [assignStockToDesignAsset] Response data:', responseData)
    console.log('✅ [assignStockToDesignAsset] Stock asignado exitosamente')
  } catch (error) {
    console.error('🔴 [assignStockToDesignAsset] Error capturado en catch')
    console.error('🔴 [assignStockToDesignAsset] Tipo de error:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('🔴 [assignStockToDesignAsset] Mensaje:', error instanceof Error ? error.message : String(error))
    console.error('🔴 [assignStockToDesignAsset] Stack:', error instanceof Error ? error.stack : 'N/A')
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🔴 [assignStockToDesignAsset] Error de tipo TypeError relacionado con fetch')
      throw new Error('No se pudo conectar con el servidor. Verifica que el servidor esté corriendo')
    }
    
    if (error instanceof Error) {
      console.error('🔴 [assignStockToDesignAsset] Re-lanzando error:', error.message)
      throw error
    }
    
    console.error('🔴 [assignStockToDesignAsset] Error desconocido, creando nuevo error')
    throw new Error('Error desconocido al asignar el stock')
  }
}

