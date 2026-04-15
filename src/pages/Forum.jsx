import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessagesSquare,
  Shield,
  ShieldOff,
  Folder,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Slugs that have a PNG icon at /static/products/icons/<slug>.png
const IMAGE_ICON_SLUGS = new Set([
  'roblox',
  'fortnite',
  'overwatch',
  'arc-raiders',
  'valorant-private',
  'seven-deadly-sins',
  'seven-deadly-sins-origins',
])

// Fallback lucide icons for slugs without a product image
const LUCIDE_MAP = {
  general: MessagesSquare,
  'vulcan-checker': Shield,
  'vanguard-bypass': ShieldOff,
}

function iconFor(slug) {
  return LUCIDE_MAP[slug?.toLowerCase?.()] || Folder
}

function iconImageUrl(slug) {
  // seven-deadly-sins-origins uses seven-deadly-sins.png
  const key = slug === 'seven-deadly-sins-origins' ? 'seven-deadly-sins' : slug
  return `${API_URL}/static/products/icons/${key}.png`
}

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
        {categories.map(cat => {
          const hasImage = IMAGE_ICON_SLUGS.has(cat.slug?.toLowerCase?.())
          const Icon = hasImage ? null : iconFor(cat.slug)
          return (
            <Link
              key={cat.id}
              to={`/forum/c/${cat.slug}`}
              className="card card-hover p-5 flex items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  background: `${cat.color}15`,
                  border: `1px solid ${cat.color}40`,
                  color: cat.color,
                }}
              >
                {hasImage ? (
                  <img
                    src={iconImageUrl(cat.slug)}
                    alt={cat.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <Icon size={22} strokeWidth={2} />
                )}
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
          )
        })}
      </div>
    </div>
  )
}
