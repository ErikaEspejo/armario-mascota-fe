import { NextRequest, NextResponse } from 'next/server'

const ADMIN_API_BASE_URL = 'http://localhost:8080'
const DASHBOARD_ENDPOINT = '/admin/finance/dashboard'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const compareWith = searchParams.get('compareWith')
    
    // Construir URL del backend con parámetros opcionales
    const backendParams = new URLSearchParams()
    if (period) backendParams.append('period', period)
    if (from) backendParams.append('from', from)
    if (to) backendParams.append('to', to)
    if (compareWith) backendParams.append('compareWith', compareWith)
    
    const queryString = backendParams.toString()
    const backendUrl = queryString 
      ? `${ADMIN_API_BASE_URL}${DASHBOARD_ENDPOINT}?${queryString}`
      : `${ADMIN_API_BASE_URL}${DASHBOARD_ENDPOINT}`
    
    console.log('🔵 [API Route] Proxying GET finance dashboard request to:', backendUrl)
    
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
        { error: `Error fetching finance dashboard: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route] Successfully fetched finance dashboard')
    
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
      { error: 'Error fetching finance dashboard', details: error instanceof Error ? error.message : 'Unknown error' },
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


