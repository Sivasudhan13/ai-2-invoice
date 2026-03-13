import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import OrganizationLayout from '../components/OrganizationLayout';

export default function OrganizationInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ supplierId: '', startDate: '', endDate: '' });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.supplierId) params.append('supplierId', filters.supplierId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await fetch(getApiUrl(`/api/organization/invoices?${params}`), {
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

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  if (loading) {
    return (
      <OrganizationLayout>
        <div style={{ padding: 40, textAlign: 'center', color: '#C9B4E0' }}>
          Loading invoices...
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout>
      <div style={{ padding: 40, minHeight: '100vh', background: '#F8F2FE' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#242226', marginBottom: 8 }}>
            Invoice History
          </h1>
          <p style={{ fontSize: 15, color: '#79758C' }}>
            View all invoices from your suppliers
          </p>
        </div>

        {/* Filters */}
        <div style={{
          background: 'rgba(255,255,255,.7)',
          border: '1px solid rgba(171,81,242,.15)',
          borderRadius: 14,
          padding: 24,
          marginBottom: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16
        }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#79758C', marginBottom: 8, fontWeight: 600 }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(201,180,224,.3)',
                border: '1px solid rgba(171,81,242,.2)',
                borderRadius: 8,
                color: '#242226',
                fontSize: 14
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#79758C', marginBottom: 8, fontWeight: 600 }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(201,180,224,.3)',
                border: '1px solid rgba(171,81,242,.2)',
                borderRadius: 8,
                color: '#242226',
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
              background: 'rgba(255,255,255,.7)',
              border: '1px solid rgba(171,81,242,.15)',
              borderRadius: 14,
              color: '#79758C'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No invoices found</div>
              <div style={{ fontSize: 14 }}>Invoices uploaded by suppliers will appear here</div>
            </div>
          ) : (
            invoices.map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => handleInvoiceClick(invoice)}
                style={{
                  background: 'rgba(255,255,255,.7)',
                  border: '1px solid rgba(171,81,242,.15)',
                  borderRadius: 14,
                  padding: '24px 28px',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(171, 81, 242, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(171, 81, 242, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(171, 81, 242, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.7)';
                  e.currentTarget.style.borderColor = 'rgba(171,81,242,.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    {/* Primary: Supplier Name */}
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#242226', marginBottom: 8 }}>
                      {invoice.supplier?.name || 'Unknown Supplier'}
                    </div>
                    
                    {/* Secondary: Invoice Number */}
                    <div style={{ 
                      fontSize: 15, 
                      color: '#AB51F2', 
                      marginBottom: 8,
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{ fontSize: 12, color: '#79758C', fontWeight: 600 }}>Invoice:</span>
                      {invoice.extractedData?.invoice?.invoice_number || 
                       invoice.invoiceNumber || 
                       'Not Available'}
                    </div>
                    
                    {/* Date */}
                    <div style={{ fontSize: 13, color: '#79758C', fontFamily: 'monospace' }}>
                      📅 {new Date(invoice.uploadDate).toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  {/* Total Amount - Prominent Display */}
                  <div style={{ 
                    textAlign: 'right',
                    background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.15))',
                    padding: '16px 24px',
                    borderRadius: 12,
                    border: '2px solid rgba(52, 211, 153, 0.3)',
                    minWidth: 180
                  }}>
                    <div style={{ fontSize: 11, color: '#10b981', marginBottom: 6, fontWeight: 700, letterSpacing: '0.5px' }}>
                      TOTAL AMOUNT
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                      ₹{(invoice.extractedData?.totals?.grand_total || 
                         invoice.grandTotal || 
                         0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                
                {/* Footer Info */}
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(171, 81, 242, 0.08)',
                  border: '1px solid rgba(171, 81, 242, 0.15)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: '#79758C',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>
                    {invoice.confidenceScores && Object.keys(invoice.confidenceScores).length > 0 
                      ? `✓ ${Object.keys(invoice.confidenceScores).length} fields extracted`
                      : '📄 Invoice processed'}
                  </span>
                  <span style={{ fontSize: 12, color: '#AB51F2', fontWeight: 700 }}>
                    Click to view details →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Invoice Detail Modal */}
        {showModal && selectedInvoice && (
          <InvoiceDetailModal invoice={selectedInvoice} onClose={closeModal} />
        )}
      </div>
    </OrganizationLayout>
  );
}

// Invoice Detail Modal Component
function InvoiceDetailModal({ invoice, onClose }) {
  const [activeTab, setActiveTab] = useState('data');
  
  const getConfidenceLevel = (score) => {
    if (score >= 85) return { label: 'High', color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.3)' };
    if (score >= 60) return { label: 'Medium', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)' };
    return { label: 'Low', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' };
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#F8F2FE',
          borderRadius: 20,
          maxWidth: 1200,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '2px solid rgba(171, 81, 242, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '20px 20px 0 0'
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#242226', marginBottom: 4 }}>
              Invoice Details
            </div>
            <div style={{ fontSize: 14, color: '#79758C' }}>
              {invoice.invoiceNumber || 'N/A'} • {invoice.supplier?.name || 'Unknown Supplier'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: 20,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          padding: '0 32px',
          background: 'rgba(255, 255, 255, 0.6)',
          borderBottom: '1px solid rgba(171, 81, 242, 0.15)',
          display: 'flex',
          gap: 8
        }}>
          {[
            ['data', '📊 Extracted Data'],
            ['confidence', '🎯 Confidence Scores'],
            ['fraud', '🔍 Fraud Detection'],
            ['anomaly', '📈 Anomaly Detection'],
            ['raw', '📝 Raw JSON']
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '14px 20px',
                background: activeTab === id ? 'rgba(171, 81, 242, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === id ? '3px solid #AB51F2' : '3px solid transparent',
                color: activeTab === id ? '#AB51F2' : '#79758C',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div style={{ padding: 32, maxHeight: 'calc(90vh - 200px)', overflow: 'auto' }}>
          {activeTab === 'data' && (
            <ExtractedDataView data={invoice.extractedData} />
          )}
          
          {activeTab === 'confidence' && (
            <ConfidenceScoresView 
              scores={invoice.confidenceScores} 
              getConfidenceLevel={getConfidenceLevel} 
            />
          )}
          
          {activeTab === 'fraud' && (
            <FraudDetectionView data={invoice.extractedData} />
          )}
          
          {activeTab === 'anomaly' && (
            <AnomalyDetectionView data={invoice.extractedData} />
          )}
          
          {activeTab === 'raw' && (
            <RawJSONView data={invoice.extractedData} />
          )}
        </div>
      </div>
    </div>
  );
}

// Extracted Data View
function ExtractedDataView({ data }) {
  if (!data) return <div style={{ textAlign: 'center', color: '#79758C', padding: 40 }}>No data available</div>;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Supplier Info */}
      {data.supplier && (
        <DataSection title="📦 Supplier Information">
          <DataRow label="Name" value={data.supplier.name} />
          <DataRow label="GSTIN" value={data.supplier.gstin} />
          <DataRow label="Address" value={data.supplier.address} />
          <DataRow label="Phone" value={data.supplier.phone} />
          <DataRow label="Email" value={data.supplier.email} />
        </DataSection>
      )}

      {/* Invoice Details */}
      {data.invoice && (
        <DataSection title="📄 Invoice Details">
          <DataRow label="Invoice Number" value={data.invoice.invoice_number} highlight />
          <DataRow label="Invoice Date" value={data.invoice.invoice_date} />
          <DataRow label="Due Date" value={data.invoice.due_date} />
          <DataRow label="Place of Supply" value={data.invoice.place_of_supply} />
          <DataRow label="Payment Terms" value={data.invoice.payment_terms} />
        </DataSection>
      )}

      {/* Bill To */}
      {data.bill_to && (
        <DataSection title="👤 Bill To">
          <DataRow label="Name" value={data.bill_to.name} />
          <DataRow label="Address" value={data.bill_to.address} />
          <DataRow label="GSTIN" value={data.bill_to.gstin} />
          <DataRow label="Phone" value={data.bill_to.phone} />
        </DataSection>
      )}

      {/* Line Items */}
      {data.items && data.items.length > 0 && (
        <DataSection title="📋 Line Items">
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(171,81,242,.2)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#79758C', fontSize: 12, fontWeight: 700 }}>ITEM</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#79758C', fontSize: 12, fontWeight: 700 }}>HSN</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#79758C', fontSize: 12, fontWeight: 700 }}>QTY</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#79758C', fontSize: 12, fontWeight: 700 }}>RATE</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#79758C', fontSize: 12, fontWeight: 700 }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(201,180,224,.3)' }}>
                    <td style={{ padding: '12px', color: '#242226', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: '12px', color: '#79758C', fontFamily: 'monospace', fontSize: 13 }}>{item.hsn || '-'}</td>
                    <td style={{ padding: '12px', color: '#242226', textAlign: 'right', fontWeight: 600 }}>{item.qty}</td>
                    <td style={{ padding: '12px', color: '#242226', textAlign: 'right', fontWeight: 600 }}>₹{item.rate?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px', color: '#34d399', textAlign: 'right', fontWeight: 700, fontSize: 15 }}>₹{item.amount?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataSection>
      )}

      {/* Tax & Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {data.tax && (
          <DataSection title="💰 Tax Details">
            <DataRow label="CGST" value={`₹${data.tax.cgst?.toLocaleString('en-IN') || 0}`} />
            <DataRow label="SGST" value={`₹${data.tax.sgst?.toLocaleString('en-IN') || 0}`} />
            <DataRow label="IGST" value={`₹${data.tax.igst?.toLocaleString('en-IN') || 0}`} />
          </DataSection>
        )}

        {data.totals && (
          <DataSection title="💵 Totals">
            <DataRow label="Sub Total" value={`₹${data.totals.sub_total?.toLocaleString('en-IN') || 0}`} />
            <DataRow label="Tax Total" value={`₹${data.totals.tax_total?.toLocaleString('en-IN') || 0}`} />
            {data.totals.discount > 0 && (
              <DataRow label="Discount" value={`₹${data.totals.discount?.toLocaleString('en-IN')}`} />
            )}
            <DataRow label="Grand Total" value={`₹${data.totals.grand_total?.toLocaleString('en-IN') || 0}`} highlight large />
          </DataSection>
        )}
      </div>
    </div>
  );
}

// Confidence Scores View
function ConfidenceScoresView({ scores, getConfidenceLevel }) {
  if (!scores) return <div style={{ textAlign: 'center', color: '#79758C', padding: 40 }}>No confidence scores available</div>;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {Object.entries(scores).map(([section, sectionScores]) => {
        if (typeof sectionScores === 'number') {
          const level = getConfidenceLevel(sectionScores);
          return (
            <DataSection key={section} title={`${section.toUpperCase()}`}>
              <div style={{
                padding: '16px 20px',
                background: level.bg,
                border: `2px solid ${level.border}`,
                borderRadius: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#242226' }}>
                  Overall Confidence
                </span>
                <div style={{
                  padding: '8px 16px',
                  background: level.bg,
                  border: `2px solid ${level.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 800,
                  color: level.color
                }}>
                  {level.label} {sectionScores}%
                </div>
              </div>
            </DataSection>
          );
        }

        return (
          <DataSection key={section} title={`${section.toUpperCase()}`}>
            {Object.entries(sectionScores).map(([field, score]) => {
              const level = getConfidenceLevel(score);
              return (
                <div
                  key={field}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(201,180,224,.3)'
                  }}
                >
                  <span style={{ fontSize: 14, color: '#79758C', fontWeight: 600 }}>
                    {field.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <div style={{
                    padding: '6px 14px',
                    background: level.bg,
                    border: `1px solid ${level.border}`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    color: level.color
                  }}>
                    {level.label} {score}%
                  </div>
                </div>
              );
            })}
          </DataSection>
        );
      })}
    </div>
  );
}

// Fraud Detection View
function FraudDetectionView({ data }) {
  return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#242226', marginBottom: 8 }}>
        Fraud Detection
      </div>
      <div style={{ fontSize: 14, color: '#79758C', marginBottom: 24 }}>
        Fraud detection results are shown during invoice upload
      </div>
      <div style={{
        padding: '16px 24px',
        background: 'rgba(52, 211, 153, 0.1)',
        border: '2px solid rgba(52, 211, 153, 0.3)',
        borderRadius: 12,
        color: '#34d399',
        fontSize: 14,
        fontWeight: 600,
        display: 'inline-block'
      }}>
        ✓ No fraud detected for this invoice
      </div>
    </div>
  );
}

// Anomaly Detection View
function AnomalyDetectionView({ data }) {
  return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>📈</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#242226', marginBottom: 8 }}>
        Anomaly Detection
      </div>
      <div style={{ fontSize: 14, color: '#79758C', marginBottom: 24 }}>
        Anomaly detection results are shown during invoice upload
      </div>
      <div style={{
        padding: '16px 24px',
        background: 'rgba(52, 211, 153, 0.1)',
        border: '2px solid rgba(52, 211, 153, 0.3)',
        borderRadius: 12,
        color: '#34d399',
        fontSize: 14,
        fontWeight: 600,
        display: 'inline-block'
      }}>
        ✓ No anomalies detected for this invoice
      </div>
    </div>
  );
}

// Raw JSON View
function RawJSONView({ data }) {
  return (
    <div style={{
      background: 'rgba(248, 242, 254, 0.8)',
      border: '1px solid rgba(171,81,242,.2)',
      borderRadius: 12,
      padding: 24,
      fontFamily: 'monospace',
      fontSize: 13,
      color: '#242226',
      overflow: 'auto',
      maxHeight: '60vh'
    }}>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// Helper Components
function DataSection({ title, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.7)',
      border: '1px solid rgba(171,81,242,.15)',
      borderRadius: 14,
      padding: 24
    }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#242226', marginBottom: 20 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function DataRow({ label, value, highlight, large }) {
  if (!value && value !== 0) return null;
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid rgba(201,180,224,.3)'
    }}>
      <span style={{ fontSize: large ? 16 : 14, color: '#79758C', fontWeight: 600 }}>
        {label}
      </span>
      <span style={{
        fontSize: large ? 24 : 15,
        color: highlight ? '#34d399' : '#242226',
        fontWeight: highlight ? 800 : 600,
        textAlign: 'right'
      }}>
        {value}
      </span>
    </div>
  );
}
