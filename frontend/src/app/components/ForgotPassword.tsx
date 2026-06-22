import { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useNav } from '../App'

const BASE = import.meta.env.VITE_API_URL ?? ''

const COLORS = {
  inkNavy: '#0f172a',
  slateBlue: '#475569',
  precisionBlue: '#3b82f6',
}

export function ForgotPassword() {
  const { navigate } = useNav()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email address.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.detail ?? 'Something went wrong. Please try again.')
      } else {
        setSent(true)
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top accent */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #3b82f6)' }} />
        <div className="p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: COLORS.precisionBlue }}>
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <span className="font-bold text-lg" style={{ color: COLORS.inkNavy }}>HireAI</span>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#ecfdf5' }}>
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.inkNavy }}>Check your inbox</h2>
              <p className="text-sm mb-6" style={{ color: COLORS.slateBlue }}>
                If an account exists for <strong>{email}</strong>, we've sent a password reset link. It expires in 30 minutes.
              </p>
              <p className="text-xs text-slate-400 mb-6">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => navigate('login')}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: COLORS.precisionBlue }}>
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.inkNavy }}>Forgot password?</h2>
                <p className="text-sm" style={{ color: COLORS.slateBlue }}>
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="fp-email" className="block text-sm font-semibold mb-2"
                    style={{ color: COLORS.inkNavy }}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm border-2 border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      style={{ color: COLORS.inkNavy }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-lg bg-red-50 border-2 border-red-200">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ background: COLORS.precisionBlue }}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <button
                onClick={() => navigate('login')}
                className="mt-6 flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
                style={{ color: COLORS.slateBlue }}>
                <ArrowLeft size={15} /> Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
