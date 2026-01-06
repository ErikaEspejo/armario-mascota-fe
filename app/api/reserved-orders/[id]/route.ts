import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_API_BASE_URL } from '@/lib/constants'
const RESERVED_ORDERS_ENDPOINT = '/admin/reserved-orders'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const backendUrl = `${ADMIN_API_BASE_URL}${RESERVED_ORDERS_ENDPOINT}/${orderId}`
    
    console.log('🔵 [API Route] Proxying GET reserved order request to:', backendUrl)
    
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
        { error: `Error fetching reserved order: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route] Successfully fetched reserved order')
    
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
      { error: 'Error fetching reserved order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()
    
    // Mapear orderType: 'Detal' -> 'retail' para el backend
    const backendBody = {
      ...body,
      orderType: body.orderType === 'Detal' ? 'retail' : body.orderType,
    }
    
    const backendUrl = `${ADMIN_API_BASE_URL}${RESERVED_ORDERS_ENDPOINT}/${orderId}`
    
    console.log('🔵 [API Route] Proxying PUT reserved order request to:', backendUrl)
    console.log('🔵 [API Route] Request body:', body)
    console.log('🔵 [API Route] Backend body:', backendBody)
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendBody),
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
          error: errorData.error || errorData.message || `Error updating reserved order: ${response.statusText}`, 
          details: errorText 
        },
        { status: response.status }
      )
    }

    const data = await response.json().catch(() => ({}))
    console.log('✅ [API Route] Successfully updated reserved order')
    
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
      { error: 'Error updating reserved order', details: error instanceof Error ? error.message : 'Unknown error' },
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

