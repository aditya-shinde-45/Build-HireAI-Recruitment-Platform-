import { useState } from 'react'
import { Eye, EyeOff, User, Briefcase, ArrowRight, CheckCircle2, BarChart3, Trophy, Star } from 'lucide-react'
import { useAuth, useNav } from '../App'
import type { Role } from './data'

// Design System Colors (from Landing Page)
const COLORS = {
  inkNavy: '#0f172a',
  slateBlue: '#475569',
  precisionBlue: '#3b82f6',
  warmPaper: '#fafaf9',
  softCream: '#f5f5f4',
  dataGreen: '#10b981',
}

export function Login() {
  const { login } = useAuth()
  const { navigate } = useNav()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('candidate')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (!result.ok) setError(result.msg)
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Left Branding Panel */}
      <div 
        className="hidden lg:flex lg:w-1/2 xl:w-[45%] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}
      >
        {/* Decorative geometric shapes */}
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)', transform: 'translate(30%, 0)' }} />
        
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 h-full">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: COLORS.precisionBlue }}>
                <span className="text-white text-base font-bold">AI</span>
              </div>
              <span className="font-bold text-2xl" style={{ color: COLORS.inkNavy }}>HireAI</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight" style={{ color: COLORS.inkNavy }}>
              Data-driven hiring,<br />made simple
            </h1>
            
            <p className="text-lg mb-8" style={{ color: COLORS.slateBlue }}>
              AI-powered resume screening, real-time analytics, and transparent candidate ranking—all in one platform.
            </p>

            {/* Proof Points */}
            <div className="space-y-3 mb-8">
              {[
                { icon: <CheckCircle2 size={18} />, text: 'Screen 500 resumes in under 2 minutes' },
                { icon: <CheckCircle2 size={18} />, text: 'Multi-dimensional candidate scoring' },
                { icon: <CheckCircle2 size={18} />, text: 'Live hiring funnel analytics' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-blue-600">{item.icon}</span>
                  <span className="text-sm font-medium" style={{ color: COLORS.slateBlue }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Product UI Mockup */}
          <div className="relative">
            <div className="rounded-xl border-2 border-white bg-white shadow-2xl overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Analytics Dashboard</span>
              </div>
              <div className="p-4 bg-gradient-to-br from-white to-slate-50">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                    <p className="text-[10px] text-slate-600 mb-1">Total Applications</p>
                    <p className="font-mono text-xl font-bold text-slate-900">147</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                    <p className="text-[10px] text-slate-600 mb-1">Hired</p>
                    <p className="font-mono text-xl font-bold text-slate-900">12</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: '78%' }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">78%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '45%' }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">45%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Badge */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-xl border border-slate-200 max-w-xs">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs italic mb-2" style={{ color: COLORS.slateBlue }}>
                "Cut our time-to-hire by 60%"
              </p>
              <p className="text-[10px] font-semibold text-slate-900">Sarah K., Head of Talent</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-blue-200/50">
            <p className="text-sm text-slate-600">
              Trusted by 2,800+ companies worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 xl:w-[55%] flex flex-col bg-white">
        {/* Mobile Logo */}
        <div className="lg:hidden p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: COLORS.precisionBlue }}>
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <span className="font-bold text-lg" style={{ color: COLORS.inkNavy }}>HireAI</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.inkNavy }}>
                Welcome back
              </h2>
              <p className="text-base" style={{ color: COLORS.slateBlue }}>
                Sign in to your HireAI account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Toggle */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: COLORS.inkNavy }}>
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['candidate', 'recruiter'] as Role[]).map(r => {
                    const isActive = role === r
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className="py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                          background: isActive ? '#eff6ff' : '#ffffff',
                          border: `2px solid ${isActive ? COLORS.precisionBlue : '#e2e8f0'}`,
                          color: isActive ? COLORS.precisionBlue : COLORS.slateBlue,
                          minHeight: '44px',
                        }}
                      >
                        {r === 'candidate' ? <User size={16} /> : <Briefcase size={16} />}
                        {r === 'candidate' ? 'Job Seeker' : 'Recruiter'}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: COLORS.inkNavy }}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-lg text-base border-2 border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  style={{ color: COLORS.inkNavy, minHeight: '48px' }}
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold" style={{ color: COLORS.inkNavy }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('forgot-password')}
                    className="text-sm font-medium transition-colors hover:underline"
                    style={{ color: COLORS.precisionBlue }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-lg text-base border-2 border-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    style={{ color: COLORS.inkNavy, minHeight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:text-slate-700"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-50 border-2 border-red-200">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg text-base font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2"
                style={{ background: COLORS.precisionBlue, minHeight: '48px' }}
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: COLORS.slateBlue }}>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('signup')}
                  className="font-semibold transition-colors hover:underline focus:outline-none focus:underline"
                  style={{ color: COLORS.precisionBlue }}
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 py-6 px-6 sm:px-8 lg:px-12">
          <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-700 transition-colors">Terms of Service</a>
            </div>
            <div>
              <a href="#" className="hover:text-slate-700 transition-colors">
                Need help? Contact support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        /* Focus states */
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid ${COLORS.precisionBlue};
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}
