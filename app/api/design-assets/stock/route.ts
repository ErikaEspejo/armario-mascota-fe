import { NextResponse } from 'next/server'
import { ADMIN_API_BASE_URL } from '@/lib/constants'
const STOCK_ENDPOINT = '/admin/items/stock'

export async function POST(request: Request) {
  console.log('🟢 [API Route] POST /api/design-assets/stock recibido')
  console.log('🟢 [API Route] Request URL:', request.url)
  console.log('🟢 [API Route] Request method:', request.method)
  console.log('🟢 [API Route] Request headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    console.log('🟢 [API Route] Leyendo body del request...')
    const body = await request.json()
    console.log('🟢 [API Route] Body recibido:', body)
    console.log('🟢 [API Route] Tipo de body:', typeof body)
    console.log('🟢 [API Route] Body keys:', Object.keys(body))
    
    const backendUrl = `${ADMIN_API_BASE_URL}${STOCK_ENDPOINT}`
    console.log('🔵 [API Route] URL del backend:', backendUrl)
    console.log('🔵 [API Route] Proxying stock assignment request to:', backendUrl)
    
    const requestBodyString = JSON.stringify(body)
    console.log('🔵 [API Route] Request body (string):', requestBodyString)
    
    console.log('🔵 [API Route] Haciendo fetch al backend...')
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBodyString,
    })

    console.log('🔵 [API Route] Fetch al backend completado')
    console.log('🔵 [API Route] Response status:', response.status)
    console.log('🔵 [API Route] Response statusText:', response.statusText)
    console.log('🔵 [API Route] Response ok:', response.ok)
    console.log('🔵 [API Route] Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.error('🔴 [API Route] Response no es OK')
      const errorText = await response.text()
      console.error('🔴 [API Route] Error text del backend:', errorText)
      console.error('🔴 [API Route] Status code:', response.status)
      
      return NextResponse.json(
        { error: `Error assigning stock: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    console.log('✅ [API Route] Response OK, parseando JSON...')
    const data = await response.json().catch((parseError) => {
      console.warn('⚠️ [API Route] No se pudo parsear respuesta como JSON:', parseError)
      return {}
    })
    console.log('✅ [API Route] Response data:', data)
    console.log('✅ [API Route] Successfully assigned stock')
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('🔴 [API Route] Error capturado en catch')
    console.error('🔴 [API Route] Tipo de error:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('🔴 [API Route] Mensaje:', error instanceof Error ? error.message : String(error))
    console.error('🔴 [API Route] Stack:', error instanceof Error ? error.stack : 'N/A')
    
    return NextResponse.json(
      { error: 'Error assigning stock', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

