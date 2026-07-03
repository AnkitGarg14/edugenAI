import api from './api';

export const progressApi = {
  getProgress: async () => {
    const response = await api.get('/progress');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/progress/dashboard');
    return response.data;
  },

  startSession: async (activityType) => {
    const response = await api.post('/progress/sessions', { activityType });
    return response.data;
  },

  endSession: async (sessionId) => {
    const response = await api.put(`/progress/sessions/${sessionId}/end`);
    return response.data;
  }
};
