// Placeholder — full implementation in Phase 4
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Forum() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/forum/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-white mb-2">Forum</h1>
        <p className="text-ink-secondary">Discuss tools, share tips, and get help from the community.</p>
      </div>

      {loading && (
        <div className="text-center py-16 text-ink-muted">Loading categories…</div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-16 text-ink-muted">No categories yet.</div>
      )}

      <div className="space-y-3">
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={`/forum/c/${cat.slug}`}
            className="card card-hover p-5 flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: `${cat.color}15`,
                border: `1px solid ${cat.color}40`,
                color: cat.color,
              }}
            >
              ●
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold">{cat.name}</h3>
              <p className="text-sm text-ink-secondary line-clamp-1">{cat.description}</p>
            </div>
            <div className="text-right text-sm text-ink-muted">
              <div className="font-semibold text-white">{cat.thread_count}</div>
              <div className="text-xs">threads</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
