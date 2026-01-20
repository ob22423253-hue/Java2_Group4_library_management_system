import React from 'react';
import { useLocation } from 'react-router-dom';
import StudentQRScanner from '../QR/StudentQRScanner';

export default function EntryForm() {
  const location = useLocation();
  const scanType = location.state?.scanType || 'ENTRY';

  return <StudentQRScanner scanType={scanType} />;
}
