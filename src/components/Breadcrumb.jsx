import { Link } from 'react-router-dom'

function ChevronIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

// items: [{ label, to }] — the last item is rendered as plain text (current page)
export default function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            <ChevronIcon />
            {isLast || !item.to ? (
              <span className="current">{item.label}</span>
            ) : (
              <Link to={item.to}>{item.label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}