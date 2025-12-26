import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true
    return p.category?.toLowerCase() === filter.toLowerCase()
  })

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[#1f1f2e] border-t-[#ff4444] rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-[#ff4444] font-mono text-sm">LOADING_STORE...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs text-[#666] uppercase tracking-widest">STORE.CATALOG</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <span className="text-[#888]">VULCAN</span> <span className="text-[#ff4444]">STORE</span>
          </h1>
          <p className="text-[#666] text-sm font-mono">
            // BROWSE AVAILABLE PACKAGES...<br/>
            {'>'}&gt; SELECT A PRODUCT TO VIEW DETAILS
          </p>
        </div>

        {/* Filters */}
        {categories.length > 1 && (
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
                  filter === cat
                    ? 'bg-[#ff4444] text-[#0a0a0f] border border-[#ff4444]'
                    : 'bg-transparent text-[#888] border border-[#1f1f2e] hover:border-[#ff4444] hover:text-[#ff4444]'
                }`}
              >
                {'>'} {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group bg-[#0d0d12] border border-[#1a1a24] rounded-lg overflow-hidden hover:border-[#ff4444]/50 transition-all"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#1a1a24] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-transparent border border-[#333] text-[#666] text-[10px] uppercase tracking-wider">
                    License
                  </span>
                  <span className="text-[10px] text-[#ff4444]">◉ {product.status || 'UNDETECTED'}</span>
                </div>
                <span className="text-[#ff4444] font-bold text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {(() => {
                    if (product.plans && Array.isArray(product.plans) && product.plans.length > 0) {
                      const lowestPrice = Math.min(...product.plans.map(p => p.price || 0));
                      return `$${lowestPrice.toFixed(2)}`;
                    }
                    if (product.price && typeof product.price === 'number') {
                      return `$${product.price.toFixed(2)}`;
                    }
                    return '$0.00';
                  })()}
                  <span className="text-xs text-[#666] font-normal ml-1">+</span>
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#ff4444] transition-colors uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {product.name}
                </h3>
                <p className="text-[#666] text-sm mb-6 line-clamp-2">
                  {product.description || 'Advanced gaming utility with premium features and real-time protection.'}
                </p>

                {/* Features Preview */}
                <div className="space-y-2 mb-6">
                  {product.features?.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[#888]">
                      <span className="text-[#ff4444]">◎</span>
                      <span className="text-xs">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#1a1a24]">
                  {product.category && (
                    <span className="text-xs text-[#888] uppercase tracking-wider">{product.category}</span>
                  )}
                  <span className="text-[#ff4444] text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {'>'} VIEW
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-lg p-8 max-w-md mx-auto">
              <p className="text-[#888] font-mono mb-4">NO_PRODUCTS_AVAILABLE</p>
              <p className="text-[#666] text-sm">No products match your current filter selection.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
