import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard', auth: true },
  { href: '/assessment', label: 'Assessment', auth: true },
  { href: '/roadmap', label: 'Roadmap', auth: true },
  { href: '/questions', label: 'Practice', auth: true },
  { href: '/progress', label: 'Progress', auth: true },
  { href: '/career', label: 'Career', auth: true },
  { href: '/study-group', label: 'Study Group', auth: true }
]

function NavButton({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
        active ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {children}
    </Link>
  )
}

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/40 bg-slate-950/95 shadow-xl shadow-slate-950/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-slate-100 sm:px-6">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-lg font-bold text-slate-950">AI</span>
          <span>AI Learning</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {navLinks.map((link) => {
            if (link.auth && !user) return null
            return <NavButton key={link.href} to={link.href} active={location.pathname === link.href}>{link.label}</NavButton>
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden rounded-full border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 md:inline-flex">{user.name}</span>
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <NavButton to="/login" active={location.pathname === '/login'}>Login</NavButton>
              <NavButton to="/register" active={location.pathname === '/register'}>Register</NavButton>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
