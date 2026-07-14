import { useContext } from 'react'
import { ProductsContext } from '../context/products-context'

export const useProducts = () => {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts must be used inside ProductsProvider')
  return context
}
