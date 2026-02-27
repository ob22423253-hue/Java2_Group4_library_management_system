import React, { useState } from 'react';

const PAGE_SIZE = 8;
const COLORS = {
  primary: '#003d7a', border: '#e0e0e0', gray: '#757575',
  grayLight: '#f5f5f5', success: '#2e7d32', successLight: '#e8f5e9',
  warning: '#e65100', warningLight: '#fff3e0', white: '#ffffff',
};

export default function EntryList({ entries }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);

  const formatTime = (dt) => {
    if (!dt) return '—';
    try { return new Date(dt).toLocaleString(); } catch { return dt; }
  };

  const getDuration = (entryTime, exitTime) => {
    if (!exitTime) return 'Still inside';
    try {
      const mins = Math.floor((new Date(exitTime) - new Date(entryTime)) / 60000);
      const h = Math.floor(mins/60), m = mins%60;
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    } catch { return '—'; }
  };

  if (!entries || entries.length === 0) {
    return <div style={{ padding:30, textAlign:'center', color:COLORS.gray }}>No entries recorded yet</div>;
  }

  const filtered = entries.filter(entry => {
    const s = entry.student;
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      `${s?.firstName||''} ${s?.lastName||''}`.toLowerCase().includes(q) ||
      (s?.studentId||'').toLowerCase().includes(q) ||
      (s?.department||'').toLowerCase().includes(q) ||
      (s?.major||'').toLowerCase().includes(q);
    const matchesStatus = filterStatus==='ALL' || (filterStatus==='INSIDE' && !entry.exitTime) || (filterStatus==='LEFT' && entry.exitTime);
    const entryDate = new Date(entry.entryTime);
    const matchesFrom = !fromDate || entryDate >= new Date(fromDate);
    const matchesTo = !toDate || entryDate <= new Date(toDate+'T23:59:59');
    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const headers = ['Student ID','Name','Department','Major','Minor','Year','Entry Time','Exit Time','Duration','Status'];

  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:14, padding:'14px 16px', backgroundColor:COLORS.grayLight, borderRadius:8, border:`1px solid ${COLORS.border}` }}>
        <input type="text" placeholder="Search by name, ID, department, major..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{ flex:1, minWidth:200, padding:'7px 12px', border:`1px solid ${COLORS.border}`, borderRadius:5, fontSize:'0.88em' }} />
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
          style={{ padding:'7px 12px', border:`1px solid ${COLORS.border}`, borderRadius:5, fontSize:'0.88em' }}>
          <option value="ALL">All Status</option>
          <option value="INSIDE">Currently Inside</option>
          <option value="LEFT">Left</option>
        </select>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <label style={{ fontSize:'0.82em', color:COLORS.gray }}>From:</label>
          <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(0); }}
            style={{ padding:'7px', border:`1px solid ${COLORS.border}`, borderRadius:5, fontSize:'0.88em' }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <label style={{ fontSize:'0.82em', color:COLORS.gray }}>To:</label>
          <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(0); }}
            style={{ padding:'7px', border:`1px solid ${COLORS.border}`, borderRadius:5, fontSize:'0.88em' }} />
        </div>
        <button onClick={() => { setSearch(''); setFilterStatus('ALL'); setFromDate(''); setToDate(''); setPage(0); }}
          style={{ padding:'7px 14px', backgroundColor:'#9e9e9e', color:'white', border:'none', borderRadius:5, cursor:'pointer', fontSize:'0.85em', fontWeight:600 }}>
          Clear
        </button>
      </div>

      <div style={{ marginBottom:8, fontSize:'0.82em', color:COLORS.gray }}>
        Showing {filtered.length} of {entries.length} records
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding:30, textAlign:'center', color:COLORS.gray }}>No records match your filter</div>
      ) : (
        <>
          <div style={{ overflowX:'auto', borderRadius:8, border:`1px solid ${COLORS.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', backgroundColor:COLORS.white }}>
              <thead>
                <tr style={{ backgroundColor:COLORS.primary, color:'white' }}>
                  {headers.map(h => (
                    <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:'0.78em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((entry, idx) => {
                  const inside = !entry.exitTime;
                  return (
                    <tr key={idx} style={{ borderBottom:`1px solid ${COLORS.border}`, backgroundColor:inside?'#f0f8ff':idx%2===0?COLORS.white:'#fafafa' }}>
                      <td style={{ padding:'11px 14px', fontWeight:600, fontFamily:'monospace', fontSize:'0.88em', color:COLORS.primary }}>{entry.student?.studentId||'—'}</td>
                      <td style={{ padding:'11px 14px', fontWeight:500, fontSize:'0.9em' }}>
                        {entry.student?.firstName && entry.student?.lastName
                          ? `${entry.student.firstName} ${entry.student.lastName}`
                          : entry.student?.firstName||'—'}
                      </td>
                      <td style={{ padding:'11px 14px', fontSize:'0.88em', color:COLORS.gray }}>{entry.student?.department||'—'}</td>
                      <td style={{ padding:'11px 14px', fontSize:'0.88em' }}>{entry.student?.major||'—'}</td>
                      <td style={{ padding:'11px 14px', fontSize:'0.88em' }}>{entry.student?.minorSubject||'—'}</td>
                      <td style={{ padding:'11px 14px', fontSize:'0.88em', textAlign:'center' }}>
                        {entry.student?.yearLevel ? `Year ${entry.student.yearLevel}` : '—'}
                      </td>
                      <td style={{ padding:'11px 14px', fontSize:'0.82em', whiteSpace:'nowrap' }}>{formatTime(entry.entryTime)}</td>
                      <td style={{ padding:'11px 14px', fontSize:'0.82em', whiteSpace:'nowrap' }}>{formatTime(entry.exitTime)}</td>
                      <td style={{ padding:'11px 14px', fontWeight:600, fontSize:'0.85em' }}>{getDuration(entry.entryTime, entry.exitTime)}</td>
                      <td style={{ padding:'11px 14px' }}>
                        <span style={{ display:'inline-block', padding:'3px 12px', borderRadius:20, fontSize:'0.78em', fontWeight:700, backgroundColor:inside?COLORS.successLight:COLORS.warningLight, color:inside?COLORS.success:COLORS.warning }}>
                          {inside ? '✓ Inside' : 'Left'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'0.82em', color:COLORS.gray }}>Page {page+1} of {totalPages} · {filtered.length} records</span>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}
                  style={{ padding:'5px 14px', border:`1px solid ${COLORS.border}`, borderRadius:5, cursor:page===0?'not-allowed':'pointer', backgroundColor:page===0?COLORS.grayLight:COLORS.white, fontWeight:600, fontSize:'0.85em' }}>← Prev</button>
                {Array.from({length:totalPages},(_,i) => (
                  <button key={i} onClick={() => setPage(i)}
                    style={{ padding:'5px 11px', border:`1px solid ${i===page?COLORS.primary:COLORS.border}`, borderRadius:5, cursor:'pointer', backgroundColor:i===page?COLORS.primary:COLORS.white, color:i===page?'white':'#222', fontWeight:600, fontSize:'0.85em' }}>{i+1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page===totalPages-1}
                  style={{ padding:'5px 14px', border:`1px solid ${COLORS.border}`, borderRadius:5, cursor:page===totalPages-1?'not-allowed':'pointer', backgroundColor:page===totalPages-1?COLORS.grayLight:COLORS.white, fontWeight:600, fontSize:'0.85em' }}>Next →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}