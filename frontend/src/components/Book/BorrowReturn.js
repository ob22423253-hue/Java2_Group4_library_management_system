import React, { useEffect, useState } from 'react';
import bookService from '../../services/bookService';

export default function BorrowReturn() {
  const [books, setBooks] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [message, setMessage] = useState(null);

  async function load() {
    try {
      const all = await bookService.getAllBooks();
      const mine = await bookService.getMyBorrowedBooks();
      setBooks(all.data || []);
      setBorrowed(mine.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  useEffect(() => { load(); }, []);

  async function borrow(bookId) {
    try {
      await bookService.borrowBook(bookId);
      setMessage({ type: 'success', text: 'Book borrowed successfully' });
      load();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  async function returnBk(bookId) {
    try {
      await bookService.returnBook(bookId);
      setMessage({ type: 'success', text: 'Book returned successfully' });
      load();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  return (
    <div>
      <h3>📚 Available Books</h3>
      <ul>
        {books.map(b => (
          <li key={b.id}>
            {b.title} — {b.author}
            <button onClick={() => borrow(b.id)} style={{ marginLeft: 10 }}>
              Borrow
            </button>
          </li>
        ))}
      </ul>

      <h3>📖 My Borrowed Books</h3>
      <ul>
        {borrowed.map(b => (
          <li key={b.id}>
            {b.title}
            <button onClick={() => returnBk(b.id)} style={{ marginLeft: 10 }}>
              Return
            </button>
          </li>
        ))}
      </ul>

      {message && (
        <p style={{ color: message.type === 'error' ? 'crimson' : 'green' }}>
          {message.text}
        </p>
      )}
    </div>
  );
}
