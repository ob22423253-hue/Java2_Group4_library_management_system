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
    major: '',
    minorSubject: '',
    yearLevel: '',
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
      await studentService.registerStudent({
        ...form,
        yearLevel: form.yearLevel ? parseInt(form.yearLevel) : null
      });
      setMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' });
      setTimeout(() => navigate('/student-login'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: '40px auto' }}>
      <h2>Student Registration</h2>
      <form onSubmit={onSubmit} style={{ maxWidth: 480 }}>

        <div style={{ marginBottom: 15 }}>
          <label>Student ID (8 digits, e.g., 12345678)</label><br />
          <input name="studentId" value={form.studentId} onChange={onChange}
            placeholder="12345678" pattern="^[0-9]{8}$"
            title="Student ID must be exactly 8 digits" required
            style={inputStyle} />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Password</label><br />
          <input name="password" type="password" value={form.password}
            onChange={onChange} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>First Name</label><br />
          <input name="firstName" value={form.firstName} onChange={onChange}
            required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Last Name</label><br />
          <input name="lastName" value={form.lastName} onChange={onChange}
            required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Email</label><br />
          <input name="email" type="email" value={form.email} onChange={onChange}
            required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Department / School (e.g., ITC, Arts and Science, SBPA)</label><br />
          <input name="department" value={form.department} onChange={onChange}
            placeholder="e.g. ITC" required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Major (e.g., Computer Science)</label><br />
          <input name="major" value={form.major} onChange={onChange}
            placeholder="e.g. Computer Science" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Minor (optional)</label><br />
          <input name="minorSubject" value={form.minorSubject} onChange={onChange}
            placeholder="e.g. Mathematics (leave blank if none)" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Year Level</label><br />
          <select name="yearLevel" value={form.yearLevel} onChange={onChange}
            style={inputStyle}>
            <option value="">-- Select Year --</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
            <option value="5">Year 5</option>
            <option value="6">Year 6</option>
            <option value="7">Year 7</option>
            <option value="8">Year 8</option>
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Phone Number (7-15 digits, optional, may start with +)</label><br />
          <input name="phoneNumber" value={form.phoneNumber} onChange={onChange}
            placeholder="+1234567890" pattern="^\+?[0-9]{7,15}$"
            title="Phone must be 7-15 digits and may start with +"
            style={inputStyle} />
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