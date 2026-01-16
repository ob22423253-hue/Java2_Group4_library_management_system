import React from 'react';
import BorrowReturn from '../Book/BorrowReturn';

export default function StudentDashboard() {
  return (
    <div style={{ padding: 20 }}>
      <h2>👨‍🎓 Student Dashboard</h2>

      <section style={{ marginTop: 30 }}>
        <BorrowReturn />
      </section>
    </div>
  );
}
