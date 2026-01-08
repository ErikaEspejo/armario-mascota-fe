import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_API_BASE_URL } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const size = searchParams.get('size')
    const format = searchParams.get('format')
    
    if (!size || !format) {
      return NextResponse.json(
        { error: 'Se requieren los parámetros size y format' },
        { status: 400 }
      )
    }
    
    // Construir URL del backend
    const backendUrl = `${ADMIN_API_BASE_URL}/admin/catalog?size=${size}&format=${format}`
    
    console.log('🔵 [API Route] Proxying catalog download request to:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
    })

    console.log('🔵 [API Route] Response status:', response.status)

    if (response.status === 404) {
      return NextResponse.json(
        { error: 'No hay productos en dicha talla' },
        { status: 404 }
      )
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔴 [API Route] Error response:', errorText)
      return NextResponse.json(
        { error: `Error al descargar el catálogo: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    // Obtener el Content-Type del backend
    const contentType = response.headers.get('Content-Type') || ''
    
    // Si el formato es PNG y la respuesta es JSON, retornar el JSON directamente
    if (format.toLowerCase() === 'png' && contentType.includes('application/json')) {
      const jsonData = await response.json()
      console.log('✅ [API Route] PNG catalog returned as JSON with pages:', jsonData.pages?.length || 0)
      
      return NextResponse.json(jsonData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    // Para PDF o PNG legacy (blob), mantener comportamiento actual
    const blob = await response.blob()
    const finalContentType = contentType || 
      (format.toLowerCase() === 'png' ? 'image/png' : 'application/pdf')
    
    console.log('✅ [API Route] Successfully downloaded catalog as blob')
    
    // Retornar el blob con los headers apropiados
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': finalContentType,
        'Content-Disposition': `attachment; filename="catalogo-${size}-${Date.now()}.${format.toLowerCase()}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('🔴 [API Route] Error:', error)
    return NextResponse.json(
      { error: 'Error al descargar el catálogo', details: error instanceof Error ? error.message : 'Unknown error' },
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


