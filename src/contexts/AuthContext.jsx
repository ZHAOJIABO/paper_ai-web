import { createContext, useContext, useState, useEffect } from 'react'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  isLoggedIn,
  getUserInfo as getStoredUserInfo,
  clearAuthData
} from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 初始化时检查登录状态
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    if (!isLoggedIn()) {
      setLoading(false)
      return
    }

    try {
      // 先从本地存储获取用户信息
      const storedUser = getStoredUserInfo()
      if (storedUser) {
        setUser(storedUser)
      }

      // 然后从服务器获取最新信息
      const result = await getCurrentUser()
      setUser(result.data)
      setError(null)
    } catch (err) {
      console.error('获取用户信息失败:', err)
      // 如果token无效，清除所有数据
      if (err.code === 20004 || err.code === 20008) {
        clearAuthData()
        setUser(null)
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setError(null)
      const result = await apiLogin(credentials)
      setUser(result.data.user)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const result = await apiRegister(userData)
      // 注册后需要手动登录
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('登出失败:', err)
      // 即使失败也清除本地状态
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const result = await getCurrentUser()
      setUser(result.data)
      setError(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
