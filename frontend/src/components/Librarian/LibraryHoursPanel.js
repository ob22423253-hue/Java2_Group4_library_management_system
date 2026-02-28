import React, { useEffect, useState } from 'react';
import libraryHoursService from '../../services/libraryHoursService';

const COLORS = {
  primary: '#003d7a', border: '#e0e0e0', gray: '#757575',
  danger: '#c62828', dangerLight: '#ffebee',
  success: '#2e7d32', successLight: '#e8f5e9', white: '#ffffff',
};

const ALL_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function LibraryHoursPanel() {
  const [status, setStatus] = useState(null);
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('17:00');
  const [selectedDays, setSelectedDays] = useState(['MON', 'TUE', 'WED', 'THU', 'FRI']);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    libraryHoursService.getStatus().then(s => {
      setStatus(s);
      if (s?.openTime) setOpenTime(s.openTime.substring(0, 5));
      if (s?.closeTime) setCloseTime(s.closeTime.substring(0, 5));
      if (s?.workingDays) setSelectedDays(s.workingDays.split(',').map(d => d.trim()));
    }).catch(() => {});
  }, []);

  function toggleDay(day) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }

  async function handleSave() {
    if (selectedDays.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one working day' });
      return;
    }
    setSaving(true);
    try {
      await libraryHoursService.saveHours({
        openTime: openTime + ':00',
        closeTime: closeTime + ':00',
        workingDays: selectedDays.join(','),
      });
      setMessage({ type: 'success', text: 'Library hours saved successfully' });
      const updated = await libraryHoursService.getStatus();
      setStatus(updated);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save library hours' });
    } finally {
      setSaving(false);
    }
  }

  const isOpen = status?.open;

  return (
    <div>
      {/* Current Status */}
      <div style={{
        padding: '12px 18px', borderRadius: 8, marginBottom: 20,
        backgroundColor: isOpen ? '#e8f5e9' : '#ffebee',
        border: `1px solid ${isOpen ? '#2e7d32' : '#c62828'}`,
        fontWeight: 700, color: isOpen ? '#2e7d32' : '#c62828', fontSize: '0.95em',
      }}>
        {isOpen ? '🟢 Library is currently OPEN' : '🔴 Library is currently CLOSED'}
      </div>

      {message && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 6,
          color: message.type === 'error' ? COLORS.danger : COLORS.success,
          backgroundColor: message.type === 'error' ? COLORS.dangerLight : COLORS.successLight,
          border: `1px solid ${message.type === 'error' ? COLORS.danger : COLORS.success}` }}>
          {message.text}
          <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: '0.8em', fontWeight: 600, color: COLORS.gray, display: 'block', marginBottom: 6 }}>OPEN TIME</label>
          <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: '0.95em', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.8em', fontWeight: 600, color: COLORS.gray, display: 'block', marginBottom: 6 }}>CLOSE TIME</label>
          <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: '0.95em', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: '0.8em', fontWeight: 600, color: COLORS.gray, display: 'block', marginBottom: 10 }}>WORKING DAYS</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALL_DAYS.map(day => (
            <button key={day} onClick={() => toggleDay(day)}
              style={{
                padding: '7px 16px', border: `2px solid ${selectedDays.includes(day) ? COLORS.primary : COLORS.border}`,
                borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.85em',
                backgroundColor: selectedDays.includes(day) ? COLORS.primary : COLORS.white,
                color: selectedDays.includes(day) ? 'white' : COLORS.gray,
              }}>
              {day}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        style={{ padding: '10px 28px', backgroundColor: saving ? '#ccc' : COLORS.success, color: 'white', border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.95em' }}>
        {saving ? 'Saving...' : '💾 Save Library Hours'}
      </button>
    </div>
  );
}