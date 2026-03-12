import { useState, useEffect } from 'react';
import OrganizationLayout from '../components/OrganizationLayout';

export default function OrganizationAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unreviewed, reviewed

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/organization/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAsReviewed = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/organization/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchAlerts(); // Refresh alerts
      }
    } catch (err) {
      console.error('Error marking alert as reviewed:', err);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unreviewed') return !alert.reviewed;
    if (filter === 'reviewed') return alert.reviewed;
    return true;
  });

  if (loading) {
    return (
      <OrganizationLayout>
        <div style={{ padding: 40, textAlign: 'center', color: '#a78bfa' }}>
          Loading alerts...
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout>
      <div style={{ padding: 40, minHeight: '100vh', background: '#0f0f23' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>
            Data Quality Alerts
          </h1>
          <p style={{ fontSize: 15, color: '#64748b' }}>
            Review invoices with low confidence scores
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {[
            { key: 'all', label: 'All Alerts', count: alerts.length },
            { key: 'unreviewed', label: 'Unreviewed', count: alerts.filter(a => !a.reviewed).length },
            { key: 'reviewed', label: 'Reviewed', count: alerts.filter(a => a.reviewed).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '12px 24px',
                background: filter === tab.key 
                  ? 'rgba(108, 99, 255, 0.2)' 
                  : 'rgba(255,255,255,.04)',
                border: filter === tab.key 
                  ? '2px solid rgba(108, 99, 255, 0.4)' 
                  : '1px solid rgba(255,255,255,.07)',
                borderRadius: 10,
                color: filter === tab.key ? '#a78bfa' : '#94a3b8',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (filter !== tab.key) {
                  e.target.style.background = 'rgba(255,255,255,.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== tab.key) {
                  e.target.style.background = 'rgba(255,255,255,.04)';
                }
              }}
            >
              {tab.label}
              <span style={{
                padding: '4px 10px',
                background: filter === tab.key 
                  ? 'rgba(108, 99, 255, 0.3)' 
                  : 'rgba(255,255,255,.1)',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 800
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Alerts Grid */}
        <div style={{ display: 'grid', gap: 20 }}>
          {filteredAlerts.length === 0 ? (
            <div style={{
              padding: 60,
              textAlign: 'center',
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 14,
              color: '#64748b'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                {filter === 'all' ? 'No alerts' : `No ${filter} alerts`}
              </div>
              <div style={{ fontSize: 14 }}>
                {filter === 'all' 
                  ? 'All invoices have good confidence scores' 
                  : `No ${filter} alerts at this time`}
              </div>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert._id}
                style={{
                  background: alert.reviewed 
                    ? 'rgba(255,255,255,.02)' 
                    : 'rgba(239, 68, 68, 0.05)',
                  border: alert.reviewed 
                    ? '1px solid rgba(255,255,255,.07)' 
                    : '2px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 14,
                  padding: '24px 28px',
                  transition: 'all 0.2s',
                  opacity: alert.reviewed ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = alert.reviewed 
                    ? 'rgba(255,255,255,.04)' 
                    : 'rgba(239, 68, 68, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = alert.reviewed 
                    ? 'rgba(255,255,255,.02)' 
                    : 'rgba(239, 68, 68, 0.05)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 28 }}>⚠️</div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
                          Low Confidence Score Detected
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>
                          {new Date(alert.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '16px 20px',
                      background: 'rgba(255,255,255,.04)',
                      border: '1px solid rgba(255,255,255,.07)',
                      borderRadius: 10,
                      marginBottom: 16
                    }}>
                      <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12, lineHeight: 1.6 }}>
                        {alert.message}
                      </div>
                      
                      {/* Low Confidence Fields */}
                      {alert.lowConfidenceFields && alert.lowConfidenceFields.length > 0 && (
                        <div>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
                            AFFECTED FIELDS:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {alert.lowConfidenceFields.map((field, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '6px 12px',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: '#ef4444',
                                  fontFamily: 'monospace'
                                }}
                              >
                                {field.field}: {field.score}%
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Invoice Info */}
                    <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#64748b' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>Invoice:</span>{' '}
                        {alert.invoiceId?.extractedData?.invoiceNumber || 'N/A'}
                      </div>
                      <div>
                        <span style={{ fontWeight: 600 }}>Supplier:</span>{' '}
                        {alert.invoiceId?.userId?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div style={{ marginLeft: 24 }}>
                    {!alert.reviewed ? (
                      <button
                        onClick={() => handleMarkAsReviewed(alert._id)}
                        style={{
                          padding: '12px 20px',
                          background: 'linear-gradient(135deg, #34d399, #10b981)',
                          border: 'none',
                          borderRadius: 10,
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        ✓ Mark as Reviewed
                      </button>
                    ) : (
                      <div style={{
                        padding: '12px 20px',
                        background: 'rgba(52, 211, 153, 0.1)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        borderRadius: 10,
                        color: '#34d399',
                        fontSize: 13,
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}>
                        ✓ Reviewed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </OrganizationLayout>
  );
}
