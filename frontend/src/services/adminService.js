import api from '../api/axios'

/** Admin dashboard stats. Returns { totalUsers, totalOrders, totalRevenue, pendingOrders }. */
export const getDashboard = async () => {
  const { data } = await api.get('/api/admin/dashboard')
  return data?.data
}

/** List all users (admin). */
export const getAllUsers = async (params = {}) => {
  const { data } = await api.get('/api/admin/users', { params })
  return { users: data?.data ?? [], pagination: data?.pagination }
}

/** Update a user's role (admin). */
export const updateUserRole = async (id, role) => {
  const { data } = await api.put(`/api/admin/users/${id}/role`, { role })
  return data?.data
}

/** Delete a user (admin). */
export const deleteUser = async (id) => {
  const { data } = await api.delete(`/api/admin/users/${id}`)
  return data
}

/** Sales report with optional date range (admin). */
export const getSalesReport = async (params = {}) => {
  const { data } = await api.get('/api/admin/sales', { params })
  return data?.data
}
