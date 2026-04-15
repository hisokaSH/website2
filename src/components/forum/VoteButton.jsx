import { useState } from 'react'
import { ChevronUp } from 'lucide-react'

/**
 * Upvote button with optimistic UI.
 * Props:
 *   - voted: boolean (current user's vote state)
 *   - count: number
 *   - onVote: async () => { voted, upvote_count }  (hits the API, returns server truth)
 *   - size: 'sm' | 'md'
 */
export default function VoteButton({ voted, count, onVote, size = 'md' }) {
  const [localVoted, setLocalVoted] = useState(voted)
  const [localCount, setLocalCount] = useState(count)
  const [busy, setBusy] = useState(false)

  // Reset if parent props change (e.g. after page reload)
  if (voted !== undefined && voted !== localVoted && !busy) {
    setLocalVoted(voted)
  }
  if (count !== undefined && count !== localCount && !busy) {
    setLocalCount(count)
  }

  const handleClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)

    // Optimistic
    const nextVoted = !localVoted
    const nextCount = localCount + (nextVoted ? 1 : -1)
    setLocalVoted(nextVoted)
    setLocalCount(nextCount)

    try {
      const result = await onVote()
      if (result) {
        setLocalVoted(!!result.voted)
        setLocalCount(result.upvote_count ?? nextCount)
      }
    } catch {
      // Revert on error
      setLocalVoted(localVoted)
      setLocalCount(localCount)
    } finally {
      setBusy(false)
    }
  }

  const padding = size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-1.5'
  const iconSize = size === 'sm' ? 14 : 16
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`flex items-center gap-1 rounded-md border transition-colors ${padding} ${textSize} ${
        localVoted
          ? 'border-flame-500/50 bg-flame-600/10 text-flame-300'
          : 'border-border-soft text-ink-secondary hover:border-border hover:text-white'
      }`}
      aria-label={localVoted ? 'Remove upvote' : 'Upvote'}
    >
      <ChevronUp size={iconSize} strokeWidth={2.5} />
      <span className="font-semibold tabular-nums">{localCount}</span>
    </button>
  )
}
