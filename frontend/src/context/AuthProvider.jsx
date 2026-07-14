import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './auth-context'
import { clearToken, setToken } from '../api/axios'
import * as authService from '../services/authService'

const USER_KEY = 'primepc-user'

// Backend stores a single `name`; the UI uses firstName/lastName. Bridge them.
const splitName = (name = '') => {
  const parts = String(name).trim().split(/\s+/)
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') }
}

// Normalize a backend user object into the shape the UI components expect.
const normalizeUser = (raw) => {
  if (!raw) return null
  const { firstName, lastName } = splitName(raw.name)
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name ?? '',
    firstName: raw.firstName ?? firstName,
    lastName: raw.lastName ?? lastName,
    phone: raw.phone ?? '',
    address: raw.address ?? '',
    role: raw.role ?? 'CUSTOMER',
  }
}

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

const persistUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)
  const [loading, setLoading] = useState(true)

  // Force logout when axios detects an invalid/expired token (401).
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null)
      persistUser(null)
    }
    window.addEventListener('primepc:unauthorized', onUnauthorized)
    return () => window.removeEventListener('primepc:unauthorized', onUnauthorized)
  }, [])

  // On first load, if a token exists, refresh the profile from the backend.
  useEffect(() => {
    let active = true
    ;(async () => {
      // No token → nothing to refresh; skip the guaranteed 401.
      if (!authService.getStoredToken()) {
        setLoading(false)
        return
      }
      try {
        const profile = await authService.fetchProfile()
        if (active && profile) {
          const normalized = normalizeUser(profile)
          setUser(normalized)
          persistUser(normalized)
        }
      } catch {
        // No valid session — leave whatever is in localStorage / null.
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, user: rawUser } = await authService.login(email, password)
    setToken(token)
    const normalized = normalizeUser(rawUser)
    setUser(normalized)
    persistUser(normalized)
    return normalized
  }, [])

  const register = useCallback(async (payload) => {
    const { token, user: rawUser } = await authService.register(payload)
    if (token) setToken(token)
    const normalized = normalizeUser(rawUser)
    if (normalized) {
      setUser(normalized)
      persistUser(normalized)
    }
    return normalized
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    persistUser(null)
  }, [])

  const updateUser = useCallback(async (profile) => {
    // profile may carry firstName/lastName from the UI — merge into `name`.
    const name = profile.name ?? [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
    const updated = await authService.updateProfile({
      name: name || undefined,
      phone: profile.phone,
      address: profile.address,
    })
    const normalized = normalizeUser(updated)
    setUser(normalized)
    persistUser(normalized)
    return normalized
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
