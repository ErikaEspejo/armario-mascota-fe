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

