const API_BASE = '/api/v1/books';

async function handleResponse(res) {
  const text = await res.text();
  let body = null;
  if (text && text.length) {
    try { body = JSON.parse(text); } catch (e) { body = { message: text }; }
  }
  if (!res.ok) {
    const errMsg = (body && body.message) || res.statusText || 'Request failed';
    throw new Error(errMsg);
  }
  return body;
}

// ---------- Book CRUD ----------
export async function getAllBooks() {
  const token = localStorage.getItem('token');
  const res = await fetch(API_BASE, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function addBook(payload) {
  const token = localStorage.getItem('token');
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateBook(id, payload) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteBook(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(res);
}

export default {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook
};
