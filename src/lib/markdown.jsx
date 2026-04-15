/**
 * Minimal inline markdown renderer for forum posts.
 * Supports: paragraphs, **bold**, *italic*, `inline code`, ```code blocks```,
 * > quotes, [links](url), bullet and numbered lists, @mentions.
 * Intentionally tiny — no external dependency.
 */
import { Link } from 'react-router-dom'

const URL_RE  = /(https?:\/\/[^\s<]+)/g
const MENTION_RE = /(^|\s)@([A-Za-z0-9_-]{2,32})/g

function renderInline(text, keyBase) {
  // Escape HTML-sensitive chars first
  let parts = [text]

  // Inline code: `code`
  parts = parts.flatMap((p, i) => {
    if (typeof p !== 'string') return [p]
    const out = []
    let last = 0
    const re = /`([^`]+)`/g
    let m
    while ((m = re.exec(p)) !== null) {
      if (m.index > last) out.push(p.slice(last, m.index))
      out.push(<code key={`${keyBase}-c-${i}-${m.index}`} className="px-1 py-0.5 rounded bg-bg-overlay text-flame-300 text-[0.9em] font-mono">{m[1]}</code>)
      last = m.index + m[0].length
    }
    if (last < p.length) out.push(p.slice(last))
    return out
  })

  // Bold: **text**
  parts = parts.flatMap((p, i) => {
    if (typeof p !== 'string') return [p]
    const out = []
    let last = 0
    const re = /\*\*([^*]+)\*\*/g
    let m
    while ((m = re.exec(p)) !== null) {
      if (m.index > last) out.push(p.slice(last, m.index))
      out.push(<strong key={`${keyBase}-b-${i}-${m.index}`} className="text-white font-semibold">{m[1]}</strong>)
      last = m.index + m[0].length
    }
    if (last < p.length) out.push(p.slice(last))
    return out
  })

  // Italic: *text*
  parts = parts.flatMap((p, i) => {
    if (typeof p !== 'string') return [p]
    const out = []
    let last = 0
    const re = /(^|\s)\*([^*\n]+)\*/g
    let m
    while ((m = re.exec(p)) !== null) {
      if (m.index + m[1].length > last) out.push(p.slice(last, m.index + m[1].length))
      out.push(<em key={`${keyBase}-i-${i}-${m.index}`}>{m[2]}</em>)
      last = m.index + m[0].length
    }
    if (last < p.length) out.push(p.slice(last))
    return out
  })

  // Links: [text](url)
  parts = parts.flatMap((p, i) => {
    if (typeof p !== 'string') return [p]
    const out = []
    let last = 0
    const re = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
    let m
    while ((m = re.exec(p)) !== null) {
      if (m.index > last) out.push(p.slice(last, m.index))
      out.push(
        <a key={`${keyBase}-l-${i}-${m.index}`} href={m[2]} target="_blank" rel="noreferrer" className="text-flame-400 hover:text-flame-300 underline">
          {m[1]}
        </a>
      )
      last = m.index + m[0].length
    }
    if (last < p.length) out.push(p.slice(last))
    return out
  })

  // Bare URLs
  parts = parts.flatMap((p, i) => {
    if (typeof p !== 'string') return [p]
    const out = []
    let last = 0
    URL_RE.lastIndex = 0
    let m
    while ((m = URL_RE.exec(p)) !== null) {
      if (m.index > last) out.push(p.slice(last, m.index))
      out.push(
        <a key={`${keyBase}-u-${i}-${m.index}`} href={m[1]} target="_blank" rel="noreferrer" className="text-flame-400 hover:text-flame-300 underline break-all">
          {m[1]}
        </a>
      )
      last = m.index + m[0].length
    }
    if (last < p.length) out.push(p.slice(last))
    return out
  })

  // @mentions
  parts = parts.flatMap((p, i) => {
    if (typeof p !== 'string') return [p]
    const out = []
    let last = 0
    MENTION_RE.lastIndex = 0
    let m
    while ((m = MENTION_RE.exec(p)) !== null) {
      const prefix = m[1]
      const usernameStart = m.index + prefix.length
      if (usernameStart > last) out.push(p.slice(last, usernameStart))
      out.push(
        <Link
          key={`${keyBase}-m-${i}-${m.index}`}
          to={`/forum/u/${m[2]}`}
          className="text-flame-300 font-medium hover:text-flame-200"
        >
          @{m[2]}
        </Link>
      )
      last = m.index + m[0].length
    }
    if (last < p.length) out.push(p.slice(last))
    return out
  })

  return parts
}

export function Markdown({ text }) {
  if (!text) return null
  const src = String(text)

  // Split into blocks by blank lines / fenced code blocks
  const blocks = []
  const lines = src.split('\n')
  let i = 0
  while (i < lines.length) {
    // Fenced code block
    if (lines[i].trim().startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing fence
      blocks.push({ type: 'code', content: codeLines.join('\n') })
      continue
    }
    // Blockquote (consecutive > lines)
    if (lines[i].trimStart().startsWith('>')) {
      const qLines = []
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        qLines.push(lines[i].trimStart().replace(/^>\s?/, ''))
        i++
      }
      blocks.push({ type: 'quote', content: qLines.join('\n') })
      continue
    }
    // Bullet list
    if (/^\s*[-*]\s+/.test(lines[i])) {
      const items = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }
    // Numbered list
    if (/^\s*\d+\.\s+/.test(lines[i])) {
      const items = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }
    // Paragraph (accumulate until blank line)
    if (lines[i].trim() === '') {
      i++
      continue
    }
    const pLines = []
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].trim().startsWith('```') && !lines[i].trimStart().startsWith('>') && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) {
      pLines.push(lines[i])
      i++
    }
    blocks.push({ type: 'p', content: pLines.join(' ') })
  }

  return (
    <div className="markdown-content space-y-3 text-ink-primary leading-relaxed">
      {blocks.map((b, idx) => {
        if (b.type === 'code') {
          return (
            <pre key={idx} className="bg-bg-overlay border border-border-soft rounded-lg p-3 overflow-x-auto text-sm font-mono text-ink-primary">
              <code>{b.content}</code>
            </pre>
          )
        }
        if (b.type === 'quote') {
          return (
            <blockquote key={idx} className="border-l-2 border-flame-500/60 pl-4 text-ink-secondary italic">
              {renderInline(b.content, `q${idx}`)}
            </blockquote>
          )
        }
        if (b.type === 'ul') {
          return (
            <ul key={idx} className="list-disc list-outside pl-5 space-y-1 marker:text-flame-500">
              {b.items.map((it, j) => <li key={j}>{renderInline(it, `ul${idx}-${j}`)}</li>)}
            </ul>
          )
        }
        if (b.type === 'ol') {
          return (
            <ol key={idx} className="list-decimal list-outside pl-5 space-y-1 marker:text-flame-500">
              {b.items.map((it, j) => <li key={j}>{renderInline(it, `ol${idx}-${j}`)}</li>)}
            </ol>
          )
        }
        return <p key={idx}>{renderInline(b.content, `p${idx}`)}</p>
      })}
    </div>
  )
}
