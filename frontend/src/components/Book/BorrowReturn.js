import React, { useState } from 'react';

export default function BorrowReturn({ onBorrow, onReturn }) {
  const [studentId, setStudentId] = useState('');
  const [bookId, setBookId] = useState('');

  function handleBorrow() {
    if (!studentId || !bookId) return alert('Student ID and Book ID required');
    onBorrow({ studentId, bookId });
    setStudentId(''); setBookId('');
  }

  function handleReturn() {
    if (!studentId || !bookId) return alert('Student ID and Book ID required');
    onReturn({ studentId, bookId });
    setStudentId(''); setBookId('');
  }

  return (
    <div style={{ marginTop: 10 }}>
      <input placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
      <input placeholder="Book ID" value={bookId} onChange={e => setBookId(e.target.value)} style={{ marginLeft: 5 }} />
      <button onClick={handleBorrow} style={{ marginLeft: 5 }}>Borrow</button>
      <button onClick={handleReturn} style={{ marginLeft: 5 }}>Return</button>
    </div>
  );
}
