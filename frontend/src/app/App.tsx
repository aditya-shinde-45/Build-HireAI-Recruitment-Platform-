import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Role, User } from './components/data'
import { Layout } from './components/Layout'
import { Landing } from './components/Landing'
import { Login } from './components/Login'
import { Signup } from './components/Signup'
import { CandidateDashboard } from './components/CandidateDashboard'
import { CandidateProfile } from './components/CandidateProfile'
import { ResumeParser } from './components/ResumeParser'
import { JobSearch } from './components/JobSearch'
import { ManageJobs } from './components/ManageJobs'
import { ApplicationTracking } from './components/ApplicationTracking'
import { JobDetail } from './components/JobDetail'
import { RecruiterDashboard } from './components/RecruiterDashboard'
import { JobPosting } from './components/JobPosting'
import { CandidateRanking } from './components/CandidateRanking'
import { Analytics } from './components/Analytics'
import { AdminDashboard } from './components/AdminDashboard'
import { ForgotPassword } from './components/ForgotPassword'
import { ResetPassword } from './components/ResetPassword'
import { auth, token } from './api'

// -- Page type
export type Page =
  | 'landing' | 'login' | 'signup' | 'forgot-password' | 'reset-password'
  | 'candidate-dashboard' | 'candidate-profile' | 'resume-analyzer' | 'job-search' | 'application-tracking'
  | 'job-detail'
  | 'recruiter-dashboard' | 'job-posting' | 'manage-jobs' | 'candidate-ranking' | 'analytics'
  | 'admin-dashboard'

const PROTECTED: Page[] = [
  'candidate-dashboard', 'candidate-profile', 'resume-analyzer', 'application-tracking', 'job-detail',
  'recruiter-dashboard', 'job-posting', 'manage-jobs', 'candidate-ranking',
  'analytics', 'admin-dashboard',
]

const PUBLIC_ONLY: Page[] = ['landing', 'login', 'signup', 'forgot-password', 'reset-password']

// Pages each role is allowed to access
const ROLE_PAGES: Record<Role, Page[]> = {
  candidate: ['candidate-dashboard', 'candidate-profile', 'resume-analyzer', 'job-search', 'application-tracking', 'job-detail'],
  recruiter: ['recruiter-dashboard', 'job-posting', 'manage-jobs', 'candidate-ranking', 'analytics'],
  admin:     ['admin-dashboard', 'analytics', 'candidate-ranking', 'job-search', 'recruiter-dashboard', 'job-posting'],
}

// -- Auth context
interface AuthCtx {
  user: User | null
  login: (email: string, password: string) => Promise<{ ok: boolean; msg: string }>
  signup: (name: string, email: string, password: string, role: Role) => Promise<{ ok: boolean; msg: string }>
  logout: () => void
}
export const AuthContext = createContext<AuthCtx>({} as AuthCtx)
export const useAuth = () => useContext(AuthContext)

// -- Nav context
interface NavCtx { currentPage: Page; navigate: (p: Page, opts?: { jobId?: number; editJobId?: number }) => void; jobId?: number; editJobId?: number }
export const NavContext = createContext<NavCtx>({} as NavCtx)
export const useNav = () => useContext(NavContext)

// -- Page renderer
function PageRenderer({ page, jobId, editJobId }: { page: Page; jobId?: number; editJobId?: number }) {
  switch (page) {
    case 'landing':               return <Landing />
    case 'login':                 return <Login />
    case 'signup':                return <Signup />
    case 'forgot-password':       return <ForgotPassword />
    case 'reset-password':        return <ResetPassword />
    case 'candidate-dashboard':   return <CandidateDashboard />
    case 'candidate-profile':     return <CandidateProfile />
    case 'resume-analyzer':        return <ResumeParser />
    case 'job-search':            return <JobSearch />
    case 'manage-jobs':           return <ManageJobs />
    case 'application-tracking':  return <ApplicationTracking />
    case 'job-detail':            return jobId ? <JobDetail jobId={jobId} /> : <CandidateDashboard />
    case 'recruiter-dashboard':   return <RecruiterDashboard />
    case 'job-posting':           return <JobPosting editJobId={editJobId} />
    case 'candidate-ranking':     return <CandidateRanking />
    case 'analytics':             return <Analytics />
    case 'admin-dashboard':       return <AdminDashboard />
    default:                      return <Landing />
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [currentJobId, setCurrentJobId]   = useState<number | undefined>(undefined)
  const [currentEditJobId, setCurrentEditJobId] = useState<number | undefined>(undefined)
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove('dark')
    // Restore session — only if token exists, use /auth/me to validate
    const t = token.get()
    if (t) {
      auth.me()
        .then(u => {
          setUser({ name: u.name, email: u.email, role: u.role as Role })
          const dash: Record<Role, Page> = {
            candidate: 'candidate-dashboard',
            recruiter: 'recruiter-dashboard',
            admin:     'admin-dashboard',
          }
          setCurrentPage(dash[u.role as Role])
        })
        .catch(() => {
          token.clear()
          setCurrentPage('login')
        })
        .finally(() => setBootstrapped(true))
    } else {
      setBootstrapped(true)
    }
  }, [])

  const navigate = (page: Page, opts?: { jobId?: number; editJobId?: number }) => {
    if (PROTECTED.includes(page) && !user) {
      setCurrentPage('login')
      return
    }
    if (user && PROTECTED.includes(page) && !ROLE_PAGES[user.role].includes(page)) {
      const dash: Record<Role, Page> = {
        candidate: 'candidate-dashboard',
        recruiter: 'recruiter-dashboard',
        admin:     'admin-dashboard',
      }
      setCurrentPage(dash[user.role])
      return
    }
    if (opts?.jobId !== undefined) setCurrentJobId(opts.jobId)
    if (opts?.editJobId !== undefined) setCurrentEditJobId(opts.editJobId)
    setCurrentPage(page)
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await auth.login(email, password)
      token.set(res.access_token)
      // Use user data returned directly from login response
      const u = res.user
      const newUser: User = { name: u.name, email: u.email, role: u.role as Role }
      setUser(newUser)
      const dash: Record<Role, Page> = {
        candidate: 'candidate-dashboard',
        recruiter: 'recruiter-dashboard',
        admin:     'admin-dashboard',
      }
      setCurrentPage(dash[u.role as Role])
      return { ok: true, msg: '' }
    } catch (e: unknown) {
      return { ok: false, msg: e instanceof Error ? e.message : 'Login failed.' }
    }
  }

  const signup = async (name: string, email: string, password: string, role: Role) => {
    try {
      await auth.register(name, email, password, role)
      return { ok: true, msg: 'Account created! You can now log in.' }
    } catch (e: unknown) {
      return { ok: false, msg: e instanceof Error ? e.message : 'Signup failed.' }
    }
  }

  const logout = () => {
    token.clear()
    setUser(null)
    setCurrentPage('landing')
  }

  if (!bootstrapped) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const isPublicPage = PUBLIC_ONLY.includes(currentPage)

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      <NavContext.Provider value={{ currentPage, navigate, jobId: currentJobId, editJobId: currentEditJobId }}>
        <div className="min-h-screen bg-background text-foreground">
          {isPublicPage ? (
            <PageRenderer page={currentPage} jobId={currentJobId} />
          ) : (
            <Layout>
              <PageRenderer page={currentPage} jobId={currentJobId} editJobId={currentEditJobId} />
            </Layout>
          )}
        </div>
      </NavContext.Provider>
    </AuthContext.Provider>
  )
}
