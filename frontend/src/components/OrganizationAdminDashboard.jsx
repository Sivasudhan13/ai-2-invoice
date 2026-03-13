import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import VendorAnalysisPanel from './VendorAnalysisPanel';

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
      const response = await fetch(getApiUrl('/api/organization/users'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/organization/analytics'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data || null);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/organization/alerts'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/organization/invoices'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data || []);
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
    console.log('=== CREATE SUPPLIER FRONTEND ===');
    console.log('Form data:', formData);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const url = getApiUrl('/api/organization/supplier');
      console.log('Request URL:', url);
      console.log('Request body:', JSON.stringify(formData));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Get response text first
      const responseText = await response.text();
      console.log('Response body (raw):', responseText);

      // Check if response is empty
      if (!responseText) {
        console.error('ERROR: Empty response from server');
        setError('Server returned empty response. Check backend logs.');
        return;
      }

      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Response body (parsed):', data);
      } catch (parseError) {
        console.error('ERROR: Failed to parse JSON:', parseError);
        console.error('Raw response:', responseText);
        setError(`Invalid server response: ${responseText.substring(0, 100)}`);
        return;
      }
      
      if (response.ok) {
        console.log('SUCCESS: Supplier created');
        setShowCreateSupplier(false);
        setError(null);
        fetchUsers();
      } else {
        console.error('ERROR: Request failed:', data.error);
        setError(data.error || 'Failed to create supplier');
      }
    } catch (err) {
      console.error('EXCEPTION in handleCreateSupplier:', err);
      console.error('Stack:', err.stack);
      setError(err.message || 'Failed to create supplier');
    }
    
    console.log('=== END CREATE SUPPLIER FRONTEND ===\n');
  };

  // Create mentor handler
  const handleCreateMentor = async (formData) => {
    console.log('=== CREATE MENTOR FRONTEND ===');
    console.log('Form data:', formData);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const url = getApiUrl('/api/organization/mentor');
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Response body (raw):', responseText);

      if (!responseText) {
        console.error('ERROR: Empty response from server');
        setError('Server returned empty response. Check backend logs.');
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Response body (parsed):', data);
      } catch (parseError) {
        console.error('ERROR: Failed to parse JSON:', parseError);
        setError(`Invalid server response: ${responseText.substring(0, 100)}`);
        return;
      }
      
      if (response.ok) {
        console.log('SUCCESS: Mentor created');
        setShowCreateMentor(false);
        setError(null);
        fetchUsers();
      } else {
        console.error('ERROR: Request failed:', data.error);
        setError(data.error || 'Failed to create mentor');
      }
    } catch (err) {
      console.error('EXCEPTION in handleCreateMentor:', err);
      setError(err.message || 'Failed to create mentor');
    }
    
    console.log('=== END CREATE MENTOR FRONTEND ===\n');
  };

  // Delete user handler
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/organization/user/${userId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  // Delete invoice handler
  const handleDeleteInvoice = async (invoiceId) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/organization/invoice/${invoiceId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchInvoices();
        fetchAnalytics(); // Refresh analytics
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete invoice');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete invoice');
    }
  };

  // Delete alert handler
  const handleDeleteAlert = async (alertId) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/organization/alerts/${alertId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchAlerts();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete alert');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete alert');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#AB51F2', fontSize: 18, fontWeight: 600 }}>Loading dashboard...</div>
      </div>
    );
  }

  const unreviewed = alerts.filter(a => a.status === 'unreviewed').length;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F2FE', fontFamily: 'system-ui, sans-serif', color: '#242226' }}>
      <style>{`
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(171,81,242,.3)}50%{box-shadow:0 0 40px rgba(171,81,242,.7)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .hov{transition:all .15s;cursor:pointer}
        .hov:hover{opacity:.88;transform:translateY(-1px)}
      `}</style>

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,.8)', borderBottom: '1px solid rgba(171,81,242,.15)', padding: '20px 32px', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#242226', marginBottom: 4 }}>
              Organization Dashboard
            </div>
            <div style={{ fontSize: 14, color: '#79758C', fontFamily: 'monospace' }}>
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
                <div style={{ fontSize: 11, color: '#79758C', fontWeight: 600 }}>ALERTS</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>{unreviewed} Unreviewed</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: 'rgba(255,255,255,.6)', borderBottom: '1px solid rgba(171,81,242,.1)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 4 }}>
          {[
            ['overview', '📊 Overview'],
            ['vendors', '🏢 Unusual Vendors'],
            ['users', '👥 Users'],
            ['invoices', '📄 Invoices'],
            ['alerts', '⚠️ Alerts']
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '16px 24px',
                background: activeTab === id ? 'rgba(171, 81, 242, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === id ? '3px solid #AB51F2' : '3px solid transparent',
                color: activeTab === id ? '#AB51F2' : '#79758C',
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
                  color="#AB51F2"
                />
                <StatCard
                  icon="💰"
                  label="Total Value"
                  value={`₹${(analytics.totalValue || 0).toLocaleString('en-IN')}`}
                  color="#10b981"
                />
                <StatCard
                  icon="🎯"
                  label="Avg Confidence"
                  value={`${(analytics.avgConfidence || 0).toFixed(1)}%`}
                  color="#3C3867"
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
              background: 'rgba(255,255,255,.7)', 
              border: '1px solid rgba(171,81,242,.15)', 
              borderRadius: 14, 
              padding: 24,
              marginBottom: 32
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#242226' }}>
                Quick Actions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <button
                  className="hov"
                  onClick={() => setShowCreateSupplier(true)}
                  style={{
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
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
                    background: 'linear-gradient(135deg, #C9B4E0, #3C3867)',
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
                background: 'rgba(255,255,255,.7)', 
                border: '1px solid rgba(171,81,242,.15)', 
                borderRadius: 14, 
                padding: 24
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#242226' }}>
                  30-Day Upload Trend
                </div>
                {analytics?.uploadTrend && analytics.uploadTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics.uploadTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(171,81,242,0.15)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#79758C" 
                        tick={{ fill: '#79758C', fontSize: 11 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis stroke="#79758C" tick={{ fill: '#79758C', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '1px solid rgba(171, 81, 242, 0.3)',
                          borderRadius: 8,
                          color: '#242226'
                        }}
                        labelStyle={{ color: '#AB51F2', fontWeight: 600 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#AB51F2" 
                        strokeWidth={3}
                        dot={{ fill: '#AB51F2', r: 4 }}
                        activeDot={{ r: 6, fill: '#C9B4E0' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#79758C' }}>
                    No data available
                  </div>
                )}
              </div>

              {/* Supplier Distribution Chart */}
              <div style={{ 
                background: 'rgba(255,255,255,.7)', 
                border: '1px solid rgba(171,81,242,.15)', 
                borderRadius: 14, 
                padding: 24
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#242226' }}>
                  Invoice Distribution by Supplier
                </div>
                {analytics?.supplierDistribution && analytics.supplierDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.supplierDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(171,81,242,0.15)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#79758C" 
                        tick={{ fill: '#79758C', fontSize: 11 }}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis stroke="#79758C" tick={{ fill: '#79758C', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '1px solid rgba(52, 211, 153, 0.3)',
                          borderRadius: 8,
                          color: '#242226'
                        }}
                        labelStyle={{ color: '#10b981', fontWeight: 600 }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#10b981"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#79758C' }}>
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Additional Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 32 }}>
              {/* Vendor Risk Distribution */}
              <div style={{ 
                background: 'rgba(255,255,255,.7)', 
                border: '1px solid rgba(171,81,242,.15)', 
                borderRadius: 14, 
                padding: 24
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#242226' }}>
                  Vendor Risk Distribution
                </div>
                {analytics?.vendorAnalysis && analytics.vendorAnalysis.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { risk: 'High', count: analytics.vendorAnalysis.filter(v => v.riskLevel === 'high').length },
                      { risk: 'Medium', count: analytics.vendorAnalysis.filter(v => v.riskLevel === 'medium').length },
                      { risk: 'Low', count: analytics.vendorAnalysis.filter(v => v.riskLevel === 'low').length }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(171,81,242,0.15)" />
                      <XAxis dataKey="risk" stroke="#79758C" tick={{ fill: '#79758C', fontSize: 12 }} />
                      <YAxis stroke="#79758C" tick={{ fill: '#79758C', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '1px solid rgba(171, 81, 242, 0.3)',
                          borderRadius: 8,
                          color: '#242226'
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {[
                          { risk: 'High', count: analytics.vendorAnalysis.filter(v => v.riskLevel === 'high').length },
                          { risk: 'Medium', count: analytics.vendorAnalysis.filter(v => v.riskLevel === 'medium').length },
                          { risk: 'Low', count: analytics.vendorAnalysis.filter(v => v.riskLevel === 'low').length }
                        ].map((entry, index) => (
                          <Bar 
                            key={`cell-${index}`}
                            dataKey="count" 
                            fill={entry.risk === 'High' ? '#ef4444' : entry.risk === 'Medium' ? '#fbbf24' : '#10b981'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#79758C' }}>
                    No vendor data available
                  </div>
                )}
              </div>

              {/* Invoice Value Trend */}
              <div style={{ 
                background: 'rgba(255,255,255,.7)', 
                border: '1px solid rgba(171,81,242,.15)', 
                borderRadius: 14, 
                padding: 24
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#242226' }}>
                  Top 5 Vendors by Invoice Count
                </div>
                {analytics?.supplierDistribution && analytics.supplierDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart 
                      data={analytics.supplierDistribution.slice(0, 5).sort((a, b) => b.count - a.count)}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(171,81,242,0.15)" />
                      <XAxis type="number" stroke="#79758C" tick={{ fill: '#79758C', fontSize: 11 }} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#79758C" 
                        tick={{ fill: '#79758C', fontSize: 11 }}
                        width={100}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '1px solid rgba(171, 81, 242, 0.3)',
                          borderRadius: 8,
                          color: '#242226'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#AB51F2"
                        radius={[0, 8, 8, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#79758C' }}>
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Analysis */}
            {analytics?.vendorAnalysis && analytics.vendorAnalysis.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <VendorAnalysisPanel vendorAnalysis={analytics.vendorAnalysis} />
              </div>
            )}

            {/* Recent Invoices Preview */}
            <div style={{ 
              background: 'rgba(255,255,255,.7)', 
              border: '1px solid rgba(171,81,242,.15)', 
              borderRadius: 14, 
              padding: 24
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#242226' }}>
                Recent Invoices
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {invoices.slice(0, 5).map((invoice, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,.02)',
                      border: '1px solid rgba(201,180,224,.3)',
                      borderRadius: 10,
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#242226', marginBottom: 4 }}>
                        {invoice.invoiceNumber || invoice.extractedData?.invoice?.invoice_number || invoice.extractedData?.invoiceNumber || 'N/A'}
                      </div>
                      <div style={{ fontSize: 12, color: '#79758C', fontFamily: 'monospace' }}>
                        {invoice.supplier?.name || invoice.userName || 'Unknown'} • {new Date(invoice.uploadDate || invoice.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399' }}>
                      ₹{(invoice.grandTotal || invoice.extractedData?.totals?.grand_total || invoice.extractedData?.grandTotal || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#242226', marginBottom: 8 }}>
              Unusual Vendor Analysis
            </div>
            <div style={{ fontSize: 14, color: '#79758C', marginBottom: 24 }}>
              Vendors with unusual invoice patterns detected by AI analysis
            </div>

            {analytics?.vendorAnalysis && analytics.vendorAnalysis.length > 0 ? (
              <div style={{ display: 'grid', gap: 20 }}>
                {analytics.vendorAnalysis
                  .filter(v => v.unusualCount > 0)
                  .sort((a, b) => b.unusualCount - a.unusualCount)
                  .map((vendor, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,.7)',
                      border: `2px solid ${
                        vendor.riskLevel === 'high' 
                          ? 'rgba(239, 68, 68, 0.4)' 
                          : vendor.riskLevel === 'medium' 
                          ? 'rgba(251, 191, 36, 0.4)' 
                          : 'rgba(52, 211, 153, 0.4)'
                      }`,
                      borderRadius: 14,
                      padding: '24px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Risk Badge */}
                    <div style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      padding: '8px 16px',
                      background: vendor.riskLevel === 'high' 
                        ? 'rgba(239, 68, 68, 0.2)' 
                        : vendor.riskLevel === 'medium' 
                        ? 'rgba(251, 191, 36, 0.2)' 
                        : 'rgba(52, 211, 153, 0.2)',
                      border: `2px solid ${
                        vendor.riskLevel === 'high' 
                          ? 'rgba(239, 68, 68, 0.5)' 
                          : vendor.riskLevel === 'medium' 
                          ? 'rgba(251, 191, 36, 0.5)' 
                          : 'rgba(52, 211, 153, 0.5)'
                      }`,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: vendor.riskLevel === 'high' 
                        ? '#ef4444' 
                        : vendor.riskLevel === 'medium' 
                        ? '#fbbf24' 
                        : '#10b981'
                    }}>
                      {vendor.riskLevel} Risk
                    </div>

                    {/* Vendor Header */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#242226', marginBottom: 8 }}>
                        {vendor.vendorName}
                      </div>
                      <div style={{ fontSize: 14, color: '#79758C', fontFamily: 'monospace' }}>
                        {vendor.totalInvoices} total invoices • {vendor.unusualCount} unusual detected
                      </div>
                    </div>

                    {/* Statistics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                      <div style={{
                        background: 'rgba(171, 81, 242, 0.1)',
                        border: '1px solid rgba(171, 81, 242, 0.2)',
                        borderRadius: 10,
                        padding: '12px 16px'
                      }}>
                        <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4, fontWeight: 600 }}>AVG AMOUNT</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#AB51F2' }}>
                          ₹{vendor.avgAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 10,
                        padding: '12px 16px'
                      }}>
                        <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4, fontWeight: 600 }}>MAX AMOUNT</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#ef4444' }}>
                          ₹{vendor.maxAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(52, 211, 153, 0.1)',
                        border: '1px solid rgba(52, 211, 153, 0.2)',
                        borderRadius: 10,
                        padding: '12px 16px'
                      }}>
                        <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4, fontWeight: 600 }}>MIN AMOUNT</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>
                          ₹{vendor.minAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.2)',
                        borderRadius: 10,
                        padding: '12px 16px'
                      }}>
                        <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4, fontWeight: 600 }}>FREQUENCY</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>
                          {vendor.invoicesPerMonth}/mo
                        </div>
                      </div>
                    </div>

                    {/* Unusual Invoices List */}
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '2px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: 12,
                      padding: '16px 20px'
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#242226', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>⚠️</span>
                        Unusual Invoices Detected
                      </div>
                      <div style={{ display: 'grid', gap: 10 }}>
                        {vendor.unusualInvoices.map((invoice, invIdx) => (
                          <div
                            key={invIdx}
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              borderRadius: 8,
                              padding: '12px 16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#242226', marginBottom: 4 }}>
                                ₹{invoice.amount.toLocaleString('en-IN')}
                              </div>
                              <div style={{ fontSize: 12, color: '#79758C', fontFamily: 'monospace' }}>
                                {new Date(invoice.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div style={{
                              padding: '6px 12px',
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 700,
                              color: '#ef4444'
                            }}>
                              +{invoice.deviationPercent}% above avg
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                      <button
                        onClick={() => {
                          setActiveTab('invoices');
                          // Could filter by vendor here
                        }}
                        style={{
                          flex: 1,
                          padding: '12px 20px',
                          background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
                          border: 'none',
                          borderRadius: 10,
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        📄 View All Invoices
                      </button>
                      <button
                        onClick={() => {
                          alert(`Vendor Analysis:\n\nTotal Invoices: ${vendor.totalInvoices}\nAverage: ₹${vendor.avgAmount.toLocaleString('en-IN')}\nStd Dev: ₹${vendor.stdDeviation.toLocaleString('en-IN')}\n\nThis vendor has ${vendor.unusualCount} invoices that deviate significantly from their normal pattern.`);
                        }}
                        style={{
                          padding: '12px 20px',
                          background: 'rgba(171, 81, 242, 0.1)',
                          border: '2px solid rgba(171, 81, 242, 0.3)',
                          borderRadius: 10,
                          color: '#AB51F2',
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        📊 View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,.7)',
                border: '1px solid rgba(171,81,242,.15)',
                borderRadius: 14,
                padding: 60,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#242226', marginBottom: 8 }}>
                  No Unusual Patterns Detected
                </div>
                <div style={{ fontSize: 14, color: '#79758C' }}>
                  All vendors are operating within normal invoice patterns
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#242226' }}>
                Organization Users ({users.length})
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="hov"
                  onClick={() => setShowCreateSupplier(true)}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
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
                    background: 'linear-gradient(135deg, #C9B4E0, #C9B4E0)',
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
                    background: 'rgba(255,255,255,.7)',
                    border: '1px solid rgba(171,81,242,.15)',
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
                      background: u.role === 'supplier' ? 'linear-gradient(135deg, #AB51F2, #C9B4E0)' : 'linear-gradient(135deg, #34d399, #10b981)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20
                    }}>
                      {u.role === 'supplier' ? '📦' : '👁️'}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#242226', marginBottom: 4 }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: 13, color: '#79758C', fontFamily: 'monospace' }}>
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      padding: '6px 14px',
                      background: u.role === 'supplier' ? 'rgba(171, 81, 242, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                      border: `1px solid ${u.role === 'supplier' ? 'rgba(171, 81, 242, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: u.role === 'supplier' ? '#C9B4E0' : '#34d399',
                      textTransform: 'uppercase'
                    }}>
                      {u.role}
                    </div>
                    <div style={{
                      padding: '6px 14px',
                      background: u.status === 'active' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(121, 117, 140, 0.1)',
                      border: `1px solid ${u.status === 'active' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(121, 117, 140, 0.3)'}`,
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: u.status === 'active' ? '#34d399' : '#79758C'
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
            <div style={{ fontSize: 22, fontWeight: 700, color: '#242226', marginBottom: 24 }}>
              Invoice History ({invoices.length})
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              {invoices.map((invoice, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,.7)',
                    border: '1px solid rgba(171,81,242,.15)',
                    borderRadius: 12,
                    padding: '20px 24px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#242226', marginBottom: 6 }}>
                        {invoice.invoiceNumber || invoice.extractedData?.invoice?.invoice_number || invoice.extractedData?.invoiceNumber || 'N/A'}
                      </div>
                      <div style={{ fontSize: 13, color: '#79758C', fontFamily: 'monospace' }}>
                        Uploaded by: {invoice.supplier?.name || invoice.userName || 'Unknown'} • {new Date(invoice.uploadDate || invoice.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>TOTAL</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399' }}>
                        ₹{(invoice.grandTotal || invoice.extractedData?.totals?.grand_total || invoice.extractedData?.grandTotal || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  {invoice.confidenceScores && (
                    <div style={{ 
                      padding: '10px 14px', 
                      background: 'rgba(171, 81, 242, 0.1)', 
                      border: '1px solid rgba(171, 81, 242, 0.2)', 
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#C9B4E0',
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
            <div style={{ fontSize: 22, fontWeight: 700, color: '#242226', marginBottom: 24 }}>
              Data Quality Alerts ({alerts.length})
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    background: alert.status === 'unreviewed' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,.7)',
                    border: `2px solid ${alert.status === 'unreviewed' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(171,81,242,.15)'}`,
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
                      <div style={{ fontSize: 13, color: '#79758C', marginBottom: 8 }}>
                        Invoice: {alert.invoiceNumber || 'N/A'}
                      </div>
                      <div style={{ fontSize: 12, color: '#79758C', fontFamily: 'monospace' }}>
                        Affected fields: {alert.affectedFields?.join(', ') || 'N/A'}
                      </div>
                      <div style={{ fontSize: 11, color: '#79758C', marginTop: 6 }}>
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
      background: 'rgba(255,255,255,.7)',
      border: '1px solid rgba(171,81,242,.15)',
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
        <div style={{ fontSize: 12, color: '#79758C', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        border: '2px solid rgba(171, 81, 242, 0.3)',
        borderRadius: 16,
        padding: '32px',
        maxWidth: 500,
        width: '90%'
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#242226', marginBottom: 24 }}>
          {title}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#79758C', marginBottom: 8, fontWeight: 600 }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(201,180,224,.2)',
                border: '1px solid rgba(171,81,242,.2)',
                borderRadius: 8,
                color: '#242226',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#79758C', marginBottom: 8, fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(201,180,224,.2)',
                border: '1px solid rgba(171,81,242,.2)',
                borderRadius: 8,
                color: '#242226',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#79758C', marginBottom: 8, fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(201,180,224,.2)',
                border: '1px solid rgba(171,81,242,.2)',
                borderRadius: 8,
                color: '#242226',
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
                background: loading ? 'rgba(171, 81, 242, 0.5)' : 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
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
                background: 'rgba(201,180,224,.3)',
                border: '1px solid rgba(171,81,242,.2)',
                borderRadius: 8,
                color: '#79758C',
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
