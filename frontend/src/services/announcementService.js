import API from './api';

const announcementService = {

  getActive: async () => {
    const res = await API.get('/api/v1/announcements');
    const data = res.data;
    return data?.data ?? data ?? [];
  },

  getAll: async () => {
    const res = await API.get('/api/v1/announcements/all');
    const data = res.data;
    return data?.data ?? data ?? [];
  },

  create: async (payload) => {
    const res = await API.post('/api/v1/announcements', payload);
    return res.data?.data ?? res.data;
  },

  update: async (id, payload) => {
    const res = await API.put(`/api/v1/announcements/${id}`, payload);
    return res.data?.data ?? res.data;
  },

  remove: async (id) => {
    await API.delete(`/api/v1/announcements/${id}`);
  },
};

export default announcementService;