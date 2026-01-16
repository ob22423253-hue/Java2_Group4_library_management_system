const API_BASE = '/api/v1/auth/student';

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

// ---------- Auth ----------
export async function registerStudent(payload) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

// ---------- Student CRUD ----------
const STUDENT_API = '/api/v1/students';

export async function getAllStudents() {
  const token = localStorage.getItem('token');
  const res = await fetch(STUDENT_API, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function updateStudent(id, payload) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${STUDENT_API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteStudent(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${STUDENT_API}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(res);
}

export default {
  registerStudent,
  loginStudent,
  getAllStudents,
  updateStudent,
  deleteStudent
};
