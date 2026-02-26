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

const COLORS = {
  primary: '#003d7a', border: '#e0e0e0', gray: '#757575',
  grayLight: '#f5f5f5', danger: '#c62828', dangerLight: '#ffebee',
  success: '#2e7d32', successLight: '#e8f5e9', white: '#ffffff',
};

export default function LibrarianDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [studentsInside, setStudentsInside] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [selectedQR, setSelectedQR] = useState('ENTRY');

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', studentId: '', email: '',
    department: '', phoneNumber: '', universityCardId: '',
  });
  const [editingStudentDbId, setEditingStudentDbId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

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
      const data = Array.isArray(res) ? res : (res?.data || res?.content || []);
      setStudentList(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load students' });
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStudentsInside();
      loadAllStudents();
    }, 300);
    const interval = setInterval(loadStudentsInside, 10000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);

  const qrValue = selectedQR === 'ENTRY' ? 'LIBRARY_ENTRY' : 'LIBRARY_EXIT';

  function handleEditStudent(student) {
    const dbId = student.id;
    if (!dbId) {
      setMessage({ type: 'error', text: 'Cannot edit: student database ID is missing.' });
      return;
    }
    setEditingStudentDbId(dbId);
    setEditForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      studentId: student.studentId || '',
      email: student.email || '',
      department: student.department || '',
      phoneNumber: student.phoneNumber || '',
      universityCardId: student.universityCardId || '',
    });
    setEditModalOpen(true);
  }

  async function handleEditSubmit() {
    if (!editForm.firstName || !editForm.lastName) {
      setMessage({ type: 'error', text: 'First name and last name are required' });
      return;
    }
    setEditLoading(true);
    try {
      await studentService.updateStudent(editingStudentDbId, editForm);
      setMessage({ type: 'success', text: 'Student updated successfully' });
      setEditModalOpen(false);
      loadAllStudents();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update student' });
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDeleteStudent(student) {
    const dbId = student.id;
    if (!dbId) {
      setMessage({ type: 'error', text: 'Cannot delete: student database ID is missing.' });
      return;
    }
    if (!window.confirm(`Delete student ${student.firstName} ${student.lastName}? This cannot be undone.`)) return;
    try {
      await studentService.deleteStudent(dbId);
      setMessage({ type: 'success', text: 'Student deleted successfully' });
      loadAllStudents();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete student' });
    }
  }

  function handleLogout() { logout(); navigate('/'); }

  return (
    <div style={{ padding: 20, fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f0f4f8', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingBottom: 20, borderBottom: `2px solid ${COLORS.primary}`, backgroundColor: COLORS.white, padding: '16px 24px', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.8em' }}>📚</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.2em', color: COLORS.primary }}>University Library</div>
            <div style={{ fontSize: '0.8em', color: COLORS.gray }}>Librarian Dashboard</div>
          </div>
        </div>
        <button onClick={handleLogout}
          style={{ padding: '8px 20px', backgroundColor: COLORS.danger, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
          Logout
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{ marginBottom: 20, padding: '12px 16px', color: message.type === 'error' ? COLORS.danger : COLORS.success, backgroundColor: message.type === 'error' ? COLORS.dangerLight : COLORS.successLight, border: `1px solid ${message.type === 'error' ? COLORS.danger : COLORS.success}`, borderRadius: 6 }}>
          {message.text}
          <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Current Students Inside */}
      <section style={{ marginBottom: 30, backgroundColor: COLORS.white, padding: '20px 24px', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: COLORS.primary, marginTop: 0 }}>📌 Current Students Inside</h3>
        <button onClick={loadStudentsInside} disabled={loading}
          style={{ padding: '7px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: 5, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 15, fontWeight: 600 }}>
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
        <CurrentCount
          inside={studentsInside.filter(e => !e.exitTime).length}
          left={studentsInside.filter(e => e.exitTime).length}
        />
        <EntryList entries={studentsInside} />
      </section>

      {/* QR Code */}
      <section style={{ marginBottom: 30, backgroundColor: COLORS.white, padding: '20px 24px', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: COLORS.primary, marginTop: 0 }}>📱 QR Code for Students</h3>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: 600, color: COLORS.gray, fontSize: '0.9em' }}>Select Type: </label>
          <select value={selectedQR} onChange={e => setSelectedQR(e.target.value)}
            style={{ marginLeft: 10, padding: '6px 12px', borderRadius: 5, border: `1px solid ${COLORS.border}` }}>
            <option value="ENTRY">Entry</option>
            <option value="EXIT">Exit</option>
          </select>
        </div>
        <div style={{ padding: 20, backgroundColor: COLORS.grayLight, borderRadius: 8, display: 'inline-block' }}>
          <QRCodeCanvas value={qrValue} size={200} />
        </div>
        <p style={{ marginTop: 10, fontSize: '0.9em', color: COLORS.gray }}>
          Show this QR code to students for {selectedQR === 'ENTRY' ? 'entry' : 'exit'} scanning.
        </p>
      </section>

      {/* Student Management */}
      <section style={{ marginBottom: 30, backgroundColor: COLORS.white, padding: '20px 24px', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: COLORS.primary, marginTop: 0 }}>👨‍🎓 Student Management</h3>
        <div style={{ marginBottom: 12, padding: '10px 14px', backgroundColor: '#e3f2fd', borderRadius: 6, fontSize: '0.88em', color: '#1565c0' }}>
          ℹ️ Students appear here after self-registering. Select them in Book Management below to borrow or return books.
        </div>
        <button onClick={loadAllStudents}
          style={{ padding: '7px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', marginBottom: 15, fontWeight: 600 }}>
          ↻ Reload Students
        </button>
        <StudentList students={studentList} onEdit={handleEditStudent} onDelete={handleDeleteStudent} />
      </section>

      {/* Book Management */}
      <section style={{ backgroundColor: COLORS.white, padding: '20px 24px', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: COLORS.primary, marginTop: 0 }}>📖 Book Management</h3>
        <BookManagement students={studentList} />
      </section>

      {/* Edit Student Modal */}
      {editModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: COLORS.white, borderRadius: 10, padding: '28px 32px', width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 20px', color: COLORS.primary, fontSize: '1.1em', fontWeight: 700 }}>✏️ Edit Student</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'First Name *', key: 'firstName', type: 'text' },
                { label: 'Last Name *', key: 'lastName', type: 'text' },
                { label: 'Student ID', key: 'studentId', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Department', key: 'department', type: 'text' },
                { label: 'Phone Number', key: 'phoneNumber', type: 'text' },
                { label: 'University Card ID', key: 'universityCardId', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ fontSize: '0.82em', color: COLORS.gray, display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
                  <input
                    type={type}
                    value={editForm[key]}
                    onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: '0.95em', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={handleEditSubmit} disabled={editLoading}
                style={{ flex: 1, padding: '10px', backgroundColor: editLoading ? '#ccc' : COLORS.primary, color: 'white', border: 'none', borderRadius: 6, cursor: editLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.95em' }}>
                {editLoading ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button onClick={() => setEditModalOpen(false)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.95em' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}