import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4002/api'
})

function normalizeEmail(email) {
  return email?.trim().toLowerCase() || ''
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ai_learning_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('ai_learning_token') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
    return () => api.interceptors.request.eject(requestInterceptor)
  }, [token])

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      localStorage.setItem('ai_learning_token', token)
    } else {
      delete api.defaults.headers.common.Authorization
      localStorage.removeItem('ai_learning_token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('ai_learning_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('ai_learning_user')
    }
  }, [user])

  const login = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const payload = { ...credentials, email: normalizeEmail(credentials.email) }
      const response = await api.post('/auth/login', payload)
      const nextToken = response.data.token
      const nextUser = response.data.user
      api.defaults.headers.common.Authorization = `Bearer ${nextToken}`
      setUser(nextUser)
      setToken(nextToken)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const payload = { ...data, email: normalizeEmail(data.email) }
      const response = await api.post('/auth/register', payload)
      const nextToken = response.data.token
      const nextUser = response.data.user
      api.defaults.headers.common.Authorization = `Bearer ${nextToken}`
      setUser(nextUser)
      setToken(nextToken)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    delete api.defaults.headers.common.Authorization
    setUser(null)
    setToken('')
    localStorage.removeItem('ai_learning_token')
    localStorage.removeItem('ai_learning_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
