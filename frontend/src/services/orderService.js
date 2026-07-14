import api from '../api/axios'

/**
 * Create an order.
 * @param {{items: {productId:number, quantity:number}[], shippingAddress: string}} payload
 * Backend returns { data: { order, items } }.
 */
export const createOrder = async ({ items, shippingAddress }) => {
  const { data } = await api.post('/api/orders', { items, shippingAddress })
  return data?.data
}

/** List orders. Customers get their own; staff/admin get all. Returns array. */
export const getOrders = async (params = {}) => {
  const { data } = await api.get('/api/orders', { params })
  return { orders: data?.data ?? [], pagination: data?.pagination }
}

/** Get one order by id. Returns the order object. */
export const getOrderById = async (id) => {
  const { data } = await api.get(`/api/orders/${id}`)
  return data?.data
}

/** Update order status (staff/admin). */
export const updateOrderStatus = async (id, status) => {
  const { data } = await api.put(`/api/orders/${id}/status`, { status })
  return data?.data
}

/** Cancel an order (customer or staff/admin). */
export const cancelOrder = async (id) => {
  const { data } = await api.put(`/api/orders/${id}/cancel`)
  return data?.data
}
