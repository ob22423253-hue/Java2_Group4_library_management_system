import React, { useEffect, useState } from 'react';
import bookService from '../../services/bookService';

export default function BorrowReturn() {
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      // Only load all books - borrow/return not available in backend
      const allRes = await bookService.getAllBooks();
      
      // Handle both direct array and wrapped object response
      setBooks(Array.isArray(allRes) ? allRes : (allRes?.data || []));
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to load books: ' + e.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function borrow(bookId) {
    try {
      // Borrow endpoint not available in backend - show message
      setMessage({ type: 'warning', text: 'Book borrow feature coming soon' });
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
                border: '1px solid #eee'
              }}
            >
              <div><strong>{b.title}</strong></div>
              <div>Author: {b.author || 'Unknown'}</div>
              <div>Category: {b.category || 'General'}</div>
              <div>Available: {b.availableCopies || 0} copies</div>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <p style={{ 
          marginTop: 15,
          padding: '10px',
          color: message.type === 'error' ? 'crimson' : message.type === 'warning' ? 'orange' : 'green',
          backgroundColor: message.type === 'error' ? '#ffebee' : message.type === 'warning' ? '#fff3e0' : '#f1f8e9',
          borderRadius: '4px'
        }}>
          {message.text}
        </p>
      )}
    </div>
  );
}
