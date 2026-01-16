import React, { useState } from 'react';

export default function BookForm({ onSubmit }) {
  const [book, setBook] = useState({ title: '', author: '' });

  function handleChange(e) {
    setBook(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!book.title || !book.author) return alert('Title and Author required');
    onSubmit(book);
    setBook({ title: '', author: '' });
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 10 }}>
      <input name="title" placeholder="Title" value={book.title} onChange={handleChange} />
      <input name="author" placeholder="Author" value={book.author} onChange={handleChange} />
      <button type="submit">Add Book</button>
    </form>
  );
}
