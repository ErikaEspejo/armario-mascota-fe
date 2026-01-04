import { NextRequest, NextResponse } from 'next/server'

const ADMIN_API_BASE_URL = 'http://localhost:8080'
const RESERVED_ORDERS_ENDPOINT = '/admin/reserved-orders'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const backendUrl = `${ADMIN_API_BASE_URL}${RESERVED_ORDERS_ENDPOINT}/${orderId}/cancel`
    
    console.log('🔵 [API Route] Proxying POST cancel reserved order request to:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('🔵 [API Route] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      console.error('🔴 [API Route] Error response:', errorData)
      return NextResponse.json(
        { 
          error: errorData.error || errorData.message || `Error canceling reserved order: ${response.statusText}`, 
          details: errorText 
        },
        { status: response.status }
      )
    }

    const data = await response.json().catch(() => ({}))
    console.log('✅ [API Route] Successfully canceled reserved order')
    
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
      { error: 'Error canceling reserved order', details: error instanceof Error ? error.message : 'Unknown error' },
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

