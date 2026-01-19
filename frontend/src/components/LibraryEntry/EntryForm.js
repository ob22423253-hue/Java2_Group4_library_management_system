import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../AuthContext';
import libraryEntryService from '../../services/libraryEntryService';

export default function EntryForm() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [scanResult, setScanResult] = useState('');
  const [manualQR, setManualQR] = useState(''); // Fallback manual entry

  // Attempt to use camera if available
  useEffect(() => {
    // Note: For production, integrate html5-qrcode library
    // For now, provide manual QR entry as fallback
    if (!navigator.mediaDevices) {
      setMessage({ type: 'warning', text: 'Camera not available. Use manual QR entry.' });
    }
  }, []);

  const handleManualScan = async (e) => {
    e.preventDefault();
    if (!manualQR.trim()) {
      setMessage({ type: 'error', text: 'Please enter or scan a QR code' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const qrValue = manualQR.trim().toUpperCase();
      
      // Validate QR value matches expected formats
      if (!['LIBRARY_ENTRY', 'LIBRARY_EXIT'].includes(qrValue)) {
        throw new Error('Invalid QR code. Expected LIBRARY_ENTRY or LIBRARY_EXIT');
      }

      // Send scan to backend with JWT authentication
      const payload = { qrValue, scanType: qrValue };
      const res = await libraryEntryService.sendScan(payload);
      
      setMessage({ 
        type: res.success ? 'success' : 'error', 
        text: res.message || 'Scan processed' 
      });
      setScanResult(qrValue);
      setManualQR(''); // Clear input
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to process scan' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '40px auto' }}>
      <h2>Library Entry/Exit</h2>
      <p>Scan the QR code provided by the librarian for entry or exit.</p>
      
      <section style={{ 
        marginBottom: 30, 
        padding: 20, 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3>Manual QR Code Entry</h3>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          Enter the QR code value manually (LIBRARY_ENTRY or LIBRARY_EXIT)
        </p>
        <form onSubmit={handleManualScan}>
          <div style={{ marginBottom: 15 }}>
            <label>QR Code Value</label><br />
            <input 
              type="text" 
              value={manualQR} 
              onChange={(e) => setManualQR(e.target.value)}
              placeholder="e.g., LIBRARY_ENTRY or LIBRARY_EXIT"
              style={{ 
                width: '100%', 
                padding: '10px', 
                boxSizing: 'border-box',
                fontFamily: 'monospace'
              }}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
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
            {loading ? 'Processing...' : 'Submit Scan'}
          </button>
        </form>
      </section>

      {scanResult && (
        <div style={{ 
          marginBottom: 20, 
          padding: 15, 
          backgroundColor: '#e8f5e9', 
          borderRadius: '4px',
          border: '1px solid #4caf50'
        }}>
          <strong>Last Scan:</strong> {scanResult}
        </div>
      )}

      {message && (
        <div style={{ 
          marginTop: 15, 
          padding: 15,
          color: message.type === 'error' ? 'crimson' : message.type === 'warning' ? '#ff9800' : 'green',
          backgroundColor: message.type === 'error' ? '#ffebee' : message.type === 'warning' ? '#fff3e0' : '#f1f8e9',
          border: `1px solid ${message.type === 'error' ? 'crimson' : message.type === 'warning' ? '#ff9800' : 'green'}`,
          borderRadius: '4px'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ 
        marginTop: 30, 
        padding: 15, 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px',
        fontSize: '0.9em',
        color: '#666'
      }}>
        <p><strong>Note:</strong> Student identity is automatically extracted from your JWT token. No manual entry required.</p>
      </div>
    </div>
  );
}
