import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const student = user?.loggedInUser;

  const displayName =
    (student?.firstName && student?.lastName)
      ? `${student.firstName} ${student.lastName}`
      : student?.firstName ?? student?.studentId ?? 'Student';

  function handleLogout() { logout(); navigate('/'); }
  function handleScanEntry() { navigate('/scan', { state: { scanType: 'ENTRY' } }); }
  function handleScanExit() { navigate('/scan', { state: { scanType: 'EXIT' } }); }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f0f2f5' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 30, paddingBottom: 20, borderBottom: '2px solid #003d7a' }}>
        <h1 style={{ color: '#003d7a', margin: 0 }}>📚 University Library</h1>
        <button onClick={handleLogout}
          style={{ padding: '10px 20px', backgroundColor: '#d32f2f', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>

      {/* Welcome */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h2 style={{ color: '#003d7a', fontSize: '2em', margin: '10px 0' }}>
          Welcome, {displayName}
        </h2>
      </div>

      {/* Profile */}
      <div style={{ marginBottom: 40, padding: '20px', backgroundColor: 'white',
        borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '600px', margin: '0 auto 40px' }}>
        <h3 style={{ color: '#003d7a', marginTop: 0 }}>Profile Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <p style={{ color: '#666', fontSize: '0.9em', margin: '5px 0' }}>Student ID:</p>
            <p style={{ fontWeight: 'bold', margin: '0 0 15px 0' }}>
              {student?.studentId ?? student?.id ?? 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ color: '#666', fontSize: '0.9em', margin: '5px 0' }}>Email:</p>
            <p style={{ fontWeight: 'bold', margin: '0 0 15px 0' }}>
              {student?.email ?? 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ color: '#666', fontSize: '0.9em', margin: '5px 0' }}>Department:</p>
            <p style={{ fontWeight: 'bold', margin: '0 0 15px 0' }}>
              {student?.department ?? 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ color: '#666', fontSize: '0.9em', margin: '5px 0' }}>Card ID:</p>
            <p style={{ fontWeight: 'bold', margin: '0' }}>
              {student?.universityCardId ?? 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Library Access */}
      <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center',
        maxWidth: '600px', margin: '0 auto 40px' }}>
        <h3 style={{ color: '#003d7a', marginTop: 0 }}>Library Access</h3>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleScanEntry}
            style={{ padding: '12px 24px', backgroundColor: '#4caf50', color: 'white',
              border: 'none', borderRadius: '4px', cursor: 'pointer',
              fontSize: '1em', fontWeight: 'bold', minWidth: '150px' }}>
            Scan Entry
          </button>
          <button onClick={handleScanExit}
            style={{ padding: '12px 24px', backgroundColor: '#d32f2f', color: 'white',
              border: 'none', borderRadius: '4px', cursor: 'pointer',
              fontSize: '1em', fontWeight: 'bold', minWidth: '150px' }}>
            Scan Exit
          </button>
        </div>
      </div>

      {/* Bottom Logout */}
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={handleLogout}
          style={{ padding: '12px 32px', backgroundColor: '#7a8fa3', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>
    </div>
  );
}