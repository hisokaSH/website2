import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const DISCORD_INVITE = 'https://discord.gg/avWNgmuFuK'

// Crypto icons
const CryptoIcons = {
  BTC: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
    </svg>
  ),
  ETH: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
    </svg>
  ),
  USDT: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">₮</text>
    </svg>
  ),
  XRP: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  LTC: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-4v-2l-2 1-.5-1 2.5-1.5V10H7V8h2V6h2v2h2v2h-2v3l2-1 .5 1-2.5 1.5V17z"/>
    </svg>
  ),
}

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [quantity, setQuantity] = useState(1)
  
  // Modal states
  const [showCart, setShowCart] = useState(false)
  const [showPaymentMethod, setShowPaymentMethod] = useState(false)
  const [showCryptoPayment, setShowCryptoPayment] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  // Payment state
  const [selectedCrypto, setSelectedCrypto] = useState('BTC')
  const [wallets, setWallets] = useState({})
  const [orderReference, setOrderReference] = useState('')
  const [orderLoading, setOrderLoading] = useState(false)

  useEffect(() => {
    fetchProduct()
    fetchWallets()
  }, [id])

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      if (data.success) {
        setProduct(data.product)
        if (data.product.plans && data.product.plans.length > 0) {
          setSelectedPlan(data.product.plans[0])
        }
      }
    } catch (err) {
      console.error('Failed to fetch product:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchWallets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/crypto/wallets`)
      const data = await res.json()
      if (data.success) {
        setWallets(data.wallets)
      }
    } catch (err) {
      console.error('Failed to fetch wallets:', err)
    }
  }

  const handleBuyNow = () => {
    if (!selectedPlan) return
    setShowCart(true)
  }

  const handleCheckout = () => {
    setShowCart(false)
    setShowPaymentMethod(true)
  }

  const handleSelectCrypto = () => {
    setShowPaymentMethod(false)
    setShowCryptoPayment(true)
  }

  const handlePaymentSent = async () => {
    setOrderLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          plan_id: selectedPlan.id,
          quantity: quantity,
          crypto_type: selectedCrypto
        })
      })
      const data = await res.json()
      if (data.success) {
        setOrderReference(data.order.reference)
        
        // Confirm the order
        await fetch(`${API_URL}/api/orders/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: data.order.reference })
        })
        
        setShowCryptoPayment(false)
        setShowConfirmation(true)
      }
    } catch (err) {
      console.error('Order error:', err)
    } finally {
      setOrderLoading(false)
    }
  }

  const totalPrice = selectedPlan ? selectedPlan.price * quantity : 0

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[#1f1f2e] border-t-[#ff4444] rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-[#ff4444] font-mono text-sm">LOADING_PRODUCT...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center cyber-card rounded-lg p-8">
          <p className="text-[#ff4444] font-mono mb-4">PRODUCT_NOT_FOUND</p>
          <Link to="/products" className="text-[#888] hover:text-[#ff4444]">
            {'<'} Return to Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link to="/products" className="inline-flex items-center gap-2 text-[#666] hover:text-[#ff4444] mb-8 transition-colors text-sm">
          {'<-'} BACK_TO_METHODS
        </Link>

        {/* Main Product Card */}
        <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-lg overflow-hidden">
          {/* Header with License badge and Status */}
          <div className="p-6 border-b border-[#1a1a24]">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-transparent border border-[#333] text-[#888] text-xs uppercase tracking-wider">
                LICENSE
              </span>
              <span className="text-xs">
                <span className="text-[#666]">|</span>
                <span className="text-[#666] ml-2">◉</span>
                <span className="text-[#ff4444] ml-1 uppercase tracking-wider">STATUS: {product.status || 'UNDETECTED'}</span>
              </span>
            </div>

            {/* Product Title with Glitch Effect */}
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-wider" 
                style={{ 
                  fontFamily: 'Orbitron, sans-serif',
                  textShadow: '2px 0 #ff4444, -2px 0 #ff00ff'
                }}>
              {product.name} - {selectedPlan?.duration || '30 DAY'} KEY
            </h1>

            {/* Price with Strikethrough */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                ${selectedPlan?.price.toFixed(2) || '0.00'}
              </span>
              {selectedPlan?.original_price && (
                <span className="text-lg text-[#666] line-through">
                  ${selectedPlan.original_price.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-[#666] uppercase tracking-widest ml-auto">
                LICENSE_KEY_DELIVERY
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-[#1a1a24]">
            <div className="border-l-2 border-[#333] pl-4">
              <p className="text-[#888] text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="p-6 border-b border-[#1a1a24]">
            <div className="grid grid-cols-2 gap-4">
              {product.features?.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#0a0a0f] border border-[#1a1a24] rounded">
                  <span className="text-[#ff4444]">◎</span>
                  <span className="text-[#888] text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Selection */}
          {!product.hasAccess && (
            <div className="p-6 border-b border-[#1a1a24]">
              <div className="space-y-3">
                {product.plans?.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 rounded border-2 transition-all flex items-center justify-between ${
                      selectedPlan?.id === plan.id
                        ? 'border-[#ff4444] bg-[#ff4444]/10'
                        : 'border-[#1a1a24] bg-[#0a0a0f] hover:border-[#ff4444]/50'
                    }`}
                  >
                    <div className="text-left">
                      <span className={`font-bold ${selectedPlan?.id === plan.id ? 'text-[#ff4444]' : 'text-white'}`}>
                        {plan.name}
                      </span>
                      {plan.bonus && (
                        <span className="ml-2 text-[#ff4444] text-xs">
                          + {plan.bonus}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        ${plan.price.toFixed(2)}
                      </span>
                      {plan.original_price && (
                        <span className="text-xs text-[#666] line-through ml-2">
                          ${plan.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buy Button */}
          <div className="p-6">
            {product.hasAccess ? (
              <Link
                to="/dashboard"
                className="w-full py-4 bg-[#ff4444] text-[#0a0a0f] font-bold uppercase tracking-wider text-center block hover:bg-[#ff6666] transition-colors"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {'>'} GO TO DASHBOARD
              </Link>
            ) : (
              <>
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 bg-transparent border-2 border-[#333] text-white font-bold uppercase tracking-wider hover:border-[#ff4444] hover:text-[#ff4444] transition-all"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  {'>'} BUY NOW
                </button>
                <p className="text-center text-[#666] text-xs uppercase tracking-widest mt-4">
                  SECURE CHECKOUT // INSTANT DELIVERY
                </p>
              </>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-lg p-4 text-center">
            <span className="text-xs text-[#666] uppercase">Platform</span>
            <p className="text-white mt-1 text-sm">{product.supportedPlatforms}</p>
          </div>
          <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-lg p-4 text-center">
            <span className="text-xs text-[#666] uppercase">Version</span>
            <p className="text-white mt-1 text-sm">{product.version}</p>
          </div>
          <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-lg p-4 text-center">
            <span className="text-xs text-[#666] uppercase">Status</span>
            <p className="text-[#ff4444] mt-1 text-sm">{product.status || 'UNDETECTED'}</p>
          </div>
          <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-lg p-4 text-center">
            <span className="text-xs text-[#666] uppercase">Updates</span>
            <p className="text-white mt-1 text-sm">Automatic</p>
          </div>
        </div>
      </div>

      {/* CART MODAL */}
      {showCart && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-lg w-full max-w-md">
            {/* Header */}
            <div className="p-4 border-b border-[#1a1a24] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#888]">🛒</span>
                <span className="text-white font-mono text-sm uppercase tracking-wider">CART_MODULE</span>
              </div>
              <button onClick={() => setShowCart(false)} className="text-[#666] hover:text-white text-xl">
                ×
              </button>
            </div>

            {/* Cart Item */}
            <div className="p-4">
              <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">{product.name} - {selectedPlan?.duration} Key</h3>
                    <p className="text-[#666] text-xs">License</p>
                  </div>
                  <button className="text-[#666] hover:text-[#ff4444]">🗑</button>
                </div>
                
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#1a1a24] rounded">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-[#666] hover:text-white"
                    >
                      -
                    </button>
                    <span className="text-white px-2">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-[#666] hover:text-white"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-white font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1a1a24]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#666] text-xs uppercase tracking-wider">TOTAL_ESTIMATED</span>
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-[#7c3aed] text-white font-bold uppercase tracking-wider hover:bg-[#6d28d9] transition-colors rounded"
              >
                SECURE_CHECKOUT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT METHOD MODAL */}
      {showPaymentMethod && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-lg w-full max-w-md">
            {/* Header */}
            <div className="p-4 border-b border-[#1a1a24] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#888]">💳</span>
                <span className="text-white font-mono text-sm uppercase tracking-wider">SECURE_CHECKOUT</span>
              </div>
              <button onClick={() => setShowPaymentMethod(false)} className="text-[#666] hover:text-white text-xl">
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-[#666] text-xs uppercase tracking-wider mb-4">
                SELECT_PAYMENT_PROTOCOL //
              </p>
              
              <button
                onClick={handleSelectCrypto}
                className="w-full p-4 bg-[#0a0a0f] border border-[#1a1a24] rounded-lg hover:border-[#f7931a] transition-colors flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-[#f7931a]/20 rounded-full flex items-center justify-center text-[#f7931a]">
                  💰
                </div>
                <div className="text-left">
                  <span className="text-white font-bold block">CRYPTO</span>
                  <span className="text-[#666] text-xs">BTC / ETH / LTC / USDT / XRP...</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRYPTO PAYMENT MODAL */}
      {showCryptoPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-lg w-full max-w-md">
            {/* Header */}
            <div className="p-4 border-b border-[#1a1a24] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#888]">💳</span>
                <span className="text-white font-mono text-sm uppercase tracking-wider">SECURE_CHECKOUT</span>
              </div>
              <button onClick={() => setShowCryptoPayment(false)} className="text-[#666] hover:text-white text-xl">
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Back Button */}
              <button 
                onClick={() => { setShowCryptoPayment(false); setShowPaymentMethod(true); }}
                className="text-[#666] text-xs uppercase tracking-wider hover:text-white mb-4 flex items-center gap-1"
              >
                {'<-'} BACK_TO_METHODS
              </button>

              {/* Total Amount */}
              <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-lg p-4 mb-6 text-center">
                <span className="text-[#666] text-xs uppercase tracking-wider">TOTAL AMOUNT</span>
                <p className="text-3xl font-bold text-white mt-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  ${totalPrice.toFixed(2)}
                </p>
                <span className="text-[#666] text-xs">Reference: {orderReference || 'Generating...'}</span>
              </div>

              {/* Crypto Selection */}
              <div className="flex gap-2 mb-6 flex-wrap justify-center">
                {Object.keys(wallets).map((crypto) => (
                  <button
                    key={crypto}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all flex flex-col items-center min-w-[70px] ${
                      selectedCrypto === crypto
                        ? 'border-[#ff4444] bg-[#ff4444]/10'
                        : 'border-[#1a1a24] bg-[#0a0a0f] hover:border-[#333]'
                    }`}
                  >
                    <span className={selectedCrypto === crypto ? 'text-[#ff4444]' : 'text-[#888]'}>
                      {CryptoIcons[crypto] || '💰'}
                    </span>
                    <span className={`text-xs mt-1 ${selectedCrypto === crypto ? 'text-[#ff4444]' : 'text-[#666]'}`}>
                      {crypto}
                    </span>
                  </button>
                ))}
              </div>

              {/* Wallet Address */}
              <div className="mb-6">
                <label className="text-[#666] text-xs uppercase tracking-wider mb-2 block">
                  {selectedCrypto} DEPOSIT ADDRESS
                </label>
                <div className="flex items-center gap-2 bg-[#0a0a0f] border border-[#1a1a24] rounded p-3">
                  <input
                    type="text"
                    readOnly
                    value={wallets[selectedCrypto] || ''}
                    className="bg-transparent text-white text-sm flex-1 outline-none font-mono"
                  />
                  <button 
                    onClick={() => copyToClipboard(wallets[selectedCrypto])}
                    className="text-[#666] hover:text-[#ff4444]"
                  >
                    📋
                  </button>
                </div>
                <p className="text-[#ff4444] text-xs mt-2">
                  Only send {selectedCrypto} to this address. Sending other coins may result in permanent loss.
                </p>
              </div>

              {/* Payment Sent Button */}
              <button
                onClick={handlePaymentSent}
                disabled={orderLoading}
                className="w-full py-4 bg-transparent border-2 border-[#333] text-white font-bold uppercase tracking-wider hover:border-[#ff4444] hover:text-[#ff4444] transition-all disabled:opacity-50"
              >
                {orderLoading ? 'PROCESSING...' : 'I HAVE SENT THE PAYMENT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-lg w-full max-w-md">
            {/* Header */}
            <div className="p-4 border-b border-[#1a1a24] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#888]">💳</span>
                <span className="text-white font-mono text-sm uppercase tracking-wider">SECURE_CHECKOUT</span>
              </div>
              <button onClick={() => setShowConfirmation(false)} className="text-[#666] hover:text-white text-xl">
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-[#ff4444] flex items-center justify-center">
                <svg className="w-10 h-10 text-[#ff4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                PAYMENT RECORDED
              </h2>
              <p className="text-[#666] mb-6">
                Please proceed to our Discord server to claim your product.
              </p>

              {/* Instructions */}
              <div className="bg-[#1a1a0f] border border-[#333300] rounded-lg p-4 mb-6 text-left">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-[#ffcc00]">⚠</span>
                  <span className="text-[#ffcc00] font-bold text-sm">IMPORTANT NEXT STEPS:</span>
                </div>
                <ul className="text-[#888] text-sm space-y-2 ml-6">
                  <li>• Join our Discord server.</li>
                  <li>• Open a support ticket.</li>
                  <li>• Provide your Order Reference: <span className="text-white font-mono">{orderReference}</span></li>
                  <li>• If you have a <span className="text-[#ff4444]">referral code</span>, please mention it in the ticket!</li>
                </ul>
              </div>

              {/* Discord Button */}
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#5865F2] text-white font-bold uppercase tracking-wider hover:bg-[#4752c4] transition-colors rounded flex items-center justify-center gap-2 mb-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                OPEN DISCORD TICKET
              </a>
              
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-[#666] text-sm hover:text-white"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
