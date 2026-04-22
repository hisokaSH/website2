import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── API helper ────────────────────────────────────────────────────────────────
async function apiCall(endpoint, { method = 'GET', body = null } = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  let data = {}
  try { data = await res.json() } catch { /* non-JSON */ }
  if (!res.ok) {
    const msg = data?.error || data?.msg || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data
}

// ── Root component ────────────────────────────────────────────────────────────
export default function Admin() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const showMessage = useCallback((msg, type = 'success') => {
    if (type === 'success') {
      setSuccess(msg)
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(msg)
      setTimeout(() => setError(''), 4000)
    }
  }, [])

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 font-mono text-sm mb-4">// ACCESS_DENIED</p>
          <Link to="/" className="text-gray-400 hover:text-white font-mono text-xs">← BACK_HOME</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-[#111] border-b border-[#222] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">VULCAN</h1>
            <span className="text-red-500 font-mono text-sm">// ADMIN_PANEL</span>
            <span className="text-gray-500 font-mono text-xs">logged in as @{user.username}</span>
          </div>
          <Link to="/" className="text-gray-400 hover:text-white text-sm font-mono">EXIT</Link>
        </div>
      </div>

      {/* Toasts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded z-50 font-mono text-sm"
          >{error}</motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-50 font-mono text-sm"
          >{success}</motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['dashboard', 'users', 'licenses', 'generate', 'products'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-mono text-sm rounded transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-red-600 text-white'
                  : 'bg-[#111] text-gray-400 hover:text-white border border-[#222]'
              }`}
            >{tab.toUpperCase()}</button>
          ))}
        </div>

        {activeTab === 'dashboard' && <Dashboard showMessage={showMessage} />}
        {activeTab === 'users'     && <Users showMessage={showMessage} />}
        {activeTab === 'licenses'  && <Licenses showMessage={showMessage} />}
        {activeTab === 'generate'  && <Generate showMessage={showMessage} />}
        {activeTab === 'products'  && <Products showMessage={showMessage} />}
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ showMessage }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiCall('/api/admin/stats')
      .then(d => setStats(d.stats))
      .catch(e => showMessage(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [showMessage])

  if (loading) return <div className="text-gray-500 font-mono text-sm">Loading stats…</div>

  const cards = [
    ['TOTAL_USERS',      stats?.total_users,        'red'],
    ['ADMINS',           stats?.admin_users,        'red'],
    ['SUSPENDED',        stats?.suspended_users,    'yellow'],
    ['DISCORD_LINKED',   stats?.discord_linked,     'blue'],
    ['ACTIVE_LICENSES',  stats?.active_licenses,    'green'],
    ['UNREDEEMED_KEYS',  stats?.unredeemed_keys,    'yellow'],
    ['EXPIRED',          stats?.expired_licenses,   'gray'],
    ['REVOKED',          stats?.revoked_licenses,   'red'],
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(([label, val, color]) => <StatCard key={label} title={label} value={val ?? 0} color={color} />)}
    </div>
  )
}

function StatCard({ title, value, color }) {
  const colors = {
    red: 'text-red-500', green: 'text-green-500', yellow: 'text-yellow-500',
    blue: 'text-blue-500', gray: 'text-gray-400',
  }
  return (
    <div className="bg-[#111] border border-[#222] rounded-lg p-6">
      <p className="text-gray-500 text-xs font-mono mb-2">// {title}</p>
      <p className={`text-4xl font-bold ${colors[color] || 'text-white'}`}>{value}</p>
    </div>
  )
}

// ── Users ─────────────────────────────────────────────────────────────────────
function Users({ showMessage }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await apiCall(`/api/admin/users?search=${encodeURIComponent(search)}`)
      setUsers(d.users || [])
    } catch (e) {
      showMessage(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [search, showMessage])

  useEffect(() => { load() }, []) // initial load

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
          placeholder="Search username, email, discord ID, user ID…"
          className="flex-1 bg-[#111] border border-[#222] rounded px-4 py-2 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
        />
        <button onClick={load} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-mono text-sm">
          SEARCH
        </button>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0a0a0a]">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">USER</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">EMAIL</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">FLAGS</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">LICENSES</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">HWID</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">CREATED</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan="7" className="text-center py-8 text-gray-500 font-mono text-sm">Loading…</td></tr>
              : users.length === 0
                ? <tr><td colSpan="7" className="text-center py-8 text-gray-500 font-mono text-sm">No users found</td></tr>
                : users.map(u => (
                  <UserRow
                    key={u.id}
                    user={u}
                    expanded={expanded === u.id}
                    onToggle={() => setExpanded(expanded === u.id ? null : u.id)}
                    onRefresh={load}
                    showMessage={showMessage}
                  />
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UserRow({ user, expanded, onToggle, onRefresh, showMessage }) {
  const flags = []
  if (user.is_admin) flags.push('ADMIN')
  if (user.is_moderator) flags.push('MOD')
  if (!user.is_active) flags.push('SUSPENDED')

  const act = async (path, opts) => {
    try {
      await apiCall(path, opts)
      showMessage('Done')
      onRefresh()
    } catch (e) {
      showMessage(e.message, 'error')
    }
  }

  return (
    <>
      <tr className="border-t border-[#222] hover:bg-[#1a1a1a]">
        <td className="px-4 py-3">
          <div className="text-white font-mono text-sm">@{user.username}</div>
          <div className="text-gray-500 font-mono text-xs">id:{user.id}</div>
        </td>
        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{user.email}</td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {flags.length === 0
              ? <span className="text-gray-600 text-xs">—</span>
              : flags.map(f => (
                <span key={f} className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  f === 'ADMIN' ? 'bg-red-900/40 text-red-400' :
                  f === 'MOD'   ? 'bg-blue-900/40 text-blue-400' :
                                  'bg-yellow-900/40 text-yellow-400'
                }`}>{f}</span>
              ))}
          </div>
        </td>
        <td className="px-4 py-3 text-gray-300 font-mono text-xs">
          {user.active_licenses}/{user.license_count}
        </td>
        <td className="px-4 py-3 text-gray-400 font-mono text-xs">
          {user.hwid_bound ? 'BOUND' : '—'}
        </td>
        <td className="px-4 py-3 text-gray-500 font-mono text-xs">
          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
        </td>
        <td className="px-4 py-3 text-right">
          <button onClick={onToggle} className="text-red-500 hover:text-red-400 text-xs font-mono">
            {expanded ? '[–]' : '[+]'}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-t border-[#222] bg-[#0d0d0d]">
          <td colSpan="7" className="px-4 py-4">
            <UserDetail
              user={user}
              onAction={act}
              onRefresh={onRefresh}
              showMessage={showMessage}
            />
          </td>
        </tr>
      )}
    </>
  )
}

function UserDetail({ user, onAction, onRefresh, showMessage }) {
  const [products, setProducts] = useState([])
  const [grantForm, setGrantForm] = useState({ product_slug: '', duration_days: 30 })

  useEffect(() => {
    apiCall('/api/products/all')
      .then(setProducts)
      .catch(() => {})
  }, [])

  const handleGrant = async () => {
    if (!grantForm.product_slug) return showMessage('Select a product', 'error')
    try {
      const d = await apiCall('/api/admin/licenses/grant', {
        method: 'POST',
        body: {
          user: String(user.id),
          product_slug: grantForm.product_slug,
          duration_days: grantForm.duration_days,
        },
      })
      showMessage(`Granted ${d.license.key}`)
      setGrantForm({ product_slug: '', duration_days: 30 })
      onRefresh()
    } catch (e) {
      showMessage(e.message, 'error')
    }
  }

  const revokeKey = async (key) => {
    if (!window.confirm(`Revoke key ${key}?`)) return
    try {
      await apiCall(`/api/admin/licenses/${key}/revoke`, { method: 'POST' })
      showMessage('Revoked')
      onRefresh()
    } catch (e) {
      showMessage(e.message, 'error')
    }
  }

  const extendKey = async (key, days) => {
    try {
      await apiCall(`/api/admin/licenses/${key}`, {
        method: 'PATCH',
        body: { add_days: days },
      })
      showMessage(`+${days}d`)
      onRefresh()
    } catch (e) {
      showMessage(e.message, 'error')
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Left: quick actions */}
      <div className="space-y-3">
        <p className="text-gray-500 font-mono text-xs">// ACTIONS</p>

        <div className="bg-[#111] border border-[#222] rounded p-3">
          <p className="text-gray-400 font-mono text-[10px] mb-2">GRANT_LICENSE</p>
          <select
            value={grantForm.product_slug}
            onChange={e => setGrantForm({ ...grantForm, product_slug: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1.5 text-white text-sm mb-2 font-mono"
          >
            <option value="">Select product…</option>
            {products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              value={grantForm.duration_days}
              onChange={e => setGrantForm({ ...grantForm, duration_days: parseInt(e.target.value || '0', 10) })}
              className="w-24 bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-white text-sm font-mono"
              placeholder="Days"
            />
            <button onClick={handleGrant} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-mono">
              GRANT
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAction(`/api/admin/users/${user.id}/reset-hwid`, { method: 'POST' })}
            className="bg-[#111] hover:bg-[#1a1a1a] border border-[#333] text-yellow-400 px-3 py-1.5 rounded text-xs font-mono"
          >RESET_HWID</button>
          <button
            onClick={() => onAction(`/api/admin/users/${user.id}/suspend`, { method: 'POST' })}
            className="bg-[#111] hover:bg-[#1a1a1a] border border-[#333] text-red-400 px-3 py-1.5 rounded text-xs font-mono"
          >{user.is_active ? 'SUSPEND' : 'UNSUSPEND'}</button>
          <button
            onClick={() => onAction(`/api/admin/users/${user.id}/promote`, {
              method: 'POST',
              body: { is_admin: !user.is_admin },
            })}
            className="bg-[#111] hover:bg-[#1a1a1a] border border-[#333] text-red-400 px-3 py-1.5 rounded text-xs font-mono"
          >{user.is_admin ? 'REMOVE_ADMIN' : 'MAKE_ADMIN'}</button>
          <button
            onClick={() => onAction(`/api/admin/users/${user.id}/moderator`, {
              method: 'POST',
              body: { is_moderator: !user.is_moderator },
            })}
            className="bg-[#111] hover:bg-[#1a1a1a] border border-[#333] text-blue-400 px-3 py-1.5 rounded text-xs font-mono"
          >{user.is_moderator ? 'REMOVE_MOD' : 'MAKE_MOD'}</button>
        </div>

        {user.discord && user.discord.linked && (
          <p className="text-gray-500 font-mono text-xs">
            discord: {user.discord.username} <span className="text-gray-700">({user.discord.id})</span>
          </p>
        )}
        {user.hwid_bound && (
          <p className="text-gray-500 font-mono text-xs">
            hwid last ip: {user.hwid_last_ip || '—'}
          </p>
        )}
      </div>

      {/* Right: licenses */}
      <div>
        <p className="text-gray-500 font-mono text-xs mb-2">// LICENSES ({user.licenses.length})</p>
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {user.licenses.length === 0
            ? <p className="text-gray-600 font-mono text-xs">No licenses</p>
            : user.licenses.map(l => (
              <div key={l.id} className="bg-[#111] border border-[#222] rounded px-2 py-1.5 flex items-center gap-2 flex-wrap">
                <code className="text-gray-300 font-mono text-[11px] flex-1 min-w-0 truncate">{l.key}</code>
                <span className="text-gray-500 font-mono text-[10px]">{l.product_slug}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  l.status === 'active'     ? 'bg-green-900/30 text-green-400' :
                  l.status === 'unredeemed' ? 'bg-blue-900/30 text-blue-400' :
                  l.status === 'expired'    ? 'bg-gray-800 text-gray-400' :
                                              'bg-red-900/30 text-red-400'
                }`}>{l.status}</span>
                <button onClick={() => extendKey(l.key, 7)}  className="text-green-500 hover:text-green-400 text-[10px] font-mono">+7</button>
                <button onClick={() => extendKey(l.key, 30)} className="text-green-500 hover:text-green-400 text-[10px] font-mono">+30</button>
                {!l.status.includes('revoked') && (
                  <button onClick={() => revokeKey(l.key)} className="text-red-500 hover:text-red-400 text-[10px] font-mono">×</button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// ── Licenses ──────────────────────────────────────────────────────────────────
function Licenses({ showMessage }) {
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ status: '', product: '', key: '' })
  const [products, setProducts] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    const qs = new URLSearchParams()
    if (filters.status)  qs.set('status',  filters.status)
    if (filters.product) qs.set('product', filters.product)
    if (filters.key)     qs.set('key',     filters.key)
    try {
      const d = await apiCall(`/api/admin/licenses?${qs.toString()}`)
      setLicenses(d.licenses || [])
    } catch (e) {
      showMessage(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [filters, showMessage])

  useEffect(() => {
    apiCall('/api/products/all').then(setProducts).catch(() => {})
    load()
  }, []) // eslint-disable-line

  const revokeKey = async (key) => {
    if (!window.confirm(`Revoke key ${key}?`)) return
    try {
      await apiCall(`/api/admin/licenses/${key}/revoke`, { method: 'POST' })
      showMessage('Revoked'); load()
    } catch (e) { showMessage(e.message, 'error') }
  }
  const unrevokeKey = async (key) => {
    try {
      await apiCall(`/api/admin/licenses/${key}`, { method: 'PATCH', body: { revoked: false } })
      showMessage('Unrevoked'); load()
    } catch (e) { showMessage(e.message, 'error') }
  }
  const extend = async (key, days) => {
    try {
      await apiCall(`/api/admin/licenses/${key}`, { method: 'PATCH', body: { add_days: days } })
      showMessage(`+${days}d`); load()
    } catch (e) { showMessage(e.message, 'error') }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          value={filters.key}
          onChange={e => setFilters({ ...filters, key: e.target.value })}
          placeholder="Key contains…"
          className="bg-[#111] border border-[#222] rounded px-3 py-2 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
        />
        <select
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
          className="bg-[#111] border border-[#222] rounded px-3 py-2 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="unredeemed">Unredeemed</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
        <select
          value={filters.product}
          onChange={e => setFilters({ ...filters, product: e.target.value })}
          className="bg-[#111] border border-[#222] rounded px-3 py-2 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
        >
          <option value="">All products</option>
          {products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
        <button onClick={load} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-mono text-sm">
          FILTER
        </button>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0a0a0a]">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">KEY</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">PRODUCT</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">STATUS</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">OWNER</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">EXPIRES</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan="6" className="text-center py-8 text-gray-500 font-mono text-sm">Loading…</td></tr>
              : licenses.length === 0
                ? <tr><td colSpan="6" className="text-center py-8 text-gray-500 font-mono text-sm">No licenses found</td></tr>
                : licenses.map(l => (
                  <tr key={l.id} className="border-t border-[#222] hover:bg-[#1a1a1a]">
                    <td className="px-4 py-3">
                      <code
                        className="text-white font-mono text-xs cursor-pointer hover:text-red-400"
                        onClick={() => navigator.clipboard?.writeText(l.key)}
                        title="Click to copy"
                      >{l.key}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{l.product_slug}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        l.status === 'active'     ? 'bg-green-900/30 text-green-400' :
                        l.status === 'unredeemed' ? 'bg-blue-900/30 text-blue-400' :
                        l.status === 'expired'    ? 'bg-gray-800 text-gray-400' :
                                                    'bg-red-900/30 text-red-400'
                      }`}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {l.user
                        ? <span className="text-gray-300">@{l.user.username}</span>
                        : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {l.expires_at ? new Date(l.expires_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => extend(l.key, 7)}  className="text-green-500 hover:text-green-400 text-xs font-mono">+7</button>
                        <button onClick={() => extend(l.key, 30)} className="text-green-500 hover:text-green-400 text-xs font-mono">+30</button>
                        {l.status === 'revoked'
                          ? <button onClick={() => unrevokeKey(l.key)} className="text-yellow-500 hover:text-yellow-400 text-xs font-mono">UNREV</button>
                          : <button onClick={() => revokeKey(l.key)}   className="text-red-500 hover:text-red-400 text-xs font-mono">REVOKE</button>}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Generate ──────────────────────────────────────────────────────────────────
function Generate({ showMessage }) {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ product_slug: '', duration_days: 30, count: 1 })
  const [generated, setGenerated] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    apiCall('/api/products/all').then(setProducts).catch(() => {})
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!form.product_slug) return showMessage('Select a product', 'error')
    setLoading(true)
    try {
      const d = await apiCall('/api/admin/licenses/generate', {
        method: 'POST',
        body: form,
      })
      setGenerated(d.keys || [])
      showMessage(`Generated ${d.count} keys`)
    } catch (e) {
      showMessage(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <form onSubmit={handleGenerate} className="bg-[#111] border border-[#222] rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-gray-400 font-mono text-xs mb-1">PRODUCT</label>
          <select
            value={form.product_slug}
            onChange={e => setForm({ ...form, product_slug: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-white font-mono text-sm"
          >
            <option value="">Select product…</option>
            {products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-400 font-mono text-xs mb-1">DURATION_DAYS</label>
            <input
              type="number" min="1"
              value={form.duration_days}
              onChange={e => setForm({ ...form, duration_days: parseInt(e.target.value || '0', 10) })}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-white font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-400 font-mono text-xs mb-1">COUNT (max 500)</label>
            <input
              type="number" min="1" max="500"
              value={form.count}
              onChange={e => setForm({ ...form, count: parseInt(e.target.value || '0', 10) })}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-white font-mono text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white py-2 rounded font-mono text-sm"
        >
          {loading ? 'GENERATING…' : 'GENERATE_KEYS'}
        </button>
      </form>

      <div className="bg-[#111] border border-[#222] rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-500 font-mono text-xs">// LAST_BATCH ({generated.length})</p>
          {generated.length > 0 && (
            <button
              onClick={() => navigator.clipboard?.writeText(generated.join('\n'))}
              className="text-gray-400 hover:text-white font-mono text-xs"
            >COPY_ALL</button>
          )}
        </div>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {generated.length === 0
            ? <p className="text-gray-600 font-mono text-xs">No keys generated yet.</p>
            : generated.map(k => (
              <code
                key={k}
                onClick={() => navigator.clipboard?.writeText(k)}
                className="block text-gray-300 font-mono text-xs bg-[#0a0a0a] px-2 py-1 rounded cursor-pointer hover:text-red-400"
                title="Click to copy"
              >{k}</code>
            ))}
        </div>
      </div>
    </div>
  )
}

// ── Products (pause / unpause loaders) ────────────────────────────────────────
function Products({ showMessage }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [busySlug, setBusySlug] = useState(null)
  const [versionDraft, setVersionDraft] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = await apiCall('/api/products/all')
      setProducts(p)
      setVersionDraft(Object.fromEntries(p.map(x => [x.slug, x.version])))
    } catch (e) {
      showMessage(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showMessage])

  useEffect(() => { load() }, []) // eslint-disable-line

  const update = async (slug, updates) => {
    setBusySlug(slug)
    try {
      await apiCall(`/api/admin/products/${slug}`, { method: 'PATCH', body: updates })
      showMessage('Updated')
      await load()
    } catch (e) {
      showMessage(e.message, 'error')
    } finally {
      setBusySlug(null)
    }
  }

  const statusClasses = (status) =>
    status === 'active'      ? 'bg-green-900/30 text-green-400'  :
    status === 'maintenance' ? 'bg-red-900/40 text-red-400'       :
                               'bg-blue-900/30 text-blue-400'

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#0a0a0a]">
          <tr>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">PRODUCT</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">STATUS</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">VERSION</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? <tr><td colSpan="4" className="text-center py-8 text-gray-500 font-mono text-sm">Loading…</td></tr>
            : products.length === 0
              ? <tr><td colSpan="4" className="text-center py-8 text-gray-500 font-mono text-sm">No products</td></tr>
              : products.map(p => {
                const paused = p.status === 'maintenance'
                const soon   = p.status === 'coming_soon'
                const busy   = busySlug === p.slug
                const draft  = versionDraft[p.slug] ?? p.version
                const dirty  = draft !== p.version

                return (
                  <tr key={p.slug} className="border-t border-[#222] hover:bg-[#1a1a1a]">
                    <td className="px-4 py-3">
                      <div className="text-white font-mono text-sm">{p.name}</div>
                      <div className="text-gray-500 font-mono text-xs">{p.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${statusClasses(p.status)}`}>
                        {paused ? 'PAUSED' : soon ? 'SOON' : 'LIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={draft}
                        onChange={e => setVersionDraft(prev => ({ ...prev, [p.slug]: e.target.value }))}
                        className="w-24 bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-white font-mono text-xs"
                        placeholder="version"
                      />
                      <button
                        disabled={busy || !dirty || !draft.trim()}
                        onClick={() => update(p.slug, { version: draft.trim() })}
                        className="ml-2 text-green-500 hover:text-green-400 disabled:text-gray-700 text-xs font-mono"
                      >SAVE</button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {paused ? (
                          <button
                            disabled={busy}
                            onClick={() => update(p.slug, { status: 'active' })}
                            className="bg-green-900/40 hover:bg-green-900/60 border border-green-800 text-green-400 px-3 py-1 rounded text-xs font-mono disabled:opacity-50"
                          >RESUME</button>
                        ) : (
                          <button
                            disabled={busy}
                            onClick={() => update(p.slug, { status: 'maintenance' })}
                            className="bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-red-400 px-3 py-1 rounded text-xs font-mono disabled:opacity-50"
                          >PAUSE</button>
                        )}
                        {!soon && (
                          <button
                            disabled={busy}
                            onClick={() => update(p.slug, { status: 'coming_soon' })}
                            className="bg-[#111] hover:bg-[#1a1a1a] border border-[#333] text-gray-400 px-3 py-1 rounded text-xs font-mono disabled:opacity-50"
                            title="Hide as 'coming soon'"
                          >HIDE</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
        </tbody>
      </table>
    </div>
  )
}
