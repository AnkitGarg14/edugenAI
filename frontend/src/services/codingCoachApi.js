import api from './api';

export const codingCoachApi = {
  analyzeCode: async (code, language) => {
    const response = await api.post('/coding-coach/analyze', { code, language });
    return response.data;
  }
};
