const API_BASE = '/api/v1/scan';

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

export async function sendScan(payload) {
  const token = localStorage.getItem('token');
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    },
    body: JSON.stringify(payload)
  });
  return parseRes(res);
}

export default { sendScan };
