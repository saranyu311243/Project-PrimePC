import { useCallback, useEffect, useMemo, useState } from 'react'
import { ProductsContext } from './products-context'
import { fetchProducts } from '../services/productService'

/**
 * Loads the full product catalog from the backend once and caches it.
 * Components consume `useProducts()` and keep doing client-side
 * filtering/search on the `products` array exactly as before.
 *
 * If the backend is unreachable, products stays empty and `error` is set —
 * the UI shows an honest empty/error state rather than a stale mock catalog.
 */
function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // limit=200 comfortably covers the real catalog with headroom to grow.
      const { products: list } = await fetchProducts({ limit: 200 })
      setProducts(list)
    } catch (err) {
      setProducts([])
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
    () => ({ products, loading, error, reload: load }),
    [products, loading, error, load],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export default ProductsProvider
