import React, { useEffect, useState, useContext } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import librarianService from '../../services/librarianService';
import studentService from '../../services/studentService';

import CurrentCount from '../LibraryEntry/CurrentCount';
import EntryList from '../LibraryEntry/EntryList';
import StudentList from '../Student/StudentList';

export default function LibrarianDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [studentsInside, setStudentsInside] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [selectedQR, setSelectedQR] = useState('ENTRY'); // ENTRY or EXIT

  // Load current students inside
  async function loadStudentsInside() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await librarianService.getCurrentlyInside();
      // Handle both direct array and wrapped response
      const data = res?.data || res || [];
      setStudentsInside(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load scans' });
    } finally { 
      setLoading(false); 
    }
  }

  // Load all students
  async function loadAllStudents() {
    try {
      const res = await studentService.getAllStudents();
      const data = res?.data || res || [];
      setStudentList(Array.isArray(data) ? data : []);
    } catch (err) { 
      setMessage({ type: 'error', text: 'Failed to load students' });
    }
  }

  useEffect(() => {
    loadStudentsInside();
    loadAllStudents();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadStudentsInside, 10000);
    return () => clearInterval(interval);
  }, []);

  // QR Code value
  const qrValue = selectedQR === 'ENTRY' ? 'LIBRARY_ENTRY' : 'LIBRARY_EXIT';

  // Student CRUD
  async function handleAddStudent(student) {
    try {
      await studentService.registerStudent(student);
      setMessage({ type: 'success', text: 'Student added successfully' });
      loadAllStudents();
    } catch (err) { 
      setMessage({ type: 'error', text: err.message || 'Failed to add student' });
    }
  }

  async function handleEditStudent(student) {
    const newName = prompt('New name', student.firstName);
    if (!newName) return;
    try {
      await studentService.updateStudent(student.id, { firstName: newName });
      setMessage({ type: 'success', text: 'Student updated successfully' });
      loadAllStudents();
    } catch (err) { 
      setMessage({ type: 'error', text: err.message || 'Failed to update student' });
    }
  }

  async function handleDeleteStudent(id) {
    if (!window.confirm('Delete this student?')) return;
    try {
      await studentService.deleteStudent(id);
      setMessage({ type: 'success', text: 'Student deleted successfully' });
      loadAllStudents();
    } catch (err) { 
      setMessage({ type: 'error', text: err.message || 'Failed to delete student' });
    }
  }

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
        <h2>📚 Librarian Dashboard</h2>
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

      {message && (
        <div style={{ 
          marginBottom: 20, 
          padding: 15,
          color: message.type === 'error' ? 'crimson' : 'green',
          backgroundColor: message.type === 'error' ? '#ffebee' : '#f1f8e9',
          border: `1px solid ${message.type === 'error' ? 'crimson' : 'green'}`,
          borderRadius: '4px'
        }}>
          {message.text}
        </div>
      )}

      {/* Current Students Inside */}
      <section style={{ marginBottom: 30 }}>
        <h3>📌 Current Students Inside</h3>
        <button 
          onClick={loadStudentsInside} 
          disabled={loading}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#2196f3', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 15
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>

        <CurrentCount count={studentsInside.length} />
        <EntryList entries={studentsInside} />
      </section>

      {/* QR Code */}
      <section style={{ marginBottom: 30 }}>
        <h3>📱 QR Code for Students</h3>
        <div style={{ marginBottom: 15 }}>
          <label>Select Type: </label>
          <select 
            value={selectedQR} 
            onChange={e => setSelectedQR(e.target.value)}
            style={{ marginLeft: 10, padding: '6px 10px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="ENTRY">Entry</option>
            <option value="EXIT">Exit</option>
          </select>
        </div>
        <div style={{ 
          padding: 20, 
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px',
          display: 'inline-block'
        }}>
          <QRCodeCanvas value={qrValue} size={200} />
        </div>
        <p style={{ marginTop: 10, fontSize: '0.9em', color: '#666' }}>
          Show this QR code to students for {selectedQR === 'ENTRY' ? 'entry' : 'exit'} scanning.
        </p>
      </section>

      {/* Student Management */}
      <section>
        <h3>👨‍🎓 Student Management</h3>
        <button 
          onClick={loadAllStudents}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4caf50', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: 15
          }}
        >
          Reload Students
        </button>
        <StudentList students={studentList} onEdit={handleEditStudent} onDelete={handleDeleteStudent} />
      </section>
    </div>
  );
}
