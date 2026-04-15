import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Pin, Lock, MessageSquare, Eye, Flame, X } from 'lucide-react'
import { useAuth } from '../App'
import { forumApi } from '../lib/forumApi.js'
import { relativeTime, absoluteTime } from '../lib/time.js'

const SORT_OPTIONS = [
  { key: 'recent', label: 'Recent' },
  { key: 'new',    label: 'New' },
  { key: 'top',    label: 'Top' },
]

export default function ForumCategory() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [category, setCategory] = useState(null)
  const [threads, setThreads]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [sort, setSort]         = useState('recent')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [composerOpen, setComposerOpen] = useState(false)

  const perPage = 20

  useEffect(() => {
    forumApi.getCategory(slug)
      .then(setCategory)
      .catch(() => setCategory({ slug, name: slug, description: '', color: '#dc2626' }))
  }, [slug])

  useEffect(() => {
    setLoading(true)
    setError('')
    forumApi.listThreads({ category: slug, sort, page, per_page: perPage })
      .then((data) => {
        setThreads(data.threads || [])
        setTotal(data.total || 0)
      })
      .catch((err) => setError(err.message || 'Failed to load threads'))
      .finally(() => setLoading(false))
  }, [slug, sort, page])

  const handleCreated = (thread) => {
    setComposerOpen(false)
    navigate(`/forum/t/${thread.id}`)
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link to="/forum" className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-white mb-4">
        <ArrowLeft size={14} /> All categories
      </Link>

      {/* Category header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            {category?.name || slug}
          </h1>
          {category?.description && (
            <p className="text-ink-secondary">{category.description}</p>
          )}
        </div>
        {user && (
          <button
            onClick={() => setComposerOpen(true)}
            className="btn-flame flex items-center gap-2 flex-shrink-0"
          >
            <Plus size={16} />
            New Thread
          </button>
        )}
      </div>

      {/* Sort tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 border border-border-soft rounded-lg p-1 bg-bg-overlay/40">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setSort(opt.key); setPage(1) }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                sort === opt.key
                  ? 'bg-flame-600/20 text-flame-300'
                  : 'text-ink-secondary hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-ink-muted">
          {total} thread{total === 1 ? '' : 's'}
        </div>
      </div>

      {/* Thread list */}
      {loading && (
        <div className="card p-10 text-center text-ink-muted">Loading threads…</div>
      )}
      {error && !loading && (
        <div className="card p-6 text-center text-rose-300 border-rose-500/30 bg-rose-500/5">
          {error}
        </div>
      )}
      {!loading && !error && threads.length === 0 && (
        <div className="card p-10 text-center">
          <MessageSquare className="mx-auto text-ink-muted mb-3" size={32} />
          <p className="text-ink-secondary mb-2">No threads yet in this category.</p>
          {user && (
            <button
              onClick={() => setComposerOpen(true)}
              className="text-flame-400 hover:text-flame-300 text-sm font-medium"
            >
              Be the first to post →
            </button>
          )}
        </div>
      )}

      {!loading && threads.length > 0 && (
        <div className="space-y-2">
          {threads.map((t) => <ThreadRow key={t.id} thread={t} />)}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm text-ink-secondary hover:text-white border border-border-soft rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-sm text-ink-secondary">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm text-ink-secondary hover:text-white border border-border-soft rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* New thread modal */}
      {composerOpen && user && (
        <NewThreadModal
          categorySlug={slug}
          onClose={() => setComposerOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}

// ─── Thread row ───────────────────────────────────────────────────────────────
function ThreadRow({ thread }) {
  return (
    <Link
      to={`/forum/t/${thread.id}`}
      className="card card-hover p-4 flex items-start gap-4 group"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-flame flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-flame">
        {(thread.author?.username || '?')[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {thread.pinned && <Pin size={14} className="text-flame-400" />}
          {thread.locked && <Lock size={14} className="text-ink-muted" />}
          <h3 className="text-white font-semibold group-hover:text-flame-300 transition-colors truncate">
            {thread.title}
          </h3>
        </div>
        {thread.excerpt && (
          <p className="text-sm text-ink-secondary line-clamp-1 mb-2">{thread.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-ink-muted">
          <span>
            by <span className="text-ink-secondary">{thread.author?.username || '[deleted]'}</span>
          </span>
          <span title={absoluteTime(thread.created_at)}>{relativeTime(thread.created_at)}</span>
          <span className="flex items-center gap-1"><MessageSquare size={12} /> {thread.reply_count || 0}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {thread.view_count || 0}</span>
          <span className="flex items-center gap-1"><Flame size={12} /> {thread.upvote_count || 0}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── New thread modal ─────────────────────────────────────────────────────────
function NewThreadModal({ categorySlug, onClose, onCreated }) {
  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (busy) return
    setError('')
    if (title.trim().length < 3) return setError('Title must be at least 3 characters.')
    if (content.trim().length < 10) return setError('Content must be at least 10 characters.')
    setBusy(true)
    try {
      const { thread } = await forumApi.createThread({
        category_slug: categorySlug,
        title: title.trim(),
        content: content.trim(),
      })
      onCreated?.(thread)
    } catch (err) {
      setError(err.message || 'Failed to create thread')
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card max-w-2xl w-full mt-12 p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border-soft">
          <h2 className="text-lg font-semibold text-white">New thread</h2>
          <button onClick={onClose} className="p-1 text-ink-muted hover:text-white rounded">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="What's this thread about?"
              className="w-full bg-bg-overlay border border-border rounded-lg px-4 py-2.5 text-white placeholder:text-ink-muted focus:outline-none focus:border-flame-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Content <span className="text-ink-muted normal-case">(markdown supported)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Write your post…"
              className="w-full bg-bg-overlay border border-border rounded-lg px-4 py-3 text-ink-primary placeholder:text-ink-muted resize-y focus:outline-none focus:border-flame-500"
            />
            <p className="text-xs text-ink-muted mt-1">
              **bold** · *italic* · `code` · ```code block``` · &gt; quote · - list · [link](url)
            </p>
          </div>
          {error && (
            <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              disabled={busy}
            >
              Cancel
            </button>
            <button type="submit" className="btn-flame" disabled={busy}>
              {busy ? 'Posting…' : 'Post Thread'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
