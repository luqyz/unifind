import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmail, signInWithGoogle } from '../services/firebaseService'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmail(form)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      await signInWithGoogle()
      navigate('/')
    } catch (err) {
      setError(err.message || 'Google login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-amber mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-ink">Lost &amp; Found</h1>
          <p className="mt-1 text-sm text-ink-soft">Help reunite community members with their belongings</p>
        </div>

        {/* Card */}
        <div className="paper-card bg-surface border border-ink/10 shadow-sm p-8 space-y-6">
          {/* Header */}
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-ink">Welcome back</h2>
            <p className="mt-1 text-sm text-ink-soft">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                placeholder="name@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-coral/10 border border-coral/30 px-3.5 py-2.5 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-coral mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-coral">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-navy hover:bg-amber-dark disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-2 text-ink-soft">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full rounded-lg border border-ink/15 bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-soft disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.64v3h3.88c2.27-2.09 3.57-5.17 3.57-8.83z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1A12 12 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.26a12 12 0 0 0 0 10.78z" />
              <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.6 4.6 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.61l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77z" />
            </svg>
            Continue with Google
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-ink-soft">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-amber-dark hover:text-amber-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}