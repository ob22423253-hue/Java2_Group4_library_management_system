import React, { useEffect, useState } from 'react';
import bookService from '../../services/bookService';

export default function BorrowReturn() {
  const [books, setBooks] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const allRes = await bookService.getAllBooks();
      const myRes = await bookService.getMyBorrowedBooks();
      
      // Handle both direct array and wrapped object response
      setBooks(allRes?.data || allRes || []);
      setBorrowed(myRes?.data || myRes || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function borrow(bookId) {
    try {
      const res = await bookService.borrowBook(bookId);
      setMessage({ type: 'success', text: res?.message || 'Book borrowed successfully' });
      load();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  async function returnBk(bookId) {
    try {
      const res = await bookService.returnBook(bookId);
      setMessage({ type: 'success', text: res?.message || 'Book returned successfully' });
      load();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  if (loading) return <p>Loading books...</p>;

  return (
    <div>
      <h3>📚 Available Books</h3>
      {books.length === 0 ? (
        <p>No books available</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {books.map(b => (
            <li 
              key={b.id}
              style={{
                padding: '10px',
                marginBottom: '8px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                border: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{b.title} — {b.author}</span>
              <button 
                onClick={() => borrow(b.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Borrow
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3>📖 My Borrowed Books</h3>
      {borrowed.length === 0 ? (
        <p>No borrowed books</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {borrowed.map(b => (
            <li 
              key={b.id}
              style={{
                padding: '10px',
                marginBottom: '8px',
                backgroundColor: '#fff3e0',
                borderRadius: '4px',
                border: '1px solid #ffb74d',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{b.title}</span>
              <button 
                onClick={() => returnBk(b.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Return
              </button>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <p style={{ 
          marginTop: 15,
          padding: '10px',
          color: message.type === 'error' ? 'crimson' : 'green',
          backgroundColor: message.type === 'error' ? '#ffebee' : '#f1f8e9',
          borderRadius: '4px'
        }}>
          {message.text}
        </p>
      )}
    </div>
  );
}
