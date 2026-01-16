import React from 'react';

export default function BookList({ books, onEdit, onDelete }) {
  if (!books || books.length === 0) return <p>No books available</p>;

  return (
    <table border="1" cellPadding="6" style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {books.map(b => (
          <tr key={b.id}>
            <td>{b.title}</td>
            <td>{b.author}</td>
            <td>
              <button onClick={() => onEdit(b)}>Edit</button>
              <button onClick={() => onDelete(b.id)} style={{ marginLeft: 5 }}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
