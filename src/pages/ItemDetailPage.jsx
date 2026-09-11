import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getItemById, createReport, updateItemStatus, deleteItem, sendMessage, subscribeToMessages } from '../services/firebaseService'
import { mockItems } from '../data/mockData'
import Breadcrumb from '../components/Breadcrumb'

const NO_IMAGE_SVG =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23F3EBDD"/%3E%3Cpath d="M250 160h100v80H250z" fill="none" stroke="%236B7C93" stroke-width="3"/%3E%3Ccircle cx="270" cy="180" r="8" fill="%236B7C93"/%3E%3Cpath d="M250 220l30-30 20 20 30-30 20 20v20H250z" fill="%236B7C93"/%3E%3Ctext x="300" y="270" text-anchor="middle" fill="%236B7C93" font-family="sans-serif" font-size="16"%3ENo image%3C/text%3E%3C/svg%3E'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  )
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showResolvedPrompt, setShowResolvedPrompt] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reportForm, setReportForm] = useState({ reason: 'spam', details: '' })
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [activeThreadUid, setActiveThreadUid] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const fetchedItem = await getItemById(id)
        setItem(fetchedItem)
      } catch (err) {
        console.log('Using mock data')
        const mockItem = mockItems.find((entry) => entry.id === id)
        setItem(mockItem)
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id])

  const isOwner = useMemo(() => user?.uid === item?.userId, [user, item])

  // Group messages by the "other" participant so multiple people
  // messaging the same owner don't get merged into one thread.
  const conversations = useMemo(() => {
    if (!user?.uid) return []
    const map = new Map()
    messages.forEach((msg) => {
      const otherUid = msg.senderId === user.uid ? msg.receiverId : msg.senderId
      if (!map.has(otherUid)) map.set(otherUid, [])
      map.get(otherUid).push(msg)
    })
    return Array.from(map.entries()).map(([otherUid, msgs]) => ({
      otherUid,
      lastMessage: msgs[msgs.length - 1],
    }))
  }, [messages, user?.uid])

  const activeMessages = useMemo(() => {
    if (!activeThreadUid) return []
    return messages.filter(
      (msg) => msg.senderId === activeThreadUid || msg.receiverId === activeThreadUid,
    )
  }, [messages, activeThreadUid])

  useEffect(() => {
    if (!showChat || !id || !user?.uid) return undefined

    const unsubscribe = subscribeToMessages(
      id,
      user.uid,
      (msgs) => setMessages(msgs),
      (err) => setError(err.message || 'Failed to load messages.'),
    )

    return () => unsubscribe()
  }, [showChat, id, user?.uid])

  // Non-owners only ever have one thread (with the owner) — open it automatically.
  useEffect(() => {
    if (!isOwner && item?.userId) {
      setActiveThreadUid(item.userId)
    }
  }, [isOwner, item?.userId])

  const handleToggleChat = () => {
    if (!user) {
      navigate('/login')
      return
    }
    setShowChat((prev) => !prev)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!user || !item || !activeThreadUid) return
    if (!messageText.trim()) return

    setSending(true)
    try {
      await sendMessage({
        itemId: id,
        senderId: user.uid,
        receiverId: activeThreadUid,
        text: messageText,
      })
      setMessageText('')
    } catch (err) {
      setError(err.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  const handleResolve = async () => {
    if (!isOwner) return
    try {
      await updateItemStatus(id, 'resolved')
      setItem((prev) => ({ ...prev, status: 'resolved' }))
      setShowResolvedPrompt(true)
    } catch (err) {
      setError(err.message || 'Failed to update status.')
    }
  }

  const handleDelete = async () => {
    if (!isOwner) return
    setDeleting(true)
    try {
      await deleteItem(id)
      navigate('/profile')
    } catch (err) {
      setError(err.message || 'Failed to delete listing.')
      setDeleting(false)
    }
  }

  const handleReport = async (e) => {
    e.preventDefault()
    if (!user) {
      setError('Please log in to report a listing.')
      return
    }

    try {
      await createReport({
        itemId: id,
        reporterUid: user.uid,
        reportedUserUid: item.userId,
        reason: reportForm.reason,
        details: reportForm.details,
      })
      setShowReport(false)
      setReportForm({ reason: 'spam', details: '' })
      setError('Report submitted. Thank you for keeping the community safe.')
    } catch (err) {
      setError(err.message || 'Failed to submit report.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <p className="text-ink-soft text-lg">Loading…</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-soft mb-4">
            <Icon className="h-6 w-6 text-ink-soft" path={<><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-ink">Listing not found</h1>
          <p className="mt-2 text-ink-soft">This item may have been removed or is no longer available.</p>
          <Link to="/" className="mt-6 inline-block rounded-lg bg-amber px-6 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition">
            Back to listings
          </Link>
        </div>
      </div>
    )
  }

  const images = item.imageUrls && item.imageUrls.length > 0
    ? item.imageUrls
    : (item.image || item.imageUrl ? [item.image || item.imageUrl] : [])
  const imageUrl = images[activeImageIndex] || ''
  const dateDisplay = item.date
    ? new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : item.dateOccurred
    ? new Date(item.dateOccurred).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently'

  return (
    <div className="detail-page min-h-screen">
      <div className="detail-backbar">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8 space-y-2">
          <Breadcrumb items={[{ label: item.type === 'lost' ? 'Lost items' : 'Found items', to: `/?type=${item.type}` }, { label: item.title }]} />
          <Link to="/" className="text-sm font-semibold text-amber-dark hover:text-amber-dark flex items-center gap-1.5">
            <Icon className="h-4 w-4" path={<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>} />
            Back to listings
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="detail-image-frame">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-50"
                />
              )}
              <img
                src={imageUrl || NO_IMAGE_SVG}
                alt={item.title}
                className={`relative h-full w-full ${imageUrl ? 'object-contain' : 'object-cover'}`}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = NO_IMAGE_SVG
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition ${
                      i === activeImageIndex ? 'border-amber' : 'border-ink/10 hover:border-ink/25'
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="detail-panel space-y-3">
              <div className="flex items-center flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white ${
                    item.type === 'lost' ? 'bg-coral' : 'bg-sage'
                  }`}
                >
                  {item.type === 'lost' ? (
                    <Icon className="h-3.5 w-3.5" path={<><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />
                  ) : (
                    <Icon className="h-3.5 w-3.5" path={<polyline points="20 6 9 17 4 12" />} />
                  )}
                  {item.type === 'lost' ? 'Lost item' : 'Found item'}
                </span>
                <span className="rounded-full bg-surface-soft px-3 py-1.5 text-xs font-semibold text-ink">
                  {item.category}
                </span>
                {item.status === 'resolved' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white">
                    <Icon className="h-3.5 w-3.5" path={<polyline points="20 6 9 17 4 12" />} />
                    Resolved
                  </span>
                )}
                {item.hasReward && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber px-3 py-1.5 text-xs font-semibold text-ink">
                    <Icon className="h-3.5 w-3.5" path={<><circle cx="12" cy="8" r="6" /><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" /></>} />
                    Reward offered
                  </span>
                )}
              </div>

              <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-ink">{item.title}</h1>

              {item.hasReward && (
                <div className="rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 flex items-start gap-2.5">
                  <Icon className="h-5 w-5 text-amber-dark flex-shrink-0 mt-0.5" path={<><circle cx="12" cy="8" r="6" /><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" /></>} />
                  <div>
                    <p className="text-sm font-bold text-ink">{item.rewardAmount} reward</p>
                    {item.rewardNote && <p className="text-xs text-ink-soft mt-0.5">{item.rewardNote}</p>}
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid gap-4 sm:grid-cols-3 py-4">
                <div className="detail-meta-card rounded-2xl p-4">
                  <p className="text-xs text-ink-soft font-black uppercase tracking-[0.14em] mb-1.5">Location</p>
                  <p className="flex items-center gap-1.5 text-base font-black text-ink">
                    <Icon className="h-4 w-4 text-ink-soft" path={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>} />
                    {item.location}
                  </p>
                  {item.landmark && (
                    <p className="mt-1 text-xs text-ink-soft">{item.landmark}</p>
                  )}
                </div>
                <div className="detail-meta-card rounded-2xl p-4">
                  <p className="text-xs text-ink-soft font-black uppercase tracking-[0.14em] mb-1.5">Date</p>
                  <p className="flex items-center gap-1.5 text-base font-black text-ink">
                    <Icon className="h-4 w-4 text-ink-soft" path={<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>} />
                    {dateDisplay}
                  </p>
                </div>
                <div className="detail-meta-card rounded-2xl p-4">
                  <p className="text-xs text-ink-soft font-black uppercase tracking-[0.14em] mb-1.5">Status</p>
                  <p className="flex items-center gap-1.5 text-base font-black text-ink">
                    <span className={`h-2 w-2 rounded-full ${item.status === 'resolved' ? 'bg-sage/100' : 'bg-blue-500'}`} />
                    {item.status === 'resolved' ? 'Resolved' : 'Open'}
                  </p>
                </div>
              </div>
            </div>

            <div className="detail-info-card p-6">
              <h2 className="detail-section-title text-base mb-3">Item details</h2>
              <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Private verification detail — owner only */}
            {item.type === 'found' && isOwner && item.privateDetails && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
                  <Icon className="h-3.5 w-3.5" path={<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>} />
                  Your private verification note
                </p>
                <p className="text-sm leading-relaxed text-amber-900 whitespace-pre-wrap">
                  {item.privateDetails}
                </p>
                <p className="mt-2 text-xs text-amber-700">Only visible to you. Use this to verify the real owner before handing the item over.</p>
              </div>
            )}

            {/* Note for non-owners on found items */}
            {item.type === 'found' && !isOwner && (
              <div className="rounded-2xl bg-surface-soft border border-ink/10 p-6">
                <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                  <Icon className="h-4 w-4 text-ink-soft flex-shrink-0" path={<><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>} />
                  If this is your item, message the poster and describe specific details only you would know — they'll use it to verify before returning it.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="detail-sidebar-card rounded-2xl p-6">
              <p className="text-xs font-black text-ink-soft uppercase tracking-[0.14em] mb-4">Posted by</p>
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-black text-ink">
                    {item.user?.name || item.user?.displayName || 'Community member'}
                  </p>
                  <p className="text-sm text-ink-soft">
                    Member since {item.user?.joined
                      ? new Date(item.user.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : 'recently'}
                  </p>
                </div>
                {(item.user?.verified || item.user?.isVerified) && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 border border-amber-200">
                    <Icon className="h-3.5 w-3.5 text-amber-600" path={<polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5" />} />
                    <p className="text-xs font-black text-amber-700">Verified member</p>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-sidebar-card rounded-2xl p-6 space-y-3">
              <div>
                <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Contact</p>
                <p className="text-sm text-ink-soft mb-4">
                  Your message will be sent safely without exposing personal information.
                </p>
              </div>

              {!isOwner && (
                <button
                  type="button"
                  onClick={handleToggleChat}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition"
                >
                  <Icon className="h-4 w-4" path={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />
                  {showChat ? 'Hide conversation' : 'Message poster'}
                </button>
              )}

              {isOwner && (
                <button
                  type="button"
                  onClick={handleToggleChat}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition"
                >
                  <Icon className="h-4 w-4" path={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />
                  {showChat ? 'Hide messages' : 'View messages'}
                </button>
              )}

              {isOwner && item.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={handleResolve}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-sm font-semibold text-white hover:bg-sage/90 transition"
                >
                  <Icon className="h-4 w-4" path={<polyline points="20 6 9 17 4 12" />} />
                  Mark as resolved
                </button>
              )}

              {isOwner && showResolvedPrompt && (
                <div className="rounded-lg border border-sage/30 bg-sage/10 p-3.5 space-y-2.5">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">Nice, marked as resolved!</span> Delete this listing now, or keep it for your records?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowResolvedPrompt(false)}
                      className="flex-1 rounded-lg border border-ink/15 bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-soft transition"
                    >
                      Keep it
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResolvedPrompt(false)
                        setShowDeleteConfirm(true)
                      }}
                      className="flex-1 rounded-lg bg-coral px-3 py-2 text-xs font-semibold text-white hover:bg-coral/90 transition"
                    >
                      Delete now
                    </button>
                  </div>
                </div>
              )}

              {isOwner && (
                <Link
                  to={`/items/${id}/edit`}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-soft transition"
                >
                  <Icon className="h-4 w-4" path={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" /></>} />
                  Edit listing
                </Link>
              )}

              {isOwner && item.status === 'resolved' && !showDeleteConfirm && !showResolvedPrompt && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-coral/30 px-4 py-2.5 text-sm font-semibold text-coral hover:bg-coral/10 transition"
                >
                  <Icon className="h-4 w-4" path={<><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>} />
                  Delete listing
                </button>
              )}

              {isOwner && showDeleteConfirm && (
                <div className="rounded-lg border border-coral/30 bg-coral/10 p-3.5 space-y-2.5">
                  <p className="text-sm text-ink">Delete this listing permanently? This can&apos;t be undone.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="flex-1 rounded-lg border border-ink/15 bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-soft transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 rounded-lg bg-coral px-3 py-2 text-xs font-semibold text-white hover:bg-coral/90 transition disabled:opacity-50"
                    >
                      {deleting ? 'Deleting…' : 'Yes, delete'}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowReport(!showReport)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-coral/30 bg-coral/10 px-4 py-2.5 text-sm font-semibold text-coral hover:bg-coral/20 transition"
              >
                <Icon className="h-4 w-4" path={<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>} />
                Report listing
              </button>
            </div>

            {/* Chat Panel */}
            {showChat && (
              <div className="rounded-2xl bg-surface border border-ink/10 overflow-hidden flex flex-col">
                <div className="border-b border-ink/10 px-4 py-3 flex items-center gap-2">
                  {isOwner && activeThreadUid && conversations.length > 1 && (
                    <button type="button" onClick={() => setActiveThreadUid(null)} className="text-ink-soft hover:text-ink-soft">
                      <Icon className="h-4 w-4" path={<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>} />
                    </button>
                  )}
                  <p className="font-[family-name:var(--font-heading)] text-sm font-semibold text-ink">
                    {isOwner && (!activeThreadUid || conversations.length > 1) && !activeThreadUid
                      ? 'Messages'
                      : 'Conversation'}
                  </p>
                </div>

                {/* Owner: conversation list when multiple people have messaged */}
                {isOwner && !activeThreadUid ? (
                  conversations.length === 0 ? (
                    <p className="text-xs text-ink-soft text-center py-8">No messages yet.</p>
                  ) : (
                    <div className="divide-y divide-navy/10 max-h-72 overflow-y-auto">
                      {conversations.map((conv) => (
                        <button
                          key={conv.otherUid}
                          type="button"
                          onClick={() => setActiveThreadUid(conv.otherUid)}
                          className="w-full text-left px-4 py-3 hover:bg-surface-soft transition"
                        >
                          <p className="text-xs font-semibold text-ink-soft mb-0.5">
                            {conv.otherUid.slice(0, 8)}…
                          </p>
                          <p className="text-sm text-ink truncate">{conv.lastMessage?.text}</p>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <>
                    <div className="flex-1 max-h-72 overflow-y-auto px-4 py-3 space-y-2">
                      {activeMessages.length === 0 ? (
                        <p className="text-xs text-ink-soft text-center py-6">No messages yet. Say hello to get started.</p>
                      ) : (
                        activeMessages.map((msg) => {
                          const isMine = msg.senderId === user?.uid
                          return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                                  isMine ? 'bg-amber text-navy' : 'bg-surface-soft text-ink'
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    <form onSubmit={handleSendMessage} className="border-t border-ink/10 p-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message…"
                        className="flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                      />
                      <button
                        type="submit"
                        disabled={sending || !messageText.trim()}
                        className="flex-shrink-0 flex items-center justify-center rounded-lg bg-amber h-9 w-9 text-ink hover:bg-amber-dark disabled:opacity-50 transition"
                        aria-label="Send message"
                      >
                        <Icon className="h-4 w-4" path={<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>} />
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* Report Form */}
            {showReport && (
              <div className="paper-card bg-surface border border-ink/10 p-6">
                <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-ink mb-4">Report this listing</h3>
                <form className="space-y-3" onSubmit={handleReport}>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Reason</label>
                    <select
                      value={reportForm.reason}
                      onChange={(e) => setReportForm((prev) => ({ ...prev, reason: e.target.value }))}
                      className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                    >
                      <option value="spam">Spam</option>
                      <option value="misleading">Misleading info</option>
                      <option value="harassment">Harassment</option>
                      <option value="inappropriate">Inappropriate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Details</label>
                    <textarea
                      value={reportForm.details}
                      onChange={(e) => setReportForm((prev) => ({ ...prev, details: e.target.value }))}
                      rows="3"
                      className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                      placeholder="Explain your concern…"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-coral px-4 py-2 text-sm font-semibold text-white hover:bg-coral/90 transition"
                  >
                    Submit report
                  </button>
                </form>
              </div>
            )}

            {/* Success/Error Message */}
            {error && (
              <div className={`flex items-start gap-2 rounded-lg p-3.5 text-sm ${
                error.includes('submitted')
                  ? 'bg-sage/10 border border-sage/30 text-sage'
                  : 'bg-coral/10 border border-coral/30 text-coral'
              }`}>
                <Icon
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  path={
                    error.includes('submitted')
                      ? <polyline points="20 6 9 17 4 12" />
                      : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                  }
                />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}