// src/services/librarianService.js
const API_BASE = '/api/v1/librarian/scans';

async function parseRes(res) {
  const text = await res.text();
  let body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = (body && body.message) || res.statusText || 'Request failed';
    throw new Error(err);
  }
  return body;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

export async function getCurrentlyInside() {
  const res = await fetch(API_BASE, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return parseRes(res);
}

export default { getCurrentlyInside };
