import { useState } from 'react'
import { AuthContext } from './auth-context'

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('primepc-user'))
  } catch {
    return null
  }
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)

  const login = (email) => {
    const profile = (() => {
      try {
        return JSON.parse(localStorage.getItem('primepc-profile'))
      } catch {
        return null
      }
    })()
    const nextUser = {
      email,
      firstName: profile?.email === email ? profile.firstName : '',
      lastName: profile?.email === email ? profile.lastName : '',
    }
    localStorage.setItem('primepc-user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const logout = () => {
    localStorage.removeItem('primepc-user')
    setUser(null)
  }

  const updateUser = (profile) => {
    setUser((current) => {
      if (!current) return current
      const nextUser = { ...current, email: profile.email || current.email, firstName: profile.firstName || '', lastName: profile.lastName || '' }
      localStorage.setItem('primepc-user', JSON.stringify(nextUser))
      return nextUser
    })
  }

  return <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export default AuthProvider
