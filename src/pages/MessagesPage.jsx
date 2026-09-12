import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { subscribeToAllConversations, sendMessage, getItemById } from '../services/firebaseService'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  )
}

function UnreadBadge({ count }) {
  if (!count) return null
  return (
    <span className="flex-shrink-0 inline-flex items-center justify-center rounded-full bg-coral text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5">
      {count > 9 ? '9+' : count}
    </span>
  )
}

export default function MessagesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [allMessages, setAllMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [itemTitles, setItemTitles] = useState({})
  const [lastRead, setLastRead] = useState({})

  const activeKey = searchParams.get('c') || null

  useEffect(() => {
    if (!user?.uid) return
    try {
      const stored = localStorage.getItem(`lastRead_${user.uid}`)
      setLastRead(stored ? JSON.parse(stored) : {})
    } catch {
      setLastRead({})
    }
  }, [user?.uid])

  const markConversationRead = (key) => {
    if (!user?.uid || !key) return
    const nowSeconds = Math.floor(Date.now() / 1000)
    setLastRead((prev) => {
      const updated = { ...prev, [key]: nowSeconds }
      try {
        localStorage.setItem(`lastRead_${user.uid}`, JSON.stringify(updated))
      } catch {
        // ignore storage errors (e.g. private browsing)
      }
      return updated
    })
  }

  useEffect(() => {
    if (!user?.uid) return undefined

    const unsubscribe = subscribeToAllConversations(
      user.uid,
      (msgs) => {
        setAllMessages(msgs)
        setLoading(false)
      },
      (err) => {
        console.error('subscribeToAllConversations error:', err.code, err.message, err)
        setError(err.message || 'Failed to load messages.')
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user?.uid])

  const conversations = useMemo(() => {
    if (!user?.uid) return []
    const map = new Map()

    allMessages.forEach((msg) => {
      const otherUid = msg.senderId === user.uid ? msg.receiverId : msg.senderId
      const key = `${msg.itemId}__${otherUid}`
      if (!map.has(key)) {
        map.set(key, { key, itemId: msg.itemId, otherUid, messages: [] })
      }
      map.get(key).messages.push(msg)
    })

    return Array.from(map.values())
      .map((conv) => ({
        ...conv,
        lastMessage: conv.messages[0],
      }))
      .sort((a, b) => (b.lastMessage?.createdAt?.seconds || 0) - (a.lastMessage?.createdAt?.seconds || 0))
  }, [allMessages, user?.uid])

  const unreadCounts = useMemo(() => {
    if (!user?.uid) return {}
    const counts = {}
    conversations.forEach((conv) => {
      const lastReadAt = lastRead[conv.key] || 0
      counts[conv.key] = conv.messages.filter(
        (msg) => msg.senderId !== user.uid && (msg.createdAt?.seconds || 0) > lastReadAt,
      ).length
    })
    return counts
  }, [conversations, lastRead, user?.uid])

  const totalUnread = useMemo(
    () => Object.values(unreadCounts).reduce((sum, n) => sum + n, 0),
    [unreadCounts],
  )

  useEffect(() => {
    const missing = conversations
      .map((c) => c.itemId)
      .filter((itemId) => itemId && !itemTitles[itemId])
    const unique = [...new Set(missing)]
    if (unique.length === 0) return

    unique.forEach(async (itemId) => {
      try {
        const item = await getItemById(itemId)
        setItemTitles((prev) => ({ ...prev, [itemId]: item?.title || 'Listing' }))
      } catch {
        setItemTitles((prev) => ({ ...prev, [itemId]: 'Listing' }))
      }
    })
  }, [conversations, itemTitles])

  const activeConversation = conversations.find((c) => c.key === activeKey)
  const activeMessages = useMemo(() => {
    if (!activeConversation) return []
    return [...activeConversation.messages].sort(
      (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0),
    )
  }, [activeConversation])

  useEffect(() => {
    if (activeConversation) {
      markConversationRead(activeConversation.key)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.key, activeMessages.length])

  const handleSelectConversation = (key) => {
    setSearchParams({ c: key })
    markConversationRead(key)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!user || !activeConversation || !messageText.trim()) return

    setSending(true)
    try {
      await sendMessage({
        itemId: activeConversation.itemId,
        senderId: user.uid,
        receiverId: activeConversation.otherUid,
        text: messageText,
      })
      setMessageText('')
    } catch (err) {
      setError(err.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-ink-soft mb-4">Log in to see your messages.</p>
          <Link to="/login" className="rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition">
            Log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="messages-page min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="messages-title text-xl font-black mb-4 flex items-center gap-2">
          Messages
          {totalUnread > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-coral text-white text-xs font-black h-5 min-w-[20px] px-1.5">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </h1>

        <div className="messages-shell grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 overflow-hidden" style={{ minHeight: '70vh' }}>
          <div className={`messages-list border-r border-ink/10 ${activeKey ? 'hidden md:block' : 'block'}`}>
            <div className="border-b border-ink/10 px-4 py-3">
              <p className="text-sm font-black text-ink">Conversations</p>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '65vh' }}>
              {loading ? (
                <p className="text-xs text-ink-soft text-center py-8">Loading…</p>
              ) : conversations.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Icon className="h-6 w-6 mx-auto text-ink-soft/50 mb-2" path={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />
                  <p className="text-sm text-ink-soft">No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y divide-navy/10">
                  {conversations.map((conv) => {
                    const unread = unreadCounts[conv.key] || 0
                    return (
                      <button
                        key={conv.key}
                        type="button"
                        onClick={() => handleSelectConversation(conv.key)}
                        className={`w-full text-left px-4 py-3 hover:bg-surface-soft transition ${
                          activeKey === conv.key ? 'active' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-amber-dark mb-0.5 truncate">
                              {itemTitles[conv.itemId] || 'Listing'}
                            </p>
                            <p className="text-xs text-ink-soft mb-1">{conv.otherUid.slice(0, 8)}…</p>
                            <p className={`text-sm truncate ${unread > 0 ? 'text-ink font-black' : 'text-ink-soft'}`}>
                              {conv.lastMessage?.text}
                            </p>
                          </div>
                          <UnreadBadge count={unread} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={`flex flex-col ${activeKey ? 'block' : 'hidden md:flex'}`}>
            {activeConversation ? (
              <>
                <div className="border-b border-ink/10 px-4 py-3 flex items-center gap-2">
                  <button type="button" onClick={() => setSearchParams({})} className="md:hidden text-ink-soft hover:text-ink-soft">
                    <Icon className="h-4 w-4" path={<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>} />
                  </button>
                  <div className="min-w-0">
                    <Link to={`/items/${activeConversation.itemId}`} className="text-sm font-black text-ink hover:text-amber-dark truncate block">
                      {itemTitles[activeConversation.itemId] || 'Listing'}
                    </Link>
                    <p className="text-xs text-ink-soft">{activeConversation.otherUid.slice(0, 8)}…</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: '55vh' }}>
                  {activeMessages.map((msg) => {
                    const isMine = msg.senderId === user.uid
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`message-bubble max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                            isMine ? 'me' : 'them'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <form onSubmit={handleSendMessage} className="message-compose border-t border-ink/10 p-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 rounded-lg border border-ink/15 bg-surface text-ink placeholder:text-ink-soft px-3 py-2 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim() || !activeConversation?.itemId}
                    className="flex-shrink-0 flex items-center justify-center rounded-lg bg-amber h-9 w-9 text-ink hover:bg-amber-dark disabled:opacity-50 transition"
                    aria-label="Send message"
                  >
                    <Icon className="h-4 w-4" path={<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-ink-soft">Select a conversation to start replying</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-coral/30 bg-coral/10 px-3.5 py-2.5">
            <Icon className="h-4 w-4 text-coral mt-0.5 flex-shrink-0" path={<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>} />
            <p className="text-sm text-coral">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}