'use client'

import { createContext, useState, ReactNode } from 'react'
import { Item } from '../utils/types'

type CartContextType = {
  cart: Item[]
  addItem: (item: Item) => void
  deleteItem: (index: number) => void
  addAmount: (index: number, amount: number) => void
  increaseAmount: (index: number) => void
  decreaseAmount: (index: number) => void
  clear: () => void
  getTotalAmount: () => number
  getTotalPrice: () => number
}

export const CartContext = createContext({} as CartContextType)

export function CartContextProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Item[]>([])

  function addItem(item: Item) {
    const newCart = [...cart]
    newCart.push(item)
    setCart(newCart)
  }

  function deleteItem(index: number) {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  function addAmount(index: number, amount: number) {
    const newCart = [...cart]
    newCart[index].amount += amount
    setCart(newCart)
  }

  function increaseAmount(index: number) {
    const newCart = [...cart]
    newCart[index].amount++
    setCart(newCart)
  }

  function decreaseAmount(index: number) {
    const newCart = [...cart]
    newCart[index].amount--
    setCart(newCart)
  }

  function clear() {
    setCart([])
  }

  function getTotalAmount() {
    let totalAmount = 0
    for (const item of cart) {
      totalAmount += item.amount
    }

    return totalAmount
  }

  function getTotalPrice() {
    let totalPrice = 0

    for (const item of cart) {
      let unitPrice = item.menu.price

      for (const option of item.options) {
        if (option) {
          unitPrice += option.price
        }
      }

      totalPrice += unitPrice * item.amount
    }

    return Math.round(totalPrice * 100) / 100
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        deleteItem,
        addAmount,
        increaseAmount,
        decreaseAmount,
        clear,
        getTotalAmount,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
