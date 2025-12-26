import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Auth Context
const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.user)
        setSubscriptions(data.subscriptions || [])
      } else {
        localStorage.removeItem('token')
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (data.success) {
      localStorage.setItem('token', data.token)
      setUser(data.user)
      await fetchUser(data.token)
    }
    return data
  }

  const register = async (email, password, username) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    })
    const data = await res.json()
    if (data.success) {
      localStorage.setItem('token', data.token)
      setUser(data.user)
    }
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setSubscriptions([])
    // Notify agent
    window.location.href = 'vulcan://logout'
  }

  const connectAgent = async () => {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, error: 'Not logged in' }

    try {
      const res = await fetch(`${API_URL}/api/agent/token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        // Open agent with auth token
        window.location.href = `vulcan://auth?token=${data.token}`
        return { success: true }
      }
      return data
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const startProduct = (productId) => {
    window.location.href = `vulcan://start/${productId}`
  }

  const hasSubscription = (productId) => {
    return subscriptions.some(s => s.productId === productId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[#1f1f2e] border-t-[#ff4444] rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-[#ff4444] font-mono text-sm">LOADING_SYSTEM...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      subscriptions, 
      login, 
      register, 
      logout, 
      connectAgent, 
      startProduct,
      hasSubscription,
      refreshUser: () => fetchUser(localStorage.getItem('token'))
    }}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  )
}

export default App
