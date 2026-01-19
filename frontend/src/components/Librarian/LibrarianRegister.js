import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import librarianService from '../../services/librarianService';

export default function LibrarianRegister() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await librarianService.registerLibrarian(form);
      setMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' });
      setTimeout(() => navigate('/librarian-login'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: '40px auto' }}>
      <h2>Librarian Registration</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>Username (Unique)</label><br />
          <input 
            name="username" 
            value={form.username} 
            onChange={onChange} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>First Name</label><br />
          <input 
            name="firstName" 
            value={form.firstName} 
            onChange={onChange} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Last Name</label><br />
          <input 
            name="lastName" 
            value={form.lastName} 
            onChange={onChange} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Email</label><br />
          <input 
            name="email" 
            type="email" 
            value={form.email} 
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
            {loading ? 'Registering...' : 'Register'}
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
