import { useState } from 'react'
import { useAuth } from '../App'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Dashboard() {
  const { user, subscriptions, connectAgent, startProduct, refreshUser } = useAuth()
  const [licenseKey, setLicenseKey] = useState('')
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemMessage, setRedeemMessage] = useState(null)

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    })
  }

  const getDaysLeft = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
    return diff
  }

  // Filter out expired subscriptions
  const activeSubscriptions = subscriptions.filter(sub => {
    const expiryDate = new Date(sub.expiresAt)
    return expiryDate > new Date()
  })

  const handleConnectAgent = async () => {
    const result = await connectAgent()
    if (!result.success) {
      alert(result.error || 'Failed to connect. Make sure the agent is running.')
    }
  }

  const handleStartProduct = async (productId) => {
    const result = await startProduct(productId)
    if (!result.success) {
      alert(result.error || 'Failed to start. Make sure the agent is connected.')
    }
  }

  const handleRedeemLicense = async (e) => {
    e.preventDefault()
    if (!licenseKey.trim()) return

    setRedeemLoading(true)
    setRedeemMessage(null)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/license/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ license_key: licenseKey.trim() })
      })

      const data = await res.json()
      if (data.success) {
        setRedeemMessage({ type: 'success', text: 'License key redeemed successfully!' })
        setLicenseKey('')
        // Refresh subscriptions
        if (refreshUser) refreshUser()
      } else {
        setRedeemMessage({ type: 'error', text: data.error || 'Failed to redeem license key' })
      }
    } catch (err) {
      setRedeemMessage({ type: 'error', text: 'Failed to connect to server' })
    } finally {
      setRedeemLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs text-[#666] uppercase tracking-widest">SYSTEM.ROOT</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <span className="text-[#888]">USER_</span><span className="text-[#ff4444]">DASHBOARD</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="cyber-card rounded-lg p-6 bg-[#0a0a0f]/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm text-[#888] uppercase tracking-wider">User_Profile</h3>
              <span className="cyber-badge">Authenticated</span>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#1f1f2e]">
              <div className="w-16 h-16 rounded border border-[#ff4444] bg-[#0a0a0f] flex items-center justify-center text-[#ff4444] text-2xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-xl text-white font-bold">{user?.username}</div>
                <div className="text-sm text-[#666] font-mono">{user?.email}</div>
              </div>
            </div>

            {/* License Key Redemption */}
            <div className="mb-6 pb-6 border-b border-[#1f1f2e]">
              <h4 className="text-xs text-[#666] uppercase tracking-wider mb-3">Redeem License Key</h4>
              <form onSubmit={handleRedeemLicense} className="space-y-3">
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="Enter license key..."
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded px-3 py-2 text-white text-sm placeholder-[#666] focus:border-[#ff4444] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={redeemLoading || !licenseKey.trim()}
                  className="w-full py-2 bg-[#ff4444] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#ff6666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {redeemLoading ? 'Redeeming...' : '> Redeem Key'}
                </button>
              </form>
              {redeemMessage && (
                <p className={`text-xs mt-2 ${redeemMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {redeemMessage.text}
                </p>
              )}
            </div>

            <div className="text-xs text-[#666] font-mono space-y-2">
              <div className="flex justify-between">
                <span>Session_ID:</span>
                <span className="text-[#ff4444]">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last_Login:</span>
                <span className="text-[#888]">{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB')}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-[#ff4444]">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* My Licenses / Products Card */}
          <div className="lg:col-span-2 cyber-card rounded-lg p-6 bg-[#0a0a0f]/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm text-[#888] uppercase tracking-wider">My_Licenses</h3>
              <span className="text-xs text-[#ff4444]">{activeSubscriptions.length} OWNED</span>
            </div>
            
            <div className="space-y-3">
              {activeSubscriptions.length > 0 ? (
                activeSubscriptions.map(sub => (
                  <div key={sub.id} className="bg-[#0a0a0f] border border-[#1f1f2e] rounded p-4 hover:border-[#ff4444]/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-white font-medium text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>{sub.productName || sub.productId}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 rounded-full bg-[#ff4444] animate-pulse" />
                          <span className="text-xs text-[#ff4444]">ACTIVE</span>
                          <span className="text-xs text-[#666]">•</span>
                          <span className="text-xs text-[#666]">{getDaysLeft(sub.expiresAt)}d remaining</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartProduct(sub.productId)}
                        className="px-4 py-2 bg-[#ff4444] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#ff6666] transition-colors flex items-center gap-2"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        START
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#666]">
                      <span>Expires: {formatDate(sub.expiresAt)}</span>
                      <span className="text-[#888]">Windows 10 & 11</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-[#666]">
                  <svg className="w-16 h-16 mx-auto mb-4 text-[#1f1f2e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="mb-4 font-mono">NO_LICENSES_FOUND</p>
                  <p className="text-sm mb-4">You don't own any products yet.</p>
                  <Link to="/products" className="cyber-btn text-xs py-2 px-4">
                    {'>'} BROWSE STORE
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-3 cyber-card rounded-lg p-6 bg-[#0a0a0f]/60 backdrop-blur-sm">
            <h3 className="text-sm text-[#888] uppercase tracking-wider mb-6">Quick_Actions</h3>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={handleConnectAgent}
                className="p-4 border border-[#1f1f2e] rounded hover:border-[#ff4444] transition-colors group text-left"
              >
                <svg className="w-8 h-8 text-[#ff4444] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div className="text-white font-medium group-hover:text-[#ff4444] transition-colors">Connect Agent</div>
                <div className="text-xs text-[#666] mt-1">Link your desktop app</div>
              </button>

              <Link
                to="/products"
                className="p-4 border border-[#1f1f2e] rounded hover:border-[#ff4444] transition-colors group text-left"
              >
                <svg className="w-8 h-8 text-[#ff4444] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div className="text-white font-medium group-hover:text-[#ff4444] transition-colors">Visit Store</div>
                <div className="text-xs text-[#666] mt-1">Browse available products</div>
              </Link>

              <a
                href={`${API_URL}/download/VulcanAgent-Setup.exe`}
                className="p-4 border border-[#1f1f2e] rounded hover:border-[#ff4444] transition-colors group text-left"
              >
                <svg className="w-8 h-8 text-[#ff4444] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <div className="text-white font-medium group-hover:text-[#ff4444] transition-colors">Download Agent</div>
                <div className="text-xs text-[#666] mt-1">Get the desktop app</div>
              </a>

              <a
                href="https://discord.gg/tSdNMH2v3M"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border border-[#1f1f2e] rounded hover:border-[#ff4444] transition-colors group text-left"
              >
                <svg className="w-8 h-8 text-[#ff4444] mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <div className="text-white font-medium group-hover:text-[#ff4444] transition-colors">Discord</div>
                <div className="text-xs text-[#666] mt-1">Join our community</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
