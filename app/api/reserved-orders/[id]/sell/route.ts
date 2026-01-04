import { NextRequest, NextResponse } from 'next/server'

const ADMIN_API_BASE_URL = 'http://localhost:8080'
const RESERVED_ORDERS_ENDPOINT = '/admin/reserved-orders'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()
    
    // Validar que el body tenga los campos requeridos
    if (!body.amountPaid || typeof body.amountPaid !== 'number' || body.amountPaid <= 0) {
      return NextResponse.json(
        { error: 'amountPaid es requerido y debe ser un número entero mayor a 0' },
        { status: 400 }
      )
    }

    if (!body.paymentMethod || !['cash', 'transfer'].includes(body.paymentMethod)) {
      return NextResponse.json(
        { error: 'paymentMethod es requerido y debe ser "cash" o "transfer"' },
        { status: 400 }
      )
    }

    if (!body.paymentDestination || !['Cash', 'Nequi', 'Daviplata'].includes(body.paymentDestination)) {
      return NextResponse.json(
        { error: 'paymentDestination es requerido y debe ser "Cash", "Nequi", o "Daviplata"' },
        { status: 400 }
      )
    }

    const backendUrl = `${ADMIN_API_BASE_URL}${RESERVED_ORDERS_ENDPOINT}/${orderId}/sell`
    
    console.log('🔵 [API Route] Proxying POST sell reserved order request to:', backendUrl)
    console.log('🔵 [API Route] Body:', body)
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
          error: errorData.error || errorData.message || `Error selling reserved order: ${response.statusText}`, 
          details: errorText 
        },
        { status: response.status }
      )
    }

    const data = await response.json().catch(() => ({}))
    console.log('✅ [API Route] Successfully sold reserved order')
    
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
      { error: 'Error selling reserved order', details: error instanceof Error ? error.message : 'Unknown error' },
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

