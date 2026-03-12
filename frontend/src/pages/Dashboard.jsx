import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import EnhancedInvoiceOCR from '../components/EnhancedInvoiceOCR';

export default function Dashboard() {
  const { user } = useAuth();

  // Redirect organization admins to their dedicated dashboard
  if (user?.role === 'organization_admin') {
    return <Navigate to="/organization/dashboard" replace />;
  }

  // Redirect suppliers to their supplier dashboard
  if (user?.role === 'supplier') {
    return <Navigate to="/supplier/dashboard" replace />;
  }

  // Redirect mentors to their mentor dashboard
  if (user?.role === 'mentor') {
    return <Navigate to="/mentor/dashboard" replace />;
  }

  // Personal users see the invoice OCR interface
  return <EnhancedInvoiceOCR />;
}
