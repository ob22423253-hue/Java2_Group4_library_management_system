import React, { useState, useContext } from 'react';
import studentService from '../../services/studentService';
import { AuthContext } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function StudentLogin() {
  const [form, setForm] = useState({ studentId: '', password: '' });
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
      const response = await studentService.loginStudent(form);
      
      // Backend returns AuthResponse: { token, studentId, role }
      if (!response?.token) {
        throw new Error(response?.message || 'Login failed');
      }

      // Save to AuthContext with user info
      // Normalize role: backend returns 'ROLE_STUDENT', frontend expects 'STUDENT'
      const normalizedRole = response.role?.replace('ROLE_', '') || 'STUDENT';
      const userInfo = {
        id: response.studentId,
        studentId: response.studentId,
        role: normalizedRole,
      };
      
      login(userInfo, response.token);

      setMessage({ type: 'success', text: 'Login successful' });
      
      // Redirect to student dashboard
      navigate('/student');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: '40px auto' }}>
      <h2>Student Login</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>Student ID</label><br />
          <input 
            name="studentId" 
            value={form.studentId} 
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
              backgroundColor: '#007bff', 
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
