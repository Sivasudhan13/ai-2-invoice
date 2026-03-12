import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OrganizationSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/organization/dashboard', icon: '📊', label: 'Overview', description: 'Analytics & Stats' },
    { path: '/organization/users', icon: '👥', label: 'Users', description: 'Manage Team' },
    { path: '/organization/invoices', icon: '📄', label: 'Invoices', description: 'All Invoices' },
    { path: '/organization/alerts', icon: '⚠️', label: 'Alerts', description: 'Data Quality' },
    { path: '/organization/settings', icon: '⚙️', label: 'Settings', description: 'Organization' }
  ];

  return (
    <div style={{
      width: 280,
      minHeight: '100vh',
      background: 'rgba(15, 15, 35, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.07)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      {/* Logo Section */}
      <div style={{ padding: '0 12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 8
        }}>
          <div style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(108, 99, 255, 0.4)'
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              InvoiceAI
            </div>
            <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              ORGANIZATION
            </div>
          </div>
        </div>
        
        {/* Organization Info */}
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: 'rgba(108, 99, 255, 0.1)',
          border: '1px solid rgba(108, 99, 255, 0.2)',
          borderRadius: 10
        }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Organization
          </div>
          <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 700 }}>
            {user?.organizationName || 'My Organization'}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 10,
              textDecoration: 'none',
              background: isActive(item.path) ? 'rgba(108, 99, 255, 0.15)' : 'transparent',
              border: isActive(item.path) ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
          >
            {isActive(item.path) && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                background: 'linear-gradient(180deg, #6c63ff, #a78bfa)',
                borderRadius: '0 4px 4px 0'
              }} />
            )}
            <div style={{ fontSize: 24, lineHeight: 1 }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: isActive(item.path) ? '#a78bfa' : '#e2e8f0',
                marginBottom: 2
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: 11,
                color: '#64748b',
                fontWeight: 500
              }}>
                {item.description}
              </div>
            </div>
            {isActive(item.path) && (
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#6c63ff',
                boxShadow: '0 0 10px rgba(108, 99, 255, 0.6)'
              }} />
            )}
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div style={{
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #34d399, #10b981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20
          }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>
              {user?.name || 'Admin User'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
              {user?.email || 'admin@example.com'}
            </div>
          </div>
        </div>
        <div style={{
          padding: '6px 12px',
          background: 'rgba(108, 99, 255, 0.15)',
          border: '1px solid rgba(108, 99, 255, 0.3)',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          color: '#a78bfa',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Organization Admin
        </div>
      </div>
    </div>
  );
}
