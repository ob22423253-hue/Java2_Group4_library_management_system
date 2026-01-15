const API_BASE = '/api/v1/librarian/scans';

async function parseRes(res) {
  const text = await res.text();
  let body = null;
  if (text && text.length) {
    try { body = JSON.parse(text); } catch (e) { body = { message: text }; }
  }
  if (!res.ok) {
    const err = (body && body.message) || res.statusText || 'Request failed';
    throw new Error(err);
  }
  return body;
}

export async function getCurrentlyInside() {
  const token = localStorage.getItem('token');
  const res = await fetch(API_BASE, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    }
  });
  return parseRes(res);
}

export default { getCurrentlyInside };
