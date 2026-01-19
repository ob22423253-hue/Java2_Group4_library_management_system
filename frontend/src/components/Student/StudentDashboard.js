import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import BorrowReturn from '../Book/BorrowReturn';

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: '1px solid #ddd'
      }}>
        <h2>👨‍🎓 Student Dashboard</h2>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#d32f2f', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {user?.loggedInUser && (
        <div style={{ 
          marginBottom: 30, 
          padding: 15, 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px'
        }}>
          <p><strong>Welcome:</strong> {user.loggedInUser.studentId || user.loggedInUser.id}</p>
        </div>
      )}

      <section style={{ marginBottom: 30 }}>
        <h3>📚 Book Management</h3>
        <BorrowReturn />
      </section>

      <section style={{ marginTop: 30 }}>
        <h3>📱 Library Entry/Exit</h3>
        <button 
          onClick={() => navigate('/scan')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1em'
          }}
        >
          Scan Entry/Exit QR Code
        </button>
      </section>
    </div>
  );
}
