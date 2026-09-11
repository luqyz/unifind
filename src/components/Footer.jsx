import { Link } from 'react-router-dom'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer hidden md:block">
      <div className="site-footer-accent" />
      <div className="mx-auto max-w-[1600px] px-6 lg:px-8 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="footer-logo flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0">
                <LogoMark className="h-4 w-4" />
              </div>
              <p className="footer-brand font-[family-name:var(--font-heading)] text-sm font-black">UniFind</p>
            </div>
            <p className="footer-copy text-sm leading-relaxed max-w-xs">
              A community board built to reunite people with what they&rsquo;ve lost.
            </p>
          </div>

          <div>
            <p className="footer-heading text-xs font-black uppercase tracking-[0.12em] mb-3">Navigate</p>
            <ul className="space-y-2">
              <li><Link to="/" className="footer-link text-sm">Feed</Link></li>
              <li><Link to="/post" className="footer-link text-sm">Post item</Link></li>
              <li><Link to="/welcome" className="footer-link text-sm">How it works</Link></li>
            </ul>
          </div>

          <div>
            <p className="footer-heading text-xs font-black uppercase tracking-[0.12em] mb-3">Account</p>
            <ul className="space-y-2">
              <li><Link to="/login" className="footer-link text-sm">Login</Link></li>
              <li><Link to="/signup" className="footer-link text-sm">Sign up</Link></li>
              <li><Link to="/profile" className="footer-link text-sm">My posts</Link></li>
            </ul>
          </div>

          <div>
            <p className="footer-heading text-xs font-black uppercase tracking-[0.12em] mb-3">Safety</p>
            <p className="footer-copy text-sm leading-relaxed">
              Contact details are never shown publicly. Messages stay in-app and verified before handover.
            </p>
          </div>
        </div>

        <div className="footer-divider mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="footer-copy text-xs">&copy; {year} UniFind &middot; Campus Desk</p>
          <p className="footer-copy text-xs flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" path={<path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.77.78L12 20.66l7.65-7.65.77-.78a5.4 5.4 0 0 0 0-7.65z" />} />
            Built for the community
          </p>
        </div>
      </div>
    </footer>
  )
}