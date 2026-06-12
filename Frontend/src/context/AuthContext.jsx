/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedSession = localStorage.getItem('session')
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession)
        setUser(session.user ?? null)
        setToken(session.token ?? null)
      } catch (error) {
        console.error('Error parsing stored session:', error)
        localStorage.removeItem('session')
      }
    }
    setLoading(false)
  }, [])

  const login = (sessionData) => {
    localStorage.setItem('session', JSON.stringify(sessionData))
    setUser(sessionData.user)
    setToken(sessionData.token)
  }

  const logout = () => {
    localStorage.removeItem('session')
    setUser(null)
    setToken(null)
  }

  const updateSessionUser = (updatedUser) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedUser }
      const storedSession = localStorage.getItem('session')
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession)
          session.user = newUser
          localStorage.setItem('session', JSON.stringify(session))
        } catch (error) {
          console.error('Error updating session user in localStorage:', error)
        }
      }
      return newUser
    })
  }

  const value = {
    user,
    token,
    login,
    logout,
    updateSessionUser,
    loading,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
