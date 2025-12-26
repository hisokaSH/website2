import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Admin Panel Component
export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Check for saved admin key
  useEffect(() => {
    const savedKey = localStorage.getItem('vulcan_admin_key');
    if (savedKey) {
      setAdminKey(savedKey);
      verifyAdminKey(savedKey);
    }
  }, []);

  const verifyAdminKey = async (key) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_key: key })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('vulcan_admin_key', key);
        loadDashboard(key);
      } else {
        localStorage.removeItem('vulcan_admin_key');
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    verifyAdminKey(adminKey);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminKey('');
    localStorage.removeItem('vulcan_admin_key');
  };

  const apiCall = async (endpoint, method = 'GET', body = null) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey
      }
    };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${API_URL}${endpoint}`, options);
    return res.json();
  };

  const loadDashboard = async (key) => {
    const k = key || adminKey;
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'X-Admin-Key': k }
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    const data = await apiCall(`/api/admin/users?search=${searchQuery}`);
    if (data.success) setUsers(data.users);
    setLoading(false);
  };

  const loadSubscriptions = async () => {
    setLoading(true);
    const data = await apiCall('/api/admin/subscriptions');
    if (data.success) setSubscriptions(data.subscriptions);
    setLoading(false);
  };

  const loadProducts = async () => {
    setLoading(true);
    const data = await apiCall('/api/admin/products');
    if (data.success) setProducts(data.products);
    setLoading(false);
  };

  const loadOrders = async () => {
    setLoading(true);
    const data = await apiCall('/api/admin/orders');
    if (data.success) setOrders(data.orders);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'dashboard') loadDashboard();
      if (activeTab === 'users') loadUsers();
      if (activeTab === 'subscriptions') loadSubscriptions();
      if (activeTab === 'products') loadProducts();
      if (activeTab === 'orders') loadOrders();
    }
  }, [activeTab, isAuthenticated]);

  const showMessage = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#111] border border-[#222] rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">VULCAN ADMIN</h1>
              <p className="text-gray-500 text-sm font-mono">// RESTRICTED_ACCESS</p>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label className="block text-gray-400 text-xs font-mono mb-2">ADMIN_KEY</label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded px-4 py-3 text-white font-mono focus:border-red-500 focus:outline-none"
                  placeholder="Enter admin key..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors"
              >
                AUTHENTICATE
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main Admin Panel
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-[#111] border-b border-[#222] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">VULCAN</h1>
            <span className="text-red-500 font-mono text-sm">// ADMIN_PANEL</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm font-mono"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded z-50"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-50"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['dashboard', 'users', 'subscriptions', 'products', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-mono text-sm rounded transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-red-600 text-white'
                  : 'bg-[#111] text-gray-400 hover:text-white border border-[#222]'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="TOTAL_USERS" value={stats?.total_users || 0} />
            <StatCard title="ACTIVE_SUBS" value={stats?.active_subscriptions || 0} color="green" />
            <StatCard title="PENDING_ORDERS" value={stats?.pending_orders || 0} color="yellow" />
            <StatCard title="PRODUCTS" value={stats?.total_products || 0} color="blue" />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UsersPanel
            users={users}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={loadUsers}
            apiCall={apiCall}
            showMessage={showMessage}
            products={products}
            loadProducts={loadProducts}
            onRefresh={loadUsers}
          />
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <SubscriptionsPanel
            subscriptions={subscriptions}
            loading={loading}
            apiCall={apiCall}
            showMessage={showMessage}
            onRefresh={loadSubscriptions}
          />
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <ProductsPanel
            products={products}
            loading={loading}
            apiCall={apiCall}
            showMessage={showMessage}
            onRefresh={loadProducts}
          />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrdersPanel
            orders={orders}
            loading={loading}
            apiCall={apiCall}
            showMessage={showMessage}
            onRefresh={loadOrders}
          />
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, color = 'red' }) {
  const colors = {
    red: 'text-red-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    blue: 'text-blue-500'
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg p-6">
      <p className="text-gray-500 text-xs font-mono mb-2">// {title}</p>
      <p className={`text-4xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

// Users Panel
function UsersPanel({ users, loading, searchQuery, setSearchQuery, onSearch, apiCall, showMessage, products, loadProducts, onRefresh }) {
  const [showAddSub, setShowAddSub] = useState(null);
  const [subForm, setSubForm] = useState({ product_id: '', days: 30 });

  useEffect(() => {
    if (products.length === 0) loadProducts();
  }, []);

  const handleAddSubscription = async (userId, username) => {
    if (!subForm.product_id) {
      showMessage('Select a product', 'error');
      return;
    }
    
    const data = await apiCall('/api/admin/subscriptions', 'POST', {
      user_identifier: userId,
      product_id: subForm.product_id,
      days: subForm.days
    });
    
    if (data.success) {
      showMessage(`Subscription added for ${username}`);
      setShowAddSub(null);
      setSubForm({ product_id: '', days: 30 });
      onRefresh();
    } else {
      showMessage(data.error, 'error');
    }
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg">
      <div className="p-4 border-b border-[#222] flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder="Search by username, email, or ID..."
          className="flex-1 bg-[#0a0a0a] border border-[#333] rounded px-4 py-2 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
        />
        <button
          onClick={onSearch}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-mono text-sm"
        >
          SEARCH
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0a0a0a]">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">USERNAME</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">EMAIL</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">SUBSCRIPTIONS</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">CREATED</th>
              <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">No users found</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-[#222] hover:bg-[#1a1a1a]">
                  <td className="px-4 py-3 text-white font-mono text-sm">{user.username}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.subscriptions?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.subscriptions.map((sub, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-xs font-mono ${
                              new Date(sub.expires_at) > new Date()
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-red-900/30 text-red-400'
                            }`}
                          >
                            {sub.product_id}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setShowAddSub(showAddSub === user.id ? null : user.id)}
                      className="text-red-500 hover:text-red-400 text-xs font-mono"
                    >
                      + ADD_SUB
                    </button>
                    
                    {showAddSub === user.id && (
                      <div className="mt-2 p-3 bg-[#0a0a0a] rounded border border-[#333]">
                        <select
                          value={subForm.product_id}
                          onChange={(e) => setSubForm({ ...subForm, product_id: e.target.value })}
                          className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 text-white text-sm mb-2"
                        >
                          <option value="">Select product...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                          <option value="vanguard-bypass">Vanguard Bypass</option>
                        </select>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={subForm.days}
                            onChange={(e) => setSubForm({ ...subForm, days: parseInt(e.target.value) })}
                            className="w-20 bg-[#111] border border-[#333] rounded px-2 py-1 text-white text-sm"
                            placeholder="Days"
                          />
                          <button
                            onClick={() => handleAddSubscription(user.id, user.username)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                          >
                            ADD
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Subscriptions Panel
function SubscriptionsPanel({ subscriptions, loading, apiCall, showMessage, onRefresh }) {
  const handleDelete = async (subId) => {
    if (!confirm('Delete this subscription?')) return;
    
    const data = await apiCall(`/api/admin/subscriptions/${subId}`, 'DELETE');
    if (data.success) {
      showMessage('Subscription deleted');
      onRefresh();
    } else {
      showMessage(data.error, 'error');
    }
  };

  const handleExtend = async (subId, days) => {
    const data = await apiCall(`/api/admin/subscriptions/${subId}`, 'PUT', { add_days: days });
    if (data.success) {
      showMessage(`Extended by ${days} days`);
      onRefresh();
    } else {
      showMessage(data.error, 'error');
    }
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#0a0a0a]">
          <tr>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">USER</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">PRODUCT</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">STATUS</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">EXPIRES</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td></tr>
          ) : subscriptions.length === 0 ? (
            <tr><td colSpan="5" className="text-center py-8 text-gray-500">No subscriptions found</td></tr>
          ) : (
            subscriptions.map((sub) => (
              <tr key={sub.id} className="border-t border-[#222] hover:bg-[#1a1a1a]">
                <td className="px-4 py-3">
                  <div className="text-white font-mono text-sm">{sub.username || 'Unknown'}</div>
                  <div className="text-gray-500 font-mono text-xs">{sub.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-300 font-mono text-sm">{sub.product_name || sub.product_id}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    sub.is_active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {sub.is_active ? 'ACTIVE' : 'EXPIRED'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                  {new Date(sub.expires_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExtend(sub.id, 7)}
                      className="text-green-500 hover:text-green-400 text-xs font-mono"
                    >
                      +7D
                    </button>
                    <button
                      onClick={() => handleExtend(sub.id, 30)}
                      className="text-green-500 hover:text-green-400 text-xs font-mono"
                    >
                      +30D
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="text-red-500 hover:text-red-400 text-xs font-mono"
                    >
                      DELETE
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Products Panel
function ProductsPanel({ products, loading, apiCall, showMessage, onRefresh }) {
  const handleUpdateStatus = async (productId, status) => {
    const data = await apiCall(`/api/admin/products/${productId}/status`, 'PUT', { status });
    if (data.success) {
      showMessage(`${productId} status updated to ${status}`);
      onRefresh();
    } else {
      showMessage(data.error, 'error');
    }
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#0a0a0a]">
          <tr>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">PRODUCT</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">CATEGORY</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">STATUS</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">VERSION</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td></tr>
          ) : products.length === 0 ? (
            <tr><td colSpan="5" className="text-center py-8 text-gray-500">No products found</td></tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="border-t border-[#222] hover:bg-[#1a1a1a]">
                <td className="px-4 py-3">
                  <div className="text-white font-mono text-sm">{product.name}</div>
                  <div className="text-gray-500 font-mono text-xs">{product.id}</div>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-sm">{product.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    product.status === 'UNDETECTED' ? 'bg-green-900/30 text-green-400' :
                    product.status === 'UPDATING' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{product.version}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(product.id, 'UNDETECTED')}
                      className="text-green-500 hover:text-green-400 text-xs font-mono"
                    >
                      SET_UD
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(product.id, 'UPDATING')}
                      className="text-yellow-500 hover:text-yellow-400 text-xs font-mono"
                    >
                      SET_UPD
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(product.id, 'DETECTED')}
                      className="text-red-500 hover:text-red-400 text-xs font-mono"
                    >
                      SET_DET
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Orders Panel
function OrdersPanel({ orders, loading, apiCall, showMessage, onRefresh }) {
  const handleApprove = async (orderId) => {
    const data = await apiCall(`/api/admin/orders/${orderId}/approve`, 'POST');
    if (data.success) {
      showMessage('Order approved and subscription created');
      onRefresh();
    } else {
      showMessage(data.error, 'error');
    }
  };

  const handleReject = async (orderId) => {
    if (!confirm('Reject this order?')) return;
    
    const data = await apiCall(`/api/admin/orders/${orderId}/reject`, 'POST');
    if (data.success) {
      showMessage('Order rejected');
      onRefresh();
    } else {
      showMessage(data.error, 'error');
    }
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#0a0a0a]">
          <tr>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">REFERENCE</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">PRODUCT</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">AMOUNT</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">CRYPTO</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">STATUS</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">EMAIL</th>
            <th className="text-left px-4 py-3 text-gray-400 text-xs font-mono">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading...</td></tr>
          ) : orders.length === 0 ? (
            <tr><td colSpan="7" className="text-center py-8 text-gray-500">No orders found</td></tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="border-t border-[#222] hover:bg-[#1a1a1a]">
                <td className="px-4 py-3 text-white font-mono text-sm">{order.reference}</td>
                <td className="px-4 py-3 text-gray-300 font-mono text-sm">{order.product_id}</td>
                <td className="px-4 py-3 text-green-400 font-mono text-sm">${order.total_amount}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{order.crypto_type || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    order.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                    order.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {order.status?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{order.email || '-'}</td>
                <td className="px-4 py-3">
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(order.id)}
                        className="text-green-500 hover:text-green-400 text-xs font-mono"
                      >
                        APPROVE
                      </button>
                      <button
                        onClick={() => handleReject(order.id)}
                        className="text-red-500 hover:text-red-400 text-xs font-mono"
                      >
                        REJECT
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
