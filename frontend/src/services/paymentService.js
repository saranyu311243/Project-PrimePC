import api from '../api/axios'

/** Available payment methods. Backend returns { data: string[] }. */
export const getPaymentOptions = async () => {
  const { data } = await api.get('/api/payments/options')
  return data?.data ?? []
}

/**
 * Create a payment for an order.
 * @param {{orderId:number, amount:number, method:string, transactionId?:string}} payload
 */
export const createPayment = async (payload) => {
  const { data } = await api.post('/api/payments', payload)
  return data?.data
}

/** Get payment by order id. */
export const getPaymentByOrder = async (orderId) => {
  const { data } = await api.get(`/api/payments/order/${orderId}`)
  return data?.data
}

/** Confirm/update a payment status (staff/admin). */
export const confirmPayment = async (id, status = 'SUCCESS') => {
  const { data } = await api.put(`/api/payments/${id}/confirm`, { status })
  return data?.data
}
