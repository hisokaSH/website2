import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../App'

const LOGO_URL = 'https://i.ibb.co/fKxV1h9/image-2025-10-18-170600039-removebg-preview.png'

export default function Login() {
  const { login, connectAgent } = useAuth()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectToAgent = searchParams.get('redirect')?.startsWith('vulcan://')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    if (result.success) {
      if (redirectToAgent) await connectAgent()
    } else {
      setError(result.error || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src={LOGO_URL} alt="Vulcan" className="h-20 w-auto mx-auto mb-4 animate-flame-glow" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-gradient-flame">Welcome back</h1>
          <p className="text-sm text-ink-secondary mt-2">Sign in to your Vulcan account</p>
        </div>

        {/* Form card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {redirectToAgent && (
              <div className="rounded-lg px-4 py-3 text-sm bg-flame-600/10 border border-flame-600/25 text-flame-300">
                Sign in to launch the Vulcan loader
              </div>
            )}

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm bg-red-500/10 border border-red-500/25 text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">
                Username or Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="username or email"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-ink-muted hover:text-flame-400 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-flame w-full">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                redirectToAgent ? 'Sign in & Launch Loader' : 'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-soft text-center">
            <span className="text-sm text-ink-secondary">Don't have an account? </span>
            <Link to="/register" className="text-sm font-semibold text-flame-400 hover:text-flame-300 transition-colors">
              Create one
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-ink-muted mt-8">
          By signing in you agree to our terms and community guidelines
        </p>
      </div>
    </div>
  )
}
