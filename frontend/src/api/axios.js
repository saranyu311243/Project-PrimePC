import axios from 'axios'

// Base URL comes from Vite env in production, falls back to local backend in dev.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({ baseURL })

const TOKEN_KEY = 'primepc-token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// Attach the JWT to every request when present.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 the token is stale/invalid — drop it and let the app redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      localStorage.removeItem('primepc-user')
      if (!window.location.pathname.startsWith('/login')) {
        window.dispatchEvent(new CustomEvent('primepc:unauthorized'))
      }
    }
    return Promise.reject(error)
  },
)

export default api
