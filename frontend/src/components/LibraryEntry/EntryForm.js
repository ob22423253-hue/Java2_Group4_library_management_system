import React, { useState, useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import libraryEntryService from '../../services/libraryEntryService';
import QrReader from 'react-qr-reader';

export default function EntryForm() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [scanResult, setScanResult] = useState('');

  const handleScan = async (data) => {
    if (data) {
      setScanResult(data);
      setLoading(true);
      setMessage(null);
      try {
        const payload = { qrValue: data, studentId: user.id };
        const res = await libraryEntryService.sendScan(payload);
        setMessage({ type: res.success ? 'success' : 'error', text: res.message || 'Scan sent' });
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Failed to send scan' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setMessage({ type: 'error', text: 'QR Scan Error' });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Library Scan</h2>
      <div style={{ marginBottom: 20 }}>
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: '100%' }}
        />
      </div>
      {scanResult && <p>Scanned QR: {scanResult}</p>}
      {loading && <p>Sending scan...</p>}
      {message && <p style={{ color: message.type === 'error' ? 'crimson' : 'green' }}>{message.text}</p>}
    </div>
  );
}
