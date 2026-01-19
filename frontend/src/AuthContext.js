// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);

  // On mount, restore auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    const savedUser = localStorage.getItem('loggedInUser');
    
    if (savedToken && savedRole) {
      setToken(savedToken);
      setRole(savedRole);
      if (savedUser) {
        try {
          setLoggedInUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse logged in user:', e);
        }
      }
    }
  }, []);

  function login(userInfo, authToken) {
    // userInfo = { id, name, role } or similar
    localStorage.setItem('token', authToken);
    localStorage.setItem('role', userInfo.role || 'STUDENT');
    localStorage.setItem('loggedInUser', JSON.stringify(userInfo));
    
    setToken(authToken);
    setRole(userInfo.role || 'STUDENT');
    setLoggedInUser(userInfo);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('loggedInUser');
    
    setToken(null);
    setRole(null);
    setLoggedInUser(null);
  }

  const user = {
    loggedInUser,
    token,
    role
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
