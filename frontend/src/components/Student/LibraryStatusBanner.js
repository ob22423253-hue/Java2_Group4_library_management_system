import React, { useEffect, useState } from 'react';
import libraryHoursService from '../../services/libraryHoursService';

export default function LibraryStatusBanner() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    libraryHoursService.getStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  if (!status) return null;

  const isOpen = status.open;
  const bg = isOpen ? '#e8f5e9' : '#ffebee';
  const border = isOpen ? '#2e7d32' : '#c62828';
  const color = isOpen ? '#2e7d32' : '#c62828';
  const icon = isOpen ? '🟢' : '🔴';

  return (
    <div style={{
      backgroundColor: bg,
      border: `1px solid ${border}`,
      borderRadius: 8,
      padding: '12px 20px',
      marginBottom: 20,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    }}>
      <div style={{ fontWeight: 700, color, fontSize: '0.95em' }}>
        {icon} {status.message}
      </div>
      {status.openTime && status.closeTime && (
        <div style={{ fontSize: '0.82em', color: '#555' }}>
          Hours: <strong>{status.openTime}</strong> – <strong>{status.closeTime}</strong>
          {status.workingDays && (
            <span style={{ marginLeft: 12 }}>
              Days: <strong>{status.workingDays}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}