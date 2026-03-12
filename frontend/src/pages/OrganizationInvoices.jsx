import { useState, useEffect } from 'react';
import OrganizationLayout from '../components/OrganizationLayout';

export default function OrganizationInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ supplierId: '', startDate: '', endDate: '' });

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.supplierId) params.append('supplierId', filters.supplierId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await fetch(`http://localhost:5000/api/organization/invoices?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  if (loading) {
    return (
      <OrganizationLayout>
        <div style={{ padding: 40, textAlign: 'center', color: '#a78bfa' }}>
          Loading invoices...
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout>
      <div style={{ padding: 40, minHeight: '100vh', background: '#0f0f23' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>
            Invoice History
          </h1>
          <p style={{ fontSize: 15, color: '#64748b' }}>
            View all invoices from your suppliers
          </p>
        </div>

        {/* Filters */}
        <div style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.07)',
          borderRadius: 14,
          padding: 24,
          marginBottom: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16
        }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 14
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 14
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => setFilters({ supplierId: '', startDate: '', endDate: '' })}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                color: '#ef4444',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Invoices Grid */}
        <div style={{ display: 'grid', gap: 20 }}>
          {invoices.length === 0 ? (
            <div style={{
              padding: 60,
              textAlign: 'center',
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 14,
              color: '#64748b'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No invoices found</div>
              <div style={{ fontSize: 14 }}>Invoices uploaded by suppliers will appear here</div>
            </div>
          ) : (
            invoices.map((invoice) => (
              <div
                key={invoice.id}
                style={{
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.07)',
                  borderRadius: 14,
                  padding: '24px 28px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.06)';
                  e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
                      {invoice.invoiceNumber || 'N/A'}
                    </div>
                    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
                      Supplier: {invoice.supplier?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', fontFamily: 'monospace' }}>
                      {new Date(invoice.uploadDate).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
                      TOTAL AMOUNT
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#34d399' }}>
                      ₹{(invoice.grandTotal || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                
                {invoice.confidenceScores && Object.keys(invoice.confidenceScores).length > 0 && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(108, 99, 255, 0.1)',
                    border: '1px solid rgba(108, 99, 255, 0.2)',
                    borderRadius: 10,
                    fontSize: 13,
                    color: '#a78bfa',
                    fontFamily: 'monospace'
                  }}>
                    Confidence: {Object.keys(invoice.confidenceScores).length} fields extracted
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </OrganizationLayout>
  );
}
