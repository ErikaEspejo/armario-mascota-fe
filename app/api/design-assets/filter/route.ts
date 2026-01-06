import { NextRequest, NextResponse } from 'next/server'

const ADMIN_API_BASE_URL = 'http://localhost:8080'
// TODO: Replace with actual endpoint when provided
const FILTER_DESIGN_ASSETS_ENDPOINT = '/admin/design-assets/filter'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Construir query params para el backend
    const backendParams = new URLSearchParams()
    if (searchParams.get('colorPrimary')) backendParams.append('colorPrimary', searchParams.get('colorPrimary')!)
    if (searchParams.get('colorSecondary')) backendParams.append('colorSecondary', searchParams.get('colorSecondary')!)
    if (searchParams.get('hoodieType')) backendParams.append('hoodieType', searchParams.get('hoodieType')!)
    if (searchParams.get('imageType')) backendParams.append('imageType', searchParams.get('imageType')!)
    if (searchParams.get('decoBase')) backendParams.append('decoBase', searchParams.get('decoBase')!)
    
    const queryString = backendParams.toString()
    const backendUrl = queryString 
      ? `${ADMIN_API_BASE_URL}${FILTER_DESIGN_ASSETS_ENDPOINT}?${queryString}`
      : `${ADMIN_API_BASE_URL}${FILTER_DESIGN_ASSETS_ENDPOINT}`
    
    console.log('🔵 [API Route] Proxying filter request to:', backendUrl)
    
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
        { error: `Error filtering design assets: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route] Successfully filtered design assets')
    
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
      { error: 'Error filtering design assets', details: error instanceof Error ? error.message : 'Unknown error' },
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



