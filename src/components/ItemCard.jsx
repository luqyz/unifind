import { Link } from 'react-router-dom'

const NO_IMAGE_SVG =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23F3EBDD"/%3E%3Cpath d="M167 107h67v53h-67z" fill="none" stroke="%236B7C93" stroke-width="2"/%3E%3Ccircle cx="180" cy="120" r="5" fill="%236B7C93"/%3E%3Cpath d="M167 147l20-20 13 13 20-20 13 13v13H167z" fill="%236B7C93"/%3E%3Ctext x="200" y="180" text-anchor="middle" fill="%236B7C93" font-family="sans-serif" font-size="12"%3ENo image%3C/text%3E%3C/svg%3E'

function Icon({ path, className = 'h-3.5 w-3.5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  )
}

export default function ItemCard({ item }) {
  const imageUrl = item.image || item.imageUrl || ''
  const dateStr = item.date || item.dateOccurred
  const formattedDate = dateStr
    ? typeof dateStr === 'string'
      ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : dateStr?.seconds
      ? new Date(dateStr.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Recently'
    : 'Recently'

  const userName = item.user?.name || item.user?.displayName || 'Community member'
  const isVerified = item.user?.verified || item.user?.isVerified || false

  return (
    <article className="lost-found-card group">
      <Link to={`/items/${item.id}`} className="block">
        <div className="card-image-wrap">
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-40"
            />
          )}
          <img
            src={imageUrl || NO_IMAGE_SVG}
            alt={item.title}
            className={`relative h-full w-full transition-transform duration-500 ease-out ${
              imageUrl ? 'object-cover group-hover:scale-[1.04]' : 'object-cover'
            }`}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = NO_IMAGE_SVG
            }}
          />

          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

          <span
            className={`type-badge absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-[0.14em] shadow-sm backdrop-blur-sm ${
              item.type === 'lost' ? 'lost' : 'found'
            }`}
          >
            {item.type === 'lost' ? (
              <Icon className="h-3 w-3" path={<><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />
            ) : (
              <Icon className="h-3 w-3" path={<polyline points="20 6 9 17 4 12" />} />
            )}
            {item.type === 'lost' ? 'LOST' : 'FOUND'}
          </span>

          {item.status === 'resolved' && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-navy/95 px-2.5 py-1 text-[11px] font-black tracking-[0.10em] text-amber shadow-sm backdrop-blur-sm">
              <Icon className="h-3 w-3" path={<polyline points="20 6 9 17 4 12" />} />
              RESOLVED
            </span>
          )}

          {item.hasReward && item.status !== 'resolved' && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber px-2.5 py-1 text-[11px] font-black tracking-[0.10em] text-navy shadow-sm">
              <Icon className="h-3 w-3" path={<><circle cx="12" cy="8" r="6" /><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" /></>} />
              REWARD
            </span>
          )}

          <div className="absolute inset-x-3 bottom-3 hidden lg:flex opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/96 backdrop-blur-sm px-3 py-2 text-[11px] font-extrabold text-navy shadow-lg">
              View details
              <Icon className="h-3.5 w-3.5" path={<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>} />
            </span>
          </div>
        </div>
      </Link>

      <div className="card-body space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="card-category inline-block">
            {item.category}
          </span>
          {isVerified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-dark">
              <Icon className="h-3 w-3" path={<polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5" />} />
              VERIFIED
            </span>
          )}
        </div>

        {item.hasReward && item.rewardAmount && (
          <p className="flex items-center gap-1.5 text-[11px] font-black text-amber-dark">
            <Icon className="h-3.5 w-3.5" path={<><circle cx="12" cy="8" r="6" /><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" /></>} />
            RM {item.rewardAmount} reward offered
          </p>
        )}

        <h3 className="card-title line-clamp-1">
          {item.title}
        </h3>

        <div className="flex items-center justify-between gap-2 text-xs text-ink-soft">
          <span className="flex items-center gap-1 min-w-0">
            <Icon className="h-3.5 w-3.5 flex-shrink-0 text-ink/40" path={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>} />
            <span className="truncate">{item.location}</span>
          </span>
          <span className="flex items-center gap-1 flex-shrink-0 text-ink/40">
            <Icon className="h-3.5 w-3.5" path={<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>} />
            <span className="text-ink-soft">{formattedDate}</span>
          </span>
        </div>

        <div className="h-px bg-ink/[0.08]" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-ink/[0.08] text-[10px] font-black text-ink">
              {userName.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs font-black text-ink truncate">{userName}</p>
          </div>
          <Link
            to={`/items/${item.id}`}
            className="detail-link lg:hidden flex-shrink-0 inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-black"
          >
            Details
            <Icon className="h-3 w-3" path={<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>} />
          </Link>
        </div>
      </div>
    </article>
  )
}