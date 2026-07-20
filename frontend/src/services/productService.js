import api from '../api/axios'
import { inferProductFilterFields } from '../data/productFilterUtils'

/**
 * Normalize a product coming from the backend into the shape the UI expects.
 * - `specs` (JSON) is spread to top-level so ProductDetailPage/ProductListPage
 *   can read product.gpuSeries, product.chipset, product.monitorRefreshRate, ...
 * - `inStock` / `stockQuantity` are derived from stock + isAvailable.
 * - `image_url` mirrors imageUrl (ProductDetailPage reads image_url).
 */
export const normalizeProduct = (p) => {
  if (!p) return null
  const rawSpecs = p.specs && typeof p.specs === 'object' ? p.specs : {}
  const specs = Object.fromEntries(Object.entries(rawSpecs).filter(([, value]) =>
    value !== undefined && value !== null && String(value).trim() !== ''))
  const inferredFilterFields = inferProductFilterFields(p)
  const stockQuantity = typeof p.stock === 'number' ? p.stock : 0
  return {
    ...inferredFilterFields,
    ...specs,
    ...p,
    inStock: Boolean(p.isAvailable) && stockQuantity > 0,
    stockQuantity,
    image_url: p.imageUrl ?? null,
  }
}

/** Fetch products with optional filters. Returns { products, pagination }. */
export const fetchProducts = async (params = {}) => {
  const { data } = await api.get('/api/products', { params })
  return {
    products: (data.data ?? []).map(normalizeProduct),
    pagination: data.pagination ?? null,
  }
}

/** Fetch a single product by id. Returns normalized product or null. */
export const fetchProductById = async (id) => {
  const { data } = await api.get(`/api/products/${id}`)
  return normalizeProduct(data.data)
}

/** Create a product (Staff/Admin). */
export const createProduct = async (payload) => {
  const { data } = await api.post('/api/products', payload)
  return normalizeProduct(data.data)
}

/** Update a product (Staff/Admin). */
export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/api/products/${id}`, payload)
  return normalizeProduct(data.data)
}

/** Delete a product (Admin). */
export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/api/products/${id}`)
  return data
}
