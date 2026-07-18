import api from '../api/axios'

/**
 * Upload a single product image into a category folder in Supabase Storage.
 * Returns { path, url } for the newly stored image.
 */
export const uploadProductImage = async (file, category) => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('category', category)
  const { data } = await api.post('/api/product-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

/** List previously uploaded images for a category. Returns an array of { name, path, url }. */
export const listProductImages = async (category) => {
  const { data } = await api.get('/api/product-images', { params: { category } })
  return data.data
}

/** Delete an uploaded image by its storage path. */
export const deleteProductImage = async (path) => {
  const { data } = await api.delete('/api/product-images', { data: { path } })
  return data
}
