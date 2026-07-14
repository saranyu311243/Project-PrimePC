import api from '../api/axios'

/** Create an inquiry (customer). */
export const createInquiry = async (message) => {
  const { data } = await api.post('/api/inquiries', { message })
  return data?.data
}

/** Get inquiries — customer sees own, staff/admin sees all. */
export const getInquiries = async () => {
  const { data } = await api.get('/api/inquiries')
  return data?.data ?? []
}

/** Get all inquiries with optional status filter (staff/admin). */
export const getAllInquiries = async (params = {}) => {
  const { data } = await api.get('/api/inquiries/all', { params })
  return { inquiries: data?.data ?? [], pagination: data?.pagination }
}

/** Respond to an inquiry (staff/admin). */
export const respondInquiry = async (id, response) => {
  const { data } = await api.put(`/api/inquiries/${id}/respond`, { response })
  return data?.data
}

/** Close an inquiry (staff/admin). */
export const closeInquiry = async (id) => {
  const { data } = await api.put(`/api/inquiries/${id}/close`)
  return data?.data
}
