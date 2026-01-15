import React, { useState } from 'react';
import libraryEntryService from '../../services/libraryEntryService';

export default function EntryForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [scanType, setScanType] = useState('ENTRY');

  async function send() {
    setLoading(true);
    setMessage(null);
    try {
      const payload = { qrValue: scanType === 'ENTRY' ? 'LIBRARY_ENTRY' : 'LIBRARY_EXIT', scanType };
      const res = await libraryEntryService.sendScan(payload);
      setMessage({ type: res.success ? 'success' : 'error', text: res.message || 'Scan sent' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to send scan' });
    } finally { setLoading(false); }
  }

  return (
    <div style={{padding:20}}>
      <h2>Library Scan</h2>
      <div>
        <label style={{marginRight:8}}>Type:</label>
        <select value={scanType} onChange={e => setScanType(e.target.value)}>
          <option value="ENTRY">Entry</option>
          <option value="EXIT">Exit</option>
        </select>
      </div>
      <div style={{marginTop:12}}>
        <button onClick={send} disabled={loading}>{loading ? 'Sending...' : 'Send Scan'}</button>
      </div>
      {message && <div style={{marginTop:12,color: message.type==='error' ? 'crimson':'green'}}>{message.text}</div>}
    </div>
  );
}
