// client/src/components/routing/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && user && user.role === 'admin' ? (
    children
  ) : (
    <Navigate to="/dashboard" />
  );
};

export default AdminRoute;