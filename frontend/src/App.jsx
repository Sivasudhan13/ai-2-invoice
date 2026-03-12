import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import OrganizationDashboard from './pages/OrganizationDashboard';
import OrganizationUsers from './pages/OrganizationUsers';
import OrganizationInvoices from './pages/OrganizationInvoices';
import OrganizationAlerts from './pages/OrganizationAlerts';
import OrganizationSettings from './pages/OrganizationSettings';
import SupplierDashboard from './pages/SupplierDashboard';
import InvoiceExtractor from './pages/InvoiceExtractor';
import History from './pages/History';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isOrganizationRoute = location.pathname.startsWith('/organization');
  const isSupplierRoute = location.pathname.startsWith('/supplier');
  const isExtractorRoute = location.pathname === '/extractor';

  return (
    <div className="app-container">
      {!isOrganizationRoute && !isSupplierRoute && !isExtractorRoute && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/extractor" element={<InvoiceExtractor />} />
        <Route path="/organization/dashboard" element={<PrivateRoute><OrganizationDashboard /></PrivateRoute>} />
        <Route path="/organization/users" element={<PrivateRoute><OrganizationUsers /></PrivateRoute>} />
        <Route path="/organization/invoices" element={<PrivateRoute><OrganizationInvoices /></PrivateRoute>} />
        <Route path="/organization/alerts" element={<PrivateRoute><OrganizationAlerts /></PrivateRoute>} />
        <Route path="/organization/settings" element={<PrivateRoute><OrganizationSettings /></PrivateRoute>} />
        <Route path="/supplier/dashboard" element={<PrivateRoute><SupplierDashboard /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/extractor" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
