import React, { useState } from 'react';
import studentService from '../../services/studentService';

export default function StudentForm() {
  const [form, setForm] = useState({
    studentId: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    universityCardId: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await studentService.registerStudent(form);
      const msg = res && res.message ? res.message : 'Registration successful. You can now login.';
      setMessage({ type: 'success', text: msg });
      setForm({ studentId: '', password: '', firstName: '', lastName: '', email: '', universityCardId: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Student Registration</h2>
      <form onSubmit={onSubmit} style={{maxWidth:480}}>
        <div>
          <label>Student ID</label><br/>
          <input name="studentId" value={form.studentId} onChange={onChange} required />
        </div>
        <div>
          <label>Password</label><br/>
          <input name="password" type="password" value={form.password} onChange={onChange} required />
        </div>
        <div>
          <label>First name</label><br/>
          <input name="firstName" value={form.firstName} onChange={onChange} />
        </div>
        <div>
          <label>Last name</label><br/>
          <input name="lastName" value={form.lastName} onChange={onChange} />
        </div>
        <div>
          <label>Email</label><br/>
          <input name="email" type="email" value={form.email} onChange={onChange} />
        </div>
        <div>
          <label>University Card ID</label><br/>
          <input name="universityCardId" value={form.universityCardId} onChange={onChange} />
        </div>
        <div style={{marginTop:10}}>
          <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </div>
      </form>
      {message && (
        <div style={{marginTop:12,color: message.type==='error' ? 'crimson':'green'}}>{message.text}</div>
      )}
    </div>
  );
}
