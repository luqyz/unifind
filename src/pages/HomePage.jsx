import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ItemCard from '../components/ItemCard'
import { categories, mockItems } from '../data/mockData'
import { areaGroups } from '../data/areas'
import { getPublicItems } from '../services/firebaseService'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  )
}

const defaultFilters = {
  keyword: '',
  type: 'all',
  category: 'all',
  location: 'all',
}

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
]

export default function HomePage() {
  const [filters, setFilters] = useState(defaultFilters)
  const [sortBy, setSortBy] = useState('newest')
  const [locationGroupFilter, setLocationGroupFilter] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const publicItems = await getPublicItems()
        setItems(publicItems)
      } catch (err) {
        console.log('Using mock data:', err)
        setItems(mockItems)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  const filteredItems = useMemo(() => {
    const result = items.filter((item) => {
      const keywordMatch =
        !filters.keyword ||
        item.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.keyword.toLowerCase())

      const typeMatch = filters.type === 'all' || item.type === filters.type
      const categoryMatch = filters.category === 'all' || item.category === filters.category
      const locationMatch = filters.location === 'all' || item.location === filters.location

      return keywordMatch && typeMatch && categoryMatch && locationMatch
    })

    const getTime = (item) => {
      const raw = item.createdAt
      if (raw?.seconds) return raw.seconds
      if (typeof raw === 'string') return new Date(raw).getTime() / 1000
      return 0
    }

    return [...result].sort((a, b) =>
      sortBy === 'newest' ? getTime(b) - getTime(a) : getTime(a) - getTime(b),
    )
  }, [filters, items, sortBy])

  const typeOptions = [
    { value: 'all', label: 'All items' },
    { value: 'lost', label: 'Lost items' },
    { value: 'found', label: 'Found items' },
  ]
  const categoryOptions = [{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: c }))]

  const hasActiveFilters = filters.category !== 'all' || filters.location !== 'all' || filters.type !== 'all' || filters.keyword

  const stats = [
    { value: String(items.length || '0'), label: 'Active listings' },
    { value: String(items.filter((i) => i.status === 'resolved').length || '0'), label: 'Items reunited' },
    { value: '24/7', label: 'Live access' },
  ]

  return (
    <div className="feed-dashboard min-h-screen">
      <section className="dashboard-hero relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full bg-amber/15 blur-[110px] pointer-events-none" />
        <div className="absolute right-1/4 bottom-0 h-80 w-80 rounded-full bg-coral/10 blur-[110px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/40 to-navy" />

        <div className="relative mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="hero-kicker inline-flex items-center gap-2 rounded-full border px-3 py-1 mb-4">
            <span className="hero-kicker-dot h-1.5 w-1.5 rounded-full" />
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em]">
              Live &middot; Campus network
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(640px,1.8fr)_minmax(330px,0.9fr)] lg:items-end">
            <div>
              <h1 className="hero-title max-w-3xl">
                Find what your campus has lost
              </h1>
              <p className="hero-copy mt-4 text-sm sm:text-base max-w-2xl leading-relaxed">
                Track, report, and recover student belongings through a faster community matching system.
              </p>

              <div className="hero-actions mt-6 flex flex-wrap items-center gap-3">
                <div className="holo-border">
                  <Link
                    to="/post"
                    className="hero-report flex items-center gap-2 px-5 py-2.5 text-sm font-black transition-colors"
                  >
                    <Icon className="h-4 w-4" path={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />
                    Report an item
                  </Link>
                </div>
                <a
                  href="#listings"
                  className="hero-browse inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition-all"
                >
                  Browse listings
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[1.6rem] border border-amber/30 bg-white/8 p-4 backdrop-blur-md">
                <div className="grid grid-cols-3 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="hero-stat-value text-2xl font-black leading-none">
                        {stat.value}
                      </p>
                      <p className="hero-stat-label mt-2 font-mono text-[8px] font-black uppercase tracking-wider">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified floating control bar */}
      <section className="relative z-10 -mt-7">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="control-bar">
            <div className="control-bar-row">
              <div className="control-bar-search">
                <Icon className="h-4 w-4" path={<><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  placeholder="Search by item name, keyword…"
                />
              </div>

              <div className="control-bar-divider" />

              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="control-bar-pill"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="control-bar-pill"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <select
                value={locationGroupFilter}
                onChange={(e) => {
                  setLocationGroupFilter(e.target.value)
                  setFilters({ ...filters, location: 'all' })
                }}
                className="control-bar-pill"
              >
                <option value="all">All areas</option>
                {areaGroups.map((group) => (
                  <option key={group.label} value={group.label}>{group.label}</option>
                ))}
              </select>

              {locationGroupFilter !== 'all' && (
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="control-bar-pill"
                >
                  <option value="all">All in {locationGroupFilter}</option>
                  {areaGroups.find((g) => g.label === locationGroupFilter)?.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              <div className="control-bar-divider hidden lg:block" />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="control-bar-pill control-bar-pill-sort"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="control-bar-meta">
            <span>
              {loading ? 'Loading…' : <><strong>{filteredItems.length}</strong> results</>}
            </span>
            {hasActiveFilters && (
              <button onClick={() => { setFilters(defaultFilters); setLocationGroupFilter('all') }} className="control-bar-clear">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      <section id="listings" className="mx-auto max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-surface border border-ink/[0.08] overflow-hidden animate-pulse">
                <div className="h-56 bg-surface-soft" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-16 bg-surface-soft rounded-full" />
                  <div className="h-4 w-3/4 bg-surface-soft rounded" />
                  <div className="h-3 w-full bg-surface-soft rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-surface p-14 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-surface-soft flex items-center justify-center">
              <Icon className="h-7 w-7 text-ink/30" path={<><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />
            </div>
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-black text-ink">No listings found</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Try adjusting your filters or check back soon for new postings.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}