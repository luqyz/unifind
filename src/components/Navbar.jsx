import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Icon({ path, className = 'h-5 w-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  )
}

function LogoMark({ className = 'h-5 w-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c-3.8-3.6-6-6.9-6-9.8A6 6 0 0 1 18 11c0 2.9-2.2 6.2-6 10z" />
      <circle cx="12" cy="10.8" r="2.1" />
    </svg>
  )
}

const mobileNavItemClass = ({ isActive }) =>
  `flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition ${
    isActive ? 'text-amber' : 'text-muted'
  }`

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const topNavLinkClass = ({ isActive }) =>
    `topbar-link px-3.5 py-2 text-sm transition ${isActive ? 'active' : ''}`

  return (
    <>
      {/* Desktop Top Navigation Bar */}
      <header className={`topbar-shell hidden md:block sticky top-0 z-50 ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="topbar-accent" />
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3 min-w-0 flex-shrink-0">
              <div className="topbar-logo flex h-11 w-11 items-center justify-center rounded-2xl flex-shrink-0">
                <LogoMark className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="topbar-brand-title font-[family-name:var(--font-heading)] text-base font-black truncate">UniFind</p>
                <p className="topbar-brand-subtitle text-[10px] truncate uppercase tracking-[0.14em]">Campus Desk</p>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink to="/" end className={topNavLinkClass}>Feed</NavLink>
              <NavLink to="/post" className={topNavLinkClass}>Post item</NavLink>
              <NavLink to="/welcome" className={topNavLinkClass}>How it works</NavLink>
              {user && <NavLink to="/messages" className={topNavLinkClass}>Messages</NavLink>}
              {user && <NavLink to="/profile" className={topNavLinkClass}>My posts</NavLink>}
              {isAdmin && <NavLink to="/admin" className={topNavLinkClass}>Admin</NavLink>}
            </nav>

            {/* CTA + Auth */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <ThemeToggle className="topbar-theme-toggle flex h-9 w-9 items-center justify-center rounded-lg transition" />

              <Link
                to="/post"
                className="topbar-cta hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-black transition"
              >
                <Icon className="h-4 w-4" path={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />
                Report lost item
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDesktopMenuOpen((v) => !v)}
                    className="topbar-avatar flex h-10 w-10 items-center justify-center rounded-full text-sm font-black flex-shrink-0"
                  >
                    {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
                  </button>

                  {desktopMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDesktopMenuOpen(false)} />
                      <div className="topbar-dropdown absolute right-0 top-12 z-50 w-52 overflow-hidden">
                        <p className="topbar-dropdown-name px-4 py-3 text-xs truncate border-b border-navy/10">
                          {user.displayName || user.email}
                        </p>
                        <Link
                          to="/messages"
                          onClick={() => setDesktopMenuOpen(false)}
                          className="topbar-dropdown-link lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm"
                        >
                          Messages
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDesktopMenuOpen(false)}
                          className="topbar-dropdown-link lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm"
                        >
                          My posts
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDesktopMenuOpen(false)}
                            className="topbar-dropdown-link flex items-center gap-2 px-4 py-2.5 text-sm"
                          >
                            Admin
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false)
                            if (window.confirm('Log out of UniFind?')) {
                              logout()
                            }
                          }}
                          className="topbar-dropdown-logout w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left"
                        >
                          <Icon className="h-4 w-4" path={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>} />
                          Log out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <NavLink to="/login" className="topbar-login px-3.5 py-2 text-sm font-bold transition">
                    Login
                  </NavLink>
                  <NavLink to="/signup" className="topbar-signup px-4 py-2 text-sm font-black transition">
                    Sign up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="mobile-topbar md:hidden sticky top-0 z-40 border-b border-navy/10">
        <div className="mobile-topbar-row flex items-center justify-between px-4 py-3">
          <Link to="/" className="mobile-brand flex items-center gap-2">
            <div className="mobile-brand-icon flex h-8 w-8 items-center justify-center rounded-lg">
              <LogoMark className="h-4 w-4" />
            </div>
            <p className="mobile-brand-title font-[family-name:var(--font-heading)] text-sm font-bold">UniFind</p>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle className="topbar-theme-toggle flex h-8 w-8 items-center justify-center rounded-lg transition" />

            {user ? (
              <button type="button" onClick={() => setMobileOpen((v) => !v)} className="mobile-user-button p-1">
                <div className="mobile-user-avatar flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                  {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
                </div>
              </button>
            ) : (
              <NavLink to="/login" className="mobile-login-button rounded-lg px-3.5 py-1.5 text-xs font-semibold">
                Login
              </NavLink>
            )}
          </div>
        </div>

        {mobileOpen && user && (
          <div className="mobile-user-menu border-t border-navy/10 px-4 py-3 space-y-1">
            <p className="mobile-user-name px-1 pb-1 text-xs truncate">{user.displayName || user.email}</p>
            <NavLink to="/welcome" onClick={() => setMobileOpen(false)} className="mobile-menu-link block px-1 py-1.5 text-sm">
              How it works
            </NavLink>
            <NavLink to="/messages" onClick={() => setMobileOpen(false)} className="mobile-menu-link block px-1 py-1.5 text-sm">
              Messages
            </NavLink>
            <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="mobile-menu-link block px-1 py-1.5 text-sm">
              My posts
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setMobileOpen(false)} className="mobile-menu-link block px-1 py-1.5 text-sm">
                Admin
              </NavLink>
            )}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                if (window.confirm('Log out of UniFind?')) {
                  logout()
                }
              }}
              className="mobile-logout block w-full text-left px-1 py-1.5 text-sm"
            >
              Log out
            </button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav md:hidden fixed bottom-0 inset-x-0 z-40 border-t grid grid-cols-4">
        <NavLink to="/" end className={mobileNavItemClass}>
          <Icon className="h-5 w-5" path={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>} />
          Feed
        </NavLink>
        <NavLink to="/post" className={mobileNavItemClass}>
          <Icon className="h-5 w-5" path={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />
          Post
        </NavLink>
        {user && (
          <NavLink to="/messages" className={mobileNavItemClass}>
            <Icon className="h-5 w-5" path={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />
            Inbox
          </NavLink>
        )}
        {user && (
          <NavLink to="/profile" className={mobileNavItemClass}>
            <Icon className="h-5 w-5" path={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />
            Me
          </NavLink>
        )}
      </nav>
    </>
  )
}