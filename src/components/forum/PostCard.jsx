import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreVertical, Edit2, Trash2, X, Check } from 'lucide-react'
import { Markdown } from '../../lib/markdown.jsx'
import { relativeTime, absoluteTime } from '../../lib/time.js'
import { forumApi } from '../../lib/forumApi.js'
import VoteButton from './VoteButton.jsx'

/**
 * A single forum post (OP or reply).
 * Props:
 *   - post:  { id, content, created_at, edited_at, deleted, upvote_count, user_voted, author }
 *   - currentUser: the logged-in user object (for ownership / mod checks)
 *   - onUpdate: called after edit/delete with { type: 'edit'|'delete', post }
 *   - isOP: boolean (styling hint — OP gets a subtle highlight)
 */
export default function PostCard({ post, currentUser, onUpdate, isOP = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing]   = useState(false)
  const [draft, setDraft]       = useState(post.content || '')
  const [busy, setBusy]         = useState(false)

  const canEdit   = currentUser && post.author && currentUser.id === post.author.id
  const canDelete = canEdit || (currentUser && (currentUser.is_admin || currentUser.is_moderator))

  const handleSaveEdit = async () => {
    if (!draft.trim() || busy) return
    setBusy(true)
    try {
      const { post: updated } = await forumApi.editPost(post.id, draft.trim())
      setEditing(false)
      onUpdate?.({ type: 'edit', post: updated })
    } catch (err) {
      alert(err.message || 'Failed to save')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setBusy(true)
    try {
      await forumApi.deletePost(post.id)
      onUpdate?.({ type: 'delete', post })
    } catch (err) {
      alert(err.message || 'Failed to delete')
    } finally {
      setBusy(false)
      setMenuOpen(false)
    }
  }

  const author = post.author
  const deleted = post.deleted

  return (
    <article className={`card p-5 ${isOP ? 'border-flame-500/20' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Avatar + meta */}
        <div className="flex-shrink-0">
          <AuthorAvatar author={author} size={40} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {author ? (
                  <Link to={`/forum/u/${author.username}`} className="text-white font-semibold hover:text-flame-300">
                    {author.username}
                  </Link>
                ) : (
                  <span className="text-ink-muted italic">[deleted user]</span>
                )}
                {author?.is_admin && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-flame-600/20 text-flame-300 font-semibold uppercase">Admin</span>
                )}
                {author?.is_moderator && !author?.is_admin && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-600/20 text-sky-300 font-semibold uppercase">Mod</span>
                )}
              </div>
              <div className="text-xs text-ink-muted mt-0.5" title={absoluteTime(post.created_at)}>
                {relativeTime(post.created_at)}
                {post.edited_at && <span className="ml-2 italic">(edited)</span>}
              </div>
            </div>

            {/* Menu */}
            {(canEdit || canDelete) && !deleted && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="p-1 rounded text-ink-muted hover:text-white hover:bg-bg-overlay"
                  aria-label="Post actions"
                >
                  <MoreVertical size={16} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-bg-raised border border-border-soft rounded-lg shadow-xl z-10 py-1">
                    {canEdit && (
                      <button
                        onClick={() => { setEditing(true); setMenuOpen(false) }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-ink-secondary hover:text-white hover:bg-bg-overlay"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          {deleted ? (
            <p className="text-ink-muted italic">[deleted]</p>
          ) : editing ? (
            <div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
                className="w-full bg-bg-overlay border border-border rounded-lg p-3 text-ink-primary resize-y focus:outline-none focus:border-flame-500"
              />
              <div className="flex gap-2 mt-2 justify-end">
                <button
                  onClick={() => { setEditing(false); setDraft(post.content) }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-ink-secondary hover:text-white rounded"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={busy || !draft.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-flame-600 hover:bg-flame-500 text-white disabled:opacity-50"
                >
                  <Check size={14} /> Save
                </button>
              </div>
            </div>
          ) : (
            <Markdown text={post.content} />
          )}

          {/* Footer: vote button */}
          {!deleted && !editing && (
            <div className="mt-3">
              <VoteButton
                voted={!!post.user_voted}
                count={post.upvote_count || 0}
                onVote={() => forumApi.votePost(post.id)}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function AuthorAvatar({ author, size = 40 }) {
  const letter = (author?.username || '?')[0]?.toUpperCase() || '?'
  return (
    <div
      className="rounded-full bg-gradient-flame flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-flame"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {letter}
    </div>
  )
}
