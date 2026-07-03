import api from './api';

export const quizApi = {
  generateQuiz: async (data) => {
    const response = await api.post('/quizzes/generate', data);
    return response.data;
  },

  getQuizzes: async () => {
    const response = await api.get('/quizzes');
    return response.data;
  },

  getQuizById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  submitAttempt: async (id, attemptData) => {
    const response = await api.post(`/quizzes/${id}/attempt`, attemptData);
    return response.data;
  },

  deleteQuiz: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  }
};
