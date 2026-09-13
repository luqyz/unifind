import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUpWithEmail, getAuthErrorMessage } from '../services/firebaseService'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      await signUpWithEmail({
        email: form.email,
        password: form.password,
        displayName: form.name,
      })
      navigate('/')
    } catch (err) {
      setError(getAuthErrorMessage(err))
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
          <p className="mt-1 text-sm text-ink-soft">Join the community to help reunite people with their items</p>
        </div>

        {/* Card */}
        <div className="paper-card bg-surface border border-ink/10 shadow-sm p-8 space-y-6">
          {/* Header */}
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-ink">Create an account</h2>
            <p className="mt-1 text-sm text-ink-soft">Get started in just a few steps</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                placeholder="Alex Morgan"
                required
              />
            </div>

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
                placeholder="At least 6 characters"
                required
              />
              <p className="mt-1.5 text-xs text-ink-soft">Use at least 6 characters for your password</p>
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-center text-ink-soft">
            By creating an account, you agree to our{' '}
            <span className="text-amber-dark font-medium cursor-pointer hover:text-amber-dark">Terms of Service</span>
          </p>

          {/* Sign In Link */}
          <div className="pt-4 border-t border-ink/10">
            <p className="text-center text-sm text-ink-soft">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-amber-dark hover:text-amber-dark">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}