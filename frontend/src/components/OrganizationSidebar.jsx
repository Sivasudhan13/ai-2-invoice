import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OrganizationSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/organization/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/organization/users', icon: '👥', label: 'Users' },
    { path: '/organization/invoices', icon: '📄', label: 'Invoices' },
    { path: '/extractor', icon: '🤖', label: 'AI Extractor' },
    { path: '/organization/alerts', icon: '🔔', label: 'Alerts' },
    { path: '/organization/settings', icon: '⚙️', label: 'Settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      width: 280,
      background: '#3C3867',
      borderRight: '1px solid rgba(171, 81, 242, 0.2)',
      position: 'fixed',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24
          }}>
            🏢
          </div>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#fff'
            }}>
              {user?.organizationName || 'Organization'}
            </div>
            <div style={{
              fontSize: 12,
              color: '#C9B4E0'
            }}>
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '20px 12px',
        overflowY: 'auto'
      }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              marginBottom: 4,
              borderRadius: 10,
              textDecoration: 'none',
              background: isActive(item.path) 
                ? 'linear-gradient(135deg, rgba(171, 81, 242, 0.3), rgba(201, 180, 224, 0.3))'
                : 'transparent',
              border: isActive(item.path)
                ? '1px solid rgba(171, 81, 242, 0.5)'
                : '1px solid transparent',
              color: isActive(item.path) ? '#fff' : '#C9B4E0',
              fontWeight: isActive(item.path) ? 600 : 500,
              fontSize: 14,
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'rgba(171, 81, 242, 0.2)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#C9B4E0';
              }
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 12,
          padding: '12px',
          background: 'rgba(171, 81, 242, 0.2)',
          borderRadius: 10
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 700,
            color: '#fff'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.name}
            </div>
            <div style={{
              fontSize: 12,
              color: '#C9B4E0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            color: '#ef4444',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
