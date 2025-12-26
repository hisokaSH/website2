import { useAuth } from '../App'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Home() {
  const { user, connectAgent } = useAuth()
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [line3, setLine3] = useState('')
  const [line4, setLine4] = useState('')
  
  const text1 = '> INITIALIZING VULCAN BYPASS...'
  const text2 = '> INJECTING SECURITY MODULES...'
  const text3 = '> CLOAKING MEMORY SIGNATURES...'
  const text4 = 'ACCESS GRANTED.'

  useEffect(() => {
    let timeout1, timeout2, timeout3, timeout4
    let i1 = 0, i2 = 0, i3 = 0, i4 = 0

    const type1 = () => {
      if (i1 <= text1.length) {
        setLine1(text1.slice(0, i1))
        i1++
        timeout1 = setTimeout(type1, 30)
      } else {
        timeout2 = setTimeout(type2, 200)
      }
    }

    const type2 = () => {
      if (i2 <= text2.length) {
        setLine2(text2.slice(0, i2))
        i2++
        timeout2 = setTimeout(type2, 30)
      } else {
        timeout3 = setTimeout(type3, 200)
      }
    }

    const type3 = () => {
      if (i3 <= text3.length) {
        setLine3(text3.slice(0, i3))
        i3++
        timeout3 = setTimeout(type3, 30)
      } else {
        timeout4 = setTimeout(type4, 200)
      }
    }

    const type4 = () => {
      if (i4 <= text4.length) {
        setLine4(text4.slice(0, i4))
        i4++
        timeout4 = setTimeout(type4, 30)
      }
    }

    timeout1 = setTimeout(type1, 500)

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearTimeout(timeout3)
      clearTimeout(timeout4)
    }
  }, [])

  const handleConnectAgent = async () => {
    const result = await connectAgent()
    if (!result.success) {
      alert(result.error || 'Failed to connect. Make sure the agent is running.')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Centered */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#1f1f2e] rounded-full mb-8 bg-[#0a0a0f]/30 backdrop-blur-sm">
            <div className="status-dot" />
            <span className="text-xs text-[#888] uppercase tracking-wider">System Status: </span>
            <span className="text-xs text-[#ff4444] uppercase">Operational</span>
          </div>

          {/* Main Heading - With Glitch Effect */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <span 
              className="glitch-text block" 
              data-text="UNLOCK"
            >
              UNLOCK
            </span>
            <span 
              className="glitch-text gradient-text-vulcan block" 
              data-text="POTENTIAL"
            >
              POTENTIAL
            </span>
          </h1>

          {/* Terminal Text - OAZIS Style */}
          <div className="mb-8 font-mono text-sm space-y-0.5 text-left max-w-md mx-auto">
            <div className="text-[#888]">{line1}</div>
            <div className="text-[#888]">{line2}</div>
            <div className="text-[#888]">{line3}</div>
            <div className="text-white font-bold mt-1">{line4}</div>
          </div>

          <p className="text-[#888] mb-10 leading-relaxed max-w-lg mx-auto text-sm">
            The most advanced kernel bypass. Native support for HB, BGX & LS. Hardware-level cloaking with 99.9% uptime.
          </p>

          {/* Status Badges - OAZIS Style Exact */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-[10px] text-[#666] uppercase tracking-widest mb-2">Security</div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#ff4444]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#ff4444] text-sm font-medium">UNDETECTED</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-[#666] uppercase tracking-widest mb-2">Protection</div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#ff4444]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[#ff4444] text-sm font-medium">VULCAN SAFE</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-[#666] uppercase tracking-widest mb-2">Delivery</div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#ff4444]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span className="text-[#ff4444] text-sm font-medium">INSTANT</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/products" 
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-semibold text-sm tracking-wide hover:bg-[#ff4444] transition-colors"
            >
              <span className="text-[#888]">{'>'}</span>
              <span>PURCHASE VULCAN</span>
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className="cyber-btn"
              >
                {'>'} DASHBOARD
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section className="py-20 px-4 border-t border-[#1f1f2e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs text-[#666] uppercase tracking-widest">SYSTEM.ROOT</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="text-[#888]">SYSTEM_ACCESS</span> ARSENAL
            </h2>
            <p className="text-[#666] text-sm font-mono mt-2">// SELECT PACKAGE FOR IMMEDIATE INJECTION</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="cyber-card rounded-lg p-6 relative group bg-[#0a0a0f]/30 backdrop-blur-sm">
              <div className="absolute top-4 right-4 text-4xl font-bold text-[#1f1f2e]" style={{ fontFamily: 'Orbitron, sans-serif' }}>01</div>
              <div className="w-12 h-12 rounded border border-[#ff4444] bg-[#0a0a0f] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#ff4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-white font-bold mb-2">Download Agent</h3>
              <p className="text-[#666] text-sm">Install our secure agent to enable premium features and real-time protection.</p>
            </div>

            {/* Step 2 */}
            <div className="cyber-card rounded-lg p-6 relative group bg-[#0a0a0f]/30 backdrop-blur-sm">
              <div className="absolute top-4 right-4 text-4xl font-bold text-[#1f1f2e]" style={{ fontFamily: 'Orbitron, sans-serif' }}>02</div>
              <div className="w-12 h-12 rounded border border-[#ff4444] bg-[#0a0a0f] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#ff4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-white font-bold mb-2">Connect Agent</h3>
              <p className="text-[#666] text-sm">Click "Connect Agent" to link your account with the desktop application.</p>
            </div>

            {/* Step 3 */}
            <div className="cyber-card rounded-lg p-6 relative group bg-[#0a0a0f]/30 backdrop-blur-sm">
              <div className="absolute top-4 right-4 text-4xl font-bold text-[#1f1f2e]" style={{ fontFamily: 'Orbitron, sans-serif' }}>03</div>
              <div className="w-12 h-12 rounded border border-[#ff4444] bg-[#0a0a0f] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#ff4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-bold mb-2">Launch Product</h3>
              <p className="text-[#666] text-sm">Select your product and click "Start" to begin. That's it!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-[#1f1f2e]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="cyber-card rounded-lg p-8 md:p-12 corner-decoration bg-[#0a0a0f]/30 backdrop-blur-sm">
            <span className="text-xs text-[#666] uppercase tracking-widest">SYSTEM_BREACH_DETECTED</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-4 mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              READY TO <span className="text-[#ff4444] glow-text">DOMINATE</span>?
            </h2>
            <p className="text-[#666] mb-8">
              Join users who have already unlocked their true potential. Undetected. Unstoppable.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/products" 
                className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-semibold text-sm tracking-wide hover:bg-[#ff4444] transition-colors"
              >
                <span className="text-[#888]">{'>'}</span>
                <span>GET ACCESS</span>
              </Link>
              <a href="https://discord.gg/vulcan" className="cyber-btn">
                COMMUNITY
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
