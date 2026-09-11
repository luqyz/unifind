import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, getUserItems } from '../services/firebaseService'
import Breadcrumb from '../components/Breadcrumb'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.uid) return

        const userProfile = await getUserProfile(user.uid)
        setProfile(userProfile)

        const userItems = await getUserItems(user.uid)
        setPosts(userItems)
      } catch (err) {
        console.error('Failed to fetch user data:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <p className="text-ink-soft text-lg">Loading profile…</p>
      </div>
    )
  }

  const displayName = profile?.displayName || user?.displayName || user?.email || 'User'
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'
  const isVerified = profile?.isVerified || false
  const stats = {
    postsCount: posts.length,
    resolvedCount: posts.filter((p) => p.status === 'resolved').length,
    reportsSubmitted: profile?.stats?.reportsSubmitted || 0,
  }

  return (
    <div className="profile-page min-h-screen">
      <div className="profile-hero border-b border-ink/10">
        <div className="mx-auto max-w-5xl px-4 pt-5 pb-8 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'My profile' }]} />
          <div className="mt-4 flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-black text-amber uppercase tracking-wide">Your profile</p>
              <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-black text-white">{displayName}</h1>
              <p className="mt-2 text-cream flex items-center gap-1.5">
                Member since {joinDate}
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-amber">
                    <span className="text-cream">•</span>
                    <Icon className="h-3.5 w-3.5" path={<polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5" />} />
                    Verified
                  </span>
                )}
              </p>
            </div>
            {isVerified && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-amber/10 px-4 py-2 border border-amber/30">
                <Icon className="h-4 w-4 text-amber" path={<polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5" />} />
                <p className="text-sm font-black text-amber">Verified member</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="profile-card p-6">
            <p className="text-sm text-ink-soft font-black">Total posts</p>
            <p className="profile-stat-value mt-3 text-3xl font-black text-ink">{stats.postsCount}</p>
          </div>
          <div className="profile-card p-6">
            <p className="text-sm text-ink-soft font-black">Resolved</p>
            <p className="profile-stat-value mt-3 text-3xl font-black text-sage">{stats.resolvedCount}</p>
          </div>
          <div className="profile-card p-6">
            <p className="text-sm text-ink-soft font-black">Reports submitted</p>
            <p className="profile-stat-value mt-3 text-3xl font-black text-ink">{stats.reportsSubmitted}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="profile-card overflow-hidden">
          <div className="border-b border-ink/10 bg-surface-soft/50 p-6 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-black text-ink">My listings</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {posts.length} total {posts.length === 1 ? 'listing' : 'listings'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/post')}
              className="flex items-center gap-1.5 rounded-lg bg-amber px-5 py-2.5 text-sm font-black text-ink hover:bg-amber-dark transition"
            >
              <Icon className="h-4 w-4" path={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />
              New listing
            </button>
          </div>

          {error && (
            <div className="p-6 bg-coral/10 border-b border-coral/30 flex items-start gap-2">
              <Icon className="h-4 w-4 text-coral mt-0.5 flex-shrink-0" path={<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>} />
              <p className="text-sm text-coral font-medium">{error}</p>
            </div>
          )}

          {posts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-surface-soft flex items-center justify-center">
                <Icon className="h-6 w-6 text-ink-soft" path={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-black text-ink">No listings yet</h3>
              <p className="mt-2 text-ink-soft">Create your first listing to help your community</p>
              <button
                type="button"
                onClick={() => navigate('/post')}
                className="mt-6 rounded-lg bg-amber px-6 py-2.5 text-sm font-black text-ink hover:bg-amber-dark transition"
              >
                Post item
              </button>
            </div>
          ) : (
            <div className="divide-y divide-navy/10">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/items/${post.id}`}
                  className="group p-6 hover:bg-surface-soft/40 transition flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-ink group-hover:text-amber-dark transition truncate">
                        {post.title}
                      </h3>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black text-white ${
                        post.type === 'lost' ? 'bg-coral' : 'bg-sage'
                      }`}>
                        <Icon
                          className="h-3 w-3"
                          path={
                            post.type === 'lost'
                              ? <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>
                              : <polyline points="20 6 9 17 4 12" />
                          }
                        />
                        {post.type === 'lost' ? 'Lost' : 'Found'}
                      </span>
                    </div>
                    <p className="text-sm text-ink-soft line-clamp-1">{post.description}</p>
                    <p className="mt-2 text-xs text-ink-soft">
                      {post.location} · {post.category}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black ${
                        post.status === 'resolved'
                          ? 'bg-sage/15 text-sage'
                          : 'bg-amber/15 text-amber-dark'
                      }`}
                    >
                      {post.status === 'resolved' ? (
                        <Icon className="h-3 w-3" path={<polyline points="20 6 9 17 4 12" />} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-dark" />
                      )}
                      {post.status === 'resolved' ? 'Resolved' : 'Open'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}