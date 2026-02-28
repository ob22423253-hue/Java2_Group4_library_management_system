import API from './api';

const libraryHoursService = {

  getStatus: async () => {
    const res = await API.get('/api/v1/library-hours/status');
    return res.data?.data ?? res.data;
  },

  getHours: async () => {
    const res = await API.get('/api/v1/library-hours');
    return res.data?.data ?? res.data;
  },

  saveHours: async (payload) => {
    const res = await API.post('/api/v1/library-hours', payload);
    return res.data?.data ?? res.data;
  },
};

export default libraryHoursService;