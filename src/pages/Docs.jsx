import { useState, useEffect, useRef } from 'react'
import {
  BookOpen,
  Download,
  Rocket,
  Bug,
  HelpCircle,
  Key,
  ShieldAlert,
  Wrench,
  Monitor,
  Terminal,
} from 'lucide-react'

// ─── Docs content as structured JS so we don't need a markdown renderer ───
const SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    children: [
      { id: 'installation', title: 'Installation', icon: Download },
      { id: 'first-launch', title: 'First Launch', icon: Monitor },
      { id: 'redeem-license', title: 'Redeem a License', icon: Key },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: Wrench,
    children: [
      { id: 'loader-wont-start', title: "Loader won't start", icon: Bug },
      { id: 'driver-errors', title: 'Driver / mapping errors', icon: ShieldAlert },
      { id: 'antivirus-blocks', title: 'Antivirus blocks the loader', icon: ShieldAlert },
      { id: 'console-output', title: 'Reading console output', icon: Terminal },
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: HelpCircle,
    children: [
      { id: 'supported-windows', title: 'Supported Windows versions', icon: HelpCircle },
      { id: 'refund-policy', title: 'Refund policy', icon: HelpCircle },
      { id: 'bug-reports', title: 'How to report bugs', icon: Bug },
    ],
  },
]

// Flat list for "next/prev" navigation and id lookups
const FLAT = SECTIONS.flatMap(s => s.children.map(c => ({ ...c, parent: s.id })))

export default function Docs() {
  const [active, setActive] = useState('installation')
  const contentRef = useRef(null)

  // Deep-linking via URL hash
  useEffect(() => {
    const fromHash = window.location.hash.replace('#', '')
    if (fromHash && FLAT.some(f => f.id === fromHash)) {
      setActive(fromHash)
    }
  }, [])

  useEffect(() => {
    if (active) {
      window.history.replaceState(null, '', `#${active}`)
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [active])

  const currentIndex = FLAT.findIndex(f => f.id === active)
  const prev = currentIndex > 0 ? FLAT[currentIndex - 1] : null
  const next = currentIndex < FLAT.length - 1 ? FLAT[currentIndex + 1] : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-flame-600/10 border border-flame-600/25 flex items-center justify-center text-flame-400">
          <BookOpen size={20} />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-white leading-tight">Documentation</h1>
          <p className="text-sm text-ink-secondary">Installation, troubleshooting, and FAQ</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="space-y-6">
            {SECTIONS.map(section => {
              const SectionIcon = section.icon
              return (
                <div key={section.id}>
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    <SectionIcon size={14} />
                    {section.title}
                  </div>
                  <ul className="space-y-0.5">
                    {section.children.map(item => {
                      const Icon = item.icon
                      const isActive = active === item.id
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => setActive(item.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                              isActive
                                ? 'bg-flame-600/10 text-white border-l-2 border-flame-500'
                                : 'text-ink-secondary hover:text-white hover:bg-bg-overlay'
                            }`}
                          >
                            <Icon size={14} className="flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </nav>
        </aside>

        {/* ── Main content ────────────────────────────────────── */}
        <main ref={contentRef} className="min-w-0">
          <article className="card p-6 sm:p-10 prose-docs">
            {renderSection(active)}
          </article>

          {/* Prev / Next */}
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {prev ? (
              <button
                onClick={() => setActive(prev.id)}
                className="card card-hover p-4 text-left"
              >
                <div className="text-xs text-ink-muted mb-1">← Previous</div>
                <div className="text-white font-medium">{prev.title}</div>
              </button>
            ) : <div />}
            {next ? (
              <button
                onClick={() => setActive(next.id)}
                className="card card-hover p-4 text-right"
              >
                <div className="text-xs text-ink-muted mb-1">Next →</div>
                <div className="text-white font-medium">{next.title}</div>
              </button>
            ) : <div />}
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── Small presentational helpers ───────────────────────────────────
function H1({ children }) {
  return <h1 className="font-display text-3xl font-bold text-white mb-4">{children}</h1>
}
function H2({ children }) {
  return <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">{children}</h2>
}
function P({ children }) {
  return <p className="text-ink-secondary leading-relaxed mb-4">{children}</p>
}
function UL({ children }) {
  return <ul className="list-disc list-outside pl-5 text-ink-secondary space-y-1 mb-4 marker:text-flame-500">{children}</ul>
}
function Code({ children }) {
  return <code className="px-1.5 py-0.5 rounded bg-bg-overlay text-flame-300 text-[0.9em] font-mono">{children}</code>
}
function Pre({ children }) {
  return (
    <pre className="bg-bg-overlay border border-border-soft rounded-lg p-4 overflow-x-auto text-sm font-mono text-ink-primary mb-4">
      <code>{children}</code>
    </pre>
  )
}
function Callout({ kind = 'info', children }) {
  const styles = {
    info:  'border-sky-500/30 bg-sky-500/5 text-sky-100',
    warn:  'border-amber-500/30 bg-amber-500/5 text-amber-100',
    error: 'border-rose-500/30 bg-rose-500/5 text-rose-100',
  }[kind]
  return (
    <div className={`border rounded-lg p-4 mb-4 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  )
}

// ─── Content ─────────────────────────────────────────────────────────
function renderSection(id) {
  switch (id) {
    case 'installation':
      return (
        <>
          <H1>Installation</H1>
          <P>Vulcan ships as a single installer. Download, run, and log in with your account.</P>

          <H2>Requirements</H2>
          <UL>
            <li>Windows 10 (22H2) or Windows 11 — 64-bit only</li>
            <li>~200 MB of free disk space</li>
            <li>Administrator rights (for driver mapping)</li>
            <li>Stable internet connection (mandatory — loaders are downloaded at launch)</li>
          </UL>

          <H2>Steps</H2>
          <P>1. Join the <a className="text-flame-400 hover:text-flame-300 underline" href="https://discord.gg/vulcansolutions" target="_blank" rel="noreferrer">Discord server</a> and open a ticket to receive your license key.</P>
          <P>2. Download the installer from your dashboard after purchase.</P>
          <P>3. Run <Code>Vulcan-Solutions-Setup.exe</Code> and follow the installer.</P>
          <P>4. Open Vulcan, sign in with your account, redeem your key, and click the product you want to launch.</P>

          <Callout kind="warn">
            If Windows SmartScreen blocks the installer, click <b>More info</b> → <b>Run anyway</b>. The installer is unsigned by design to avoid cert revocation attacks.
          </Callout>
        </>
      )

    case 'first-launch':
      return (
        <>
          <H1>First Launch</H1>
          <P>The first time you start Vulcan, it will check your system and show a status panel.</P>

          <H2>System checks</H2>
          <UL>
            <li><b>Defender</b> — should be disabled or the loaders folder excluded</li>
            <li><b>TPM</b> — can stay on, we do not use it</li>
            <li><b>Memory Integrity (HVCI)</b> — must be off for kernel-mode products</li>
            <li><b>Secure Boot</b> — must be off for kernel-mode products</li>
            <li><b>Anti-Cheat</b> — Vanguard must not be running before mapping</li>
          </UL>

          <Callout kind="info">
            You can leave TPM and Secure Boot enabled for user-mode only products (Roblox, checkers). Kernel-mode products require both off.
          </Callout>
        </>
      )

    case 'redeem-license':
      return (
        <>
          <H1>Redeem a License</H1>
          <P>Licenses arrive as a 16-character key in your Discord DMs after purchase.</P>

          <H2>From the loader</H2>
          <UL>
            <li>Open Vulcan and log in</li>
            <li>Go to <b>Dashboard → Redeem Key</b></li>
            <li>Paste the key and click <b>Redeem</b></li>
            <li>Your product will immediately appear under Active Subscriptions</li>
          </UL>

          <H2>From Discord</H2>
          <P>In our Discord server, run <Code>/redeem key:&lt;your-key&gt;</Code>. The bot will link the license to your Discord account, which is then used to authorize the loader.</P>

          <Callout kind="warn">
            You must link Discord to your Vulcan account <b>before</b> redeeming. Dashboard → Settings → Link Discord.
          </Callout>
        </>
      )

    case 'loader-wont-start':
      return (
        <>
          <H1>Loader won't start</H1>
          <P>The most common reasons the Vulcan loader fails to open:</P>

          <H2>Nothing happens on double-click</H2>
          <UL>
            <li>Right-click the exe → <b>Run as administrator</b></li>
            <li>Check Task Manager — if you see a crashed <Code>Vulcan.exe</Code> process, kill it and try again</li>
            <li>Your antivirus may have quarantined it: see <i>Antivirus blocks the loader</i></li>
          </UL>

          <H2>UAC prompt appears, I click Yes, but nothing opens</H2>
          <UL>
            <li>A previous instance is still holding a handle. Reboot and try again.</li>
            <li>Windows Defender SmartScreen may be silently blocking execution. Disable SmartScreen for unknown apps.</li>
          </UL>

          <H2>Error: "Session expired"</H2>
          <P>Your JWT token has expired. Log out and log back in — the new token will authorize the download.</P>
        </>
      )

    case 'driver-errors':
      return (
        <>
          <H1>Driver / mapping errors</H1>
          <P>Kernel-mode products load a driver module during startup. Common errors and fixes:</P>

          <H2><Code>Module load failed (0xc0000034)</Code></H2>
          <P>The loader couldn't register its kernel module. Either:</P>
          <UL>
            <li>Windows 11 Vulnerable Driver Blocklist is enabled — turn it off at <b>Windows Security → Device security → Core isolation → Microsoft Vulnerable Driver Blocklist</b>, then reboot</li>
            <li>Windows Defender quarantined the module the moment it was dropped — add a Defender exclusion for <Code>%LOCALAPPDATA%\\Temp</Code> or disable real-time protection during loading</li>
          </UL>

          <H2><Code>Failed to load driver image</Code></H2>
          <P>Usually means Secure Boot or HVCI is still enabled. Both must be off. Also verify Vanguard / BattlEye is not already running — they prevent further driver loads.</P>

          <H2>Blue screen after loading</H2>
          <P>Your Windows build is newer than what our module targets. Update Vulcan to the latest version from the dashboard, or wait for the next release.</P>
        </>
      )

    case 'antivirus-blocks':
      return (
        <>
          <H1>Antivirus blocks the loader</H1>
          <P>Security products flag cheat and research software as malicious. This is expected and does not mean the loader is actually malware — it's heuristic detection of techniques (driver mapping, process injection, etc.) that legitimate software rarely uses.</P>

          <H2>Windows Defender</H2>
          <P>Add an exclusion for the loader folder:</P>
          <Pre>{`Windows Security
  → Virus & threat protection
  → Manage settings
  → Exclusions → Add folder
    → %LOCALAPPDATA%\\Temp
    → %APPDATA%\\vulcan-solutions`}</Pre>

          <H2>Third-party AV (Kaspersky, Avast, Malwarebytes, etc.)</H2>
          <P>Whitelist the <Code>vulcan-solutions</Code> folder under %APPDATA%. Alternatively uninstall the third-party AV — they are strictly worse than Defender and interfere far more aggressively.</P>

          <Callout kind="error">
            Do not disable your AV system-wide unless you know what you are doing. An exclusion for the loader folder is sufficient.
          </Callout>
        </>
      )

    case 'console-output':
      return (
        <>
          <H1>Reading console output</H1>
          <P>Newer Vulcan builds hide their console for a cleaner UX. If you need to see diagnostic output (during a bug report), use the debug build.</P>

          <H2>Where to find logs</H2>
          <UL>
            <li><Code>%APPDATA%\\vulcan-solutions\\logs\\latest.log</Code> — loader logs</li>
          </UL>

          <H2>Attaching logs to a bug report</H2>
          <P>Open a ticket in Discord, attach <Code>latest.log</Code>, and include: your Windows build, the product slug, and the exact steps that reproduced the issue.</P>
        </>
      )

    case 'supported-windows':
      return (
        <>
          <H1>Supported Windows versions</H1>
          <UL>
            <li>✅ Windows 10 22H2 (19045) — fully supported</li>
            <li>✅ Windows 11 22H2 / 23H2 / 24H2 — fully supported</li>
            <li>⚠️ Windows 11 Insider builds — may break after each update, we patch within 24h</li>
            <li>❌ Windows 7, 8, 8.1 — not supported, not planned</li>
            <li>❌ Linux, macOS — not supported</li>
          </UL>
        </>
      )

    case 'refund-policy':
      return (
        <>
          <H1>Refund policy</H1>
          <P>Refunds are handled manually through Discord tickets. We generally approve refunds within the first 24 hours of purchase if the loader is undetected and the software works as described, but you were unsatisfied for any reason.</P>
          <P>Refunds are <b>not</b> granted after:</P>
          <UL>
            <li>24 hours have passed since purchase</li>
            <li>You have been banned from the game by anti-cheat (detections happen — no refunds)</li>
            <li>You violated the ToS (sharing, account resale, chargebacks)</li>
          </UL>
        </>
      )

    case 'bug-reports':
      return (
        <>
          <H1>How to report bugs</H1>
          <P>Good bug reports get fixed fast. Bad bug reports get ignored.</P>

          <H2>Include all of these</H2>
          <UL>
            <li>Product slug (e.g. <Code>roblox</Code>, <Code>seven-deadly-sins</Code>)</li>
            <li>Vulcan version (bottom of dashboard)</li>
            <li>Windows edition and build (<Code>winver</Code>)</li>
            <li>Exact error message or screenshot</li>
            <li>Steps to reproduce, in order</li>
            <li><Code>latest.log</Code> attached</li>
          </UL>

          <H2>Where to send it</H2>
          <P>Open a ticket in <a className="text-flame-400 hover:text-flame-300 underline" href="https://discord.gg/vulcansolutions" target="_blank" rel="noreferrer">our Discord</a> under the <b>Support</b> category. Bugs reported in general chat are not tracked.</P>
        </>
      )

    default:
      return <P>Select a topic from the sidebar.</P>
  }
}
