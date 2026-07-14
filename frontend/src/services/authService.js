import api from '../api/axios'

const TOKEN_KEY = 'primepc-token'
const USER_KEY = 'primepc-user'

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

const persist = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Login. Backend returns { data: { user, token } }.
 * Returns { token, user }.
 */
export const login = async (email, password) => {
  const { data } = await api.post('/api/auth/login', { email, password })
  const token = data?.data?.token
  const user = data?.data?.user
  persist(token, user)
  return { token, user }
}

/**
 * Register. Backend returns { token, data: user } (token at top level).
 * Returns { token, user }.
 */
export const register = async (payload) => {
  const { data } = await api.post('/api/auth/register', payload)
  const token = data?.token
  const user = data?.data
  persist(token, user)
  return { token, user }
}

/** Fetch the current profile. Backend returns { data: user }. */
export const fetchProfile = async () => {
  const { data } = await api.get('/api/auth/profile')
  const user = data?.data
  if (user) {
    // merge to keep token-only fields (role/email) fresh
    const current = getStoredUser() ?? {}
    persist(null, { ...current, ...user })
  }
  return user
}

/** Update profile. Backend returns { data: user }. */
export const updateProfile = async (payload) => {
  const { data } = await api.put('/api/auth/profile', payload)
  const user = data?.data
  if (user) {
    const current = getStoredUser() ?? {}
    persist(null, { ...current, ...user })
  }
  return user
}
