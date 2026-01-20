import React from 'react';

export default function EntryList({ entries }) {
  if (!entries || entries.length === 0) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>No entries recorded yet</div>;
  }

  // Format time nicely
  const formatTime = (dateTime) => {
    if (!dateTime) return '—';
    try {
      return new Date(dateTime).toLocaleString();
    } catch {
      return dateTime;
    }
  };

  // Calculate duration
  const getDuration = (entryTime, exitTime) => {
    if (!exitTime) return 'Still inside';
    try {
      const entry = new Date(entryTime);
      const exit = new Date(exitTime);
      const diffMs = exit - entry;
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    } catch {
      return '—';
    }
  };

  return (
    <div style={{ overflowX: 'auto', marginTop: 10 }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#003d7a', color: 'white' }}>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #003d7a' }}>Student ID</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #003d7a' }}>Name</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #003d7a' }}>Department</th>
            <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #003d7a' }}>Entry Time</th>
            <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #003d7a' }}>Exit Time</th>
            <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #003d7a' }}>Duration</th>
            <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #003d7a' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const isStillInside = !entry.exitTime;
            return (
              <tr 
                key={idx}
                style={{
                  backgroundColor: isStillInside ? '#f0f8ff' : 'white',
                  borderBottom: '1px solid #ddd'
                }}
              >
                <td style={{ padding: 12 }}>
                  <strong>{entry.student?.studentId || '—'}</strong>
                </td>
                <td style={{ padding: 12 }}>
                  {entry.student?.firstName && entry.student?.lastName 
                    ? `${entry.student.firstName} ${entry.student.lastName}`
                    : entry.student?.firstName || '—'
                  }
                </td>
                <td style={{ padding: 12 }}>
                  {entry.student?.department || '—'}
                </td>
                <td style={{ padding: 12, textAlign: 'center', fontSize: '0.9em' }}>
                  {formatTime(entry.entryTime)}
                </td>
                <td style={{ padding: 12, textAlign: 'center', fontSize: '0.9em' }}>
                  {formatTime(entry.exitTime)}
                </td>
                <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>
                  {getDuration(entry.entryTime, entry.exitTime)}
                </td>
                <td style={{ 
                  padding: 12, 
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: isStillInside ? '#4caf50' : '#ff9800',
                    color: 'white',
                    fontSize: '0.85em'
                  }}>
                    {isStillInside ? '✓ Inside' : 'Left'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
