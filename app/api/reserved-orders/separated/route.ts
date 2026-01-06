import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_API_BASE_URL } from '@/lib/constants'
const SEPARATED_ORDERS_ENDPOINT = '/admin/reserved-orders/separated'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    // Construir URL del backend con parámetros
    const backendParams = new URLSearchParams()
    if (status) backendParams.append('status', status)
    
    const queryString = backendParams.toString()
    const backendUrl = queryString 
      ? `${ADMIN_API_BASE_URL}${SEPARATED_ORDERS_ENDPOINT}?${queryString}`
      : `${ADMIN_API_BASE_URL}${SEPARATED_ORDERS_ENDPOINT}`
    
    console.log('🔵 [API Route] Proxying GET separated orders request to:', backendUrl)
    
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
        { error: `Error fetching separated orders: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route] Successfully fetched separated orders')
    
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
      { error: 'Error fetching separated orders', details: error instanceof Error ? error.message : 'Unknown error' },
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

