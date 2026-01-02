import { ReservedOrdersResponse, ReservedOrder, CreateReservedOrderPayload, AddItemToReservedOrderPayload } from '@/types'

/**
 * Obtiene los carritos separados con status=reserved
 */
export async function getReservedOrdersReserved(): Promise<ReservedOrder[]> {
  const url = '/api/reserved-orders?status=reserved'
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Error fetching reserved orders: ${response.status} ${response.statusText}`)
    }

    const data: ReservedOrdersResponse = await response.json()
    return data.orders || []
  } catch (error) {
    console.error('Error fetching reserved orders:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al obtener los carritos separados')
  }
}

/**
 * Crea un nuevo carrito separado
 */
export async function createReservedOrder(payload: CreateReservedOrderPayload): Promise<ReservedOrder> {
  const url = '/api/reserved-orders'
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Error creating reserved order: ${response.status} ${response.statusText}`)
    }

    const data: ReservedOrder = await response.json()
    return data
  } catch (error) {
    console.error('Error creating reserved order:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al crear el carrito separado')
  }
}

/**
 * Agrega un item a un carrito separado
 */
export async function addItemToReservedOrder(
  orderId: number,
  payload: AddItemToReservedOrderPayload
): Promise<void> {
  const url = `/api/reserved-orders/${orderId}/items`
  
  // Validaciones
  if (payload.itemId <= 0) {
    throw new Error('El ID del item debe ser mayor a 0')
  }
  if (payload.qty <= 0) {
    throw new Error('La cantidad debe ser mayor a 0')
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      const errorMessage = errorData.error || errorData.message || `Error adding item to reserved order: ${response.status} ${response.statusText}`
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error('Error adding item to reserved order:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al agregar el item al carrito')
  }
}

