import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext({
  currentUser: null,
  isLoading: true,
  isAuthenticated: () => false,
  login: async () => false,
  register: async () => false,
  logout: () => {}
})

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUserInfo()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/auth/me')
      setCurrentUser(response)
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (username, password) => {
    try {
      const response = await api.post('/auth/login', new URLSearchParams({
        username,
        password
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      const { access_token, token_type } = response
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `${token_type} ${access_token}`
      await fetchUserInfo()
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }, [])

  const register = useCallback(async (username, password) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        password
      })
      return true
    } catch (error) {
      console.error('Register failed:', error)
      if (error.response?.status === 400) {
        throw new Error(error.response.data.detail || '用户名已被使用')
      }
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setCurrentUser(null)
  }, [])

  const isAuthenticated = useCallback(() => {
    return currentUser !== null
  }, [currentUser])

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}