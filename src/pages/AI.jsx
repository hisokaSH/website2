import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Bot, User, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../App'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const MAX_FILE_BYTES = 50 * 1024 * 1024  // mirror backend cap

// Tool-progress markers: Unicode Private-Use Area chars — never appear in
// normal text content, so we can safely embed/parse them in the chat string.
const TOOL_OPEN = String.fromCodePoint(0xE100)
const TOOL_CLOSE = String.fromCodePoint(0xE101)

function fmtSize(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function isImage(file) {
  return file.type?.startsWith('image/')
}

// Parse assistant content with embedded tool-progress markers and render
// them as styled trace blocks while regular text is shown inline.
function renderContent(content) {
  if (!content) return null
  const re = new RegExp(TOOL_OPEN + '([^' + TOOL_CLOSE + ']+)' + TOOL_CLOSE, 'g')
  const parts = content.split(re)
  return parts.map((part, i) => {
    if (i % 2 === 0) {
      return part
        ? <span key={i} className="whitespace-pre-wrap break-words">{part}</span>
        : null
    }
    return (
      <div
        key={i}
        className="my-2 px-3 py-1.5 rounded-md bg-bg-overlay border-l-2 border-flame-500/60 font-mono text-xs text-ink-secondary break-all"
      >
        {part}
      </div>
    )
  })
}

export default function AI() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [pending, setPending] = useState([])  // [{ file, status, path? }]
  const [dragOver, setDragOver] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const queueFiles = (fileList) => {
    const arr = Array.from(fileList || [])
    const accepted = []
    for (const f of arr) {
      if (f.size > MAX_FILE_BYTES) {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: `[upload rejected] ${f.name}: ${fmtSize(f.size)} exceeds 50 MB limit` },
        ])
        continue
      }
      accepted.push({ file: f, status: 'queued', path: null })
    }
    if (accepted.length) setPending((p) => [...p, ...accepted])
  }

  const removeQueued = (idx) => {
    if (streaming) return
    setPending((p) => p.filter((_, i) => i !== idx))
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (streaming) return
    queueFiles(e.dataTransfer?.files)
  }

  const onPaperclip = () => {
    if (streaming) return
    fileInputRef.current?.click()
  }

  const onFileInput = (e) => {
    queueFiles(e.target.files)
    e.target.value = ''
  }

  const send = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if ((!text && pending.length === 0) || streaming) return

    const token = localStorage.getItem('token')
    if (!token) return

    setStreaming(true)

    // 1. upload any pending files first, collect paths
    const uploadedPaths = []
    if (pending.length) {
      for (let i = 0; i < pending.length; i++) {
        const item = pending[i]
        setPending((p) => p.map((x, idx) => (idx === i ? { ...x, status: 'uploading' } : x)))
        try {
          const fd = new FormData()
          fd.append('file', item.file)
          const r = await fetch(`${API_URL}/api/ai/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          })
          const j = await r.json()
          if (!r.ok || !j.success) throw new Error(j.error || `HTTP ${r.status}`)
          uploadedPaths.push({ name: j.filename, path: j.path, size: j.size, contentType: j.content_type })
          setPending((p) => p.map((x, idx) => (idx === i ? { ...x, status: 'done', path: j.path } : x)))
        } catch (err) {
          setPending((p) => p.map((x, idx) => (idx === i ? { ...x, status: 'error' } : x)))
          setMessages((m) => [...m, { role: 'assistant', content: `[upload failed] ${item.file.name}: ${err.message}` }])
          setStreaming(false)
          return
        }
      }
    }

    // 2. compose user message
    let composed = text
    if (uploadedPaths.length) {
      const attachments = uploadedPaths
        .map((u) => `- ${u.path}  (${u.name}, ${fmtSize(u.size)}, ${u.contentType})`)
        .join('\n')
      composed = (text ? text + '\n\n' : '') + 'Attached files (saved in my workspace, you can read them with the terminal tool):\n' + attachments
    }

    const next = [
      ...messages,
      { role: 'user', content: composed, attachments: uploadedPaths },
      { role: 'assistant', content: '' },
    ]
    setMessages(next)
    setInput('')
    setPending([])

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: next.slice(0, -1).map(({ role, content }) => ({ role, content })),
          stream: true,
        }),
      })

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '')
        setMessages((m) => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'assistant', content: `[error ${res.status}] ${errText || 'request failed'}` }
          return copy
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let currentEvent = null
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          // SSE blank line = end of event; reset
          if (line === '') { currentEvent = null; continue }
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
            continue
          }
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (!payload || payload === '[DONE]') continue

          // Hermes tool-progress event — render inline as a styled trace block
          if (currentEvent === 'hermes.tool.progress') {
            try {
              const ev = JSON.parse(payload)
              const emoji = ev.emoji || '🔧'
              const label = ev.label || ev.tool || 'tool'
              const traceLine = '\n' + TOOL_OPEN + emoji + ' ' + label + TOOL_CLOSE + '\n'
              setMessages((m) => {
                const copy = [...m]
                const last = copy[copy.length - 1]
                copy[copy.length - 1] = {
                  ...last,
                  content: (last.content || '') + traceLine,
                }
                return copy
              })
            } catch { /* ignore malformed event */ }
            continue
          }

          // Regular delta.content
          try {
            const j = JSON.parse(payload)
            const delta = j.choices?.[0]?.delta?.content ?? j.choices?.[0]?.message?.content ?? ''
            if (delta) {
              setMessages((m) => {
                const copy = [...m]
                copy[copy.length - 1] = {
                  ...copy[copy.length - 1],
                  role: 'assistant',
                  content: (copy[copy.length - 1].content || '') + delta,
                }
                return copy
              })
            }
          } catch {
            /* ignore non-JSON heartbeats */
          }
        }
      }
    } catch (err) {
      setMessages((m) => {
        const copy = [...m]
        copy[copy.length - 1] = { role: 'assistant', content: `[network error] ${err.message || err}` }
        return copy
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  const reset = () => {
    if (streaming) return
    setMessages([])
    setPending([])
    inputRef.current?.focus()
  }

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col"
      style={{ minHeight: 'calc(100vh - 64px)' }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Vulcan Agent</h1>
          <p className="text-ink-secondary text-sm mt-1 font-mono">
            Ask anything — coding, RE, CTF, drivers, bypasses. Drop files to share.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={reset}
            disabled={streaming}
            className="text-xs font-mono text-ink-muted hover:text-flame-400 transition-colors disabled:opacity-30"
          >
            /reset
          </button>
        )}
      </div>

      {/* Chat window */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto rounded-xl border ${dragOver ? 'border-flame-500 bg-flame-500/5' : 'border-border-soft bg-bg-raised/50'} backdrop-blur-sm p-4 sm:p-6 mb-4 transition-colors`}
      >
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="font-mono text-flame-400 text-lg">drop to attach</div>
          </div>
        )}
        {messages.length === 0 && !dragOver && (
          <div className="h-full flex items-center justify-center text-center">
            <div className="max-w-sm">
              <Bot className="w-10 h-10 mx-auto mb-3 text-flame-500/60" />
              <p className="text-ink-muted text-sm font-mono">
                {user?.username ? `welcome, ${user.username}` : 'authenticated'}. start a conversation, or drop a file.
              </p>
            </div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-5 last:mb-0"
            >
              <div className="flex items-center gap-2 mb-2">
                {m.role === 'user' ? (
                  <User className="w-3.5 h-3.5 text-ink-muted" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-flame-500" />
                )}
                <span className="text-xs font-mono text-ink-muted uppercase tracking-wider">
                  {m.role === 'user' ? (user?.username || 'you') : 'vulcan'}
                </span>
              </div>
              {m.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {m.attachments.map((a, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-bg-overlay border border-border-soft text-xs font-mono text-ink-secondary">
                      {a.contentType?.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      {a.name}
                      <span className="text-ink-muted">({fmtSize(a.size)})</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="text-sm leading-relaxed text-ink-primary">
                {m.content
                  ? renderContent(m.content)
                  : (m.role === 'assistant' && streaming ? (
                      <span className="inline-flex items-center gap-2 text-ink-muted text-xs font-mono">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-flame-500" />
                        thinking…
                      </span>
                    ) : '')}
                {m.role === 'assistant' && streaming && i === messages.length - 1 && m.content && (
                  <span className="inline-block w-2 h-4 ml-1 bg-flame-500/60 animate-pulse align-middle" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pending uploads */}
      {pending.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {pending.map((p, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                p.status === 'error'
                  ? 'bg-flame-900/30 border-flame-700 text-flame-300'
                  : p.status === 'uploading'
                  ? 'bg-bg-overlay border-flame-500/40 text-ink-primary'
                  : p.status === 'done'
                  ? 'bg-bg-overlay border-border-soft text-ink-muted'
                  : 'bg-bg-overlay border-border-soft text-ink-primary'
              }`}
            >
              {isImage(p.file) ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{p.file.name}</span>
              <span className="text-ink-muted">({fmtSize(p.file.size)})</span>
              {p.status === 'uploading' && <Loader2 className="w-3 h-3 animate-spin text-flame-500" />}
              {!streaming && p.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => removeQueued(i)}
                  className="ml-1 text-ink-muted hover:text-flame-400 transition-colors"
                  aria-label="remove"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={send} className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onFileInput}
        />
        <button
          type="button"
          onClick={onPaperclip}
          disabled={streaming}
          title="Attach file"
          className="px-3 py-3 rounded-lg bg-bg-raised border border-border-soft hover:border-flame-500/50 text-ink-secondary hover:text-flame-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={pending.length ? `message vulcan… (${pending.length} file${pending.length === 1 ? '' : 's'} attached)` : 'message vulcan…'}
          disabled={streaming}
          autoFocus
          className="flex-1 px-4 py-3 rounded-lg bg-bg-raised border border-border-soft focus:border-flame-500/50 focus:outline-none focus:ring-1 focus:ring-flame-500/30 text-ink-primary text-sm font-mono placeholder:text-ink-muted transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={streaming || (!input.trim() && pending.length === 0)}
          className="px-4 py-3 rounded-lg bg-gradient-flame text-white font-mono text-sm font-medium shadow-flame hover:shadow-flame-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
        >
          {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">{streaming ? '…' : 'Send'}</span>
        </button>
      </form>
    </div>
  )
}
