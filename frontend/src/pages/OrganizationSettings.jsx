import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrganizationLayout from '../components/OrganizationLayout';

export default function OrganizationSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <OrganizationLayout>
      <div style={{ padding: 40, minHeight: '100vh', background: '#0f0f23' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>
            Settings
          </h1>
          <p style={{ fontSize: 15, color: '#64748b' }}>
            Manage your organization settings and account
          </p>
        </div>

        <div style={{ display: 'grid', gap: 24, maxWidth: 800 }}>
          {/* Organization Info */}
          <div style={{
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.07)',
            borderRadius: 14,
            padding: 28
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>
              Organization Information
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
                  ORGANIZATION NAME
                </div>
                <div style={{ fontSize: 16, color: '#e2e8f0', fontWeight: 600 }}>
                  {user?.organizationName || 'InvoiceAI Organization'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
                  ORGANIZATION ID
                </div>
                <div style={{ fontSize: 14, color: '#94a3b8', fontFamily: 'monospace' }}>
                  {user?.organizationId || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div style={{
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.07)',
            borderRadius: 14,
            padding: 28
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>
              Account Information
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
                  NAME
                </div>
                <div style={{ fontSize: 16, color: '#e2e8f0', fontWeight: 600 }}>
                  {user?.name || 'Admin User'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
                  EMAIL
                </div>
                <div style={{ fontSize: 14, color: '#94a3b8', fontFamily: 'monospace' }}>
                  {user?.email || 'admin@example.com'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
                  ROLE
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  background: 'rgba(108, 99, 255, 0.2)',
                  border: '1px solid rgba(108, 99, 255, 0.4)',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#a78bfa',
                  textTransform: 'uppercase'
                }}>
                  {user?.role || 'organization_admin'}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div style={{
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.07)',
            borderRadius: 14,
            padding: 28
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>
              Permissions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { key: 'canUpload', label: 'Upload Invoices', icon: '📤' },
                { key: 'canView', label: 'View Data', icon: '👁️' },
                { key: 'canEdit', label: 'Edit Data', icon: '✏️' },
                { key: 'canDelete', label: 'Delete Data', icon: '🗑️' },
                { key: 'canManageUsers', label: 'Manage Users', icon: '👥' }
              ].map((perm) => (
                <div
                  key={perm.key}
                  style={{
                    padding: '12px 16px',
                    background: user?.permissions?.[perm.key] 
                      ? 'rgba(52, 211, 153, 0.1)' 
                      : 'rgba(100, 116, 139, 0.1)',
                    border: `1px solid ${user?.permissions?.[perm.key] 
                      ? 'rgba(52, 211, 153, 0.3)' 
                      : 'rgba(100, 116, 139, 0.3)'}`,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <span style={{ fontSize: 20 }}>{perm.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: 13, 
                      fontWeight: 600, 
                      color: user?.permissions?.[perm.key] ? '#34d399' : '#64748b' 
                    }}>
                      {perm.label}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 18,
                    color: user?.permissions?.[perm.key] ? '#34d399' : '#64748b'
                  }}>
                    {user?.permissions?.[perm.key] ? '✓' : '✗'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '2px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 14,
            padding: 28
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>
              Danger Zone
            </div>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
              Logout from your account. You'll need to login again to access the dashboard.
            </p>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                padding: '14px 28px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 10,
                color: '#ef4444',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: 18 }}>🚪</span>
              Logout from Account
            </button>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
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
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 16,
              padding: '32px',
              maxWidth: 450,
              width: '90%'
            }}>
              <div style={{ fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
                🚪
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 12, textAlign: 'center' }}>
                Logout Confirmation
              </div>
              <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 28, textAlign: 'center' }}>
                Are you sure you want to logout? You'll need to login again to access your dashboard.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(255,255,255,.05)',
                    border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: 10,
                    color: '#94a3b8',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OrganizationLayout>
  );
}
