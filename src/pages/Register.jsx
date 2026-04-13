import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'

const LOGO_URL = 'https://i.ibb.co/fKxV1h9/image-2025-10-18-170600039-removebg-preview.png'

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src={LOGO_URL} alt="Vulcan" className="h-20 w-auto mx-auto mb-4 animate-flame-glow" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-gradient-flame">Create your account</h1>
          <p className="text-sm text-ink-secondary mt-2">Join the Vulcan community</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg px-4 py-3 text-sm bg-red-500/10 border border-red-500/25 text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="yourusername"
                minLength={3}
                maxLength={32}
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
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
                placeholder="At least 6 characters"
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-flame w-full">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-soft text-center">
            <span className="text-sm text-ink-secondary">Already have an account? </span>
            <Link to="/login" className="text-sm font-semibold text-flame-400 hover:text-flame-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-ink-muted mt-8">
          You'll link your Discord account after signing up to unlock licenses
        </p>
      </div>
    </div>
  )
}
