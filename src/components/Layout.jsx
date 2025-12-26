import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { useState } from 'react'

export default function Layout() {
  const { user, logout, connectAgent } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleConnectAgent = async () => {
    const result = await connectAgent()
    if (!result.success) {
      alert(result.error || 'Failed to connect to agent')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Video Background - More Visible */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-cover opacity-40"
          style={{ filter: 'hue-rotate(80deg) saturate(1.2)' }}
        >
          <source src="https://oazis.vercel.app/video/bg-desktop.mp4" type="video/mp4" />
        </video>
        {/* Lighter overlay for more video visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/70 via-[#0a0a0f]/50 to-[#0a0a0f]/70" />
      </div>

      {/* Hero gradient */}
      <div className="fixed inset-0 hero-gradient pointer-events-none z-[1]" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1f1f2e]/50 bg-[#0a0a0f]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3">
              <img 
                src="https://i.ibb.co/fKxV1h9/image-2025-10-18-170600039-removebg-preview.png" 
                alt="Vulcan" 
                className="h-10 w-auto"
              />
              <div className="hidden sm:block">
                <span className="text-white font-bold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>VULCAN</span>
                <span className="text-[#ff4444] text-xs ml-2 font-mono">v2.0.0</span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => `nav-link uppercase text-xs ${isActive ? 'text-[#ff4444]' : ''}`}
              >
                {'>'} Home
              </NavLink>
              <NavLink 
                to="/products" 
                className={({ isActive }) => `nav-link uppercase text-xs ${isActive ? 'text-[#ff4444]' : ''}`}
              >
                {'>'} Products
              </NavLink>
              {user && (
                <>
                  <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => `nav-link uppercase text-xs ${isActive ? 'text-[#ff4444]' : ''}`}
                  >
                    {'>'} Dashboard
                  </NavLink>
                  <button 
                    onClick={handleConnectAgent}
                    className="nav-link uppercase text-xs"
                  >
                    {'>'} Connect_Agent
                  </button>
                </>
              )}
            </div>

            {/* Status & User */}
            <div className="flex items-center gap-4">
              {/* System Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 border border-[#1f1f2e]/50 rounded bg-[#0a0a0f]/50 backdrop-blur">
                <div className="status-dot" />
                <span className="text-xs text-[#888] uppercase tracking-wider">System: </span>
                <span className="text-xs text-[#ff4444] uppercase tracking-wider">Online</span>
              </div>

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm text-white font-medium">{user.username}</div>
                    <div className="text-xs text-[#666]">{user.email}</div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-10 h-10 rounded border border-[#1f1f2e] bg-[#0a0a0f]/50 backdrop-blur flex items-center justify-center text-[#ff4444] font-bold hover:border-[#ff4444] transition-all"
                    >
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-[#0a0a0f]/95 backdrop-blur border border-[#1f1f2e] rounded">
                        <NavLink 
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="block w-full px-4 py-2 text-left text-sm text-[#888] hover:text-[#ff4444] hover:bg-[#1f1f2e]/50 transition-all"
                        >
                          {'>'} Dashboard
                        </NavLink>
                        <button 
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-[#888] hover:text-[#ff4444] hover:bg-[#1f1f2e]/50 transition-all"
                        >
                          {'>'} Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <NavLink to="/login" className="cyber-btn text-xs py-2 px-4">
                  {'>'} Access_System
                </NavLink>
              )}

              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#888] hover:text-[#ff4444]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1f1f2e]/50 bg-[#0a0a0f]/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3">
              <NavLink to="/" end className="block text-sm text-[#888] hover:text-[#ff4444]" onClick={() => setMobileMenuOpen(false)}>
                {'>'} Home
              </NavLink>
              <NavLink to="/products" className="block text-sm text-[#888] hover:text-[#ff4444]" onClick={() => setMobileMenuOpen(false)}>
                {'>'} Products
              </NavLink>
              {user && (
                <>
                  <NavLink to="/dashboard" className="block text-sm text-[#888] hover:text-[#ff4444]" onClick={() => setMobileMenuOpen(false)}>
                    {'>'} Dashboard
                  </NavLink>
                  <button 
                    onClick={() => {
                      handleConnectAgent()
                      setMobileMenuOpen(false)
                    }}
                    className="block text-sm text-[#888] hover:text-[#ff4444]"
                  >
                    {'>'} Connect_Agent
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1f1f2e]/50 bg-[#0a0a0f]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://i.ibb.co/fKxV1h9/image-2025-10-18-170600039-removebg-preview.png" 
                  alt="Vulcan" 
                  className="h-10 w-auto"
                />
                <span className="text-white font-bold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>VULCAN</span>
              </div>
              <p className="text-xs text-[#666] font-mono leading-relaxed">
                // PREMIUM_GAMING_PLATFORM<br/>
                Advanced security solutions for gamers.<br/>
                Undetected. Unstoppable.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="status-dot" />
                <span className="text-xs text-[#ff4444]">SYSTEM_ONLINE</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm text-white uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>Navigation</h4>
              <div className="space-y-2">
                <NavLink to="/" className="block text-xs text-[#666] hover:text-[#ff4444] transition-colors">{'>'} Home</NavLink>
                <NavLink to="/products" className="block text-xs text-[#666] hover:text-[#ff4444] transition-colors">{'>'} Products</NavLink>
                <a href="https://discord.gg/vulcan" className="block text-xs text-[#666] hover:text-[#ff4444] transition-colors">{'>'} Discord</a>
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-sm text-white uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>System_Status</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#666]">
                  <span>Server:</span>
                  <span className="text-[#ff4444]">OPERATIONAL</span>
                </div>
                <div className="flex justify-between text-[#666]">
                  <span>Detection:</span>
                  <span className="text-[#ff4444]">UNDETECTED</span>
                </div>
                <div className="flex justify-between text-[#666]">
                  <span>Uptime:</span>
                  <span className="text-[#ff4444]">99.9%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#1f1f2e] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#666]">© 2025 VULCAN SOLUTIONS | EST. 2024</p>
            <p className="text-xs text-[#666]">SECURED BY <span className="text-[#ff4444]">AES-256</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
