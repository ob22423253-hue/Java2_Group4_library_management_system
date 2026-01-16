import React from 'react';

export default function EntryList({ entries }) {
  if (!entries || entries.length === 0) return <div>No entries yet</div>;

  return (
    <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Full Name</th>
          <th>Scan Type</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e, idx) => (
          <tr key={idx}>
            <td>{e.studentId}</td>
            <td>{e.fullName || e.name}</td>
            <td>{e.scanType}</td>
            <td>{e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
