// src/services/bookService.js
const API_BASE = '/api/v1/books';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    body = { message: text || 'Unknown error' };
  }
  
  if (!res.ok) {
    let errorMsg = 'Request failed';
    if (body && body.message) {
      errorMsg = body.message;
    } else if (body && body.error) {
      errorMsg = body.error;
    } else if (typeof body === 'string') {
      errorMsg = body;
    } else if (res.statusText) {
      errorMsg = res.statusText;
    }
    throw new Error(errorMsg);
  }
  return body;
}

export async function getAllBooks() {
  const res = await fetch(API_BASE, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function borrowBook(bookId) {
  const res = await fetch(`${API_BASE}/borrow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ bookId }),
  });
  return handleResponse(res);
}

export async function returnBook(bookId) {
  const res = await fetch(`${API_BASE}/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ bookId }),
  });
  return handleResponse(res);
}

export async function getMyBorrowedBooks() {
  const res = await fetch(`${API_BASE}/my-borrowed`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function addBook(book) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(book),
  });
  return handleResponse(res);
}

export async function updateBook(id, book) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(book),
  });
  return handleResponse(res);
}

export async function deleteBook(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

const bookService = {
  getAllBooks,
  borrowBook,
  returnBook,
  getMyBorrowedBooks,
  addBook,
  updateBook,
  deleteBook,
};

export default bookService;
