import api from '../api/axios'

/** Get shipment for an order id. Returns shipment or null when not created yet. */
export const getShipmentByOrder = async (orderId) => {
  try {
    const { data } = await api.get(`/api/shipments/order/${orderId}`)
    return data?.data
  } catch (err) {
    if (err?.response?.status === 404) return null
    throw err
  }
}

/** List all shipments (staff/admin). */
export const getAllShipments = async (params = {}) => {
  const { data } = await api.get('/api/shipments', { params })
  return { shipments: data?.data ?? [], pagination: data?.pagination }
}

/** Create a shipment (staff/admin). */
export const createShipment = async ({ orderId, trackingNumber }) => {
  const { data } = await api.post('/api/shipments', { orderId, trackingNumber })
  return data?.data
}

/** Update shipment status (staff/admin). */
export const updateShipmentStatus = async (id, status) => {
  const { data } = await api.put(`/api/shipments/${id}/status`, { status })
  return data?.data
}
