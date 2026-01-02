import { NextRequest, NextResponse } from 'next/server'

const ADMIN_API_BASE_URL = 'http://localhost:8080'
const RESERVED_ORDERS_ENDPOINT = '/admin/reserved-orders'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    // Construir URL del backend
    const backendParams = new URLSearchParams()
    if (status) backendParams.append('status', status)
    
    const queryString = backendParams.toString()
    const backendUrl = queryString 
      ? `${ADMIN_API_BASE_URL}${RESERVED_ORDERS_ENDPOINT}?${queryString}`
      : `${ADMIN_API_BASE_URL}${RESERVED_ORDERS_ENDPOINT}`
    
    console.log('🔵 [API Route] Proxying GET reserved orders request to:', backendUrl)
    
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
        { error: `Error fetching reserved orders: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route] Successfully fetched reserved orders')
    
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
      { error: 'Error fetching reserved orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔵 [API Route] Received body:', body)
    
    // Ensure orderType always has a value (default: 'Detal')
    const orderTypeValue = body.orderType || body.order_type || 'Detal'
    
    const backendBody = {
      assignedTo: body.assignedTo,
      orderType: orderTypeValue,
      ...(body.customerName && { customerName: body.customerName }),
      ...(body.customerPhone && { customerPhone: body.customerPhone }),
      ...(body.notes && { notes: body.notes }),
    }
    
    const backendUrl = `${ADMIN_API_BASE_URL}${RESERVED_ORDERS_ENDPOINT}`
    
    console.log('🔵 [API Route] Proxying POST reserved order request to:', backendUrl)
    console.log('🔵 [API Route] Transformed body:', backendBody)
    console.log('🔵 [API Route] orderType value:', orderTypeValue)
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendBody),
    })

    console.log('🔵 [API Route] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔴 [API Route] Error response:', errorText)
      return NextResponse.json(
        { error: `Error creating reserved order: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route] Successfully created reserved order')
    
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
      { error: 'Error creating reserved order', details: error instanceof Error ? error.message : 'Unknown error' },
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

