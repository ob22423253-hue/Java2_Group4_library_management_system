import React from 'react';

export default function CurrentCount({ inside, left }) {
  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: 15 }}>
      <div style={{
        padding: '15px 25px',
        backgroundColor: '#e8f5e9',
        border: '2px solid #4caf50',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#4caf50' }}>{inside}</div>
        <div style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ Currently Inside</div>
      </div>
      <div style={{
        padding: '15px 25px',
        backgroundColor: '#fff3e0',
        border: '2px solid #ff9800',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#ff9800' }}>{left}</div>
        <div style={{ color: '#ff9800', fontWeight: 'bold' }}>↩ Left Today</div>
      </div>
    </div>
  );
}