// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
  });

  useEffect(() => {
    // Sync localStorage with state
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUser({ token, role });
    }
  }, []);

  function login(token, role) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setUser({ token, role });
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser({ token: null, role: null });
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
