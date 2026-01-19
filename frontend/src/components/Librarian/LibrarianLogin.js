import React, { useState, useContext } from 'react';
import librarianService from '../../services/librarianService';
import { AuthContext } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LibrarianLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // Call backend login endpoint
      const response = await librarianService.loginLibrarian(form);
      
      console.log('[LibrarianLogin] Full response:', response);
      console.log('[LibrarianLogin] Response type:', typeof response);
      console.log('[LibrarianLogin] Response keys:', Object.keys(response || {}));
      
      // Backend returns AuthResponse: { token, username, role }
      if (!response?.token) {
        console.error('[LibrarianLogin] No token in response:', response);
        throw new Error(response?.message || response?.error || 'Login failed - no token');
      }

      // Save to AuthContext with user info
      // Normalize role: backend returns 'ROLE_LIBRARIAN', frontend expects 'LIBRARIAN'
      const normalizedRole = response.role?.replace('ROLE_', '') || 'LIBRARIAN';
      const userInfo = {
        id: response.username || 'unknown',
        username: response.username || 'unknown',
        role: normalizedRole,
      };
      
      console.log('[LibrarianLogin] Logging in with:', { response, normalizedRole, userInfo });
      console.log('[LibrarianLogin] Calling login function');
      login(userInfo, response.token);
      console.log('[LibrarianLogin] Login complete, state should be updated');
      console.log('[LibrarianLogin] localStorage check:', { 
        token: !!localStorage.getItem('token'),
        role: localStorage.getItem('role'),
        user: !!localStorage.getItem('loggedInUser')
      });
      setMessage({ type: 'success', text: 'Login successful' });
      
      console.log('[LibrarianLogin] Navigating to /librarian');
      // Redirect immediately - AuthContext updates synchronously
      navigate('/librarian');
    } catch (err) {
      console.error('[LibrarianLogin] Error:', err);
      setMessage({ type: 'error', text: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: '40px auto' }}>
      <h2>Librarian Login</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>Username</label><br />
          <input 
            name="username" 
            value={form.username} 
            onChange={onChange} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Password</label><br />
          <input 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={onChange} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <button 
            disabled={loading} 
            type="submit"
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#ff9800', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
      {message && (
        <div style={{ 
          marginTop: 15, 
          color: message.type === 'error' ? 'crimson' : 'green',
          padding: '10px',
          border: `1px solid ${message.type === 'error' ? 'crimson' : 'green'}`,
          borderRadius: '4px'
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
