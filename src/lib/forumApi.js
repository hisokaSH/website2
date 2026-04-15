/** Thin wrapper around the /api/forum/* endpoints. All calls attach JWT from localStorage. */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function auth() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function req(method, path, body) {
  const res = await fetch(`${API_URL}/api/forum${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...auth(),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try { data = await res.json() } catch {}
  if (!res.ok) {
    const err = new Error(data?.error || data?.msg || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

export const forumApi = {
  listCategories: ()                     => req('GET', '/categories'),
  getCategory:    (slug)                 => req('GET', `/categories/${slug}`),

  listThreads: ({ category, sort = 'recent', page = 1, per_page = 20 } = {}) => {
    const qs = new URLSearchParams({ sort, page, per_page })
    if (category) qs.set('category', category)
    return req('GET', `/threads?${qs.toString()}`)
  },
  createThread: ({ category_slug, title, content }) =>
    req('POST', '/threads', { category_slug, title, content }),
  getThread:    (id)                     => req('GET', `/threads/${id}`),
  editThread:   (id, patch)              => req('PATCH', `/threads/${id}`, patch),
  deleteThread: (id)                     => req('DELETE', `/threads/${id}`),
  pinThread:    (id)                     => req('PATCH', `/threads/${id}/pin`),
  lockThread:   (id)                     => req('PATCH', `/threads/${id}/lock`),
  voteThread:   (id)                     => req('POST', `/threads/${id}/vote`),

  createPost:   (threadId, content, parent_id = null) =>
    req('POST', `/threads/${threadId}/posts`, { content, parent_id }),
  editPost:     (id, content)            => req('PATCH', `/posts/${id}`, { content }),
  deletePost:   (id)                     => req('DELETE', `/posts/${id}`),
  votePost:     (id)                     => req('POST', `/posts/${id}/vote`),

  listNotifications: (unreadOnly = false) => req('GET', `/notifications${unreadOnly ? '?unread=1' : ''}`),
  unreadCount:       ()                    => req('GET', '/notifications/unread-count'),
  markRead:          (id)                  => req('PATCH', `/notifications/${id}/read`),
  markAllRead:       ()                    => req('PATCH', '/notifications/read-all'),

  getUser:        (username) => req('GET', `/users/${username}`),
  getUserThreads: (username) => req('GET', `/users/${username}/threads`),
}
