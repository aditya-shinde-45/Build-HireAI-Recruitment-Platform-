import { useState, useEffect } from 'react'
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import { useNav } from '../App'

const BASE = import.meta.env.VITE_API_URL ?? ''

const COLORS = {
  inkNavy: '#0f172a',
  slateBlue: '#475569',
  precisionBlue: '#3b82f6',
}

export function ResetPassword() {
  const { navigate } = useNav()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Read token from URL query string: /reset-password?token=xxx
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token') ?? ''
    setToken(t)
    if (!t) setError('Invalid or missing reset token. Please request a new link.')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirm) { setError('Please fill in all fields.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.detail ?? 'Something went wrong. Please try again.')
      } else {
        setSuccess(true)
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

          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#ecfdf5' }}>
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.inkNavy }}>Password reset!</h2>
              <p className="text-sm mb-6" style={{ color: COLORS.slateBlue }}>
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('login')}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: COLORS.precisionBlue }}>
                Go to Login
              </button>
            </div>
          ) : !token && error ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#fef2f2' }}>
                <XCircle size={32} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.inkNavy }}>Invalid Link</h2>
              <p className="text-sm mb-6" style={{ color: COLORS.slateBlue }}>{error}</p>
              <button
                onClick={() => navigate('forgot-password')}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: COLORS.precisionBlue }}>
                Request New Link
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.inkNavy }}>Set new password</h2>
                <p className="text-sm" style={{ color: COLORS.slateBlue }}>
                  Choose a strong password for your HireAI account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.inkNavy }}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-4 py-3 pr-11 rounded-lg text-sm border-2 border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      style={{ color: COLORS.inkNavy }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.inkNavy }}>
                    Confirm Password
                  </label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 rounded-lg text-sm border-2 border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    style={{ color: COLORS.inkNavy }}
                  />
                </div>

                {/* Strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all"
                          style={{
                            background: password.length >= i * 3
                              ? i <= 1 ? '#ef4444' : i <= 2 ? '#f59e0b' : i <= 3 ? '#6366f1' : '#10b981'
                              : '#e2e8f0'
                          }} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      {password.length < 6 ? 'Too short' : password.length < 9 ? 'Fair' : password.length < 12 ? 'Good' : 'Strong'}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="px-4 py-3 rounded-lg bg-red-50 border-2 border-red-200">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ background: COLORS.precisionBlue }}>
                  {loading ? 'Updating…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
