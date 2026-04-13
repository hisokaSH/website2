// Placeholder — full implementation in Phase 4
import { Link, useParams } from 'react-router-dom'

export default function ForumCategory() {
  const { slug } = useParams()
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link to="/forum" className="text-sm text-ink-secondary hover:text-white mb-6 inline-block">
        ← Back to forum
      </Link>
      <h1 className="font-display text-3xl font-bold text-white mb-2">{slug}</h1>
      <p className="text-ink-secondary mb-8">Threads coming in Phase 4</p>
      <div className="card p-8 text-center text-ink-muted">
        Thread list and new-thread form will live here.
      </div>
    </div>
  )
}
