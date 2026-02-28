import React, { useState, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS_CHART = ['#003d7a','#2196f3','#4caf50','#ff9800','#e91e63','#9c27b0','#00bcd4','#ff5722'];
const COLORS = {
  primary: '#003d7a', primaryLight: '#e8f0fb',
  success: '#2e7d32', successLight: '#e8f5e9',
  danger: '#c62828', dangerLight: '#ffebee',
  gray: '#757575', grayLight: '#f5f5f5',
  border: '#e0e0e0', white: '#ffffff',
};

export default function ReportsPanel() {
  const [period, setPeriod] = useState('MONTH');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReport = useCallback(async (selectedPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/reports/librarian/summary?period=${selectedPeriod}`,
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      const data = await res.json();
      if (res.ok) {
        setReport(data?.data ?? data);
      } else {
        setError(data?.message || 'Failed to load report');
      }
    } catch {
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, []);

  function handlePeriod(p) {
    setPeriod(p);
    loadReport(p);
  }

  function handlePrint() {
    window.print();
  }

  // Convert maps to chart arrays
  const dailyTrendData = report?.dailyVisitTrend
    ? Object.entries(report.dailyVisitTrend).map(([date, count]) => ({
        date: date.slice(5), visits: count
      }))
    : [];

  const deptData = report?.visitsByDepartment
    ? Object.entries(report.visitsByDepartment).map(([dept, count]) => ({
        name: dept, visits: count
      }))
    : [];

  const hourData = report?.visitsByHour
    ? Object.entries(report.visitsByHour).map(([hour, count]) => ({
        hour, visits: count
      }))
    : [];

  const dayData = report?.visitsByDayOfWeek
    ? Object.entries(report.visitsByDayOfWeek).map(([day, count]) => ({
        day: day.slice(0, 3), visits: count
      }))
    : [];

  const yearData = report?.visitsByYearLevel
    ? Object.entries(report.visitsByYearLevel).map(([year, count]) => ({
        name: year, visits: count
      }))
    : [];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Controls */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div style={{ display:'flex', gap:8 }}>
          {['TODAY','WEEK','MONTH','YEAR'].map(p => (
            <button key={p} onClick={() => handlePeriod(p)}
              style={{ padding:'8px 18px', border:`1px solid ${period===p ? COLORS.primary : COLORS.border}`, borderRadius:20, cursor:'pointer', fontWeight:700, fontSize:'0.82em', backgroundColor:period===p ? COLORS.primary : COLORS.white, color:period===p ? 'white' : COLORS.gray }}>
              {p}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => loadReport(period)}
            style={{ padding:'8px 18px', backgroundColor:'#2196f3', color:'white', border:'none', borderRadius:20, cursor:'pointer', fontWeight:600, fontSize:'0.82em' }}>
            ↻ Refresh
          </button>
          <button onClick={handlePrint}
            style={{ padding:'8px 18px', backgroundColor:COLORS.success, color:'white', border:'none', borderRadius:20, cursor:'pointer', fontWeight:600, fontSize:'0.82em' }}>
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      {loading && <div style={{ padding:60, textAlign:'center', color:COLORS.gray, fontSize:'1.1em' }}>⏳ Generating report...</div>}
      {error && <div style={{ padding:20, backgroundColor:COLORS.dangerLight, color:COLORS.danger, borderRadius:8, textAlign:'center' }}>{error}</div>}

      {!loading && !report && !error && (
        <div style={{ padding:60, textAlign:'center', color:COLORS.gray }}>
          Select a period above to generate the report
        </div>
      )}

      {!loading && report && (
        <div id="report-content">

          {/* Overview Cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px,1fr))', gap:14, marginBottom:24 }}>
            {[
              { label:'Total Students', value:report.totalStudents, icon:'👨‍🎓', color:COLORS.primary, bg:COLORS.primaryLight },
              { label:'Total Visits', value:report.totalVisits, icon:'🚪', color:'#1565c0', bg:'#e3f2fd' },
              { label:'Unique Visitors', value:report.uniqueVisitors, icon:'👤', color:'#6a1b9a', bg:'#f3e5f5' },
              { label:'Books Borrowed', value:report.totalBorrows, icon:'📚', color:COLORS.success, bg:COLORS.successLight },
              { label:'Books Returned', value:report.totalReturns, icon:'✅', color:'#00695c', bg:'#e0f2f1' },
              { label:'Overdue Books', value:report.overdueBooks, icon:'⚠️', color:COLORS.danger, bg:COLORS.dangerLight },
              { label:'Avg Stay (mins)', value:report.avgVisitDurationMinutes, icon:'⏱', color:'#e65100', bg:'#fff3e0' },
            ].map(card => (
              <div key={card.label} style={{ backgroundColor:card.bg, borderRadius:10, padding:'16px', border:`1px solid ${card.color}22`, textAlign:'center' }}>
                <div style={{ fontSize:'1.5em', marginBottom:4 }}>{card.icon}</div>
                <div style={{ fontSize:'1.6em', fontWeight:800, color:card.color }}>{card.value}</div>
                <div style={{ fontSize:'0.75em', color:COLORS.gray, fontWeight:500 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Daily Visit Trend */}
          {dailyTrendData.length > 0 && (
            <div style={{ backgroundColor:COLORS.white, borderRadius:10, padding:'20px', marginBottom:20, border:`1px solid ${COLORS.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h4 style={{ margin:'0 0 16px', color:COLORS.primary, fontSize:'0.88em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>📈 Daily Visit Trend</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize:11 }} />
                  <YAxis tick={{ fontSize:11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="visits" stroke={COLORS.primary} strokeWidth={2} dot={{ r:3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Two column charts */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>

            {/* Visits by Department */}
            {deptData.length > 0 && (
              <div style={{ backgroundColor:COLORS.white, borderRadius:10, padding:'20px', border:`1px solid ${COLORS.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin:'0 0 16px', color:COLORS.primary, fontSize:'0.88em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>🏫 Visits by Department</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={deptData} dataKey="visits" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {deptData.map((_, i) => <Cell key={i} fill={COLORS_CHART[i % COLORS_CHART.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Visits by Day of Week */}
            {dayData.length > 0 && (
              <div style={{ backgroundColor:COLORS.white, borderRadius:10, padding:'20px', border:`1px solid ${COLORS.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin:'0 0 16px', color:COLORS.primary, fontSize:'0.88em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>📅 Visits by Day of Week</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize:11 }} />
                    <YAxis tick={{ fontSize:11 }} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#2196f3" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Peak Hours */}
            {hourData.length > 0 && (
              <div style={{ backgroundColor:COLORS.white, borderRadius:10, padding:'20px', border:`1px solid ${COLORS.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin:'0 0 16px', color:COLORS.primary, fontSize:'0.88em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>⏰ Peak Hours</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={hourData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize:10 }} />
                    <YAxis tick={{ fontSize:11 }} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#4caf50" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Visits by Year Level */}
            {yearData.length > 0 && (
              <div style={{ backgroundColor:COLORS.white, borderRadius:10, padding:'20px', border:`1px solid ${COLORS.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin:'0 0 16px', color:COLORS.primary, fontSize:'0.88em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>🎓 Visits by Year Level</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={yearData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize:11 }} />
                    <YAxis tick={{ fontSize:11 }} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#ff9800" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Visitors Table */}
          {report.topVisitors?.length > 0 && (
            <div style={{ backgroundColor:COLORS.white, borderRadius:10, padding:'20px', marginBottom:20, border:`1px solid ${COLORS.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h4 style={{ margin:'0 0 16px', color:COLORS.primary, fontSize:'0.88em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>🏆 Top Visitors</h4>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor:COLORS.primary, color:'white' }}>
                    {['Rank','Student ID','Name','Department','Visits'].map(h => (
                      <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:'0.75em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.topVisitors.map((v, idx) => (
                    <tr key={idx} style={{ borderBottom:`1px solid ${COLORS.border}`, backgroundColor:idx%2===0?COLORS.white:'#fafafa' }}>
                      <td style={{ padding:'9px 14px', fontWeight:700, color:idx===0?'#f9a825':idx===1?COLORS.gray:COLORS.gray }}>{idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`#${idx+1}`}</td>
                      <td style={{ padding:'9px 14px', fontFamily:'monospace', fontSize:'0.88em', color:COLORS.primary, fontWeight:600 }}>{v.studentId}</td>
                      <td style={{ padding:'9px 14px', fontWeight:500 }}>{v.name}</td>
                      <td style={{ padding:'9px 14px', color:COLORS.gray, fontSize:'0.88em' }}>{v.department}</td>
                      <td style={{ padding:'9px 14px', fontWeight:700, color:COLORS.primary }}>{v.visits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Top Borrowed Books Table */}
          {report.topBorrowedBooks?.length > 0 && (
            <div style={{ backgroundColor:COLORS.white, borderRadius:10, padding:'20px', marginBottom:20, border:`1px solid ${COLORS.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h4 style={{ margin:'0 0 16px', color:COLORS.primary, fontSize:'0.88em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>📚 Most Borrowed Books</h4>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor:COLORS.primary, color:'white' }}>
                    {['Rank','Title','Author','Category','Borrows'].map(h => (
                      <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:'0.75em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.topBorrowedBooks.map((b, idx) => (
                    <tr key={idx} style={{ borderBottom:`1px solid ${COLORS.border}`, backgroundColor:idx%2===0?COLORS.white:'#fafafa' }}>
                      <td style={{ padding:'9px 14px', fontWeight:700 }}>{idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`#${idx+1}`}</td>
                      <td style={{ padding:'9px 14px', fontWeight:600 }}>{b.title}</td>
                      <td style={{ padding:'9px 14px', color:COLORS.gray, fontSize:'0.88em' }}>{b.author}</td>
                      <td style={{ padding:'9px 14px', color:COLORS.gray, fontSize:'0.88em' }}>{b.category}</td>
                      <td style={{ padding:'9px 14px', fontWeight:700, color:COLORS.primary }}>{b.borrowCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-content, #report-content * { visibility: visible; }
          #report-content { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}