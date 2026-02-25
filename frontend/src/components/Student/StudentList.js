import React from 'react';

export default function StudentList({ students, onEdit, onDelete }) {
  if (!students || students.length === 0) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>No students registered</div>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ marginBottom: 10, fontSize: '0.85em', color: '#666' }}>
        {students.length} student{students.length !== 1 ? 's' : ''} registered
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#003d7a', color: 'white' }}>
            <th style={{ padding: 12, textAlign: 'left' }}>Full Name</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Student ID</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Department</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => (
            <tr key={s.studentId || s.email || idx} style={{
              borderBottom: '1px solid #ddd',
              backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa'
            }}>
              <td style={{ padding: 12, fontWeight: 'bold' }}>
                {s.firstName && s.lastName
                  ? `${s.firstName} ${s.lastName}`
                  : s.firstName || s.lastName || s.fullName || '—'}
              </td>
              <td style={{ padding: 12, fontFamily: 'monospace' }}>{s.studentId || '—'}</td>
              <td style={{ padding: 12, fontSize: '0.9em' }}>{s.email || '—'}</td>
              <td style={{ padding: 12 }}>{s.department || '—'}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>
                <button
                  onClick={() => onEdit(s)}
                  style={{ padding: '5px 14px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: 8, fontWeight: 'bold' }}>
                  Edit
                </button>
                <button
                  onClick={() => onDelete(s)}
                  style={{ padding: '5px 14px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}