import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import OrganizationLayout from '../components/OrganizationLayout';

export default function OrganizationUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [showCreateMentor, setShowCreateMentor] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/organization/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateSupplier = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/organization/supplier', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowCreateSupplier(false);
        setSuccess('Supplier account created successfully!');
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create supplier');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateMentor = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/organization/mentor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowCreateMentor(false);
        setSuccess('Mentor account created successfully!');
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create mentor');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <OrganizationLayout>
        <div style={{ padding: 40, textAlign: 'center', color: '#C9B4E0' }}>
          Loading users...
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout>
      <div style={{ padding: 40, minHeight: '100vh', background: '#F8F2FE' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#242226', marginBottom: 8 }}>
            User Management
          </h1>
          <p style={{ fontSize: 15, color: '#79758C' }}>
            Manage suppliers and mentors in your organization
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '16px 20px',
            background: 'rgba(52, 211, 153, 0.1)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: 12,
            color: '#34d399',
            marginBottom: 24,
            fontWeight: 600
          }}>
            ✓ {success}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          <button
            onClick={() => setShowCreateSupplier(true)}
            style={{
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: 18 }}>➕</span>
            Create Supplier Account
          </button>
          <button
            onClick={() => setShowCreateMentor(true)}
            style={{
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #34d399, #10b981)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: 18 }}>➕</span>
            Create Mentor Account
          </button>
        </div>

        {/* Users Grid */}
        <div style={{ display: 'grid', gap: 20 }}>
          {users.length === 0 ? (
            <div style={{
              padding: 60,
              textAlign: 'center',
              background: 'rgba(255,255,255,.7)',
              border: '1px solid rgba(171,81,242,.15)',
              borderRadius: 14,
              color: '#79758C'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No users yet</div>
              <div style={{ fontSize: 14 }}>Create supplier or mentor accounts to get started</div>
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                style={{
                  background: 'rgba(255,255,255,.7)',
                  border: '1px solid rgba(171,81,242,.15)',
                  borderRadius: 14,
                  padding: '24px 28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.06)';
                  e.currentTarget.style.borderColor = 'rgba(171, 81, 242, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.7)';
                  e.currentTarget.style.borderColor = 'rgba(171,81,242,.15)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: u.role === 'supplier' 
                      ? 'linear-gradient(135deg, #AB51F2, #C9B4E0)' 
                      : 'linear-gradient(135deg, #34d399, #10b981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24
                  }}>
                    {u.role === 'supplier' ? '📦' : '👁️'}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#242226', marginBottom: 6 }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: 14, color: '#79758C', fontFamily: 'monospace', marginBottom: 4 }}>
                      {u.email}
                    </div>
                    <div style={{ fontSize: 12, color: '#79758C' }}>
                      Created: {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    padding: '8px 16px',
                    background: u.role === 'supplier' 
                      ? 'rgba(171, 81, 242, 0.2)' 
                      : 'rgba(52, 211, 153, 0.2)',
                    border: `1px solid ${u.role === 'supplier' 
                      ? 'rgba(171, 81, 242, 0.4)' 
                      : 'rgba(52, 211, 153, 0.4)'}`,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: u.role === 'supplier' ? '#C9B4E0' : '#34d399',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {u.role}
                  </div>
                  <div style={{
                    padding: '8px 16px',
                    background: u.status === 'active' 
                      ? 'rgba(52, 211, 153, 0.1)' 
                      : 'rgba(121, 117, 140, 0.1)',
                    border: `1px solid ${u.status === 'active' 
                      ? 'rgba(52, 211, 153, 0.3)' 
                      : 'rgba(121, 117, 140, 0.3)'}`,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: u.status === 'active' ? '#34d399' : '#79758C'
                  }}>
                    {u.status || 'active'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Supplier Modal */}
        {showCreateSupplier && (
          <CreateUserModal
            title="Create Supplier Account"
            onClose={() => {
              setShowCreateSupplier(false);
              setError(null);
            }}
            onSubmit={handleCreateSupplier}
            error={error}
          />
        )}

        {/* Create Mentor Modal */}
        {showCreateMentor && (
          <CreateUserModal
            title="Create Mentor Account"
            onClose={() => {
              setShowCreateMentor(false);
              setError(null);
            }}
            onSubmit={handleCreateMentor}
            error={error}
          />
        )}
      </div>
    </OrganizationLayout>
  );
}

function CreateUserModal({ title, onClose, onSubmit, error }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.password) {
      setFormError('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Invalid email format');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
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
        background: '#F8F2FE',
        border: '2px solid rgba(171, 81, 242, 0.3)',
        borderRadius: 16,
        padding: '32px',
        maxWidth: 500,
        width: '90%'
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#242226', marginBottom: 24 }}>
          {title}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#79758C', marginBottom: 8, fontWeight: 600 }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(201,180,224,.3)',
                border: '1px solid rgba(171,81,242,.2)',
                borderRadius: 8,
                color: '#242226',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#79758C', marginBottom: 8, fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(201,180,224,.3)',
                border: '1px solid rgba(171,81,242,.2)',
                borderRadius: 8,
                color: '#242226',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#79758C', marginBottom: 8, fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(201,180,224,.3)',
                border: '1px solid rgba(171,81,242,.2)',
                borderRadius: 8,
                color: '#242226',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          {(formError || error) && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              color: '#ef4444',
              fontSize: 13,
              marginBottom: 20
            }}>
              {formError || error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: loading ? 'rgba(171, 81, 242, 0.5)' : 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(201,180,224,.3)',
                border: '1px solid rgba(171,81,242,.2)',
                borderRadius: 8,
                color: '#79758C',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
