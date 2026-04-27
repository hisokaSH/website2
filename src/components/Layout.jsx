import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../App'
import { useState, useEffect, useRef } from 'react'
import NotificationBell from './forum/NotificationBell'

const LOGO_URL = 'https://i.ibb.co/fKxV1h9/image-2025-10-18-170600039-removebg-preview.png'

export default function Layout() {
  const { user, logout, connectAgent } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleConnectAgent = async () => {
    const result = await connectAgent()
    if (!result.success) {
      alert(result.error || 'Failed to connect. Make sure the loader is running.')
    }
  }

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors ${
      isActive ? 'text-white' : 'text-ink-secondary hover:text-white'
    }`

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border-soft bg-bg-base/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src={LOGO_URL} alt="Vulcan" className="h-8 w-auto animate-flame-glow" />
              <span className="font-display font-bold text-lg tracking-tight text-white">
                Vulcan
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink to="/" end className={navLinkClass}>Home</NavLink>
              {user && (
                <>
                  <NavLink to="/forum" className={navLinkClass}>Forum</NavLink>
                  <NavLink to="/docs" className={navLinkClass}>Docs</NavLink>
                  <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                  <NavLink to="/ai" className={navLinkClass}>AI</NavLink>
                </>
              )}
              <a
                href="https://discord.gg/vulcansolutions"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-ink-secondary hover:text-white transition-colors"
              >
                Shop
              </a>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {user && <NotificationBell />}
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-overlay transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-flame flex items-center justify-center text-sm font-bold text-white shadow-flame">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-white">
                      {user.username}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`hidden sm:block text-ink-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 py-1.5 rounded-lg bg-bg-raised border border-border shadow-xl animate-fade-in">
                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-secondary hover:text-white hover:bg-bg-overlay transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link
                        to="/forum"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-secondary hover:text-white hover:bg-bg-overlay transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Forum
                      </Link>
                      <button
                        onClick={handleConnectAgent}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink-secondary hover:text-white hover:bg-bg-overlay transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Launch Loader
                      </button>
                      <div className="my-1 border-t border-border-soft" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink-secondary hover:text-flame-400 hover:bg-bg-overlay transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-ink-secondary hover:text-white transition-colors">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-flame">
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-ink-secondary hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {mobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-soft bg-bg-raised/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-secondary hover:text-white">Home</NavLink>
              {user && (
                <>
                  <NavLink to="/forum" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-secondary hover:text-white">Forum</NavLink>
                  <NavLink to="/docs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-secondary hover:text-white">Docs</NavLink>
                  <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-ink-secondary hover:text-white">Dashboard</NavLink>
                </>
              )}
              <a
                href="https://discord.gg/vulcansolutions"
                target="_blank"
                rel="noreferrer"
                className="block py-2 text-sm font-medium text-ink-secondary hover:text-white"
              >
                Shop (Discord)
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Page content ───────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="mt-20 border-t border-border-soft bg-bg-raised/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5">
                <img src={LOGO_URL} alt="Vulcan" className="h-8 w-auto" />
                <span className="font-display font-bold text-lg text-white">Vulcan</span>
              </Link>
              <p className="mt-4 text-sm text-ink-secondary max-w-sm leading-relaxed">
                The Vulcan community hub — manage licenses, discuss tools, and stay in the loop.
                Purchases happen exclusively on our Discord.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Site</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/" className="text-ink-secondary hover:text-white">Home</Link></li>
                <li><Link to="/forum" className="text-ink-secondary hover:text-white">Forum</Link></li>
                <li><Link to="/docs" className="text-ink-secondary hover:text-white">Docs</Link></li>
                <li><Link to="/dashboard" className="text-ink-secondary hover:text-white">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Community</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="https://discord.gg/vulcansolutions" target="_blank" rel="noreferrer" className="text-ink-secondary hover:text-white">Discord</a></li>
                <li><a href="https://discord.gg/vulcansolutions" target="_blank" rel="noreferrer" className="text-ink-secondary hover:text-white">Shop</a></li>
                <li><a href="https://discord.gg/vulcansolutions" target="_blank" rel="noreferrer" className="text-ink-secondary hover:text-white">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border-soft flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">© 2026 Vulcan Solutions. All rights reserved.</p>
            <p className="text-xs text-ink-muted">Forged in fire. Built to dominate.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
