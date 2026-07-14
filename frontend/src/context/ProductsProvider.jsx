import { useCallback, useEffect, useMemo, useState } from 'react'
import { ProductsContext } from './products-context'
import { fetchProducts } from '../services/productService'
import { products as staticProducts } from '../data/products'

/**
 * Loads the full product catalog from the backend once and caches it.
 * Components consume `useProducts()` and keep doing client-side
 * filtering/search on the `products` array exactly as before.
 *
 * If the backend is unreachable we fall back to the bundled static
 * catalog so the storefront still renders (degraded, read-only) mode.
 */
function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // limit=100 covers the full 65-item catalog in one request.
      const { products: list } = await fetchProducts({ limit: 100 })
      if (list.length) {
        setProducts(list)
        setUsingFallback(false)
      } else {
        setProducts(staticProducts)
        setUsingFallback(true)
      }
    } catch (err) {
      // Backend down / network error — degrade to the bundled catalog.
      setProducts(staticProducts)
      setUsingFallback(true)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount; load() sets state after an async catalog fetch
    load()
  }, [load])

  const value = useMemo(
    () => ({ products, loading, error, usingFallback, reload: load }),
    [products, loading, error, usingFallback, load],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export default ProductsProvider
