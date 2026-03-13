import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('personal');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(getApiUrl('/api/auth/signup'), { 
        name, 
        email, 
        password, 
        accountType 
      });
      // Use AuthContext login to properly store user data with organization info
      login(res.data.data, res.data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      minHeight: 'calc(100vh - 80px)',
      background: '#F8F2FE',
      position: 'relative'
    }}>
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(171, 81, 242, 0.3); }
          50% { box-shadow: 0 0 40px rgba(171, 81, 242, 0.7); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .signup-input:focus {
          outline: none;
          border-color: rgba(171, 81, 242, 0.5);
          box-shadow: 0 0 0 3px rgba(171, 81, 242, 0.1);
        }
      `}</style>
      
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(171, 81, 242, 0.2), rgba(201, 180, 224, 0.2))',
            border: '2px solid rgba(171, 81, 242, 0.3)',
            marginBottom: 24,
            animation: 'glow 3s infinite'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#AB51F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <h2 style={{
            fontSize: 36,
            fontWeight: 800,
            color: '#242226',
            marginBottom: 12,
            letterSpacing: '-0.02em'
          }}>
            Create Account
          </h2>
          <p style={{
            fontSize: 15,
            color: '#79758C',
            fontWeight: 500
          }}>
            Join to manage your extracted invoices with AI
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(171, 81, 242, 0.2)',
          borderRadius: 20,
          padding: 40,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(201, 180, 224, 0.3), transparent)',
            borderRadius: 20,
            pointerEvents: 'none'
          }} />
          
          <form onSubmit={handleSignup} style={{ position: 'relative', zIndex: 1 }}>
            {error && (
              <div style={{
                padding: '14px 18px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 12,
                color: '#ef4444',
                fontSize: 14,
                textAlign: 'center',
                fontWeight: 600,
                marginBottom: 24,
                animation: 'pulse 2s infinite'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Name Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#79758C',
                  marginBottom: 8
                }}>
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="signup-input"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(201, 180, 224, 0.5)',
                    border: '1px solid rgba(121, 117, 140, 0.3)',
                    borderRadius: 12,
                    color: '#242226',
                    fontSize: 15,
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#79758C',
                  marginBottom: 8
                }}>
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="signup-input"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(201, 180, 224, 0.5)',
                    border: '1px solid rgba(121, 117, 140, 0.3)',
                    borderRadius: 12,
                    color: '#242226',
                    fontSize: 15,
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              {/* Password Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#79758C',
                  marginBottom: 8
                }}>
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="signup-input"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(201, 180, 224, 0.5)',
                    border: '1px solid rgba(121, 117, 140, 0.3)',
                    borderRadius: 12,
                    color: '#242226',
                    fontSize: 15,
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Account Type Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#79758C',
                  marginBottom: 8
                }}>
                  Account Type
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="signup-input"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: 'rgba(201, 180, 224, 0.5)',
                      border: '1px solid rgba(121, 117, 140, 0.3)',
                      borderRadius: 12,
                      color: '#242226',
                      fontSize: 15,
                      fontWeight: 500,
                      cursor: 'pointer',
                      appearance: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <option value="personal" style={{ background: '#1e293b', color: '#242226' }}>
                      Personal - Individual Use
                    </option>
                    <option value="organization" style={{ background: '#1e293b', color: '#242226' }}>
                      Organization - Business Use
                    </option>
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#79758C'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: 28,
                width: '100%',
                padding: '16px 24px',
                background: isLoading ? 'rgba(171, 81, 242, 0.5)' : 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 30px rgba(171, 81, 242, 0.4)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 0 40px rgba(171, 81, 242, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 0 30px rgba(171, 81, 242, 0.4)';
                }
              }}
            >
              {isLoading ? (
                <div style={{
                  width: 20,
                  height: 20,
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '3px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
              ) : (
                <>
                  Create Account
                  <span>→</span>
                </>
              )}
            </button>
          </form>
          
        </div>

        {/* Sign In Link */}
        <div style={{
          marginTop: 32,
          textAlign: 'center',
          fontSize: 14
        }}>
          <span style={{ color: '#79758C' }}>Already have an account? </span>
          <Link to="/login" style={{
            color: '#AB51F2',
            fontWeight: 700,
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: 13,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#C9B4E0'}
          onMouseLeave={(e) => e.target.style.color = '#AB51F2'}
          >
            Sign In
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
