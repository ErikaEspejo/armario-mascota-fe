import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_API_BASE_URL } from '@/lib/constants'
const FILTER_ITEMS_ENDPOINT = '/admin/items/filter'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Construir query params para el backend
    const backendParams = new URLSearchParams()
    if (searchParams.get('size')) backendParams.append('size', searchParams.get('size')!)
    if (searchParams.get('primaryColor')) backendParams.append('primaryColor', searchParams.get('primaryColor')!)
    if (searchParams.get('secondaryColor')) backendParams.append('secondaryColor', searchParams.get('secondaryColor')!)
    if (searchParams.get('hoodieType')) backendParams.append('hoodieType', searchParams.get('hoodieType')!)
    if (searchParams.get('type')) backendParams.append('type', searchParams.get('type')!)
    
    const queryString = backendParams.toString()
    const backendUrl = queryString 
      ? `${ADMIN_API_BASE_URL}${FILTER_ITEMS_ENDPOINT}?${queryString}`
      : `${ADMIN_API_BASE_URL}${FILTER_ITEMS_ENDPOINT}`
    
    console.log('🔵 [API Route] Proxying filter items request to:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('🔵 [API Route] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔴 [API Route] Error response:', errorText)
      return NextResponse.json(
        { error: `Error filtering items: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route] Successfully filtered items')
    
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
      { error: 'Error filtering items', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

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



