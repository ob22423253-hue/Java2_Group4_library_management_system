import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const COLORS = {
  primary: '#003d7a', primaryLight: '#e8f0fb',
  success: '#2e7d32', successLight: '#e8f5e9',
  danger: '#c62828', dangerLight: '#ffebee',
  gray: '#757575', grayLight: '#f5f5f5',
  border: '#e0e0e0', white: '#ffffff',
};

const PAGE_SIZE = 7;

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const student = user?.loggedInUser;

  const [allBorrows, setAllBorrows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const displayName = student?.firstName && student?.lastName
    ? `${student.firstName} ${student.lastName}`
    : student?.firstName ?? student?.studentId ?? 'Student';

  async function loadAllBorrows() {
    if (!student?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/borrow-records/student/${student.id}?size=200`, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      });
      const data = await res.json();
      if (res.ok) {
        const list = data?.data?.content ?? data?.data ?? (Array.isArray(data) ? data : []);
        setAllBorrows(Array.isArray(list) ? list : []);
      } else {
        setError(data?.message || 'Failed to load borrow history');
      }
    } catch {
      setError('Failed to load borrow history');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAllBorrows(); }, [student?.id]);

  const filtered = allBorrows.filter(r => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return r.status === 'BORROWED';
    if (statusFilter === 'RETURNED') return r.status === 'RETURNED';
    if (statusFilter === 'OVERDUE') return r.status === 'OVERDUE';
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const activeCount = allBorrows.filter(r => r.status === 'BORROWED').length;
  const overdueCount = allBorrows.filter(r => r.status === 'OVERDUE').length;
  const returnedCount = allBorrows.filter(r => r.status === 'RETURNED').length;

  function statusBadge(record) {
    if (record.returnDate || record.status === 'RETURNED')
      return <span style={{ display:'inline-block', padding:'3px 12px', borderRadius:20, fontSize:'0.78em', fontWeight:700, color:COLORS.success, backgroundColor:COLORS.successLight }}>✓ Returned</span>;
    const isOverdue = record.status === 'OVERDUE' || (!record.returnDate && new Date() > new Date(record.dueDate));
    if (isOverdue)
      return <span style={{ display:'inline-block', padding:'3px 12px', borderRadius:20, fontSize:'0.78em', fontWeight:700, color:COLORS.danger, backgroundColor:COLORS.dangerLight }}>⚠ Overdue</span>;
    return <span style={{ display:'inline-block', padding:'3px 12px', borderRadius:20, fontSize:'0.78em', fontWeight:700, color:COLORS.primary, backgroundColor:COLORS.primaryLight }}>📖 Borrowed</span>;
  }

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#f0f4f8', fontFamily:"'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor:COLORS.primary, color:'white', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:'1.6em' }}>📚</span>
          <div>
            <div style={{ fontWeight:700, fontSize:'1.1em' }}>University Library</div>
            <div style={{ fontSize:'0.8em', opacity:0.8 }}>Student Portal</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontSize:'0.9em', opacity:0.9 }}>👤 {displayName}</span>
          <button onClick={() => { logout(); navigate('/'); }}
            style={{ padding:'7px 18px', backgroundColor:COLORS.danger, color:'white', border:'none', borderRadius:6, cursor:'pointer', fontWeight:600 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'28px 20px' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16, marginBottom:28 }}>
          {[
            { label:'Total Borrowed', value:allBorrows.length, color:COLORS.primary, bg:COLORS.primaryLight, icon:'📚' },
            { label:'Currently Out', value:activeCount, color:'#1565c0', bg:'#e3f2fd', icon:'📤' },
            { label:'Overdue', value:overdueCount, color:COLORS.danger, bg:COLORS.dangerLight, icon:'⚠️' },
            { label:'Returned', value:returnedCount, color:COLORS.success, bg:COLORS.successLight, icon:'✅' },
          ].map(card => (
            <div key={card.label} style={{ backgroundColor:card.bg, borderRadius:10, padding:'18px 20px', border:`1px solid ${card.color}22` }}>
              <div style={{ fontSize:'1.6em', marginBottom:4 }}>{card.icon}</div>
              <div style={{ fontSize:'1.8em', fontWeight:800, color:card.color }}>{card.value}</div>
              <div style={{ fontSize:'0.82em', color:COLORS.gray, fontWeight:500 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Profile */}
        <div style={{ backgroundColor:COLORS.white, borderRadius:10, padding:'20px 24px', marginBottom:24, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', border:`1px solid ${COLORS.border}` }}>
          <h3 style={{ margin:'0 0 16px', color:COLORS.primary, fontSize:'0.9em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Profile Information</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:'12px 24px' }}>
            {[
              { label:'Student ID', value: student?.studentId ?? student?.id ?? 'N/A' },
              { label:'Full Name', value: displayName },
              { label:'Email', value: student?.email ?? 'N/A' },
              { label:'Department', value: student?.department ?? 'N/A' },
              { label:'Card ID', value: student?.universityCardId ?? 'N/A' },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize:'0.72em', color:COLORS.gray, marginBottom:2, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{f.label}</div>
                <div style={{ fontWeight:600, color:'#222', fontSize:'0.92em' }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Library Access */}
        <div style={{ backgroundColor:COLORS.white, borderRadius:10, padding:'20px 24px', marginBottom:24, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', border:`1px solid ${COLORS.border}` }}>
          <h3 style={{ margin:'0 0 16px', color:COLORS.primary, fontSize:'0.9em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Library Access</h3>
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => navigate('/scan', { state:{ scanType:'ENTRY' } })}
              style={{ padding:'10px 24px', backgroundColor:COLORS.success, color:'white', border:'none', borderRadius:6, cursor:'pointer', fontWeight:600 }}>
              🚪 Scan Entry
            </button>
            <button onClick={() => navigate('/scan', { state:{ scanType:'EXIT' } })}
              style={{ padding:'10px 24px', backgroundColor:COLORS.danger, color:'white', border:'none', borderRadius:6, cursor:'pointer', fontWeight:600 }}>
              🚶 Scan Exit
            </button>
          </div>
        </div>

        {/* Borrow History Table */}
        <div style={{ backgroundColor:COLORS.white, borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', border:`1px solid ${COLORS.border}`, overflow:'hidden' }}>
          <div style={{ padding:'16px 24px', borderBottom:`1px solid ${COLORS.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <h3 style={{ margin:0, color:COLORS.primary, fontSize:'0.9em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>📖 Borrow History</h3>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              {['ALL','ACTIVE','OVERDUE','RETURNED'].map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
                  style={{ padding:'5px 14px', border:`1px solid ${statusFilter===s?COLORS.primary:COLORS.border}`, borderRadius:20, cursor:'pointer', fontSize:'0.78em', fontWeight:600, backgroundColor:statusFilter===s?COLORS.primary:'white', color:statusFilter===s?'white':COLORS.gray }}>
                  {s}
                </button>
              ))}
              <button onClick={loadAllBorrows}
                style={{ padding:'5px 14px', backgroundColor:'#2196f3', color:'white', border:'none', borderRadius:20, cursor:'pointer', fontSize:'0.78em', fontWeight:600 }}>
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading && <div style={{ padding:40, textAlign:'center', color:COLORS.gray }}>Loading...</div>}
          {error && <div style={{ padding:20, margin:16, backgroundColor:COLORS.dangerLight, color:COLORS.danger, borderRadius:6, textAlign:'center' }}>{error}</div>}

          {!loading && !error && (
            <>
              {paginated.length === 0 ? (
                <div style={{ padding:40, textAlign:'center', color:COLORS.gray }}>
                  {allBorrows.length === 0 ? 'You have not borrowed any books yet' : 'No records match the selected filter'}
                </div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor:COLORS.grayLight, borderBottom:`2px solid ${COLORS.border}` }}>
                        {['Book Title','Author','Borrow Date','Due Date','Return Date','Status'].map(h => (
                          <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'0.75em', fontWeight:700, color:COLORS.gray, textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((record, idx) => (
                        <tr key={record.id} style={{ borderBottom:`1px solid ${COLORS.border}`, backgroundColor:idx%2===0?'white':'#fafafa' }}>
                          <td style={{ padding:'11px 16px', fontWeight:600, fontSize:'0.9em' }}>{record.book?.title || '—'}</td>
                          <td style={{ padding:'11px 16px', color:COLORS.gray, fontSize:'0.88em' }}>{record.book?.author || '—'}</td>
                          <td style={{ padding:'11px 16px', fontSize:'0.85em', whiteSpace:'nowrap' }}>{record.borrowDate ? new Date(record.borrowDate).toLocaleDateString() : '—'}</td>
                          <td style={{ padding:'11px 16px', fontSize:'0.85em', whiteSpace:'nowrap' }}>{record.dueDate ? new Date(record.dueDate).toLocaleDateString() : '—'}</td>
                          <td style={{ padding:'11px 16px', fontSize:'0.85em', whiteSpace:'nowrap' }}>{record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '—'}</td>
                          <td style={{ padding:'11px 16px' }}>{statusBadge(record)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div style={{ padding:'14px 24px', borderTop:`1px solid ${COLORS.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.82em', color:COLORS.gray }}>
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page+1)*PAGE_SIZE, filtered.length)} of {filtered.length}
                  </span>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}
                      style={{ padding:'5px 14px', border:`1px solid ${COLORS.border}`, borderRadius:5, cursor:page===0?'not-allowed':'pointer', backgroundColor:page===0?COLORS.grayLight:'white', fontWeight:600, fontSize:'0.85em' }}>
                      ← Prev
                    </button>
                    {Array.from({ length:totalPages }, (_,i) => (
                      <button key={i} onClick={() => setPage(i)}
                        style={{ padding:'5px 11px', border:`1px solid ${i===page?COLORS.primary:COLORS.border}`, borderRadius:5, cursor:'pointer', backgroundColor:i===page?COLORS.primary:'white', color:i===page?'white':'#222', fontWeight:600, fontSize:'0.85em' }}>
                        {i+1}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page===totalPages-1}
                      style={{ padding:'5px 14px', border:`1px solid ${COLORS.border}`, borderRadius:5, cursor:page===totalPages-1?'not-allowed':'pointer', backgroundColor:page===totalPages-1?COLORS.grayLight:'white', fontWeight:600, fontSize:'0.85em' }}>
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}