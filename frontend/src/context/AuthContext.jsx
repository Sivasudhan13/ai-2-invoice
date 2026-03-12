import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Ensure all organization-related fields are included
    const userWithOrgData = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'personal',
      permissions: userData.permissions || {
        canUpload: true,
        canView: true,
        canEdit: true,
        canDelete: true,
        canManageUsers: false
      },
      organizationId: userData.organizationId || null,
      organizationName: userData.organizationName || null
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithOrgData));
    setUser(userWithOrgData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

