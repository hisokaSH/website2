// Placeholder — full implementation in Phase 4
import { Link, useParams } from 'react-router-dom'

export default function ForumThread() {
  const { id } = useParams()
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/forum" className="text-sm text-ink-secondary hover:text-white mb-6 inline-block">
        ← Back to forum
      </Link>
      <div className="card p-8 text-center text-ink-muted">
        Thread #{id} detail view — coming in Phase 4.
      </div>
    </div>
  )
}
