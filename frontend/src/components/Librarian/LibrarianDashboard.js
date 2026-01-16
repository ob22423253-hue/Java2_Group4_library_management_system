import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import librarianService from '../../services/librarianService';
import bookService from '../../services/bookService';
import studentService from '../../services/studentService';

import BookForm from '../Book/BookForm';
import BookList from '../Book/BookList';
import BorrowReturn from '../Book/BorrowReturn';

import CurrentCount from '../LibraryEntry/CurrentCount';
import EntryList from '../LibraryEntry/EntryList';
import ExitForm from '../LibraryEntry/ExitForm';
import StudentList from '../Student/StudentList';

export default function LibrarianDashboard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [studentsInside, setStudentsInside] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [bookList, setBookList] = useState([]);
  const [selectedQR, setSelectedQR] = useState('ENTRY'); // ENTRY or EXIT

  // ------------------ Load current students ------------------
  async function loadStudentsInside() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await librarianService.getCurrentlyInside();
      const data = res?.data || [];
      setStudentsInside(data);
      setMessage({ type: res?.success ? 'success' : 'error', text: res?.message || '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load scans' });
    } finally { setLoading(false); }
  }

  // ------------------ Load all students ------------------
  async function loadAllStudents() {
    try {
      const res = await studentService.getAllStudents?.();
      setStudentList(res?.data || []);
    } catch (err) { console.error(err); }
  }

  // ------------------ Load all books ------------------
  async function loadAllBooks() {
    try {
      const res = await bookService.getAllBooks?.();
      setBookList(res?.data || []);
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    loadStudentsInside();
    loadAllStudents();
    loadAllBooks();
  }, []);

  // ------------------ QR Code ------------------
  const qrValue = selectedQR === 'ENTRY' ? 'LIBRARY_ENTRY' : 'LIBRARY_EXIT';

  // ------------------ Book CRUD ------------------
  async function handleAddBook(book) {
    try {
      await bookService.addBook(book);
      loadAllBooks();
    } catch (err) { console.error(err); }
  }

  async function handleEditBook(book) {
    const newTitle = prompt('New title', book.title);
    const newAuthor = prompt('New author', book.author);
    if (!newTitle || !newAuthor) return;
    try {
      await bookService.updateBook(book.id, { title: newTitle, author: newAuthor });
      loadAllBooks();
    } catch (err) { console.error(err); }
  }

  async function handleDeleteBook(id) {
    try {
      await bookService.deleteBook(id);
      loadAllBooks();
    } catch (err) { console.error(err); }
  }

  // ------------------ Borrow/Return ------------------
  async function handleBorrow({ studentId, bookId }) {
    try {
      console.log('Borrow:', studentId, bookId);
      alert(`Borrowed book ${bookId} to student ${studentId}`);
    } catch (err) { console.error(err); }
  }

  async function handleReturn({ studentId, bookId }) {
    try {
      console.log('Return:', studentId, bookId);
      alert(`Returned book ${bookId} from student ${studentId}`);
    } catch (err) { console.error(err); }
  }

  // ------------------ Student CRUD ------------------
  async function handleAddStudent(student) {
    try {
      await studentService.registerStudent(student);
      loadAllStudents();
    } catch (err) { console.error(err); }
  }

  async function handleEditStudent(student) {
    const newName = prompt('New full name', student.fullName);
    const newPassword = prompt('New password', '');
    if (!newName) return;
    try {
      await studentService.updateStudent?.(student.id, { fullName: newName, password: newPassword });
      loadAllStudents();
    } catch (err) { console.error(err); }
  }

  async function handleDeleteStudent(id) {
    try {
      await studentService.deleteStudent?.(id);
      loadAllStudents();
    } catch (err) { console.error(err); }
  }

  // ------------------ Render ------------------
  return (
    <div style={{ padding: 20 }}>
      <h2>Librarian Dashboard</h2>

      {/* Current Students Inside */}
      <section style={{ marginBottom: 30 }}>
        <h3>📌 Current Students Inside</h3>
        <button onClick={loadStudentsInside} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
        {message && <div style={{ color: message.type === 'error' ? 'crimson' : 'green', marginTop: 10 }}>{message.text}</div>}

        {/* Current count */}
        <CurrentCount count={studentsInside.length} />

        {/* Entry list */}
        <EntryList entries={studentsInside} />

        {/* Exit form */}
        <ExitForm onExit={loadStudentsInside} />
      </section>

      {/* QR Code */}
      <section style={{ marginBottom: 30 }}>
        <h3>📱 QR Code for Students</h3>
        <label>Select Type: </label>
        <select value={selectedQR} onChange={e => setSelectedQR(e.target.value)}>
          <option value="ENTRY">Entry</option>
          <option value="EXIT">Exit</option>
        </select>
        <QRCodeCanvas value={qrValue} size={180} style={{ display: 'block', marginTop: 10 }} />
      </section>

      {/* Book Management */}
      <section style={{ marginBottom: 30 }}>
        <h3>📚 Book Management (CRUD)</h3>
        <BookForm onSubmit={handleAddBook} />
        <BookList books={bookList} onEdit={handleEditBook} onDelete={handleDeleteBook} />
        <BorrowReturn onBorrow={handleBorrow} onReturn={handleReturn} />
      </section>

      {/* Student Management */}
      <section>
        <h3>👨‍🎓 Student Management</h3>
        <button onClick={loadAllStudents}>Load Students</button>
        <StudentList students={studentList} onEdit={handleEditStudent} onDelete={handleDeleteStudent} />
      </section>
    </div>
  );
}
