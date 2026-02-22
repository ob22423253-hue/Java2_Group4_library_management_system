// src/services/librarianService.js
const API_BASE = '/api/v1/auth';

async function parseRes(res) {
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    body = { message: text || 'Unknown error' };
  }

  if (!res.ok) {
    let errorMsg = 'Request failed';
    if (body && body.message) errorMsg = body.message;
    else if (body && body.error) errorMsg = body.error;
    else if (typeof body === 'string') errorMsg = body;
    else if (res.statusText) errorMsg = res.statusText;
    throw new Error(errorMsg);
  }
  return body;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  console.log('[librarianService] token exists:', !!token);
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

export async function registerLibrarian(credentials) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return parseRes(res);
}

export async function loginLibrarian(credentials) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return parseRes(res);
}

export async function getCurrentlyInside() {
  const token = localStorage.getItem('token');
  
  // If no token yet, return empty — don't make the request
  if (!token) {
    console.warn('[librarianService] No token, skipping getCurrentlyInside');
    return { data: [] };
  }
  const res = await fetch('/api/v1/librarian/scans', {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  });
  const body = await parseRes(res);

  const allEntries = body?.data ?? (Array.isArray(body) ? body : []);
  const currentlyInside = allEntries.filter(entry => !entry.exitTime);

  return { data: currentlyInside };
}

const librarianService = {
  registerLibrarian,
  loginLibrarian,
  getCurrentlyInside,
};

export default librarianService;