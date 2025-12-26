import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'

export default function Register() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const result = await register(email, password, username)
    
    if (!result.success) {
      setError(result.error || 'Registration failed')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Video Background - More Visible */}
      <div className="fixed inset-0 z-0">
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/70 via-[#0a0a0f]/50 to-[#0a0a0f]/70" />
      </div>

      {/* Hero gradient */}
      <div className="fixed inset-0 hero-gradient pointer-events-none z-[1]" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="https://i.ibb.co/fKxV1h9/image-2025-10-18-170600039-removebg-preview.png" 
            alt="Vulcan" 
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            VULCAN <span className="text-[#ff4444]">SOLUTIONS</span>
          </h1>
          <p className="text-[#666] mt-2 text-sm font-mono">// CREATE_NEW_ACCOUNT</p>
        </div>

        {/* Form */}
        <div className="cyber-card rounded-lg p-8 corner-decoration">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm text-[#888] uppercase tracking-wider">Registration_Terminal</h2>
            <div className="flex items-center gap-2">
              <div className="status-dot" />
              <span className="text-xs text-[#ff4444]">SECURE</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-[#ff2d95]/10 border border-[#ff2d95]/30 text-[#ff2d95] px-4 py-3 rounded text-sm font-mono">
                {'>'} ERROR: {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-[#888] uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">{'>'}</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="cyber-input pl-8"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#888] uppercase tracking-wider mb-2">Email_Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">{'>'}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cyber-input pl-8"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#888] uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">{'>'}</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input pl-8 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#ff4444] transition-colors text-xs uppercase"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#888] uppercase tracking-wider mb-2">Confirm_Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">{'>'}</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="cyber-input pl-8"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cyber-btn cyber-btn-filled disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0a0a0f] border-t-transparent rounded-full animate-spin"></div>
                  CREATING_ACCOUNT...
                </span>
              ) : (
                '> CREATE_ACCOUNT'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#1f1f2e] text-center">
            <span className="text-[#666] text-sm">Already have an account? </span>
            <Link to="/login" className="text-[#ff4444] hover:underline text-sm">
              {'>'} Login
            </Link>
          </div>

          <div className="mt-6 text-xs text-[#666] font-mono text-center">
            <div>CONNECTION: <span className="text-[#ff4444]">ENCRYPTED</span></div>
            <div>PROTOCOL: <span className="text-[#ff4444]">AES-256</span></div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#666] text-xs mt-8 font-mono">
          © 2025 VULCAN SOLUTIONS | SECURE_REGISTRATION
        </p>
      </div>
    </div>
  )
}
