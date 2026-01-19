// src/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, isAuthLoading } = useContext(AuthContext);

  console.log('[ProtectedRoute] Check:', { isAuthLoading, hasToken: !!user?.token, userRole: user?.role, requiredRole: role });

  // Wait for auth to load from localStorage before rendering
  if (isAuthLoading) {
    console.log('[ProtectedRoute] Still loading auth...');
    return null; // Return null to prevent rendering while loading
  }

  // Not logged in
  if (!user?.token) {
    console.log('[ProtectedRoute] No token, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Role mismatch (enforce role-based access)
  // Map ADMIN to LIBRARIAN (backend returns ADMIN for librarians)
  const userRole = user.role === 'ADMIN' ? 'LIBRARIAN' : user.role;
  if (role && userRole !== role) {
    console.log('[ProtectedRoute] Role mismatch:', { userRole: userRole, requiredRole: role });
    return <Navigate to="/" replace />;
  }

  console.log('[ProtectedRoute] Access granted');
  return children;
}
