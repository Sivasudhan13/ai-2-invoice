import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OrganizationAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [showCreateMentor, setShowCreateMentor] = useState(false);
  const [error, setError] = useState(null);

  // Fetch organization users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organization/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organization/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organization/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organization/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchAnalytics(),
        fetchAlerts(),
        fetchInvoices()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Create supplier handler
  const handleCreateSupplier = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organization/supplier', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowCreateSupplier(false);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create supplier');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Create mentor handler
  const handleCreateMentor = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organization/mentor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowCreateMentor(false);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create mentor');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#a78bfa', fontSize: 18, fontWeight: 600 }}>Loading dashboard...</div>
      </div>
    );
  }

  const unreviewed = alerts.filter(a => a.status === 'unreviewed').length;

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f23', fontFamily: 'system-ui, sans-serif', color: '#f1f5f9' }}>
      <style>{`
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(108,99,255,.3)}50%{box-shadow:0 0 40px rgba(108,99,255,.7)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .hov{transition:all .15s;cursor:pointer}
        .hov:hover{opacity:.88;transform:translateY(-1px)}
      `}</style>

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.07)', padding: '20px 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>
              Organization Dashboard
            </div>
            <div style={{ fontSize: 14, color: '#64748b', fontFamily: 'monospace' }}>
              {user?.organizationName || 'Organization Admin'} • {user?.name}
            </div>
          </div>
          
          {/* Alert Badge */}
          {unreviewed > 0 && (
            <div style={{ 
              background: 'rgba(251, 191, 36, 0.1)', 
              border: '2px solid rgba(251, 191, 36, 0.4)', 
              borderRadius: 12, 
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{ fontSize: 24 }}>⚠️</div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ALERTS</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>{unreviewed} Unreviewed</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: 'rgba(255,255,255,.02)', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 4 }}>
          {[
            ['overview', '📊 Overview'],
            ['users', '👥 Users'],
            ['invoices', '📄 Invoices'],
            ['alerts', '⚠️ Alerts']
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '16px 24px',
                background: activeTab === id ? 'rgba(108, 99, 255, 0.2)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === id ? '3px solid #6c63ff' : '3px solid transparent',
                color: activeTab === id ? '#a78bfa' : '#64748b',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        {activeTab === 'overview' && (
          <div>
            {/* Analytics Stats */}
            {analytics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                <StatCard
                  icon="📊"
                  label="Total Invoices"
                  value={analytics.totalInvoices || 0}
                  color="#6c63ff"
                />
                <StatCard
                  icon="💰"
                  label="Total Value"
                  value={`₹${(analytics.totalValue || 0).toLocaleString('en-IN')}`}
                  color="#34d399"
                />
                <StatCard
                  icon="🎯"
                  label="Avg Confidence"
                  value={`${(analytics.avgConfidence || 0).toFixed(1)}%`}
                  color="#a78bfa"
                />
                <StatCard
                  icon="⚠️"
                  label="Low Confidence"
                  value={`${(analytics.lowConfidencePercent || 0).toFixed(1)}%`}
                  color="#fbbf24"
                />
              </div>
            )}

            {/* Quick Actions */}
            <div style={{ 
              background: 'rgba(255,255,255,.04)', 
              border: '1px solid rgba(255,255,255,.07)', 
              borderRadius: 14, 
              padding: 24,
              marginBottom: 32
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#e2e8f0' }}>
                Quick Actions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <button
                  className="hov"
                  onClick={() => setShowCreateSupplier(true)}
                  style={{
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <span style={{ fontSize: 20 }}>➕</span>
                  Create Supplier Account
                </button>
                <button
                  className="hov"
                  onClick={() => setShowCreateMentor(true)}
                  style={{
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <span style={{ fontSize: 20 }}>➕</span>
                  Create Mentor Account
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 32 }}>
              {/* Upload Trend Chart */}
              <div style={{ 
                background: 'rgba(255,255,255,.04)', 
                border: '1px solid rgba(255,255,255,.07)', 
                borderRadius: 14, 
                padding: 24
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#e2e8f0' }}>
                  30-Day Upload Trend
                </div>
                {analytics?.uploadTrend && analytics.uploadTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics.uploadTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b" 
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#1a1a2e', 
                          border: '1px solid rgba(108, 99, 255, 0.3)',
                          borderRadius: 8,
                          color: '#e2e8f0'
                        }}
                        labelStyle={{ color: '#a78bfa', fontWeight: 600 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#6c63ff" 
                        strokeWidth={3}
                        dot={{ fill: '#6c63ff', r: 4 }}
                        activeDot={{ r: 6, fill: '#a78bfa' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    No data available
                  </div>
                )}
              </div>

              {/* Supplier Distribution Chart */}
              <div style={{ 
                background: 'rgba(255,255,255,.04)', 
                border: '1px solid rgba(255,255,255,.07)', 
                borderRadius: 14, 
                padding: 24
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#e2e8f0' }}>
                  Invoice Distribution by Supplier
                </div>
                {analytics?.supplierDistribution && analytics.supplierDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.supplierDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#1a1a2e', 
                          border: '1px solid rgba(52, 211, 153, 0.3)',
                          borderRadius: 8,
                          color: '#e2e8f0'
                        }}
                        labelStyle={{ color: '#34d399', fontWeight: 600 }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#34d399"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Recent Invoices Preview */}
            <div style={{ 
              background: 'rgba(255,255,255,.04)', 
              border: '1px solid rgba(255,255,255,.07)', 
              borderRadius: 14, 
              padding: 24
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#e2e8f0' }}>
                Recent Invoices
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {invoices.slice(0, 5).map((invoice, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,.02)',
                      border: '1px solid rgba(255,255,255,.05)',
                      borderRadius: 10,
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                        {invoice.extractedData?.invoice_number || 'N/A'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                        {invoice.userName || 'Unknown'} • {new Date(invoice.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399' }}>
                      ₹{(invoice.extractedData?.grand_total || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>
                Organization Users ({users.length})
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="hov"
                  onClick={() => setShowCreateSupplier(true)}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ➕ Create Supplier
                </button>
                <button
                  className="hov"
                  onClick={() => setShowCreateMentor(true)}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ➕ Create Mentor
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {users.map((u, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 12,
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: u.role === 'supplier' ? 'linear-gradient(135deg, #6c63ff, #a78bfa)' : 'linear-gradient(135deg, #34d399, #10b981)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20
                    }}>
                      {u.role === 'supplier' ? '📦' : '👁️'}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      padding: '6px 14px',
                      background: u.role === 'supplier' ? 'rgba(108, 99, 255, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                      border: `1px solid ${u.role === 'supplier' ? 'rgba(108, 99, 255, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: u.role === 'supplier' ? '#a78bfa' : '#34d399',
                      textTransform: 'uppercase'
                    }}>
                      {u.role}
                    </div>
                    <div style={{
                      padding: '6px 14px',
                      background: u.status === 'active' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      border: `1px solid ${u.status === 'active' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: u.status === 'active' ? '#34d399' : '#64748b'
                    }}>
                      {u.status || 'active'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 24 }}>
              Invoice History ({invoices.length})
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              {invoices.map((invoice, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 12,
                    padding: '20px 24px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
                        {invoice.extractedData?.invoice_number || 'N/A'}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>
                        Uploaded by: {invoice.userName || 'Unknown'} • {new Date(invoice.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>TOTAL</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399' }}>
                        ₹{(invoice.extractedData?.grand_total || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  {invoice.confidenceScores && (
                    <div style={{ 
                      padding: '10px 14px', 
                      background: 'rgba(108, 99, 255, 0.1)', 
                      border: '1px solid rgba(108, 99, 255, 0.2)', 
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#a78bfa',
                      fontFamily: 'monospace'
                    }}>
                      Confidence: {Object.keys(invoice.confidenceScores).length} fields extracted
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 24 }}>
              Data Quality Alerts ({alerts.length})
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    background: alert.status === 'unreviewed' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,.04)',
                    border: `2px solid ${alert.status === 'unreviewed' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255,255,255,.07)'}`,
                    borderRadius: 12,
                    padding: '20px 24px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <span style={{ fontSize: 24 }}>⚠️</span>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fbbf24' }}>
                          Low Confidence Data Detected
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
                        Invoice: {alert.invoiceNumber || 'N/A'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                        Affected fields: {alert.affectedFields?.join(', ') || 'N/A'}
                      </div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
                        {new Date(alert.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {alert.status === 'unreviewed' && (
                      <button
                        className="hov"
                        onClick={() => handleMarkAlertReviewed(alert._id)}
                        style={{
                          padding: '10px 18px',
                          background: 'linear-gradient(135deg, #34d399, #10b981)',
                          border: 'none',
                          borderRadius: 8,
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Mark Reviewed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Supplier Modal */}
      {showCreateSupplier && (
        <CreateUserModal
          title="Create Supplier Account"
          onClose={() => setShowCreateSupplier(false)}
          onSubmit={handleCreateSupplier}
          error={error}
        />
      )}

      {/* Create Mentor Modal */}
      {showCreateMentor && (
        <CreateUserModal
          title="Create Mentor Account"
          onClose={() => setShowCreateMentor(false)}
          onSubmit={handleCreateMentor}
          error={error}
        />
      )}
    </div>
  );

  // Helper function to mark alert as reviewed
  async function handleMarkAlertReviewed(alertId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/organization/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'reviewed' })
      });
      
      if (response.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error('Error marking alert as reviewed:', err);
    }
  }
}

// StatCard Component
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.04)',
      border: '1px solid rgba(255,255,255,.07)',
      borderRadius: 14,
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        fontSize: 80,
        opacity: 0.1
      }}>
        {icon}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// CreateUserModal Component
function CreateUserModal({ title, onClose, onSubmit, error }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setFormError('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Invalid email format');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#0f0f23',
        border: '2px solid rgba(108, 99, 255, 0.3)',
        borderRadius: 16,
        padding: '32px',
        maxWidth: 500,
        width: '90%'
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 24 }}>
          {title}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          {(formError || error) && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              color: '#ef4444',
              fontSize: 13,
              marginBottom: 20
            }}>
              {formError || error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: loading ? 'rgba(108, 99, 255, 0.5)' : 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 8,
                color: '#94a3b8',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
