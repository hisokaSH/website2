/** Relative time formatter: "just now", "2m ago", "3h ago", "yesterday", "Mar 12". */
export function relativeTime(isoString) {
  if (!isoString) return ''
  const then = new Date(isoString).getTime()
  if (isNaN(then)) return ''
  const now = Date.now()
  const secs = Math.floor((now - then) / 1000)

  if (secs < 5)    return 'just now'
  if (secs < 60)   return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60)   return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24)  return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1)  return 'yesterday'
  if (days < 7)    return `${days}d ago`
  if (days < 30)   return `${Math.floor(days / 7)}w ago`
  if (days < 365)  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Absolute time for tooltips. */
export function absoluteTime(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}
