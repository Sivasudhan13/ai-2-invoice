import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SupplierAnalytics from './SupplierAnalytics';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    avgConfidence: 0,
    recentInvoices: []
  });
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview or analytics

  useEffect(() => {
    fetchSupplierData();
  }, []);

  const fetchSupplierData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsResponse = await fetch(getApiUrl('/api/invoice/supplier/stats'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || {
          totalInvoices: 0,
          totalAmount: 0,
          avgConfidence: 0,
          recentInvoices: []
        });
      }

      // Fetch all invoices for analytics
      const historyResponse = await fetch(getApiUrl('/api/history'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setAllInvoices(historyData.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#C9B4E0', fontSize: 18 }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F2FE' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(248, 242, 254, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(171, 81, 242, 0.15)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24
          }}>
            📦
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#242226' }}>
              Supplier Dashboard
            </div>
            <div style={{ fontSize: 13, color: '#79758C' }}>
              Welcome back, {user?.name}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/organization/settings')}
          style={{
            padding: '12px 24px',
            background: 'rgba(201,180,224,.3)',
            border: '1px solid rgba(171,81,242,.2)',
            borderRadius: 10,
            color: '#79758C',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Settings
        </button>
      </div>

      <div style={{ padding: 40 }}>
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 28px',
              background: activeTab === 'overview' 
                ? 'linear-gradient(135deg, #AB51F2, #C9B4E0)' 
                : 'rgba(255,255,255,.7)',
              border: activeTab === 'overview' 
                ? 'none' 
                : '1px solid rgba(171,81,242,.15)',
              borderRadius: 10,
              color: activeTab === 'overview' ? '#fff' : '#79758C',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '12px 28px',
              background: activeTab === 'analytics' 
                ? 'linear-gradient(135deg, #AB51F2, #C9B4E0)' 
                : 'rgba(255,255,255,.7)',
              border: activeTab === 'analytics' 
                ? 'none' 
                : '1px solid rgba(171,81,242,.15)',
              borderRadius: 10,
              color: activeTab === 'analytics' ? '#fff' : '#79758C',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📈 Analytics & Map
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40 }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(171, 81, 242, 0.1), rgba(201, 180, 224, 0.05))',
                border: '1px solid rgba(171, 81, 242, 0.2)',
                borderRadius: 16,
                padding: 28
              }}>
                <div style={{ fontSize: 13, color: '#79758C', marginBottom: 8, fontWeight: 600 }}>
                  TOTAL INVOICES
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#C9B4E0', marginBottom: 4 }}>
                  {stats.totalInvoices}
                </div>
                <div style={{ fontSize: 12, color: '#79758C' }}>
                  Uploaded invoices
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1), rgba(16, 185, 129, 0.05))',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                borderRadius: 16,
                padding: 28
              }}>
                <div style={{ fontSize: 13, color: '#79758C', marginBottom: 8, fontWeight: 600 }}>
                  TOTAL AMOUNT
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#34d399', marginBottom: 4 }}>
                  ₹{stats.totalAmount.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 12, color: '#79758C' }}>
                  Total invoice value
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: 16,
                padding: 28
              }}>
                <div style={{ fontSize: 13, color: '#79758C', marginBottom: 8, fontWeight: 600 }}>
                  AVG CONFIDENCE
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fbbf24', marginBottom: 4 }}>
                  {stats.avgConfidence}%
                </div>
                <div style={{ fontSize: 12, color: '#79758C' }}>
                  Data extraction quality
                </div>
              </div>
            </div>

            {/* Upload Invoice Button */}
            <div style={{ marginBottom: 40 }}>
              <button
                onClick={() => setUploadModalOpen(true)}
                style={{
                  width: '100%',
                  padding: '24px',
                  background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
                  border: 'none',
                  borderRadius: 16,
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  transition: 'transform 0.2s',
                  boxShadow: '0 10px 40px rgba(171, 81, 242, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: 28 }}>📤</span>
                Upload New Invoice
              </button>
            </div>

            {/* Recent Invoices */}
            <div style={{
              background: 'rgba(255,255,255,.7)',
              border: '1px solid rgba(171,81,242,.15)',
              borderRadius: 16,
              padding: 32
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#242226', marginBottom: 24 }}>
                Recent Invoices
              </div>
              
              {stats.recentInvoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#79758C' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>No invoices yet</div>
                  <div style={{ fontSize: 14, marginTop: 8 }}>Upload your first invoice to get started</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {stats.recentInvoices.map((invoice) => (
                    <div
                      key={invoice._id}
                      style={{
                        background: 'rgba(255,255,255,.7)',
                        border: '1px solid rgba(171,81,242,.15)',
                        borderRadius: 12,
                        padding: '20px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(201,180,224,.3)';
                        e.currentTarget.style.borderColor = 'rgba(171, 81, 242, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,.7)';
                        e.currentTarget.style.borderColor = 'rgba(171,81,242,.15)';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#242226', marginBottom: 6 }}>
                          {invoice.extractedData?.invoice?.invoice_number || 
                           invoice.extractedData?.invoiceNumber || 
                           invoice.extractedData?.invoice_number || 'N/A'}
                        </div>
                        <div style={{ fontSize: 13, color: '#79758C', fontFamily: 'monospace' }}>
                          {new Date(invoice.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>
                        ₹{((invoice.extractedData?.totals?.grand_total || 
                            invoice.extractedData?.grandTotal || 
                            invoice.extractedData?.grand_total || 0)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <SupplierAnalytics invoices={allInvoices} />
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <UploadInvoiceModal
          onClose={() => setUploadModalOpen(false)}
          onSuccess={() => {
            setUploadModalOpen(false);
            fetchSupplierData();
          }}
        />
      )}
    </div>
  );
}

function UploadInvoiceModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('invoice', file);

      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/invoice/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: '#F8F2FE',
        border: '2px solid rgba(171, 81, 242, 0.3)',
        borderRadius: 20,
        padding: 40,
        maxWidth: 600,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#242226', marginBottom: 24, textAlign: 'center' }}>
          📤 Upload Invoice
        </div>

        {/* File Input */}
        <div style={{
          border: '2px dashed rgba(171, 81, 242, 0.3)',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          marginBottom: 24,
          background: 'rgba(171, 81, 242, 0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => document.getElementById('file-input').click()}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(171, 81, 242, 0.5)';
          e.currentTarget.style.background = 'rgba(171, 81, 242, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(171, 81, 242, 0.3)';
          e.currentTarget.style.background = 'rgba(171, 81, 242, 0.05)';
        }}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {preview ? (
            <div>
              <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 12, marginBottom: 16 }} />
              <div style={{ fontSize: 14, color: '#79758C', fontWeight: 600 }}>
                {file.name}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#242226', marginBottom: 8 }}>
                Click to select invoice image
              </div>
              <div style={{ fontSize: 13, color: '#79758C' }}>
                Supports JPG, PNG, JPEG formats
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            padding: '16px 20px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 12,
            color: '#ef4444',
            fontSize: 14,
            marginBottom: 24,
            fontWeight: 600
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              flex: 1,
              padding: '16px',
              background: (!file || uploading) 
                ? 'rgba(171, 81, 242, 0.3)' 
                : 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 16,
              fontWeight: 800,
              cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              if (file && !uploading) e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              if (file && !uploading) e.target.style.transform = 'translateY(0)';
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Invoice'}
          </button>
          <button
            onClick={onClose}
            disabled={uploading}
            style={{
              flex: 1,
              padding: '16px',
              background: 'rgba(201,180,224,.3)',
              border: '1px solid rgba(171,81,242,.2)',
              borderRadius: 12,
              color: '#79758C',
              fontSize: 16,
              fontWeight: 800,
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
