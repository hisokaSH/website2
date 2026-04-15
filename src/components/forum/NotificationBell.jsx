import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check } from 'lucide-react'
import { forumApi } from '../../lib/forumApi.js'
import { relativeTime } from '../../lib/time.js'

/** Bell icon with unread-count badge; dropdown shows recent mentions. */
export default function NotificationBell() {
  const [open, setOpen]       = useState(false)
  const [count, setCount]     = useState(0)
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  // Poll unread count every 60s
  useEffect(() => {
    const fetch = async () => {
      try {
        const { count } = await forumApi.unreadCount()
        setCount(count || 0)
      } catch {}
    }
    fetch()
    const interval = setInterval(fetch, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleOpen = async () => {
    setOpen((o) => !o)
    if (!open) {
      setLoading(true)
      try {
        const notifs = await forumApi.listNotifications()
        setItems(notifs || [])
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await forumApi.markAllRead()
      setItems((arr) => arr.map((n) => ({ ...n, read: true })))
      setCount(0)
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-ink-secondary hover:text-white hover:bg-bg-overlay transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-flame-600 text-white text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-raised border border-border-soft rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {count > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-ink-secondary hover:text-white flex items-center gap-1"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-6 text-center text-sm text-ink-muted">Loading…</div>
            )}
            {!loading && items.length === 0 && (
              <div className="p-6 text-center text-sm text-ink-muted">Nothing to see yet.</div>
            )}
            {!loading && items.map((n) => (
              <NotificationItem
                key={n.id}
                notif={n}
                onClick={() => setOpen(false)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationItem({ notif, onClick }) {
  const href = notif.thread_id ? `/forum/t/${notif.thread_id}` : '#'
  return (
    <Link
      to={href}
      onClick={onClick}
      className={`block px-4 py-3 border-b border-border-soft last:border-b-0 hover:bg-bg-overlay transition-colors ${
        !notif.read ? 'bg-flame-600/5' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-flame-500 mt-1.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink-primary line-clamp-2">
            You were mentioned in{' '}
            <span className="text-white font-medium">{notif.thread_title || 'a thread'}</span>
          </p>
          <p className="text-xs text-ink-muted mt-0.5">{relativeTime(notif.created_at)}</p>
        </div>
      </div>
    </Link>
  )
}
