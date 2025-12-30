export interface DesignAsset {
  id?: string
  description: string
  colorPrimary: string
  colorSecondary: string
  hoodieType: string
  imageType: string
  decoBase: string
  hasHighlights: boolean
  imageUrl: string
}

/**
 * Loads design assets from the admin endpoint via Next.js API route (proxy)
 * This avoids CORS issues by making the request from the server
 * @returns Promise with the loaded design assets data
 */
export async function loadDesignAssets(): Promise<unknown> {
  // Usar el API route de Next.js como proxy para evitar CORS
  const url = '/api/design-assets/load'
  
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

