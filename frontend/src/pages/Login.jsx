import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.data, data.data.token);
      
      // Redirect based on user role
      if (data.data.role === 'organization_admin') {
        navigate('/organization/dashboard');
      } else if (data.data.role === 'supplier') {
        navigate('/supplier/dashboard');
      } else if (data.data.role === 'mentor') {
        navigate('/organization/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      zIndex: 1
    }}>
      <div className="fade-in" style={{
        width: '100%',
        maxWidth: 440,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(171, 81, 242, 0.2)',
        borderRadius: 20,
        padding: '48px 40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(171, 81, 242, 0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 70,
            height: 70,
            background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'glow 2s infinite'
          }}>
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#242226', marginBottom: 8 }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: 14, color: '#79758C' }}>
            Sign in to continue to InvoiceAI
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            color: '#ef4444',
            fontSize: 13,
            marginBottom: 24,
            animation: 'slideIn 0.3s ease'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#79758C',
              marginBottom: 8
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(201, 180, 224, 0.3)',
                border: '1px solid rgba(171, 81, 242, 0.2)',
                borderRadius: 10,
                color: '#242226',
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#AB51F2'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(171, 81, 242, 0.2)'}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#79758C',
              marginBottom: 8
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(201, 180, 224, 0.3)',
                border: '1px solid rgba(171, 81, 242, 0.2)',
                borderRadius: 10,
                color: '#242226',
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#AB51F2'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(171, 81, 242, 0.2)'}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? 'rgba(171, 81, 242, 0.5)' : 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 18,
                  height: 18,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Signing in...
              </>
            ) : (
              '🚀 Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 24,
          textAlign: 'center',
          fontSize: 14,
          color: '#79758C'
        }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{
            color: '#AB51F2',
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
