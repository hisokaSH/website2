import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquare, FileText } from 'lucide-react'
import { forumApi } from '../lib/forumApi.js'
import { relativeTime } from '../lib/time.js'

export default function UserProfile() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      forumApi.getUser(username),
      forumApi.getUserThreads(username).catch(() => []),
    ])
      .then(([user, ts]) => {
        setProfile(user)
        setThreads(ts || [])
      })
      .catch((err) => setError(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card p-10 text-center text-ink-muted">Loading profile…</div>
      </div>
    )
  }
  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/forum" className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-white mb-4">
          <ArrowLeft size={14} /> Back to forum
        </Link>
        <div className="card p-6 text-center text-rose-300 border-rose-500/30 bg-rose-500/5">
          {error || 'User not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/forum" className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-white mb-4">
        <ArrowLeft size={14} /> Back to forum
      </Link>

      {/* Profile header */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-flame flex items-center justify-center text-white font-bold text-3xl shadow-flame flex-shrink-0">
          {(profile.username || '?')[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-white">{profile.username}</h1>
            {profile.is_admin && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-flame-600/20 text-flame-300 font-semibold uppercase">Admin</span>
            )}
            {profile.is_moderator && !profile.is_admin && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-600/20 text-sky-300 font-semibold uppercase">Mod</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-ink-secondary mt-2">
            <span className="flex items-center gap-1"><FileText size={14} /> {profile.thread_count || 0} threads</span>
            <span className="flex items-center gap-1"><MessageSquare size={14} /> {profile.post_count || 0} posts</span>
            {profile.created_at && <span>Joined {relativeTime(profile.created_at)}</span>}
          </div>
        </div>
      </div>

      {/* Recent threads */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">Recent threads</h2>
        <span className="text-xs text-ink-muted">{threads.length}</span>
      </div>

      {threads.length === 0 ? (
        <div className="card p-8 text-center text-ink-muted">
          No threads yet.
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <Link
              key={t.id}
              to={`/forum/t/${t.id}`}
              className="card card-hover p-4 flex items-center gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold group-hover:text-flame-300 transition-colors truncate">
                  {t.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-ink-muted mt-1">
                  <span>{t.category?.name}</span>
                  <span>{relativeTime(t.created_at)}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={12} /> {t.reply_count || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
