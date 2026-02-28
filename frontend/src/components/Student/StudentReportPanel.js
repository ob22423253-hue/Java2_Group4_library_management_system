import React, { useState, useEffect, useRef } from 'react';
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

// Generates a plain-English analysis message for each stat
function getInsight(key, value, report) {
  switch (key) {
    case 'totalVisits':
      if (value === 0) return 'You have not visited the library during this period.';
      if (value === 1) return 'You visited the library once this period. Try visiting more regularly to build a study habit.';
      if (value <= 5) return `You visited the library ${value} times this period. Good start — consistent visits improve academic performance.`;
      return `You visited the library ${value} times this period. Excellent library usage! Keep it up.`;

    case 'avgVisitDurationMinutes':
      if (!value || value === 0) return 'No visit duration data available for this period.';
      if (value < 30) return `Your average stay is ${value} minutes — quite short. Consider spending more time for focused study sessions.`;
      if (value < 90) return `Your average stay is ${value} minutes. A good study session length for focused work.`;
      return `Your average stay is ${value} minutes. You are making excellent use of your library time.`;

    case 'totalBorrows':
      if (value === 0) return 'You have not borrowed any books this period. Borrowing books supports deeper learning beyond digital resources.';
      if (value <= 3) return `You borrowed ${value} book(s) this period. A good reading habit is forming.`;
      return `You borrowed ${value} books this period. You are an active reader — great for academic growth.`;

    case 'totalReturns':
      if (value === 0 && report?.totalBorrows > 0) return 'You have not returned any borrowed books yet. Make sure to return them before the due date to avoid fines.';
      if (value === 0) return 'No returns recorded this period.';
      return `You returned ${value} book(s) on time this period. Responsible borrowing helps other students access books.`;

    case 'overdueCount':
      if (value === 0) return 'No overdue books — great responsibility! You are returning books on time.';
      if (value === 1) return '⚠️ You have 1 overdue book. Please return it as soon as possible to avoid additional fines.';
      return `⚠️ You have ${value} overdue books. Please return them immediately to avoid increasing fines.`;

    case 'totalFines':
      if (!value || value === 0) return 'No fines accumulated this period. Well done!';
      return `You have accumulated $${Number(value).toFixed(2)} in fines this period. Return overdue books promptly to prevent further charges.`;

    default:
      return '';
  }
}

function getOverallSummary(report, period) {
  if (!report) return '';
  const periodLabel = period === 'TODAY' ? 'today' : `this ${period.toLowerCase()}`;
  const parts = [];

  if (report.totalVisits === 0) {
    parts.push(`You did not visit the library ${periodLabel}.`);
  } else {
    parts.push(`${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)}, you visited the library ${report.totalVisits} time(s) with an average stay of ${report.avgVisitDurationMinutes} minutes.`);
  }

  if (report.totalBorrows > 0) {
    parts.push(`You borrowed ${report.totalBorrows} book(s) and returned ${report.totalReturns}.`);
  }

  if (report.overdueCount > 0) {
    parts.push(`You currently have ${report.overdueCount} overdue book(s) — please return them to avoid further fines.`);
  } else if (report.totalBorrows > 0) {
    parts.push('All borrowed books are returned on time.');
  }

  if (report.totalFines > 0) {
    parts.push(`Total fines: $${Number(report.totalFines).toFixed(2)}.`);
  }

  return parts.join(' ');
}

export default function StudentReportPanel({ studentDbId }) {
  const [period, setPeriod] = useState('MONTH');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const printRef = useRef();

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

  function handlePrint() {
    const printArea = document.getElementById('student-report-printable');
    if (!printArea) return;
    const original = document.body.innerHTML;
    document.body.innerHTML = printArea.innerHTML;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
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

  const statCards = report ? [
    { key: 'totalVisits',             label: 'Visits',         value: report.totalVisits,                                icon: '🚪', color: COLORS.primary,  bg: COLORS.primaryLight },
    { key: 'avgVisitDurationMinutes', label: 'Avg Stay',       value: `${report.avgVisitDurationMinutes}m`,              icon: '⏱',  color: '#e65100',        bg: '#fff3e0' },
    { key: 'totalBorrows',            label: 'Books Borrowed', value: report.totalBorrows,                               icon: '📚', color: COLORS.success,   bg: COLORS.successLight },
    { key: 'totalReturns',            label: 'Returned',       value: report.totalReturns,                               icon: '✅', color: '#00695c',        bg: '#e0f2f1' },
    { key: 'overdueCount',            label: 'Overdue',        value: report.overdueCount,                               icon: '⚠️', color: COLORS.danger,    bg: COLORS.dangerLight },
    { key: 'totalFines',              label: 'Total Fines',    value: `$${Number(report.totalFines).toFixed(2)}`,        icon: '💰', color: '#6a1b9a',        bg: '#f3e5f5' },
  ] : [];

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: '20px 24px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: `1px solid ${COLORS.border}` }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: COLORS.primary, fontSize: '0.9em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          📊 My Library Statistics
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['TODAY', 'WEEK', 'MONTH', 'YEAR'].map(p => (
            <button key={p} onClick={() => handlePeriod(p)}
              style={{ padding: '5px 12px', border: `1px solid ${period === p ? COLORS.primary : COLORS.border}`, borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: '0.75em', backgroundColor: period === p ? COLORS.primary : COLORS.white, color: period === p ? 'white' : COLORS.gray }}>
              {p}
            </button>
          ))}
          {report && (
            <button onClick={handlePrint}
              style={{ padding: '5px 14px', backgroundColor: COLORS.success, color: 'white', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: '0.75em' }}>
              🖨 Print / Save PDF
            </button>
          )}
        </div>
      </div>

      {loading && <div style={{ padding: 30, textAlign: 'center', color: COLORS.gray }}>Loading your stats...</div>}
      {error && <div style={{ padding: 14, backgroundColor: COLORS.dangerLight, color: COLORS.danger, borderRadius: 6, textAlign: 'center', fontSize: '0.88em' }}>{error}</div>}

      {!loading && report && (
        <>
          {/* Overall summary banner */}
          <div style={{ backgroundColor: '#f0f4f8', border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: '0.88em', color: '#333', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: COLORS.primary }}>📋 Summary: </span>
            {getOverallSummary(report, period)}
          </div>

          {/* Stat cards with insight messages */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 20 }}>
            {statCards.map(card => (
              <div key={card.key} style={{ backgroundColor: card.bg, borderRadius: 8, padding: '14px 16px', border: `1px solid ${card.color}22`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'center', minWidth: 56 }}>
                  <div style={{ fontSize: '1.4em', marginBottom: 3 }}>{card.icon}</div>
                  <div style={{ fontSize: '1.5em', fontWeight: 800, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: '0.68em', color: COLORS.gray, fontWeight: 600, textTransform: 'uppercase' }}>{card.label}</div>
                </div>
                <div style={{ fontSize: '0.8em', color: '#444', lineHeight: 1.55, paddingTop: 2, borderLeft: `2px solid ${card.color}44`, paddingLeft: 12 }}>
                  {getInsight(card.key, card.key === 'totalFines' ? report.totalFines : card.key === 'avgVisitDurationMinutes' ? report.avgVisitDurationMinutes : parseInt(card.value), report)}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {dailyTrendData.length > 0 && (
              <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: '0.78em', fontWeight: 700, color: COLORS.primary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📈 Daily Visits</div>
                <div style={{ fontSize: '0.75em', color: COLORS.gray, marginBottom: 10 }}>How many times you visited the library each day during this period.</div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="visits" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {dayData.length > 0 && (
              <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: '0.78em', fontWeight: 700, color: COLORS.primary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📅 Visits by Day</div>
                <div style={{ fontSize: '0.75em', color: COLORS.gray, marginBottom: 10 }}>Which days of the week you visit the library most often.</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#2196f3" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

      {/* Hidden printable version — includes all analysis text */}
      <div id="student-report-printable" style={{ display: 'none' }}>
        <div style={{ fontFamily: 'Arial, sans-serif', padding: 32, maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #003d7a', paddingBottom: 16, marginBottom: 24 }}>
            <h1 style={{ color: '#003d7a', margin: 0, fontSize: '1.4em' }}>University Library System</h1>
            <h2 style={{ color: '#555', margin: '6px 0 0', fontSize: '1em', fontWeight: 400 }}>Student Library Report — Period: {period}</h2>
            <div style={{ fontSize: '0.82em', color: '#888', marginTop: 4 }}>Generated: {new Date().toLocaleString()}</div>
          </div>

          <div style={{ backgroundColor: '#f0f4f8', border: '1px solid #ccc', borderRadius: 6, padding: '12px 16px', marginBottom: 24, fontSize: '0.9em', color: '#333', lineHeight: 1.7 }}>
            <strong>Overall Summary:</strong> {getOverallSummary(report, period)}
          </div>

          <h3 style={{ color: '#003d7a', fontSize: '0.95em', borderBottom: '1px solid #ddd', paddingBottom: 6, marginBottom: 16 }}>Statistics & Analysis</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
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
                  <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, fontSize: '0.95em', color: card.color }}>{card.value}</td>
                  <td style={{ padding: '9px 12px', fontSize: '0.82em', color: '#444', lineHeight: 1.5 }}>
                    {getInsight(card.key, card.key === 'totalFines' ? report.totalFines : card.key === 'avgVisitDurationMinutes' ? report.avgVisitDurationMinutes : parseInt(card.value), report)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: '0.75em', color: '#aaa', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: 12 }}>
            University Library System — Confidential Student Report
          </div>
        </div>
      </div>
    </div>
  );
}