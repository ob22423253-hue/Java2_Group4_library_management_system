import React, { useState, useEffect } from 'react';
import bookService from '../../services/bookService';

export default function BookManagement({ students }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('books');
  const [search, setSearch] = useState('');

  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '', author: '', isbn: '', category: '', publisher: '', totalCopies: 1,
    locationCode: '', publicationYear: new Date().getFullYear()
  });

  const [borrowForm, setBorrowForm] = useState({ studentId: '', bookId: '', dueDate: '' });
  const [borrowLoading, setBorrowLoading] = useState(false);

  const [activeBorrows, setActiveBorrows] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [borrowsLoading, setBorrowsLoading] = useState(false);

  async function loadBooks() {
    setLoading(true);
    try {
      const res = await bookService.getAllBooks();
      const data = res?.content ?? (Array.isArray(res) ? res : res?.data ?? []);
      setBooks(Array.isArray(data) ? data : []);
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to load books: ' + e.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBooks(); }, []);

  function openAddBook() {
    setEditingBook(null);
    setBookForm({
      title: '', author: '', isbn: '', category: '', publisher: '', totalCopies: 1,
      locationCode: '', publicationYear: new Date().getFullYear()
    });
    setShowBookForm(true);
  }

  function openEditBook(book) {
    setEditingBook(book);
    setBookForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || '',
      publisher: book.publisher || '',
      totalCopies: book.totalCopies || 1,
      locationCode: book.locationCode || '',
      publicationYear: book.publicationYear || new Date().getFullYear()
    });
    setShowBookForm(true);
  }

  async function handleBookSubmit() {
    if (!bookForm.title || !bookForm.author || !bookForm.isbn) {
      setMessage({ type: 'error', text: 'Title, Author and ISBN are required' });
      return;
    }
    if (!bookForm.locationCode) {
      setMessage({ type: 'error', text: 'Location Code is required (e.g. FIC-001)' });
      return;
    }
    if (!bookForm.publicationYear) {
      setMessage({ type: 'error', text: 'Publication Year is required' });
      return;
    }
    try {
      if (editingBook) {
        await bookService.updateBook(editingBook.id, {
          ...bookForm,
          totalCopies: parseInt(bookForm.totalCopies),
          publicationYear: parseInt(bookForm.publicationYear)
        });
        setMessage({ type: 'success', text: 'Book updated successfully' });
      } else {
        await bookService.addBook({
          ...bookForm,
          availableCopies: parseInt(bookForm.totalCopies),
          totalCopies: parseInt(bookForm.totalCopies),
          publicationYear: parseInt(bookForm.publicationYear)
        });
        setMessage({ type: 'success', text: 'Book added successfully' });
      }
      setShowBookForm(false);
      loadBooks();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  async function handleDeleteBook(id) {
    if (!window.confirm('Delete this book?')) return;
    try {
      await bookService.deleteBook(id);
      setMessage({ type: 'success', text: 'Book deleted' });
      loadBooks();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  async function handleBorrow() {
  if (!borrowForm.studentId || !borrowForm.bookId || !borrowForm.dueDate) {
    setMessage({ type: 'error', text: 'Please fill in all borrow fields' });
    return;
  }
  setBorrowLoading(true);
  try {
    const res = await fetch('/api/v1/borrow-records/borrow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        studentId: parseInt(borrowForm.studentId),
        bookId: parseInt(borrowForm.bookId),
        dueDate: borrowForm.dueDate
      })
    });
    // AFTER
const text = await res.text();
const data = text ? JSON.parse(text) : {};
if (res.ok) {
      setMessage({ type: 'success', text: 'Book borrowed successfully' });
      setBorrowForm({ studentId: '', bookId: '', dueDate: '' });
      loadBooks();
    } else {
      setMessage({ type: 'error', text: data?.message || 'Failed to borrow book' });
    }
  } catch (e) {
    setMessage({ type: 'error', text: e.message });
  } finally {
    setBorrowLoading(false);
  }
}

  async function loadActiveBorrows(studentDbId) {
    if (!studentDbId) { setActiveBorrows([]); return; }
    setBorrowsLoading(true);
    try {
      const res = await fetch(`/api/v1/borrow-records/student/${studentDbId}/active`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      // AFTER
const text = await res.text();
const data = text ? JSON.parse(text) : {};
      const list = data?.data ?? (Array.isArray(data) ? data : []);
      setActiveBorrows(Array.isArray(list) ? list : []);
    } catch (e) {
      setActiveBorrows([]);
    } finally {
      setBorrowsLoading(false);
    }
  }

  async function handleReturn(borrowRecordId) {
    if (!window.confirm('Confirm return of this book?')) return;
    try {
      const res = await fetch(`/api/v1/borrow-records/${borrowRecordId}/return`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      // AFTER
const text = await res.text();
const data = text ? JSON.parse(text) : {};
if (res.ok) {
        setMessage({ type: 'success', text: 'Book returned successfully' });
        loadActiveBorrows(selectedStudentId);
        loadBooks();
      } else {
        setMessage({ type: 'error', text: data?.message || 'Failed to return book' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  const filteredBooks = books.filter(b =>
    !search ||
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.category?.toLowerCase().includes(search.toLowerCase())
  );

  const tabStyle = (tab) => ({
    padding: '10px 20px',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #003d7a' : '3px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    color: activeTab === tab ? '#003d7a' : '#666',
    fontSize: '1em'
  });

  return (
    <div>
      {message && (
        <div style={{
          marginBottom: 15, padding: 12,
          backgroundColor: message.type === 'error' ? '#ffebee' : '#f1f8e9',
          color: message.type === 'error' ? 'crimson' : 'green',
          border: `1px solid ${message.type === 'error' ? 'crimson' : 'green'}`,
          borderRadius: '4px'
        }}>
          {message.text}
          <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div style={{ borderBottom: '1px solid #ddd', marginBottom: 20 }}>
        <button style={tabStyle('books')} onClick={() => setActiveTab('books')}>📚 Book Inventory</button>
        <button style={tabStyle('borrow')} onClick={() => setActiveTab('borrow')}>📤 Borrow a Book</button>
        <button style={tabStyle('return')} onClick={() => setActiveTab('return')}>📥 Return a Book</button>
      </div>

      {activeTab === 'books' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 15, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by title, author, category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <button onClick={openAddBook} style={{ padding: '8px 20px', backgroundColor: '#003d7a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Add Book
            </button>
            <button onClick={loadBooks} style={{ padding: '8px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Refresh
            </button>
          </div>

          {showBookForm && (
            <div style={{ marginBottom: 20, padding: 20, backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #ddd' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#003d7a' }}>{editingBook ? 'Edit Book' : 'Add New Book'}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Title *', key: 'title', type: 'text', placeholder: 'e.g. The Great Gatsby' },
                  { label: 'Author *', key: 'author', type: 'text', placeholder: 'e.g. F. Scott Fitzgerald' },
                  { label: 'ISBN * (e.g. 978-3-16-148410-0)', key: 'isbn', type: 'text', placeholder: '978-3-16-148410-0' },
                  { label: 'Location Code * (e.g. FIC-001)', key: 'locationCode', type: 'text', placeholder: 'FIC-001' },
                  { label: 'Publication Year *', key: 'publicationYear', type: 'number', placeholder: '2024' },
                  { label: 'Category', key: 'category', type: 'text', placeholder: 'e.g. Fiction' },
                  { label: 'Publisher', key: 'publisher', type: 'text', placeholder: 'e.g. Penguin Books' },
                  { label: 'Total Copies', key: 'totalCopies', type: 'number', placeholder: '1' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: '0.85em', color: '#666', display: 'block', marginBottom: 4 }}>{label}</label>
                    <input
                      type={type}
                      value={bookForm[key]}
                      placeholder={placeholder}
                      onChange={e => setBookForm(prev => ({ ...prev, [key]: e.target.value }))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
                <button onClick={handleBookSubmit} style={{ padding: '8px 24px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {editingBook ? 'Update Book' : 'Save Book'}
                </button>
                <button onClick={() => setShowBookForm(false)} style={{ padding: '8px 24px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? <p>Loading books...</p> : (
            <div>
              <div style={{ marginBottom: 10, fontSize: '0.85em', color: '#666' }}>
                Showing {filteredBooks.length} of {books.length} books
              </div>
              {filteredBooks.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>No books found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#003d7a', color: 'white' }}>
                        <th style={{ padding: 12, textAlign: 'left' }}>Title</th>
                        <th style={{ padding: 12, textAlign: 'left' }}>Author</th>
                        <th style={{ padding: 12, textAlign: 'left' }}>Category</th>
                        <th style={{ padding: 12, textAlign: 'left' }}>ISBN</th>
                        <th style={{ padding: 12, textAlign: 'center' }}>Total</th>
                        <th style={{ padding: 12, textAlign: 'center' }}>Available</th>
                        <th style={{ padding: 12, textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.map((book, idx) => (
                        <tr key={book.id} style={{ borderBottom: '1px solid #ddd', backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: 12, fontWeight: 'bold' }}>{book.title}</td>
                          <td style={{ padding: 12 }}>{book.author}</td>
                          <td style={{ padding: 12 }}>{book.category || '—'}</td>
                          <td style={{ padding: 12, fontFamily: 'monospace', fontSize: '0.85em' }}>{book.isbn}</td>
                          <td style={{ padding: 12, textAlign: 'center' }}>{book.totalCopies}</td>
                          <td style={{ padding: 12, textAlign: 'center' }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold',
                              backgroundColor: book.availableCopies > 0 ? '#e8f5e9' : '#ffebee',
                              color: book.availableCopies > 0 ? '#4caf50' : '#d32f2f'
                            }}>
                              {book.availableCopies}
                            </span>
                          </td>
                          <td style={{ padding: 12, textAlign: 'center' }}>
                            <button onClick={() => openEditBook(book)} style={{ padding: '5px 12px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: 6 }}>Edit</button>
                            <button onClick={() => handleDeleteBook(book.id)} style={{ padding: '5px 12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'borrow' && (
        <div style={{ maxWidth: 500 }}>
          <h4 style={{ color: '#003d7a', marginTop: 0 }}>Record a Book Borrow</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div>
              <label style={{ fontSize: '0.85em', color: '#666', display: 'block', marginBottom: 4 }}>Select Student *</label>
              <select
                value={borrowForm.studentId}
                onChange={e => setBorrowForm(prev => ({ ...prev, studentId: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">-- Select a student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} — {s.studentId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85em', color: '#666', display: 'block', marginBottom: 4 }}>Select Book *</label>
              <select
                value={borrowForm.bookId}
                onChange={e => setBorrowForm(prev => ({ ...prev, bookId: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">-- Select a book --</option>
                {books.filter(b => b.availableCopies > 0).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.author} ({b.availableCopies} available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85em', color: '#666', display: 'block', marginBottom: 4 }}>Due Date *</label>
              <input
                type="date"
                value={borrowForm.dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setBorrowForm(prev => ({ ...prev, dueDate: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={handleBorrow}
              disabled={borrowLoading}
              style={{ padding: '12px', backgroundColor: borrowLoading ? '#ccc' : '#003d7a', color: 'white', border: 'none', borderRadius: '4px', cursor: borrowLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1em' }}
            >
              {borrowLoading ? 'Processing...' : '📤 Record Borrow'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'return' && (
        <div>
          <h4 style={{ color: '#003d7a', marginTop: 0 }}>Record a Book Return</h4>
          <div style={{ maxWidth: 400, marginBottom: 20 }}>
            <label style={{ fontSize: '0.85em', color: '#666', display: 'block', marginBottom: 4 }}>Select Student</label>
            <select
              value={selectedStudentId}
              onChange={e => {
                setSelectedStudentId(e.target.value);
                loadActiveBorrows(e.target.value);
              }}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">-- Select a student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} — {s.studentId}
                </option>
              ))}
            </select>
          </div>

          {borrowsLoading && <p>Loading borrowed books...</p>}

          {!borrowsLoading && selectedStudentId && activeBorrows.length === 0 && (
            <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>This student has no active borrows</p>
          )}

          {activeBorrows.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#003d7a', color: 'white' }}>
                    <th style={{ padding: 12, textAlign: 'left' }}>Book Title</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Author</th>
                    <th style={{ padding: 12, textAlign: 'center' }}>Borrow Date</th>
                    <th style={{ padding: 12, textAlign: 'center' }}>Due Date</th>
                    <th style={{ padding: 12, textAlign: 'center' }}>Status</th>
                    <th style={{ padding: 12, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBorrows.map((record) => {
                    const isOverdue = new Date() > new Date(record.dueDate);
                    return (
                      <tr key={record.id} style={{ borderBottom: '1px solid #ddd', backgroundColor: isOverdue ? '#fff3e0' : 'white' }}>
                        <td style={{ padding: 12, fontWeight: 'bold' }}>{record.book?.title || '—'}</td>
                        <td style={{ padding: 12 }}>{record.book?.author || '—'}</td>
                        <td style={{ padding: 12, textAlign: 'center', fontSize: '0.9em' }}>
                          {record.borrowDate ? new Date(record.borrowDate).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center', fontSize: '0.9em' }}>
                          {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85em',
                            backgroundColor: isOverdue ? '#ffebee' : '#e8f5e9',
                            color: isOverdue ? '#d32f2f' : '#4caf50'
                          }}>
                            {isOverdue ? '⚠ Overdue' : '✓ On Time'}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button
                            onClick={() => handleReturn(record.id)}
                            style={{ padding: '6px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Return
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}