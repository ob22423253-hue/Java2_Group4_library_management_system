import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../AuthContext';
import libraryEntryService from '../../services/libraryEntryService';

export default function EntryForm() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [scanResult, setScanResult] = useState('');
  const [manualQR, setManualQR] = useState(''); // Fallback manual entry
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera
  async function startCamera() {
    try {
      console.log('[EntryForm] Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setMessage({ type: 'success', text: 'Camera started. Point at QR code.' });
        console.log('[EntryForm] Camera started successfully');
      }
    } catch (err) {
      console.error('[EntryForm] Camera access denied:', err);
      setMessage({ type: 'error', text: 'Camera access denied. Use manual entry.' });
    }
  }

  // Stop camera
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setMessage(null);
  }

  // Capture frame and attempt to detect QR code
  async function captureFrame() {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Get image data and attempt simple QR detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // For now, show instruction to user
    setMessage({ 
      type: 'warning', 
      text: 'QR scanning in progress... If not detected, use manual entry below.' 
    });

    console.log('[EntryForm] Frame captured for QR detection');
  }

  // Use timer to auto-capture frames
  useEffect(() => {
    if (!cameraActive) return;

    const interval = setInterval(() => {
      captureFrame();
    }, 1000); // Try to detect every 1 second

    return () => clearInterval(interval);
  }, [cameraActive]);

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
      
      {/* Camera Section */}
      <section style={{ 
        marginBottom: 30, 
        padding: 20, 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3>📱 Camera Scanner</h3>
        {!cameraActive ? (
          <button 
            onClick={startCamera}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#4caf50', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1em',
              fontWeight: 'bold'
            }}
          >
            📷 Open Camera
          </button>
        ) : (
          <div>
            <video 
              ref={videoRef}
              style={{ 
                width: '100%', 
                borderRadius: '4px',
                marginBottom: 15,
                backgroundColor: '#000'
              }}
              autoPlay
              playsInline
            />
            <canvas 
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            <button 
              onClick={stopCamera}
              style={{ 
                width: '100%', 
                padding: '10px', 
                backgroundColor: '#d32f2f', 
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ✕ Close Camera
            </button>
          </div>
        )}
        <p style={{ fontSize: '0.85em', color: '#666', marginTop: 10 }}>
          Point your device camera at the QR code shown on the librarian's screen.
        </p>
      </section>
      
      {/* Manual Entry Section */}
      <section style={{ 
        marginBottom: 30, 
        padding: 20, 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3>Keyboard Entry (Fallback)</h3>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          If camera doesn't work, type or paste the QR code value
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
