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
      const res = await studentService.loginStudent(form);
      // Expect backend returns { status, success, message, data: { token, id, name, role } }
      const data = res?.data || res;

      if (!data?.token) throw new Error(res?.message || 'Login failed');

      // Save in AuthContext
      login({ id: data.id, name: data.name, role: data.role || 'STUDENT' }, data.token);

      setMessage({ type: 'success', text: res.message || 'Login successful' });

      // Redirect student to scan page
      navigate('/scan');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Student Login</h2>
      <form onSubmit={onSubmit} style={{ maxWidth: 360 }}>
        <div>
          <label>Student ID</label><br />
          <input name="studentId" value={form.studentId} onChange={onChange} required />
        </div>
        <div>
          <label>Password</label><br />
          <input name="password" type="password" value={form.password} onChange={onChange} required />
        </div>
        <div style={{ marginTop: 10 }}>
          <button disabled={loading} type="submit">{loading ? 'Logging in...' : 'Login'}</button>
        </div>
      </form>
      {message && <div style={{ marginTop: 12, color: message.type === 'error' ? 'crimson' : 'green' }}>{message.text}</div>}
    </div>
  );
}
