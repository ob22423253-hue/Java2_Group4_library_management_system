import React, { useEffect, useState, useContext } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import librarianService from '../../services/librarianService';
import studentService from '../../services/studentService';

import BookManagement from '../Book/BookManagement';
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
  const [selectedQR, setSelectedQR] = useState('ENTRY');

  async function loadStudentsInside() {
    setLoading(true);
    try {
      const res = await librarianService.getCurrentlyInside();
      if (res !== null) {
        const data = res?.data || [];
        setStudentsInside(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load scans' });
    } finally {
      setLoading(false);
    }
  }

  async function loadAllStudents() {
    try {
      const res = await studentService.getAllStudents();
      console.log('RAW RES:', JSON.stringify(res).substring(0, 500));
      const data = Array.isArray(res) ? res : (res?.data || res?.content || []);
      setStudentList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('STUDENT ERROR:', err.message);
      setMessage({ type: 'error', text: 'Failed to load students' });
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStudentsInside();
      loadAllStudents();
    }, 300);

    const interval = setInterval(loadStudentsInside, 10000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const qrValue = selectedQR === 'ENTRY' ? 'LIBRARY_ENTRY' : 'LIBRARY_EXIT';

  async function handleEditStudent(student) {
    const dbId = student.id;
    if (!dbId) {
      setMessage({ type: 'error', text: 'Cannot edit: student database ID is missing. Please contact your backend developer.' });
      return;
    }
    const newFirstName = prompt('New first name', student.firstName);
    if (!newFirstName) return;
    const newLastName = prompt('New last name', student.lastName);
    if (!newLastName) return;
    try {
      await studentService.updateStudent(dbId, {
        ...student,
        firstName: newFirstName,
        lastName: newLastName,
      });
      setMessage({ type: 'success', text: 'Student updated successfully' });
      loadAllStudents();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update student' });
    }
  }

  async function handleDeleteStudent(student) {
    const dbId = student.id;
    if (!dbId) {
      setMessage({ type: 'error', text: 'Cannot delete: student database ID is missing. Please contact your backend developer.' });
      return;
    }
    if (!window.confirm(`Delete student ${student.firstName} ${student.lastName}?`)) return;
    try {
      await studentService.deleteStudent(dbId);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingBottom: 20, borderBottom: '1px solid #ddd' }}>
        <h2>📚 Librarian Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {message && (
        <div style={{ marginBottom: 20, padding: 15, color: message.type === 'error' ? 'crimson' : 'green', backgroundColor: message.type === 'error' ? '#ffebee' : '#f1f8e9', border: `1px solid ${message.type === 'error' ? 'crimson' : 'green'}`, borderRadius: '4px' }}>
          {message.text}
          <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <section style={{ marginBottom: 30 }}>
        <h3>📌 Current Students Inside</h3>
        <button onClick={loadStudentsInside} disabled={loading} style={{ padding: '8px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 15 }}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        <CurrentCount
          inside={studentsInside.filter(e => !e.exitTime).length}
          left={studentsInside.filter(e => e.exitTime).length}
        />
        <EntryList entries={studentsInside} />
      </section>

      <section style={{ marginBottom: 30 }}>
        <h3>📱 QR Code for Students</h3>
        <div style={{ marginBottom: 15 }}>
          <label>Select Type: </label>
          <select value={selectedQR} onChange={e => setSelectedQR(e.target.value)} style={{ marginLeft: 10, padding: '6px 10px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <option value="ENTRY">Entry</option>
            <option value="EXIT">Exit</option>
          </select>
        </div>
        <div style={{ padding: 20, backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'inline-block' }}>
          <QRCodeCanvas value={qrValue} size={200} />
        </div>
        <p style={{ marginTop: 10, fontSize: '0.9em', color: '#666' }}>
          Show this QR code to students for {selectedQR === 'ENTRY' ? 'entry' : 'exit'} scanning.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h3>👨‍🎓 Student Management</h3>
        <div style={{ marginBottom: 10, padding: '10px 15px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '0.9em', color: '#1565c0' }}>
          ℹ️ Students appear here after self-registering. Select them in Book Management below to borrow or return books.
        </div>
        <button onClick={loadAllStudents} style={{ padding: '8px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: 15 }}>
          Reload Students
        </button>
        <StudentList students={studentList} onEdit={handleEditStudent} onDelete={handleDeleteStudent} />
      </section>

      <section style={{ marginTop: 30 }}>
        <h3>📖 Book Management</h3>
        <BookManagement students={studentList} />
      </section>
    </div>
  );
}