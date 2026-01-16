import axios from 'axios';

const API_BASE = '/api/v1/books';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getAllBooks = () =>
  axios.get(API_BASE, { headers: authHeader() });

export const borrowBook = (bookId) =>
  axios.post(`${API_BASE}/borrow`, { bookId }, { headers: authHeader() });

export const returnBook = (bookId) =>
  axios.post(`${API_BASE}/return`, { bookId }, { headers: authHeader() });

export const getMyBorrowedBooks = () =>
  axios.get(`${API_BASE}/my-borrowed`, { headers: authHeader() });

export default {
  getAllBooks,
  borrowBook,
  returnBook,
  getMyBorrowedBooks
};
