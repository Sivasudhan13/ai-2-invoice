import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0f0f23'
      }}>
        <div style={{ 
          width: 50, 
          height: 50, 
          border: '4px solid rgba(108,99,255,.2)', 
          borderTopColor: '#6c63ff', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}
