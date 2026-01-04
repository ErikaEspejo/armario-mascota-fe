import { ReservedOrdersResponse, ReservedOrder, CreateReservedOrderPayload, AddItemToReservedOrderPayload, SeparatedOrdersResponse } from '@/types'

/**
 * Obtiene los pedidos (reserved, canceled, completed)
 * @param status - Filtro opcional por estado: 'reserved', 'canceled', 'completed'
 */
export async function getSeparatedOrders(status?: 'reserved' | 'canceled' | 'completed'): Promise<ReservedOrder[]> {
  const urlParams = new URLSearchParams()
  if (status) {
    urlParams.append('status', status)
  }
  
  const queryString = urlParams.toString()
  const url = queryString ? `/api/reserved-orders/separated?${queryString}` : '/api/reserved-orders/separated'
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Error fetching separated orders: ${response.status} ${response.statusText}`)
    }

    const data: SeparatedOrdersResponse = await response.json()
    return data.carts || []
  } catch (error) {
    console.error('Error fetching separated orders:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al obtener los pedidos')
  }
}

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

/**
 * Actualiza un pedido reservado
 */
export interface UpdateReservedOrderPayload {
  id: number
  status: 'reserved'
  assignedTo: string
  orderType: 'Detal' | 'Mayorista'
  customerName: string
  customerPhone: string
  notes: string
  lines: Array<{
    id: number
    reservedOrderId: number
    itemId: number
    qty: number
  }>
}

export async function updateReservedOrder(
  orderId: number,
  payload: UpdateReservedOrderPayload
): Promise<ReservedOrder> {
  const url = `/api/reserved-orders/${orderId}`
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      const errorMessage = errorData.error || errorData.message || `Error updating reserved order: ${response.status} ${response.statusText}`
      throw new Error(errorMessage)
    }

    const data: ReservedOrder = await response.json()
    return data
  } catch (error) {
    console.error('Error updating reserved order:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al actualizar el pedido reservado')
  }
}

/**
 * Cancela un pedido reservado
 */
export async function cancelReservedOrder(orderId: number): Promise<void> {
  const url = `/api/reserved-orders/${orderId}/cancel`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      const errorMessage = errorData.error || errorData.message || `Error canceling reserved order: ${response.status} ${response.statusText}`
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error('Error canceling reserved order:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al cancelar el pedido reservado')
  }
}

