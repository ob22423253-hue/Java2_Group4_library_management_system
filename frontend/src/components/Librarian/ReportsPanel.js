import React, { useState, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS_CHART = ['#003d7a','#2196f3','#4caf50','#ff9800','#e91e63','#9c27b0','#00bcd4','#ff5722'];
const COLORS = {
  primary: '#003d7a', primaryLight: '#e8f0fb',
  success: '#2e7d32', successLight: '#e8f5e9',
  danger: '#c62828', dangerLight: '#ffebee',
  gray: '#757575', grayLight: '#f5f5f5',
  border: '#e0e0e0', white: '#ffffff',
};

function getLibrarianInsight(key, value, report) {
  switch (key) {
    case 'totalStudents':
      if (!value || value === 0) return 'No registered students found in the system.';
      return `There are ${value} registered students in the system. This is the total pool of students who can access the library.`;

    case 'totalVisits':
      if (!value || value === 0) return 'No library visits were recorded during this period.';
      if (value <= 10) return `Only ${value} visit(s) recorded this period. Consider promoting library usage through announcements.`;
      if (value <= 50) return `${value} visits recorded this period. Moderate library activity. Check peak hours to plan staffing.`;
      return `${value} visits recorded this period. High library activity — ensure adequate resources and seating are available.`;

    case 'uniqueVisitors':
      if (!value || value === 0) return 'No unique visitors this period.';
      if (report?.totalStudents > 0) {
        const pct = ((value / report.totalStudents) * 100).toFixed(0);
        return `${value} unique students visited the library — that is ${pct}% of all registered students. ${pct < 20 ? 'Consider strategies to increase student engagement.' : pct < 50 ? 'Good reach. Work to engage the remaining students.' : 'Excellent student engagement rate.'}`;
      }
      return `${value} unique students visited the library this period.`;

    case 'totalBorrows':
      if (!value || value === 0) return 'No books were borrowed this period. Consider promoting the borrowing system to students.';
      return `${value} books were borrowed this period. Borrowing activity indicates students are actively using library resources.`;

    case 'totalReturns':
      if (!value || value === 0) return 'No books were returned this period.';
      if (report?.totalBorrows > 0 && value < report.totalBorrows) {
        return `${value} of ${report.totalBorrows} borrowed books have been returned. Follow up with students who have outstanding borrows.`;
      }
      return `${value} books were returned this period. Good return compliance.`;

    case 'overdueBooks':
      if (!value || value === 0) return 'No overdue books — excellent return compliance from students!';
      if (value <= 3) return `${value} book(s) are overdue. Send reminders to the responsible students as soon as possible.`;
      return `⚠️ ${value} books are overdue. This is a significant number — consider sending bulk reminders or implementing stricter due date policies.`;

    case 'avgVisitDurationMinutes':
      if (!value || value === 0) return 'No visit duration data available.';
      if (value < 20) return `Average stay is only ${value} minutes — very short. Students may not be finding what they need. Consider improving the library environment.`;
      if (value < 60) return `Average stay is ${value} minutes. Students are spending a reasonable amount of time studying in the library.`;
      return `Average stay is ${value} minutes — students are making excellent use of the library space for extended study sessions.`;

    default:
      return '';
  }
}

function getLibrarianOverallSummary(report, period) {
  if (!report) return '';
  const periodLabel = period === 'TODAY' ? 'today' : `this ${period.toLowerCase()}`;
  const parts = [];

  parts.push(`${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)}, the library recorded ${report.totalVisits ?? 0} total visit(s) from ${report.uniqueVisitors ?? 0} unique student(s).`);

  if (report.totalStudents > 0 && report.uniqueVisitors >= 0) {
    const pct = ((report.uniqueVisitors / report.totalStudents) * 100).toFixed(0);
    parts.push(`This represents ${pct}% of all ${report.totalStudents} registered students.`);
  }

  if (report.avgVisitDurationMinutes > 0) {
    parts.push(`The average visit lasted ${report.avgVisitDurationMinutes} minutes.`);
  }

  if (report.totalBorrows > 0) {
    parts.push(`${report.totalBorrows} book(s) were borrowed and ${report.totalReturns ?? 0} returned.`);
  }

  if (report.overdueBooks > 0) {
    parts.push(`⚠️ There are currently ${report.overdueBooks} overdue book(s) requiring attention.`);
  } else {
    parts.push('No overdue books reported — good compliance.');
  }

  return parts.join(' ');
}

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
    const printArea = document.getElementById('librarian-report-printable');
    if (!printArea) return;
    const original = document.body.innerHTML;
    document.body.innerHTML = printArea.innerHTML;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  }

  const dailyTrendData = report?.dailyVisitTrend
    ? Object.entries(report.dailyVisitTrend).map(([date, count]) => ({ date: date.slice(5), visits: count }))
    : [];

  const deptData = report?.visitsByDepartment
    ? Object.entries(report.visitsByDepartment).map(([dept, count]) => ({ name: dept, visits: count }))
    : [];

  const hourData = report?.visitsByHour
    ? Object.entries(report.visitsByHour).map(([hour, count]) => ({ hour, visits: count }))
    : [];

  const dayData = report?.visitsByDayOfWeek
    ? Object.entries(report.visitsByDayOfWeek).map(([day, count]) => ({ day: day.slice(0, 3), visits: count }))
    : [];

  const yearData = report?.visitsByYearLevel
    ? Object.entries(report.visitsByYearLevel).map(([year, count]) => ({ name: year, visits: count }))
    : [];

  const statCards = report ? [
    { key: 'totalStudents',          label: 'Total Students',   value: report.totalStudents,           icon: '👨‍🎓', color: COLORS.primary,  bg: COLORS.primaryLight },
    { key: 'totalVisits',            label: 'Total Visits',     value: report.totalVisits,             icon: '🚪', color: '#1565c0',        bg: '#e3f2fd' },
    { key: 'uniqueVisitors',         label: 'Unique Visitors',  value: report.uniqueVisitors,          icon: '👤', color: '#6a1b9a',        bg: '#f3e5f5' },
    { key: 'totalBorrows',           label: 'Books Borrowed',   value: report.totalBorrows,            icon: '📚', color: COLORS.success,   bg: COLORS.successLight },
    { key: 'totalReturns',           label: 'Books Returned',   value: report.totalReturns,            icon: '✅', color: '#00695c',        bg: '#e0f2f1' },
    { key: 'overdueBooks',           label: 'Overdue Books',    value: report.overdueBooks,            icon: '⚠️', color: COLORS.danger,    bg: COLORS.dangerLight },
    { key: 'avgVisitDurationMinutes',label: 'Avg Stay (mins)',  value: report.avgVisitDurationMinutes, icon: '⏱', color: '#e65100',        bg: '#fff3e0' },
  ] : [];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['TODAY', 'WEEK', 'MONTH', 'YEAR'].map(p => (
            <button key={p} onClick={() => handlePeriod(p)}
              style={{ padding: '8px 18px', border: `1px solid ${period === p ? COLORS.primary : COLORS.border}`, borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: '0.82em', backgroundColor: period === p ? COLORS.primary : COLORS.white, color: period === p ? 'white' : COLORS.gray }}>
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => loadReport(period)}
            style={{ padding: '8px 18px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: '0.82em' }}>
            ↻ Refresh
          </button>
          {report && (
            <button onClick={handlePrint}
              style={{ padding: '8px 18px', backgroundColor: COLORS.success, color: 'white', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: '0.82em' }}>
              🖨 Print / Save PDF
            </button>
          )}
        </div>
      </div>

      {loading && <div style={{ padding: 60, textAlign: 'center', color: COLORS.gray, fontSize: '1.1em' }}>⏳ Generating report...</div>}
      {error && <div style={{ padding: 20, backgroundColor: COLORS.dangerLight, color: COLORS.danger, borderRadius: 8, textAlign: 'center' }}>{error}</div>}
      {!loading && !report && !error && (
        <div style={{ padding: 60, textAlign: 'center', color: COLORS.gray }}>Select a period above to generate the report</div>
      )}

      {!loading && report && (
        <div>
          {/* Overall summary banner */}
          <div style={{ backgroundColor: '#f0f4f8', border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '14px 18px', marginBottom: 24, fontSize: '0.88em', color: '#333', lineHeight: 1.7 }}>
            <span style={{ fontWeight: 700, color: COLORS.primary }}>📋 Report Summary: </span>
            {getLibrarianOverallSummary(report, period)}
          </div>

          {/* Stat cards with insight messages */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 24 }}>
            {statCards.map(card => (
              <div key={card.key} style={{ backgroundColor: card.bg, borderRadius: 10, padding: '14px 16px', border: `1px solid ${card.color}22`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'center', minWidth: 60 }}>
                  <div style={{ fontSize: '1.5em', marginBottom: 3 }}>{card.icon}</div>
                  <div style={{ fontSize: '1.6em', fontWeight: 800, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: '0.68em', color: COLORS.gray, fontWeight: 600, textTransform: 'uppercase', lineHeight: 1.3 }}>{card.label}</div>
                </div>
                <div style={{ fontSize: '0.8em', color: '#444', lineHeight: 1.6, paddingTop: 2, borderLeft: `2px solid ${card.color}44`, paddingLeft: 12 }}>
                  {getLibrarianInsight(card.key, card.value, report)}
                </div>
              </div>
            ))}
          </div>

          {/* Charts — same as before with added captions */}
          {dailyTrendData.length > 0 && (
            <div style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: '20px', marginBottom: 20, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h4 style={{ margin: '0 0 4px', color: COLORS.primary, fontSize: '0.88em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📈 Daily Visit Trend</h4>
              <p style={{ margin: '0 0 14px', fontSize: '0.78em', color: COLORS.gray }}>Shows how many students visited the library on each day during this period. Peaks indicate high-demand days.</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="visits" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {deptData.length > 0 && (
              <div style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: '20px', border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin: '0 0 4px', color: COLORS.primary, fontSize: '0.88em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏫 Visits by Department</h4>
                <p style={{ margin: '0 0 12px', fontSize: '0.78em', color: COLORS.gray }}>Which departments use the library most. Helps identify underserved departments.</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={deptData} dataKey="visits" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {deptData.map((_, i) => <Cell key={i} fill={COLORS_CHART[i % COLORS_CHART.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {dayData.length > 0 && (
              <div style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: '20px', border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin: '0 0 4px', color: COLORS.primary, fontSize: '0.88em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📅 Visits by Day of Week</h4>
                <p style={{ margin: '0 0 12px', fontSize: '0.78em', color: COLORS.gray }}>Busiest days of the week. Use this to plan staffing and resource availability.</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#2196f3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {hourData.length > 0 && (
              <div style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: '20px', border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin: '0 0 4px', color: COLORS.primary, fontSize: '0.88em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>⏰ Peak Hours</h4>
                <p style={{ margin: '0 0 12px', fontSize: '0.78em', color: COLORS.gray }}>The busiest hours of the day. Plan staffing and ensure enough resources during peak times.</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={hourData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#4caf50" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {yearData.length > 0 && (
              <div style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: '20px', border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin: '0 0 4px', color: COLORS.primary, fontSize: '0.88em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎓 Visits by Year Level</h4>
                <p style={{ margin: '0 0 12px', fontSize: '0.78em', color: COLORS.gray }}>Which year groups use the library most. Useful for targeting outreach to less active year levels.</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={yearData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#ff9800" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Visitors Table */}
          {report.topVisitors?.length > 0 && (
            <div style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: '20px', marginBottom: 20, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h4 style={{ margin: '0 0 4px', color: COLORS.primary, fontSize: '0.88em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏆 Top Visitors</h4>
              <p style={{ margin: '0 0 14px', fontSize: '0.78em', color: COLORS.gray }}>The students who visited the library most frequently this period.</p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                    {['Rank', 'Student ID', 'Name', 'Department', 'Visits'].map(h => (
                      <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '0.75em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.topVisitors.map((v, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: idx % 2 === 0 ? COLORS.white : '#fafafa' }}>
                      <td style={{ padding: '9px 14px', fontWeight: 700 }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</td>
                      <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontSize: '0.88em', color: COLORS.primary, fontWeight: 600 }}>{v.studentId}</td>
                      <td style={{ padding: '9px 14px', fontWeight: 500 }}>{v.name}</td>
                      <td style={{ padding: '9px 14px', color: COLORS.gray, fontSize: '0.88em' }}>{v.department}</td>
                      <td style={{ padding: '9px 14px', fontWeight: 700, color: COLORS.primary }}>{v.visits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Top Borrowed Books Table */}
          {report.topBorrowedBooks?.length > 0 && (
            <div style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: '20px', marginBottom: 20, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h4 style={{ margin: '0 0 4px', color: COLORS.primary, fontSize: '0.88em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📚 Most Borrowed Books</h4>
              <p style={{ margin: '0 0 14px', fontSize: '0.78em', color: COLORS.gray }}>The most borrowed books this period. Consider ordering more copies of high-demand titles.</p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                    {['Rank', 'Title', 'Author', 'Category', 'Borrows'].map(h => (
                      <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '0.75em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.topBorrowedBooks.map((b, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: idx % 2 === 0 ? COLORS.white : '#fafafa' }}>
                      <td style={{ padding: '9px 14px', fontWeight: 700 }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</td>
                      <td style={{ padding: '9px 14px', fontWeight: 600 }}>{b.title}</td>
                      <td style={{ padding: '9px 14px', color: COLORS.gray, fontSize: '0.88em' }}>{b.author}</td>
                      <td style={{ padding: '9px 14px', color: COLORS.gray, fontSize: '0.88em' }}>{b.category}</td>
                      <td style={{ padding: '9px 14px', fontWeight: 700, color: COLORS.primary }}>{b.borrowCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Hidden printable version */}
      {report && (
        <div id="librarian-report-printable" style={{ display: 'none' }}>
          <div style={{ fontFamily: 'Arial, sans-serif', padding: 32, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #003d7a', paddingBottom: 16, marginBottom: 24 }}>
              <h1 style={{ color: '#003d7a', margin: 0, fontSize: '1.4em' }}>University Library System</h1>
              <h2 style={{ color: '#555', margin: '6px 0 0', fontSize: '1em', fontWeight: 400 }}>Librarian Report — Period: {period}</h2>
              <div style={{ fontSize: '0.82em', color: '#888', marginTop: 4 }}>Generated: {new Date().toLocaleString()}</div>
            </div>

            <div style={{ backgroundColor: '#f0f4f8', border: '1px solid #ccc', borderRadius: 6, padding: '12px 16px', marginBottom: 24, fontSize: '0.9em', color: '#333', lineHeight: 1.7 }}>
              <strong>Overall Summary:</strong> {getLibrarianOverallSummary(report, period)}
            </div>

            <h3 style={{ color: '#003d7a', fontSize: '0.95em', borderBottom: '1px solid #ddd', paddingBottom: 6, marginBottom: 16 }}>Statistics & Analysis</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 28 }}>
              <thead>
                <tr style={{ backgroundColor: '#003d7a', color: 'white' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.8em' }}>Metric</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.8em' }}>Value</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.8em' }}>What This Means</th>
                </tr>
              </thead>
              <tbody>
                {statCards.map((card, idx) => (
                  <tr key={card.key} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '9px 12px', fontWeight: 600, fontSize: '0.85em' }}>{card.icon} {card.label}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, fontSize: '0.95em' }}>{card.value}</td>
                    <td style={{ padding: '9px 12px', fontSize: '0.82em', color: '#444', lineHeight: 1.5 }}>
                      {getLibrarianInsight(card.key, card.value, report)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {report.topVisitors?.length > 0 && (
              <>
                <h3 style={{ color: '#003d7a', fontSize: '0.95em', borderBottom: '1px solid #ddd', paddingBottom: 6, marginBottom: 14 }}>🏆 Top Visitors</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#003d7a', color: 'white' }}>
                      {['Rank', 'Student ID', 'Name', 'Department', 'Visits'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.8em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.topVisitors.map((v, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                        <td style={{ padding: '8px 12px', fontSize: '0.85em' }}>#{idx + 1}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.85em' }}>{v.studentId}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.85em' }}>{v.name}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.85em' }}>{v.department}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.85em', fontWeight: 700 }}>{v.visits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {report.topBorrowedBooks?.length > 0 && (
              <>
                <h3 style={{ color: '#003d7a', fontSize: '0.95em', borderBottom: '1px solid #ddd', paddingBottom: 6, marginBottom: 14 }}>📚 Most Borrowed Books</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#003d7a', color: 'white' }}>
                      {['Rank', 'Title', 'Author', 'Category', 'Borrows'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.8em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.topBorrowedBooks.map((b, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                        <td style={{ padding: '8px 12px', fontSize: '0.85em' }}>#{idx + 1}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.85em', fontWeight: 600 }}>{b.title}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.85em' }}>{b.author}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.85em' }}>{b.category}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.85em', fontWeight: 700 }}>{b.borrowCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <div style={{ fontSize: '0.75em', color: '#aaa', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: 12 }}>
              University Library System — Confidential Librarian Report
            </div>
          </div>
        </div>
      )}
    </div>
  );
}