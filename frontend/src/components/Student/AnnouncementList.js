import React, { useEffect, useState } from 'react';
import announcementService from '../../services/announcementService';

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementService.getActive()
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (announcements.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{
        margin: '0 0 12px',
        color: '#003d7a',
        fontSize: '0.9em',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        📢 Announcements
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {announcements.map(a => (
          <div key={a.id} style={{
            backgroundColor: '#fffde7',
            border: '1px solid #f9a825',
            borderRadius: 8,
            padding: '14px 18px',
          }}>
            <div style={{ fontWeight: 700, color: '#e65100', marginBottom: 4, fontSize: '0.95em' }}>
              📌 {a.title}
            </div>
            <div style={{ color: '#333', fontSize: '0.88em', lineHeight: 1.5 }}>{a.content}</div>
            {a.createdAt && (
              <div style={{ fontSize: '0.75em', color: '#999', marginTop: 6 }}>
                Posted: {new Date(a.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}