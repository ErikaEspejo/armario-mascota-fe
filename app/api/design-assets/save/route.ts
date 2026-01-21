import { NextResponse } from 'next/server'
import { ADMIN_API_BASE_URL } from '@/lib/constants'
const SAVE_DESIGN_ASSET_ENDPOINT = '/admin/design-assets/update'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('🔵 [API Route] Proxying save request to:', `${ADMIN_API_BASE_URL}${SAVE_DESIGN_ASSET_ENDPOINT}`)
    console.log('🔵 [API Route] Request body:', body)
    
    const response = await fetch(`${ADMIN_API_BASE_URL}${SAVE_DESIGN_ASSET_ENDPOINT}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('🔵 [API Route] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔴 [API Route] Error response:', errorText)
      return NextResponse.json(
        { error: `Error saving design asset: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json().catch(() => ({}))
    console.log('✅ [API Route] Successfully saved design asset')
    
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
      { error: 'Error saving design asset', details: error instanceof Error ? error.message : 'Unknown error' },
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

