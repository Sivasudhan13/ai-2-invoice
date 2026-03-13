import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // Store token and user data
      const { token, ...userData } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect based on role
      if (userData.role === 'supplier') {
        navigate('/supplier/dashboard');
      } else if (userData.role === 'organization_admin') {
        navigate('/organization/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '32px', 
      position: 'relative', 
      zIndex: 10, 
      width: '100%', 
      minHeight: 'calc(100vh - 80px)' 
    }}>
      
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(171, 81, 242, 0.2), rgba(201, 180, 224, 0.2))',
            border: '2px solid rgba(171, 81, 242, 0.3)',
            marginBottom: 24,
            boxShadow: '0 0 30px rgba(171, 81, 242, 0.3)'
          }}>
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#AB51F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
               <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
             </svg>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#242226', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: 14, color: '#79758C', fontWeight: 500 }}>
            Access your intelligent OCR dashboard
          </p>
        </div>

        {/* Main Card */}
        <div className="glass" style={{ borderRadius: 16, padding: 32, boxShadow: '0 20px 60px rgba(171, 81, 242, 0.2)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.5), transparent)', borderRadius: 16, pointerEvents: 'none' }} />
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', zIndex: 10 }} onSubmit={handleLogin}>
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: 14,
                padding: 12,
                borderRadius: 10,
                textAlign: 'center',
                fontWeight: 600,
                animation: 'pulse 2s infinite'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#79758C' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="email"
                    type="email"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: '2px solid rgba(171, 81, 242, 0.2)',
                      borderRadius: 12,
                      padding: '12px 16px',
                      color: '#242226',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#79758C' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type="password"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: '2px solid rgba(171, 81, 242, 0.2)',
                      borderRadius: 12,
                      padding: '12px 16px',
                      color: '#242226',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '14px 16px',
                border: 'none',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#fff',
                overflow: 'hidden',
                boxShadow: '0 0 20px rgba(171, 81, 242, 0.4)',
                transition: 'all 0.2s',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 0 30px rgba(171, 81, 242, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 0 20px rgba(171, 81, 242, 0.4)';
                }
              }}
            >
              {isLoading ? (
                <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Sign In 
                  <span>→</span>
                </span>
              )}
            </button>
          </form>
          
        </div>

        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 14 }}>
           <span style={{ color: '#79758C' }}>Don't have an account? </span>
           <Link to="/signup" style={{ fontWeight: 700, color: '#AB51F2', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 12 }}>
            Create One
          </Link>
        </div>
      </div>
    </div>
  );
}
