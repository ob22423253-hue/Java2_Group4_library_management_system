// src/services/libraryEntryService.js
const API_BASE = '/api/v1';

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

export async function sendScan(payload) {
  // payload = { qrValue, scanType } (student identity comes from JWT)
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function recordEntry(payload) {
  const res = await fetch(`${API_BASE}/library-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function recordExit(entryId, payload) {
  const res = await fetch(`${API_BASE}/library-entries/${entryId}/exit`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getEntriesByStudent(studentId) {
  const res = await fetch(`${API_BASE}/library-entries/student/${studentId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function getCurrentStatus() {
  // Get current student's library status by checking their latest entry record
  // If latest has exitTime = null, they're inside. Otherwise outside.
  try {
    const res = await fetch(`${API_BASE}/library-entries/current`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    return handleResponse(res);
  } catch (err) {
    // Fallback: If endpoint doesn't exist, return default (not inside)
    console.warn('[libraryEntryService] Status endpoint failed, defaulting to outside:', err.message);
    return { isInside: false };
  }
}

const libraryEntryService = {
  sendScan,
  recordEntry,
  recordExit,
  getEntriesByStudent,
  getCurrentStatus,
};

export default libraryEntryService;
