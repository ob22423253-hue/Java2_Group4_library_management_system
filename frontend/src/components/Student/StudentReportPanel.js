import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = {
  primary: '#003d7a', primaryLight: '#e8f0fb',
  success: '#2e7d32', successLight: '#e8f5e9',
  danger: '#c62828', dangerLight: '#ffebee',
  gray: '#757575', grayLight: '#f5f5f5',
  border: '#e0e0e0', white: '#ffffff',
};

export default function StudentReportPanel({ studentDbId }) {
  const [period, setPeriod] = useState('MONTH');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadReport(p) {
    if (!studentDbId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/reports/student/${studentDbId}/summary?period=${p}`,
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
  }

  useEffect(() => { loadReport(period); }, [studentDbId]);

  function handlePeriod(p) {
    setPeriod(p);
    loadReport(p);
  }

  const dailyTrendData = report?.dailyVisitTrend
    ? Object.entries(report.dailyVisitTrend).map(([date, count]) => ({
        date: date.slice(5), visits: count
      }))
    : [];

  const dayData = report?.visitsByDayOfWeek
    ? Object.entries(report.visitsByDayOfWeek).map(([day, count]) => ({
        day: day.slice(0, 3), visits: count
      }))
    : [];

  return (
    <div style={{ backgroundColor:COLORS.white, borderRadius:10, padding:'20px 24px', marginBottom:24, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', border:`1px solid ${COLORS.border}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, marginBottom:16 }}>
        <h3 style={{ margin:0, color:COLORS.primary, fontSize:'0.9em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>📊 My Library Statistics</h3>
        <div style={{ display:'flex', gap:6 }}>
          {['TODAY','WEEK','MONTH','YEAR'].map(p => (
            <button key={p} onClick={() => handlePeriod(p)}
              style={{ padding:'5px 12px', border:`1px solid ${period===p?COLORS.primary:COLORS.border}`, borderRadius:20, cursor:'pointer', fontWeight:700, fontSize:'0.75em', backgroundColor:period===p?COLORS.primary:COLORS.white, color:period===p?'white':COLORS.gray }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ padding:30, textAlign:'center', color:COLORS.gray }}>Loading your stats...</div>}
      {error && <div style={{ padding:14, backgroundColor:COLORS.dangerLight, color:COLORS.danger, borderRadius:6, textAlign:'center', fontSize:'0.88em' }}>{error}</div>}

      {!loading && report && (
        <>
          {/* Stats cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px,1fr))', gap:12, marginBottom:20 }}>
            {[
              { label:'Visits', value:report.totalVisits, icon:'🚪', color:COLORS.primary, bg:COLORS.primaryLight },
              { label:'Avg Stay', value:`${report.avgVisitDurationMinutes}m`, icon:'⏱', color:'#e65100', bg:'#fff3e0' },
              { label:'Books Borrowed', value:report.totalBorrows, icon:'📚', color:COLORS.success, bg:COLORS.successLight },
              { label:'Returned', value:report.totalReturns, icon:'✅', color:'#00695c', bg:'#e0f2f1' },
              { label:'Overdue', value:report.overdueCount, icon:'⚠️', color:COLORS.danger, bg:COLORS.dangerLight },
              { label:'Total Fines', value:`$${Number(report.totalFines).toFixed(2)}`, icon:'💰', color:'#6a1b9a', bg:'#f3e5f5' },
            ].map(card => (
              <div key={card.label} style={{ backgroundColor:card.bg, borderRadius:8, padding:'14px', border:`1px solid ${card.color}22`, textAlign:'center' }}>
                <div style={{ fontSize:'1.3em', marginBottom:3 }}>{card.icon}</div>
                <div style={{ fontSize:'1.4em', fontWeight:800, color:card.color }}>{card.value}</div>
                <div style={{ fontSize:'0.72em', color:COLORS.gray, fontWeight:500 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            {dailyTrendData.length > 0 && (
              <div style={{ border:`1px solid ${COLORS.border}`, borderRadius:8, padding:16 }}>
                <div style={{ fontSize:'0.78em', fontWeight:700, color:COLORS.primary, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>📈 Daily Visits</div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize:10 }} />
                    <YAxis tick={{ fontSize:10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="visits" stroke={COLORS.primary} strokeWidth={2} dot={{ r:2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {dayData.length > 0 && (
              <div style={{ border:`1px solid ${COLORS.border}`, borderRadius:8, padding:16 }}>
                <div style={{ fontSize:'0.78em', fontWeight:700, color:COLORS.primary, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>📅 Visits by Day</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize:10 }} />
                    <YAxis tick={{ fontSize:10 }} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#2196f3" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}