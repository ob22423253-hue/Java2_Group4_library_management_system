import React, { useState } from 'react';

const PAGE_SIZE = 8;
const COLORS = {
  primary: '#003d7a', border: '#e0e0e0', gray: '#757575',
  grayLight: '#f5f5f5', danger: '#c62828', white: '#ffffff',
};

export default function StudentList({ students, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  if (!students || students.length === 0) {
    return <div style={{ padding:30, textAlign:'center', color:COLORS.gray }}>No students registered yet</div>;
  }

  const filtered = students.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      (s.studentId||'').toLowerCase().includes(q) ||
      (s.email||'').toLowerCase().includes(q) ||
      (s.department||'').toLowerCase().includes(q) ||
      (s.major||'').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const headers = ['Full Name','Student ID','Email','Department','Major','Minor','Year','Phone','Actions'];

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'center', flexWrap:'wrap' }}>
        <input type="text" placeholder="Search by name, ID, email, department, major..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{ flex:1, minWidth:220, padding:'8px 12px', border:`1px solid ${COLORS.border}`, borderRadius:6, fontSize:'0.9em' }} />
        <span style={{ fontSize:'0.82em', color:COLORS.gray, whiteSpace:'nowrap' }}>
          {filtered.length} of {students.length} student{students.length!==1?'s':''}
        </span>
      </div>

      <div style={{ overflowX:'auto', borderRadius:8, border:`1px solid ${COLORS.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', backgroundColor:COLORS.white }}>
          <thead>
            <tr style={{ backgroundColor:COLORS.primary, color:'white' }}>
              {headers.map(h => (
                <th key={h} style={{ padding:'11px 14px', textAlign:h==='Actions'?'center':'left', fontSize:'0.78em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={headers.length} style={{ padding:30, textAlign:'center', color:COLORS.gray }}>No students match your search</td></tr>
            ) : paginated.map((s, idx) => (
              <tr key={s.studentId||s.email||idx} style={{ borderBottom:`1px solid ${COLORS.border}`, backgroundColor:idx%2===0?COLORS.white:'#fafafa' }}>
                <td style={{ padding:'11px 14px', fontWeight:600, fontSize:'0.9em' }}>
                  {s.firstName && s.lastName ? `${s.firstName} ${s.lastName}` : s.firstName||s.lastName||'—'}
                </td>
                <td style={{ padding:'11px 14px', fontFamily:'monospace', fontSize:'0.88em', color:COLORS.primary, fontWeight:600 }}>{s.studentId||'—'}</td>
                <td style={{ padding:'11px 14px', fontSize:'0.85em', color:COLORS.gray }}>{s.email||'—'}</td>
                <td style={{ padding:'11px 14px', fontSize:'0.88em' }}>{s.department||'—'}</td>
                <td style={{ padding:'11px 14px', fontSize:'0.88em' }}>{s.major||'—'}</td>
                <td style={{ padding:'11px 14px', fontSize:'0.88em' }}>{s.minorSubject||'—'}</td>
                <td style={{ padding:'11px 14px', fontSize:'0.88em', textAlign:'center' }}>
                  {s.yearLevel ? `Year ${s.yearLevel}` : '—'}
                </td>
                <td style={{ padding:'11px 14px', fontSize:'0.85em', color:COLORS.gray }}>{s.phoneNumber||'—'}</td>
                <td style={{ padding:'11px 14px', textAlign:'center' }}>
                  <button onClick={() => onEdit(s)} style={{ padding:'5px 14px', backgroundColor:'#ff9800', color:'white', border:'none', borderRadius:5, cursor:'pointer', marginRight:6, fontWeight:600, fontSize:'0.82em' }}>Edit</button>
                  <button onClick={() => onDelete(s)} style={{ padding:'5px 14px', backgroundColor:COLORS.danger, color:'white', border:'none', borderRadius:5, cursor:'pointer', fontWeight:600, fontSize:'0.82em' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'0.82em', color:COLORS.gray }}>Page {page+1} of {totalPages}</span>
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
    </div>
  );
}