import React, { useEffect, useState } from 'react';
import librarianService from '../../services/librarianService';

export default function LibrarianDashboard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [list, setList] = useState([]);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await librarianService.getCurrentlyInside();
      const data = res && res.data ? res.data : [];
      setList(data);
      setMessage({ type: res.success ? 'success' : 'error', text: res.message || '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load scans' });
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{padding:20}}>
      <h2>Librarian Dashboard — Current Students Inside</h2>
      <div style={{marginBottom:10}}>
        <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {message && <div style={{color: message.type==='error' ? 'crimson':'green', marginBottom:10}}>{message.text}</div>}
      <table border="1" cellPadding="6" style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Full name</th>
            <th>Student ID</th>
            <th>Entry time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 && (
            <tr><td colSpan="5">No students currently inside</td></tr>
          )}
          {list.map((s, idx) => (
            <tr key={idx}>
              <td style={{width:80}}>{s.photoUrl ? <img src={s.photoUrl} alt="photo" style={{height:48}}/> : '—'}</td>
              <td>{s.fullName || s.name || '—'}</td>
              <td>{s.studentId || s.id || '—'}</td>
              <td>{s.entryTime ? new Date(s.entryTime).toLocaleString() : '—'}</td>
              <td>{s.status || (s.exitTime ? 'Left' : 'Inside')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
