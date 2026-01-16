import React from 'react';

export default function StudentList({ students, onEdit, onDelete }) {
  if (!students || students.length === 0) return <div>No students registered</div>;

  return (
    <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
      <thead>
        <tr>
          <th>Full Name</th>
          <th>Student ID</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.map(s => (
          <tr key={s.id}>
            <td>{s.fullName}</td>
            <td>{s.studentId}</td>
            <td>
              <button onClick={() => onEdit(s)}>Edit</button>
              <button onClick={() => onDelete(s.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
