import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import StudentForm from './components/Student/StudentForm';
import StudentLogin from './components/Student/StudentLogin';
import StudentDashboard from './components/Student/StudentDashboard';

import LibrarianLogin from './components/Librarian/LibrarianLogin';
import LibrarianRegister from './components/Librarian/LibrarianRegister';
import LibrarianDashboard from './components/Librarian/LibrarianDashboard';

import EntryForm from './components/LibraryEntry/EntryForm';

import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

/* ---------------- HOME PAGE ---------------- */
function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2.5em', color: '#333', marginBottom: '10px' }}>
          📚 University Library System
        </h1>
        <p style={{ fontSize: '1.1em', color: '#666', marginBottom: '40px' }}>
          Comprehensive library management for students and staff
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* STUDENT */}
          <div style={{ backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h2>👨‍🎓 Students</h2>
            <p>Login, scan entry/exit, borrow & return books</p>
            <Link to="/student-login" style={btn('#007bff')}>Student Login</Link>
            <Link to="/student-register" style={btn('#28a745')}>Student Register</Link>
          </div>

          {/* LIBRARIAN */}
          <div style={{ backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h2>👨‍💼 Librarians</h2>
            <p>Manage students, books & live library status</p>
            <Link to="/librarian-login" style={btn('#ff9800')}>Librarian Login</Link>
            <Link to="/librarian-register" style={btn('#ff5722')}>Librarian Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MAIN APP ---------------- */
export default function App() {
  useEffect(() => {
    // Fix ResizeObserver errors from QR libs
    const handler = (e) => {
      if (e?.message?.includes('ResizeObserver loop')) {
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/student-register" element={<StudentForm />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/librarian-login" element={<LibrarianLogin />} />
          <Route path="/librarian-register" element={<LibrarianRegister />} />

          {/* STUDENT PROTECTED */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedRoute role="STUDENT">
                <EntryForm />
              </ProtectedRoute>
            }
          />

          {/* LIBRARIAN PROTECTED */}
          <Route
            path="/librarian"
            element={
              <ProtectedRoute role="LIBRARIAN">
                <LibrarianDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

/* ---------------- BUTTON STYLE ---------------- */
function btn(color) {
  return {
    display: 'inline-block',
    backgroundColor: color,
    color: 'white',
    padding: '12px 25px',
    margin: '10px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold'
  };
}
