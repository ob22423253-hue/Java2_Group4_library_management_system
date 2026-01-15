import React, { useState } from 'react';
import studentService from '../../services/studentService';

export default function StudentLogin() {
  const [form, setForm] = useState({ studentId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function onChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await studentService.loginStudent(form);
      // backend returns wrapper { status, success, message, data }
      const payload = res && res.data ? res.data : null;
      // Support both wrapped responses ({status, success, message, data: {token,...}})
      // and direct AuthResponse ({ token, username, role })
      const resultToken = (payload && payload.token) || (res && res.data && res.data.token) || (res && res.token);
      const resultRole = (payload && payload.role) || (res && res.data && res.data.role) || (res && res.role) || 'STUDENT';

      if (resultToken) {
        // Standardize on `token` and `role` keys in localStorage
        localStorage.setItem('token', resultToken);
        localStorage.setItem('role', resultRole);
        setMessage({ type: 'success', text: res.message || 'Login successful' });
      } else {
        throw new Error(res && res.message ? res.message : 'Login failed: no token');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Login failed' });
    } finally { setLoading(false); }
  }

  return (
    <div style={{padding:20}}>
      <h2>Student Login</h2>
      <form onSubmit={onSubmit} style={{maxWidth:360}}>
        <div>
          <label>Student ID</label><br/>
          <input name="studentId" value={form.studentId} onChange={onChange} required />
        </div>
        <div>
          <label>Password</label><br/>
          <input name="password" type="password" value={form.password} onChange={onChange} required />
        </div>
        <div style={{marginTop:10}}>
          <button disabled={loading} type="submit">{loading ? 'Logging in...' : 'Login'}</button>
        </div>
      </form>
      {message && <div style={{marginTop:12,color: message.type==='error' ? 'crimson':'green'}}>{message.text}</div>}
    </div>
  );
}
