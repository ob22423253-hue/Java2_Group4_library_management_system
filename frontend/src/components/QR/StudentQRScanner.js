import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

export default function StudentQRScanner({ scanType = 'ENTRY' }) {
  const scannerRef = useRef(null);
  const isMountedRef = useRef(true);
  const [scanning, setScanning] = useState(true);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    isMountedRef.current = true;
    let scanner = null;

    const initializeScanner = async () => {
      try {
        console.log('[StudentQRScanner] Initializing scanner for', scanType);
        
        // Detect if mobile and HTTPS requirement
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isHttps = window.location.protocol === 'https:';
        
        if (isMobile && !isHttps && window.location.hostname !== 'localhost') {
          console.warn('[StudentQRScanner] Mobile device on HTTP - camera may not work. Use HTTPS or localhost for best results.');
        }
        
        scanner = new Html5QrcodeScanner(
          'qr-scanner-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            facingMode: 'environment',
            rememberLastUsedCamera: true,
            videoConstraints: {
              facingMode: { ideal: 'environment' },
              width: { min: 320, ideal: 480, max: 1920 },
              height: { min: 240, ideal: 640, max: 1440 }
            }
          },
          false
        );

        const onScanSuccess = async (decodedText) => {
          if (!isMountedRef.current) return;
          
          console.log('[StudentQRScanner] QR code detected:', decodedText);
          const upperCode = decodedText.toUpperCase().trim();

          // Validate QR code format
          if (!['LIBRARY_ENTRY', 'LIBRARY_EXIT'].includes(upperCode)) {
            if (isMountedRef.current) {
              setMessage({
                type: 'error',
                text: `Invalid QR code: "${decodedText}". Expected LIBRARY_ENTRY or LIBRARY_EXIT`,
              });
            }
            return;
          }

          // Verify QR matches requested scan type
          const expectedCode = `LIBRARY_${scanType}`;
          if (upperCode !== expectedCode) {
            if (isMountedRef.current) {
              setMessage({
                type: 'error',
                text: `Wrong QR code! Scanned "${upperCode}" but need "${expectedCode}"`,
              });
            }
            return;
          }

          // Stop scanning and prevent further scans
          if (scanner && isMountedRef.current) {
            try {
              await scanner.pause();
              setScanning(false);
            } catch (err) {
              console.warn('[StudentQRScanner] Error pausing scanner:', err);
            }
          }

          setLoading(true);

          // Send scan to backend
          try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/scan', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                qrValue: upperCode,
                scanType: scanType.toUpperCase(),
              }),
            });

            const data = await response.json();

            if (response.ok && isMountedRef.current) {
              console.log('[StudentQRScanner] Scan successful:', data);
              setMessage({
                type: 'success',
                text: `✓ ${scanType} scan recorded successfully!`,
              });

              // Redirect to dashboard after 2 seconds
              setTimeout(() => {
                if (isMountedRef.current) {
                  navigate('/student');
                }
              }, 2000);
            } else if (isMountedRef.current) {
              console.error('[StudentQRScanner] Scan failed:', data);
              setMessage({
                type: 'error',
                text: `Scan failed: ${data.message || 'Unknown error'}`,
              });
              if (scanner) {
                try {
                  await scanner.resume();
                  setScanning(true);
                } catch (err) {
                  console.warn('[StudentQRScanner] Error resuming scanner:', err);
                }
              }
            }
          } catch (err) {
            if (isMountedRef.current) {
              console.error('[StudentQRScanner] Error submitting scan:', err);
              setMessage({
                type: 'error',
                text: `Error: ${err.message}. Please try again.`,
              });
              if (scanner) {
                try {
                  await scanner.resume();
                  setScanning(true);
                } catch (resumeErr) {
                  console.warn('[StudentQRScanner] Error resuming scanner:', resumeErr);
                }
              }
            }
          } finally {
            if (isMountedRef.current) {
              setLoading(false);
            }
          }
        };

        const onScanFailure = (error) => {
          // Silently ignore scan failures
        };

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;
      } catch (err) {
        if (!isMountedRef.current) return;
        
        console.error('[StudentQRScanner] Scanner initialization failed:', err);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isHttps = window.location.protocol === 'https:';
        
        let errorText = `Camera access failed: ${err.message}. Use manual entry instead.`;
        if (isMobile && !isHttps) {
          errorText = `Mobile camera requires HTTPS. Current: ${window.location.protocol}//. Use manual entry or connect via HTTPS.`;
        }
        
        setMessage({
          type: 'error',
          text: errorText,
        });
        setScanning(false);
      }
    };

    initializeScanner();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (scanner) {
        try {
          // html5-qrcode uses pause() not stop()
          if (typeof scanner.pause === 'function') {
            scanner.pause();
          }
        } catch (err) {
          console.warn('[StudentQRScanner] Error cleaning up scanner:', err);
        }
      }
    };
  }, [scanType, navigate]);

  const handleManualEntry = async (code) => {
    const upperCode = code.toUpperCase().trim();

    // Accept both formats: "ENTRY"/"EXIT" or "LIBRARY_ENTRY"/"LIBRARY_EXIT"
    let normalizedCode = upperCode;
    if (upperCode === 'ENTRY') {
      normalizedCode = 'LIBRARY_ENTRY';
    } else if (upperCode === 'EXIT') {
      normalizedCode = 'LIBRARY_EXIT';
    }

    if (!['LIBRARY_ENTRY', 'LIBRARY_EXIT'].includes(normalizedCode)) {
      setMessage({
        type: 'error',
        text: `Invalid code: "${code}". Use LIBRARY_ENTRY, LIBRARY_EXIT, ENTRY, or EXIT`,
      });
      return;
    }

    const expectedCode = `LIBRARY_${scanType}`;
    if (normalizedCode !== expectedCode) {
      setMessage({
        type: 'error',
        text: `Wrong code! Need "${expectedCode}" but got "${normalizedCode}"`,
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          qrValue: normalizedCode,
          scanType: scanType.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('[StudentQRScanner] Manual scan successful:', data);
        setMessage({
          type: 'success',
          text: `✓ ${scanType} scan recorded successfully!`,
        });

        setTimeout(() => {
          navigate('/student');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: `Scan failed: ${data.message || 'Unknown error'}`,
        });
      }
    } catch (err) {
      console.error('[StudentQRScanner] Manual scan error:', err);
      setMessage({
        type: 'error',
        text: `Error: ${err.message}. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f0f2f5'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: 30, 
        textAlign: 'center',
        paddingBottom: 20,
        borderBottom: '2px solid #003d7a'
      }}>
        <h1 style={{ color: '#003d7a', margin: 0 }}>
          📚 Library {scanType === 'ENTRY' ? 'Entry' : 'Exit'}
        </h1>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Instructions */}
        <div style={{ 
          marginBottom: 30, 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#003d7a', margin: '0 0 15px 0' }}>📷 How to Scan</h3>
          <p style={{ color: '#666', margin: '0 0 10px 0' }}>
            Point your camera at the <strong>{scanType === 'ENTRY' ? 'ENTRY' : 'EXIT'}</strong> QR code
          </p>
          <p style={{ color: '#999', fontSize: '0.85em', margin: '0 0 15px 0' }}>
            displayed on the librarian's screen
          </p>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '0.9em',
            color: '#666',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '5px 0' }}>✓ Allow camera access when prompted</p>
            <p style={{ margin: '5px 0' }}>✓ Keep QR code in frame</p>
            <p style={{ margin: '5px 0' }}>✓ Good lighting helps scanning</p>
          </div>
        </div>

        {/* QR Scanner Container */}
        <div style={{
          marginBottom: 30,
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          {scanning ? (
            <div id="qr-scanner-container" style={{ width: '100%' }}></div>
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <p style={{ color: '#666', marginBottom: 20 }}>
                Camera scan complete. Use manual entry below if needed.
              </p>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div style={{
            marginBottom: 30,
            padding: 15,
            backgroundColor: 
              message.type === 'error' ? '#ffebee' : 
              message.type === 'warning' ? '#fff3e0' : '#f1f8e9',
            border: `1px solid ${
              message.type === 'error' ? '#d32f2f' : 
              message.type === 'warning' ? '#ff9800' : '#4caf50'
            }`,
            borderRadius: '4px',
            color: 
              message.type === 'error' ? '#d32f2f' : 
              message.type === 'warning' ? '#ff9800' : '#4caf50',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {message.text}
          </div>
        )}

        {/* Manual Entry Fallback */}
        <div style={{
          marginBottom: 30,
          padding: '20px',
          backgroundColor: '#fff8f0',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '2px dashed #ff9800'
        }}>
          <h3 style={{ color: '#ff9800', marginTop: 0, marginBottom: 15 }}>
            ⚙️ Camera Not Working?
          </h3>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 15, fontStyle: 'italic' }}>
            No problem! Type the code below instead:
          </p>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: 15,
            fontFamily: 'monospace',
            fontSize: '1.1em',
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center',
            letterSpacing: '2px'
          }}>
            LIBRARY_{scanType}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: 10 }}>
            <input
              type="text"
              placeholder={`e.g., LIBRARY_${scanType}`}
              defaultValue={`LIBRARY_${scanType}`}
              id="manual-qr-input"
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid #ff9800',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '1em',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('manual-qr-input');
                handleManualEntry(input.value);
              }}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#ccc' : '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '1em',
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? 'Processing...' : 'Submit Code'}
            </button>
          </div>
          <p style={{ fontSize: '0.8em', color: '#999', margin: 0 }}>
            💡 Tip: Make sure to type or paste the code exactly as shown above
          </p>
        </div>

        {/* Back Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/student')}
            style={{
              padding: '12px 32px',
              backgroundColor: '#7a8fa3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1em'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
