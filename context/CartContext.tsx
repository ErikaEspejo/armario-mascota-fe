'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { OrderItem } from '@/types'

interface CartItem extends OrderItem {
  productImageUrl?: string
}

interface CartContextType {
  items: CartItem[]
  customerName: string
  phone: string
  notes: string
  reservationHours: number
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId: string) => void
  updateQuantity: (productId: string, variantId: string, quantity: number) => void
  updateCustomer: (name: string, phone: string, notes?: string) => void
  updateReservationHours: (hours: number) => void
  clearCart: () => void
  getTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [reservationHours, setReservationHours] = useState(24)

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.productId === item.productId && i.variantId === item.variantId
      )
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity, subtotal: (i.quantity + item.quantity) * i.price }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (productId: string, variantId: string) => {
    setItems(prev =>
      prev.filter(i => !(i.productId === productId && i.variantId === variantId))
    )
  }

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId)
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity, subtotal: quantity * i.price }
          : i
      )
    )
  }

  const updateCustomer = (name: string, phone: string, notes?: string) => {
    setCustomerName(name)
    setPhone(phone)
    if (notes !== undefined) setNotes(notes)
  }

  const updateReservationHours = (hours: number) => {
    setReservationHours(hours)
  }

  const clearCart = () => {
    setItems([])
    setCustomerName('')
    setPhone('')
    setNotes('')
    setReservationHours(24)
  }

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        customerName,
        phone,
        notes,
        reservationHours,
        addItem,
        removeItem,
        updateQuantity,
        updateCustomer,
        updateReservationHours,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

