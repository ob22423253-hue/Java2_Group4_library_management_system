// src/services/studentService.js
const API_BASE = '/api/v1/auth/student';

async function handleResponse(res) {
  const text = await res.text();
  let body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const errMsg = (body && body.message) || res.statusText || 'Request failed';
    throw new Error(errMsg);
  }
  return body;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

export async function registerStudent(payload) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function loginStudent(credentials) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
}

export default { registerStudent, loginStudent };
