import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_API_BASE_URL } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const session = searchParams.get('session')
    const page = searchParams.get('page')
    
    if (!session || !page) {
      return NextResponse.json(
        { error: 'Se requieren los parámetros session y page' },
        { status: 400 }
      )
    }
    
    // Construir URL del backend usando la ruta relativa
    const backendUrl = `${ADMIN_API_BASE_URL}/admin/catalog/png-page?session=${session}&page=${page}`
    
    console.log('🔵 [API Route] Proxying PNG page request to:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
    })

    console.log('🔵 [API Route] Response status:', response.status)

    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Página no encontrada' },
        { status: 404 }
      )
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔴 [API Route] Error response:', errorText)
      return NextResponse.json(
        { error: `Error al descargar la página: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    // Obtener el blob de la imagen PNG
    const blob = await response.blob()
    const contentType = response.headers.get('Content-Type') || 'image/png'
    
    console.log('✅ [API Route] Successfully downloaded PNG page')
    
    // Retornar el blob con los headers apropiados
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('🔴 [API Route] Error:', error)
    return NextResponse.json(
      { error: 'Error al descargar la página PNG', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}


