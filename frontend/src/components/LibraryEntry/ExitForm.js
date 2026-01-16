import React, { useState } from 'react';
import libraryEntryService from '../../services/libraryEntryService';

export default function ExitForm({ onExit }) {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleExit() {
    setLoading(true);
    setMessage(null);
    try {
      const payload = { qrValue: 'LIBRARY_EXIT', studentId, scanType: 'EXIT' };
      const res = await libraryEntryService.sendScan(payload);
      setMessage({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success && onExit) onExit();
      setStudentId('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to exit' });
    } finally { setLoading(false); }
  }

  return (
    <div style={{ marginTop: 10 }}>
      <h4>📤 Exit Student</h4>
      <input placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
      <button onClick={handleExit} disabled={loading}>{loading ? 'Processing...' : 'Exit'}</button>
      {message && <div style={{ marginTop: 6, color: message.type === 'error' ? 'crimson' : 'green' }}>{message.text}</div>}
    </div>
  );
}
