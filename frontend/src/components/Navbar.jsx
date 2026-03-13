import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(171, 81, 242, 0.15)',
      padding: '16px 0',
      boxShadow: '0 2px 20px rgba(171, 81, 242, 0.1)'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'glow 2s infinite'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#242226', letterSpacing: '-0.02em' }}>
              InvoiceAI
            </div>
            <div style={{ fontSize: 9, color: '#79758C', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              POWERED BY GEMINI
            </div>
          </div>
        </Link>

        {/* Nav Links */}
        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              to="/dashboard"
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive('/dashboard') ? '#fff' : '#79758C',
                background: isActive('/dashboard') ? 'linear-gradient(135deg, #AB51F2, #C9B4E0)' : 'transparent',
                border: isActive('/dashboard') ? 'none' : '1px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              📊 Dashboard
            </Link>
            <Link
              to="/extractor"
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive('/extractor') ? '#fff' : '#79758C',
                background: isActive('/extractor') ? 'linear-gradient(135deg, #AB51F2, #C9B4E0)' : 'transparent',
                border: isActive('/extractor') ? 'none' : '1px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              🤖 AI Extractor
            </Link>
            <Link
              to="/history"
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive('/history') ? '#fff' : '#79758C',
                background: isActive('/history') ? 'linear-gradient(135deg, #AB51F2, #C9B4E0)' : 'transparent',
                border: isActive('/history') ? 'none' : '1px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              📜 History
            </Link>
          </div>
        )}

        {/* User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated ? (
            <>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(201, 180, 224, 0.3)',
                borderRadius: 8,
                fontSize: 13,
                color: '#3C3867',
                fontWeight: 600
              }}>
                👤 {user?.name}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 8,
                  color: '#ef4444',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: '#79758C',
                  border: '1px solid rgba(171, 81, 242, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: '#fff',
                  border: 'none',
                  transition: 'all 0.2s'
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
