import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';

export default function StudentForm() {
  const [form, setForm] = useState({
    studentId: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    phoneNumber: ''
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
      await studentService.registerStudent(form);
      setMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' });
      setTimeout(() => navigate('/student-login'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: '40px auto' }}>
      <h2>Student Registration</h2>
      <form onSubmit={onSubmit} style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 15 }}>
          <label>Student ID (8 digits, e.g., 12345678)</label><br />
          <input name="studentId" value={form.studentId} onChange={onChange}
            placeholder="12345678" pattern="^[0-9]{8}$"
            title="Student ID must be exactly 8 digits" required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Password</label><br />
          <input name="password" type="password" value={form.password}
            onChange={onChange} required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>First Name</label><br />
          <input name="firstName" value={form.firstName} onChange={onChange} required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Last Name</label><br />
          <input name="lastName" value={form.lastName} onChange={onChange} required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Email</label><br />
          <input name="email" type="email" value={form.email} onChange={onChange} required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Department</label><br />
          <input name="department" value={form.department} onChange={onChange} required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Phone Number (7-15 digits, optional, may start with +)</label><br />
          <input name="phoneNumber" value={form.phoneNumber} onChange={onChange}
            placeholder="+1234567890" pattern="^\+?[0-9]{7,15}$"
            title="Phone must be 7-15 digits and may start with +"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginTop: 20 }}>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '10px', backgroundColor: '#28a745',
            color: 'white', border: 'none', borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
      {message && (
        <div style={{
          marginTop: 15, padding: '10px', borderRadius: '4px',
          color: message.type === 'error' ? 'crimson' : 'green',
          border: `1px solid ${message.type === 'error' ? 'crimson' : 'green'}`
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}