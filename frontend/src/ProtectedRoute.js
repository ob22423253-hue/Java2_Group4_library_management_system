// src/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  // Not logged in
  if (!user.token) return <Navigate to="/" replace />;

  // Role mismatch (enforce role-based access)
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}
