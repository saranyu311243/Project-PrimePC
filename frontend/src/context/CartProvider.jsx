import { useEffect, useMemo, useState } from 'react'
import { CartContext } from './cart-context'

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem('primepc-cart')) ?? []
  } catch {
    return []
  }
}

function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    localStorage.setItem('primepc-cart', JSON.stringify(items))
  }, [items])

  const actions = useMemo(() => ({
    addItem(product, quantity = 1) {
      if (!product.inStock) return
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id)
        if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        return [...current, { ...product, quantity }]
      })
    },
    updateQuantity(id, quantity) {
      setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
    },
    removeItem(id) {
      setItems((current) => current.filter((item) => item.id !== id))
    },
    clearCart() {
      setItems([])
    },
  }), [])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return <CartContext.Provider value={{ items, itemCount, subtotal, ...actions }}>{children}</CartContext.Provider>
}

export default CartProvider
