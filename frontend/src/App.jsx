import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import InvoiceExtractor from './pages/InvoiceExtractor';
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierAnalytics from './pages/SupplierAnalytics';
import OrganizationDashboard from './pages/OrganizationDashboard';
import OrganizationUsers from './pages/OrganizationUsers';
import OrganizationInvoices from './pages/OrganizationInvoices';
import OrganizationAlerts from './pages/OrganizationAlerts';
import OrganizationSettings from './pages/OrganizationSettings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/extractor" element={<InvoiceExtractor />} />

          {/* Personal User Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
          <Route
            path="/supplier/analytics"
            element={
              <PrivateRoute>
                <SupplierAnalytics />
              </PrivateRoute>
            }
          />

          {/* Supplier Routes */}
          <Route
            path="/supplier/dashboard"
            element={
              <PrivateRoute>
                <SupplierDashboard />
              </PrivateRoute>
            }
          />

          {/* Organization Routes */}
          <Route
            path="/organization/dashboard"
            element={
              <PrivateRoute>
                <OrganizationDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/organization/users"
            element={
              <PrivateRoute>
                <OrganizationUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/organization/invoices"
            element={
              <PrivateRoute>
                <OrganizationInvoices />
              </PrivateRoute>
            }
          />
          <Route
            path="/organization/alerts"
            element={
              <PrivateRoute>
                <OrganizationAlerts />
              </PrivateRoute>
            }
          />
          <Route
            path="/organization/settings"
            element={
              <PrivateRoute>
                <OrganizationSettings />
              </PrivateRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/extractor" replace />} />
          
          {/* Catch all - redirect to extractor */}
          <Route path="*" element={<Navigate to="/extractor" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
