import { useState } from 'react'
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

function NavButton({ to, active, children, onClick, className = '' }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
        active ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
      } ${className}`}
    >
      {children}
    </Link>
  )
}

function MenuIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <>
          <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    closeMenu()
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/40 bg-slate-950/95 shadow-xl shadow-slate-950/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 text-slate-100 sm:px-6">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-lg font-bold text-slate-950">AI</span>
          <span>AI Learning</span>
        </Link>

        {/* Desktop nav: visible from md breakpoint up */}
        <nav className="hidden flex-wrap items-center gap-2 md:flex">
          {navLinks.map((link) => {
            if (link.auth && !user) return null
            return <NavButton key={link.href} to={link.href} active={location.pathname === link.href}>{link.label}</NavButton>
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="hidden rounded-full border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 lg:inline-flex">{user.name}</span>
              <button
                onClick={handleLogout}
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

        {/* Mobile hamburger toggle: visible below md breakpoint */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-200 transition hover:border-cyan-400 hover:text-white md:hidden"
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="border-t border-slate-800/60 bg-slate-950/98 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              if (link.auth && !user) return null
              return (
                <NavButton
                  key={link.href}
                  to={link.href}
                  active={location.pathname === link.href}
                  onClick={closeMenu}
                  className="w-full text-left"
                >
                  {link.label}
                </NavButton>
              )
            })}
          </nav>

          <div className="mt-3 border-t border-slate-800/60 pt-3">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <NavButton to="/login" active={location.pathname === '/login'} onClick={closeMenu} className="w-full text-left">Login</NavButton>
                <NavButton to="/register" active={location.pathname === '/register'} onClick={closeMenu} className="w-full text-left">Register</NavButton>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
