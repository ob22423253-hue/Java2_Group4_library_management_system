import React, { useEffect, useState } from 'react';
import announcementService from '../../services/announcementService';

const COLORS = {
  primary: '#003d7a', border: '#e0e0e0', gray: '#757575',
  danger: '#c62828', dangerLight: '#ffebee',
  success: '#2e7d32', successLight: '#e8f5e9', white: '#ffffff',
};

export default function AnnouncementPanel() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', expiresAt: '' });
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await announcementService.getAll();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load announcements' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) {
      setMessage({ type: 'error', text: 'Title and content are required' });
      return;
    }
    try {
      const payload = {
        title: form.title,
        content: form.content,
        expiresAt: form.expiresAt ? form.expiresAt + ':00' : null,
        active: true,
      };
      if (editingId) {
        await announcementService.update(editingId, payload);
        setMessage({ type: 'success', text: 'Announcement updated' });
      } else {
        await announcementService.create(payload);
        setMessage({ type: 'success', text: 'Announcement posted' });
      }
      setForm({ title: '', content: '', expiresAt: '' });
      setEditingId(null);
      load();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save announcement' });
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this announcement?')) return;
    try {
      await announcementService.remove(id);
      setMessage({ type: 'success', text: 'Announcement removed' });
      load();
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove announcement' });
    }
  }

  function handleEdit(a) {
    setEditingId(a.id);
    setForm({
      title: a.title,
      content: a.content,
      expiresAt: a.expiresAt ? a.expiresAt.substring(0, 16) : '',
    });
  }

  return (
    <div>
      {message && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 6,
          color: message.type === 'error' ? COLORS.danger : COLORS.success,
          backgroundColor: message.type === 'error' ? COLORS.dangerLight : COLORS.successLight,
          border: `1px solid ${message.type === 'error' ? COLORS.danger : COLORS.success}` }}>
          {message.text}
          <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Form */}
      <div style={{ backgroundColor: '#f9f9f9', border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '18px 20px', marginBottom: 24 }}>
        <h4 style={{ margin: '0 0 14px', color: COLORS.primary }}>
          {editingId ? '✏️ Edit Announcement' : '📢 Post New Announcement'}
        </h4>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: '0.8em', fontWeight: 600, color: COLORS.gray, display: 'block', marginBottom: 4 }}>TITLE *</label>
          <input
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Announcement title"
            style={{ width: '100%', padding: '8px 10px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: '0.9em', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: '0.8em', fontWeight: 600, color: COLORS.gray, display: 'block', marginBottom: 4 }}>CONTENT *</label>
          <textarea
            value={form.content}
            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            placeholder="Write your announcement..."
            rows={3}
            style={{ width: '100%', padding: '8px 10px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: '0.9em', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '0.8em', fontWeight: 600, color: COLORS.gray, display: 'block', marginBottom: 4 }}>EXPIRES AT (optional)</label>
          <input
            type="datetime-local"
            value={form.expiresAt}
            onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
            style={{ padding: '8px 10px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: '0.9em' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSubmit}
            style={{ padding: '9px 22px', backgroundColor: COLORS.primary, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>
            {editingId ? '💾 Update' : '📤 Post'}
          </button>
          {editingId && (
            <button onClick={() => { setEditingId(null); setForm({ title: '', content: '', expiresAt: '' }); }}
              style={{ padding: '9px 22px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <h4 style={{ margin: '0 0 12px', color: COLORS.primary }}>📋 All Announcements</h4>
      {loading && <div style={{ color: COLORS.gray }}>Loading...</div>}
      {!loading && announcements.length === 0 && (
        <div style={{ color: COLORS.gray, fontStyle: 'italic' }}>No announcements yet.</div>
      )}
      {announcements.map(a => (
        <div key={a.id} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '14px 18px', marginBottom: 10, backgroundColor: COLORS.white }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ fontWeight: 700, color: '#333', fontSize: '0.95em' }}>📌 {a.title}</div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => handleEdit(a)}
                style={{ padding: '4px 12px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8em', fontWeight: 600 }}>
                Edit
              </button>
              <button onClick={() => handleDelete(a.id)}
                style={{ padding: '4px 12px', backgroundColor: COLORS.danger, color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8em', fontWeight: 600 }}>
                Remove
              </button>
            </div>
          </div>
          <div style={{ color: '#555', fontSize: '0.88em', margin: '6px 0', lineHeight: 1.5 }}>{a.content}</div>
          <div style={{ fontSize: '0.75em', color: '#999' }}>
            Posted: {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
            {a.expiresAt && <span style={{ marginLeft: 12 }}>Expires: {new Date(a.expiresAt).toLocaleString()}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}