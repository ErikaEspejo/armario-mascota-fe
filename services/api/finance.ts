import {
  Transaction,
  TransactionsResponse,
  CreateTransactionPayload,
  TransactionFilters,
  FinanceSummary,
  FinanceDashboard,
} from '@/types'

/**
 * Obtiene las transacciones con filtros opcionales y paginación
 */
export async function getTransactions(
  filters?: TransactionFilters
): Promise<TransactionsResponse> {
  const urlParams = new URLSearchParams()
  
  if (filters?.type) {
    urlParams.append('type', filters.type)
  }
  if (filters?.from) {
    urlParams.append('from', filters.from)
  }
  if (filters?.to) {
    urlParams.append('to', filters.to)
  }
  if (filters?.source) {
    urlParams.append('source', filters.source)
  }
  if (filters?.destination) {
    urlParams.append('destination', filters.destination)
  }
  if (filters?.category) {
    urlParams.append('category', filters.category)
  }
  if (filters?.limit) {
    urlParams.append('limit', filters.limit.toString())
  }
  if (filters?.cursor) {
    urlParams.append('cursor', filters.cursor)
  }
  
  const queryString = urlParams.toString()
  const url = queryString ? `/api/finance/transactions?${queryString}` : '/api/finance/transactions'
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Error fetching transactions: ${response.status} ${response.statusText}`)
    }

    const data: TransactionsResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching transactions:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al obtener las transacciones')
  }
}

/**
 * Crea una nueva transacción
 */
export async function createTransaction(
  payload: CreateTransactionPayload
): Promise<Transaction> {
  try {
    const response = await fetch('/api/finance/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Error creating transaction: ${response.status} ${response.statusText}`)
    }

    const data: Transaction = await response.json()
    return data
  } catch (error) {
    console.error('Error creating transaction:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al crear la transacción')
  }
}

/**
 * Obtiene el resumen financiero con filtros opcionales de fecha
 */
export async function getFinanceSummary(
  from?: string,
  to?: string
): Promise<FinanceSummary> {
  const urlParams = new URLSearchParams()
  if (from) {
    urlParams.append('from', from)
  }
  if (to) {
    urlParams.append('to', to)
  }
  
  const queryString = urlParams.toString()
  const url = queryString ? `/api/finance/summary?${queryString}` : '/api/finance/summary'
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Error fetching finance summary: ${response.status} ${response.statusText}`)
    }

    const data: FinanceSummary = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching finance summary:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al obtener el resumen financiero')
  }
}

/**
 * Obtiene los datos del dashboard financiero
 */
export async function getFinanceDashboard(
  period?: 'month' | 'quarter' | 'year',
  from?: string,
  to?: string,
  compareWith?: 'previous' | 'last_year'
): Promise<FinanceDashboard> {
  const urlParams = new URLSearchParams()
  if (period) {
    urlParams.append('period', period)
  }
  if (from) {
    urlParams.append('from', from)
  }
  if (to) {
    urlParams.append('to', to)
  }
  if (compareWith) {
    urlParams.append('compareWith', compareWith)
  }
  
  const queryString = urlParams.toString()
  const url = queryString ? `/api/finance/dashboard?${queryString}` : '/api/finance/dashboard'
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Error fetching finance dashboard: ${response.status} ${response.statusText}`)
    }

    const data: FinanceDashboard = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching finance dashboard:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error desconocido al obtener el dashboard financiero')
  }
}

