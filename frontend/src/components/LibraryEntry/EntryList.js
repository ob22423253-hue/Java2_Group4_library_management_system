import React, { useState } from 'react';

export default function EntryList({ entries }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const formatTime = (dateTime) => {
    if (!dateTime) return '—';
    try { return new Date(dateTime).toLocaleString(); } catch { return dateTime; }
  };

  const getDuration = (entryTime, exitTime) => {
    if (!exitTime) return 'Still inside';
    try {
      const diffMs = new Date(exitTime) - new Date(entryTime);
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    } catch { return '—'; }
  };

  const filtered = entries.filter(entry => {
    const student = entry.student;
    const fullName = `${student?.firstName || ''} ${student?.lastName || ''}`.toLowerCase();
    const studentId = (student?.studentId || '').toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch = !search || fullName.includes(searchLower) || studentId.includes(searchLower);

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'INSIDE' && !entry.exitTime) ||
      (filterStatus === 'LEFT' && entry.exitTime);

    const entryDate = new Date(entry.entryTime);
    const matchesFrom = !fromDate || entryDate >= new Date(fromDate);
    const matchesTo = !toDate || entryDate <= new Date(toDate + 'T23:59:59');

    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('ALL');
    setFromDate('');
    setToDate('');
  };

  if (!entries || entries.length === 0) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>No entries recorded yet</div>;
  }

  return (
    <div>
      {/* Filter Bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '10px',
        marginBottom: 15, padding: '15px',
        backgroundColor: '#f5f5f5', borderRadius: '8px'
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or student ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '8px 12px',
            border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9em'
          }}
        />

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9em' }}
        >
          <option value="ALL">All Status</option>
          <option value="INSIDE">Currently Inside</option>
          <option value="LEFT">Left</option>
        </select>

        {/* From Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '0.85em', color: '#666', whiteSpace: 'nowrap' }}>From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9em' }}
          />
        </div>

        {/* To Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '0.85em', color: '#666', whiteSpace: 'nowrap' }}>To:</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9em' }}
          />
        </div>

        {/* Clear */}
        <button
          onClick={clearFilters}
          style={{
            padding: '8px 16px', backgroundColor: '#9e9e9e', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em'
          }}
        >
          Clear
        </button>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: 10, fontSize: '0.85em', color: '#666' }}>
        Showing {filtered.length} of {entries.length} records
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
          No records match your filter
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ backgroundColor: '#003d7a', color: 'white' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Student ID</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Department</th>
                <th style={{ padding: 12, textAlign: 'center' }}>Entry Time</th>
                <th style={{ padding: 12, textAlign: 'center' }}>Exit Time</th>
                <th style={{ padding: 12, textAlign: 'center' }}>Duration</th>
                <th style={{ padding: 12, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, idx) => {
                const isStillInside = !entry.exitTime;
                return (
                  <tr key={idx} style={{ backgroundColor: isStillInside ? '#f0f8ff' : 'white', borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: 12 }}><strong>{entry.student?.studentId || '—'}</strong></td>
                    <td style={{ padding: 12 }}>
                      {entry.student?.firstName && entry.student?.lastName
                        ? `${entry.student.firstName} ${entry.student.lastName}`
                        : entry.student?.firstName || '—'}
                    </td>
                    <td style={{ padding: 12 }}>{entry.student?.department || '—'}</td>
                    <td style={{ padding: 12, textAlign: 'center', fontSize: '0.9em' }}>{formatTime(entry.entryTime)}</td>
                    <td style={{ padding: 12, textAlign: 'center', fontSize: '0.9em' }}>{formatTime(entry.exitTime)}</td>
                    <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>{getDuration(entry.entryTime, entry.exitTime)}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px',
                        backgroundColor: isStillInside ? '#4caf50' : '#ff9800',
                        color: 'white', fontSize: '0.85em', fontWeight: 'bold'
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
      )}
    </div>
  );
}