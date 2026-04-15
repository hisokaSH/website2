import { useEffect, useState, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pin, Lock, Unlock, Trash2, Edit2, Eye, Flame,
  MessageSquare, X, Check,
} from 'lucide-react'
import { useAuth } from '../App'
import { forumApi } from '../lib/forumApi.js'
import { relativeTime } from '../lib/time.js'
import { Markdown } from '../lib/markdown.jsx'
import PostCard from '../components/forum/PostCard.jsx'
import VoteButton from '../components/forum/VoteButton.jsx'

export default function ForumThread() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [thread, setThread]  = useState(null)
  const [posts, setPosts]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState('')

  const [editingThread, setEditingThread] = useState(false)
  const [draftTitle, setDraftTitle]       = useState('')
  const [draftContent, setDraftContent]   = useState('')
  const [savingThread, setSavingThread]   = useState(false)

  const replyRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    forumApi.getThread(id)
      .then(({ thread, posts }) => {
        setThread(thread)
        setPosts(posts || [])
        setDraftTitle(thread.title)
        setDraftContent(thread.content || '')
      })
      .catch((err) => setError(err.message || 'Failed to load thread'))
      .finally(() => setLoading(false))
  }, [id])

  const canEdit      = user && thread?.author && user.id === thread.author.id
  const canModerate  = user && (user.is_admin || user.is_moderator)
  const canDeleteThread = canEdit || canModerate

  const handleReplyCreated = (newPost) => {
    setPosts((p) => [...p, newPost])
    setThread((t) => t ? { ...t, reply_count: (t.reply_count || 0) + 1 } : t)
  }

  const handlePostUpdate = ({ type, post }) => {
    if (type === 'edit') {
      setPosts((arr) => arr.map((p) => (p.id === post.id ? post : p)))
    } else if (type === 'delete') {
      setPosts((arr) => arr.map((p) => (p.id === post.id ? { ...p, deleted: true } : p)))
    }
  }

  const handleSaveThreadEdit = async () => {
    if (savingThread) return
    setSavingThread(true)
    try {
      const { thread: updated } = await forumApi.editThread(thread.id, {
        title:   draftTitle.trim(),
        content: draftContent.trim(),
      })
      setThread(updated)
      setEditingThread(false)
    } catch (err) {
      alert(err.message || 'Failed to save')
    } finally {
      setSavingThread(false)
    }
  }

  const handleDeleteThread = async () => {
    if (!confirm('Delete this thread? This cannot be undone.')) return
    try {
      await forumApi.deleteThread(thread.id)
      navigate(`/forum/c/${thread.category?.slug || ''}`)
    } catch (err) {
      alert(err.message || 'Failed to delete')
    }
  }

  const handlePin = async () => {
    try {
      const { pinned } = await forumApi.pinThread(thread.id)
      setThread((t) => ({ ...t, pinned }))
    } catch (err) { alert(err.message) }
  }

  const handleLock = async () => {
    try {
      const { locked } = await forumApi.lockThread(thread.id)
      setThread((t) => ({ ...t, locked }))
    } catch (err) { alert(err.message) }
  }

  const scrollToReply = () => {
    replyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    replyRef.current?.querySelector('textarea')?.focus()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card p-10 text-center text-ink-muted">Loading thread…</div>
      </div>
    )
  }
  if (error || !thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/forum" className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-white mb-4">
          <ArrowLeft size={14} /> Back to forum
        </Link>
        <div className="card p-6 text-center text-rose-300 border-rose-500/30 bg-rose-500/5">
          {error || 'Thread not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link
        to={`/forum/c/${thread.category?.slug || ''}`}
        className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-white mb-4"
      >
        <ArrowLeft size={14} /> {thread.category?.name || 'Back'}
      </Link>

      {/* Thread header */}
      <div className="card p-6 mb-4 border-flame-500/20">
        {editingThread ? (
          <div className="space-y-3">
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              maxLength={200}
              className="w-full bg-bg-overlay border border-border rounded-lg px-4 py-2.5 text-white text-xl font-bold focus:outline-none focus:border-flame-500"
            />
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              rows={8}
              className="w-full bg-bg-overlay border border-border rounded-lg px-4 py-3 text-ink-primary resize-y focus:outline-none focus:border-flame-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEditingThread(false)
                  setDraftTitle(thread.title)
                  setDraftContent(thread.content || '')
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-white rounded"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSaveThreadEdit}
                disabled={savingThread}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-flame-600 hover:bg-flame-500 text-white disabled:opacity-50"
              >
                <Check size={14} /> Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {thread.pinned && <Pin size={18} className="text-flame-400 flex-shrink-0" />}
                {thread.locked && <Lock size={18} className="text-ink-muted flex-shrink-0" />}
                <h1 className="font-display text-2xl font-bold text-white leading-tight">
                  {thread.title}
                </h1>
              </div>

              {/* Mod + owner actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {canModerate && (
                  <button
                    onClick={handlePin}
                    title={thread.pinned ? 'Unpin' : 'Pin'}
                    className="p-1.5 rounded text-ink-secondary hover:text-flame-300 hover:bg-bg-overlay"
                  >
                    <Pin size={16} />
                  </button>
                )}
                {canModerate && (
                  <button
                    onClick={handleLock}
                    title={thread.locked ? 'Unlock' : 'Lock'}
                    className="p-1.5 rounded text-ink-secondary hover:text-sky-300 hover:bg-bg-overlay"
                  >
                    {thread.locked ? <Unlock size={16} /> : <Lock size={16} />}
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => setEditingThread(true)}
                    title="Edit"
                    className="p-1.5 rounded text-ink-secondary hover:text-white hover:bg-bg-overlay"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                {canDeleteThread && (
                  <button
                    onClick={handleDeleteThread}
                    title="Delete"
                    className="p-1.5 rounded text-ink-secondary hover:text-rose-300 hover:bg-bg-overlay"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-ink-muted mb-4">
              <span>
                by{' '}
                {thread.author ? (
                  <Link to={`/forum/u/${thread.author.username}`} className="text-ink-secondary hover:text-flame-300">
                    {thread.author.username}
                  </Link>
                ) : (
                  <span className="italic">[deleted]</span>
                )}
              </span>
              <span>{relativeTime(thread.created_at)}</span>
              <span className="flex items-center gap-1"><Eye size={12} /> {thread.view_count || 0}</span>
              <span className="flex items-center gap-1"><MessageSquare size={12} /> {thread.reply_count || 0}</span>
            </div>

            {/* OP body */}
            <Markdown text={thread.content} />

            {/* Vote button */}
            <div className="mt-4 flex items-center gap-3">
              <VoteButton
                voted={!!thread.user_voted}
                count={thread.upvote_count || 0}
                onVote={() => forumApi.voteThread(thread.id)}
              />
              {!thread.locked && user && (
                <button
                  onClick={scrollToReply}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-md border border-border-soft text-ink-secondary hover:text-white hover:border-border"
                >
                  <MessageSquare size={14} /> Reply
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Replies */}
      <div className="space-y-3 mb-6">
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            currentUser={user}
            onUpdate={handlePostUpdate}
          />
        ))}
      </div>

      {/* Reply composer */}
      <div ref={replyRef}>
        {thread.locked ? (
          <div className="card p-6 text-center text-ink-muted border-ink-muted/20">
            <Lock className="inline mr-2" size={14} /> This thread is locked. No new replies.
          </div>
        ) : user ? (
          <ReplyComposer threadId={thread.id} onCreated={handleReplyCreated} />
        ) : (
          <div className="card p-6 text-center">
            <Link to="/login" className="text-flame-400 hover:text-flame-300">Log in</Link> to reply.
          </div>
        )}
      </div>
    </div>
  )
}

function ReplyComposer({ threadId, onCreated }) {
  const [content, setContent] = useState('')
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (busy) return
    const trimmed = content.trim()
    if (!trimmed) return setError('Reply cannot be empty.')
    if (trimmed.length > 10000) return setError('Too long (max 10000 characters).')
    setError('')
    setBusy(true)
    try {
      const { post } = await forumApi.createPost(threadId, trimmed)
      onCreated?.(post)
      setContent('')
    } catch (err) {
      setError(err.message || 'Failed to reply')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5">
      <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
        Post a reply
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        placeholder="Write your reply…"
        className="w-full bg-bg-overlay border border-border rounded-lg px-4 py-3 text-ink-primary placeholder:text-ink-muted resize-y focus:outline-none focus:border-flame-500"
      />
      <p className="text-xs text-ink-muted mt-1">
        Markdown supported · @mention users by name
      </p>
      {error && (
        <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 mt-3">
          {error}
        </div>
      )}
      <div className="flex justify-end mt-3">
        <button type="submit" disabled={busy || !content.trim()} className="btn-flame disabled:opacity-50">
          {busy ? 'Posting…' : 'Post Reply'}
        </button>
      </div>
    </form>
  )
}
