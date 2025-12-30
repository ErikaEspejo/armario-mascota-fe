import { NextResponse } from 'next/server'

const ADMIN_API_BASE_URL = 'http://localhost:8080'

export async function GET() {
  try {
    console.log('🔵 [API Route] Proxying request to:', `${ADMIN_API_BASE_URL}/admin/design-assets/load`)
    
    const response = await fetch(`${ADMIN_API_BASE_URL}/admin/design-assets/load`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // No hay problemas de CORS desde el servidor
    })

    console.log('🔵 [API Route] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔴 [API Route] Error response:', errorText)
      return NextResponse.json(
        { error: `Error loading design assets: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route] Successfully loaded design assets')
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('🔴 [API Route] Error:', error)
    return NextResponse.json(
      { error: 'Error loading design assets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Manejar preflight requests (OPTIONS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}


