import { useState, useEffect } from 'react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setHistory(history.filter(item => item._id !== id));
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const viewDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 50, height: 50, border: '4px solid rgba(108,99,255,.2)', borderTopColor: '#AB51F2', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="fade-in" style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#242226', marginBottom: 8 }}>
            📜 Extraction History
          </h1>
          <p style={{ fontSize: 16, color: '#79758C' }}>
            View and manage your processed invoices
          </p>
        </div>

        {history.length === 0 ? (
          <div className="fade-in" style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 20,
            border: '1px solid rgba(171, 81, 242, 0.2)'
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>📭</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#242226', marginBottom: 12 }}>
              No History Yet
            </h3>
            <p style={{ fontSize: 16, color: '#79758C' }}>
              Upload your first invoice to get started
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {history.map((item, index) => (
              <div
                key={item._id}
                className="fade-in"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(171, 81, 242, 0.2)',
                  borderRadius: 16,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  animationDelay: `${index * 0.1}s`
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(171, 81, 242, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => viewDetails(item)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#242226', marginBottom: 4 }}>
                      {item.filename}
                    </div>
                    <div style={{ fontSize: 11, color: '#79758C', fontFamily: 'monospace' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>INVOICE NUMBER</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#C9B4E0' }}>
                    {item.extractedData?.invoice_number || 'N/A'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>TOTAL</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>
                      {item.extractedData?.currency || '₹'}{item.extractedData?.grand_total?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>ITEMS</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>
                      {item.extractedData?.line_items?.length || 0}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 8,
                    color: '#ef4444',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 800,
              maxHeight: '90vh',
              background: '#0a0a1a',
              border: '1px solid rgba(171, 81, 242, 0.3)',
              borderRadius: 20,
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(171, 81, 242, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#242226' }}>
                Invoice Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 36,
                  height: 36,
                  background: 'rgba(171, 81, 242, 0.2)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#79758C',
                  fontSize: 20,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: 24, overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>
              <pre style={{
                fontSize: 13,
                fontFamily: 'monospace',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#242226'
              }}>
                {JSON.stringify(selectedItem.extractedData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
