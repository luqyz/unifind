import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getAllReports,
  updateReportStatus,
  getAllUsersForAdmin,
  setUserBanStatus,
  setUserRole,
  getAllItemsForAdmin,
  setItemHidden,
  adminDeleteItem,
} from '../services/firebaseService'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  )
}

const TABS = [
  { key: 'reports', label: 'Reports' },
  { key: 'users', label: 'Users' },
  { key: 'listings', label: 'Listings' },
]

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [tab, setTab] = useState('reports')

  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [reportsData, usersData, itemsData] = await Promise.all([
        getAllReports(),
        getAllUsersForAdmin(),
        getAllItemsForAdmin(),
      ])
      setReports(reportsData)
      setUsers(usersData)
      setItems(itemsData)
    } catch (err) {
      setError(err.message || 'Failed to load admin data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <p className="text-ink-soft">Loading…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  const handleReportAction = async (reportId, status) => {
    setBusyId(reportId)
    try {
      await updateReportStatus(reportId, status)
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status, resolution: status } : r)))
    } catch (err) {
      setError(err.message || 'Failed to update report.')
    } finally {
      setBusyId('')
    }
  }

  const handleToggleBan = async (uid, currentlyBanned) => {
    setBusyId(uid)
    try {
      await setUserBanStatus(uid, !currentlyBanned)
      setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, isBanned: !currentlyBanned } : u)))
    } catch (err) {
      setError(err.message || 'Failed to update user.')
    } finally {
      setBusyId('')
    }
  }

  const handleToggleAdmin = async (uid, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin'
    setBusyId(uid)
    try {
      await setUserRole(uid, nextRole)
      setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, role: nextRole } : u)))
    } catch (err) {
      setError(err.message || 'Failed to update role.')
    } finally {
      setBusyId('')
    }
  }

  const handleToggleHidden = async (itemId, currentlyHidden) => {
    setBusyId(itemId)
    try {
      await setItemHidden(itemId, !currentlyHidden)
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, isHidden: !currentlyHidden } : i)))
    } catch (err) {
      setError(err.message || 'Failed to update listing.')
    } finally {
      setBusyId('')
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this listing permanently?')) return
    setBusyId(itemId)
    try {
      await adminDeleteItem(itemId)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    } catch (err) {
      setError(err.message || 'Failed to delete listing.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="border-b border-ink/10 bg-navy">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs font-black text-amber uppercase tracking-wide">Admin</p>
          <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-black text-cream">Moderation dashboard</h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-ink/10">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition ${
                tab === t.key ? 'border-amber text-ink' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              {t.label}
              {t.key === 'reports' && reports.filter((r) => r.status === 'open').length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-coral text-white text-[10px] font-black h-4 min-w-[16px] px-1">
                  {reports.filter((r) => r.status === 'open').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-coral/30 bg-coral/10 px-3.5 py-2.5">
            <Icon className="h-4 w-4 text-coral mt-0.5 flex-shrink-0" path={<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>} />
            <p className="text-sm text-coral">{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-ink-soft text-sm">Loading data…</p>
        ) : (
          <>
            {/* Reports tab */}
            {tab === 'reports' && (
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <p className="text-ink-soft text-sm">No reports yet.</p>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="rounded-xl bg-surface border border-ink/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block rounded-full bg-surface-soft px-2.5 py-0.5 text-[11px] font-bold text-ink uppercase">
                              {report.reason}
                            </span>
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              report.status === 'open' ? 'bg-coral/15 text-coral' : 'bg-sage/15 text-sage'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-ink">{report.details || 'No additional details provided.'}</p>
                          <p className="mt-1.5 text-xs text-ink-soft">
                            Item: <Link to={`/items/${report.itemId}`} className="text-amber-dark hover:underline">{report.itemId}</Link>
                            {' · '}Reporter: {report.reporterUid?.slice(0, 8)}…
                          </p>
                        </div>
                        {report.status === 'open' && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              type="button"
                              disabled={busyId === report.id}
                              onClick={() => handleReportAction(report.id, 'dismissed')}
                              className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-bold text-ink hover:bg-surface-soft transition disabled:opacity-50"
                            >
                              Dismiss
                            </button>
                            <button
                              type="button"
                              disabled={busyId === report.id}
                              onClick={() => handleReportAction(report.id, 'resolved')}
                              className="rounded-lg bg-sage px-3 py-1.5 text-xs font-bold text-white hover:bg-sage/90 transition disabled:opacity-50"
                            >
                              Resolve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Users tab */}
            {tab === 'users' && (
              <div className="rounded-xl bg-surface border border-ink/10 overflow-hidden">
                <div className="divide-y divide-ink/10">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-navy text-amber text-sm font-black">
                          {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-ink truncate">{u.displayName || 'No name'}</p>
                          <p className="text-xs text-ink-soft truncate">{u.email}</p>
                        </div>
                        {u.role === 'admin' && (
                          <span className="flex-shrink-0 rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-black text-amber-dark uppercase">Admin</span>
                        )}
                        {u.isBanned && (
                          <span className="flex-shrink-0 rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-black text-coral uppercase">Banned</span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          disabled={busyId === u.id || u.id === user.uid}
                          onClick={() => handleToggleAdmin(u.id, u.role)}
                          className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-bold text-ink hover:bg-surface-soft transition disabled:opacity-40"
                          title={u.id === user.uid ? "Can't change your own role" : ''}
                        >
                          {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === u.id || u.id === user.uid}
                          onClick={() => handleToggleBan(u.id, u.isBanned)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-40 ${
                            u.isBanned ? 'bg-sage text-white hover:bg-sage/90' : 'bg-coral text-white hover:bg-coral/90'
                          }`}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listings tab */}
            {tab === 'listings' && (
              <div className="rounded-xl bg-surface border border-ink/10 overflow-hidden">
                <div className="divide-y divide-ink/10">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/items/${item.id}`} className="text-sm font-bold text-ink hover:text-amber-dark truncate">
                            {item.title}
                          </Link>
                          <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                            item.type === 'lost' ? 'bg-coral/15 text-coral' : 'bg-sage/15 text-sage'
                          }`}>
                            {item.type}
                          </span>
                          {item.isHidden && (
                            <span className="flex-shrink-0 rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-black text-ink-soft uppercase">Hidden</span>
                          )}
                        </div>
                        <p className="text-xs text-ink-soft">{item.location} · {item.flaggedCount || 0} flag(s)</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => handleToggleHidden(item.id, item.isHidden)}
                          className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-bold text-ink hover:bg-surface-soft transition disabled:opacity-50"
                        >
                          {item.isHidden ? 'Unhide' : 'Hide'}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => handleDeleteItem(item.id)}
                          className="rounded-lg bg-coral px-3 py-1.5 text-xs font-bold text-white hover:bg-coral/90 transition disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}