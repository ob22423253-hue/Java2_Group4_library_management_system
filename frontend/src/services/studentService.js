// src/services/studentService.js
const API_BASE = '/api/v1/auth/student';

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

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

export async function registerStudent(payload) {
  // Only send phoneNumber if it has a value (it's optional)
  const data = { ...payload };
  if (!data.phoneNumber || data.phoneNumber.trim() === '') {
    delete data.phoneNumber;
  }
  
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
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

export async function getAllStudents() {
  const res = await fetch('/api/v1/students', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function updateStudent(id, payload) {
  const res = await fetch(`/api/v1/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteStudent(id) {
  const res = await fetch(`/api/v1/students/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

const studentService = {
  registerStudent,
  loginStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
};

export default studentService;
