import api from './api';

export const flashcardApi = {
  generateFlashcards: async (data) => {
    const response = await api.post('/flashcards/generate', data);
    return response.data;
  },

  getFlashcardSets: async () => {
    const response = await api.get('/flashcards');
    return response.data;
  },

  getFlashcardSetById: async (id) => {
    const response = await api.get(`/flashcards/${id}`);
    return response.data;
  },

  updateFlashcardSet: async (id, data) => {
    const response = await api.put(`/flashcards/${id}`, data);
    return response.data;
  },

  updateCardProgress: async (setId, cardId, data) => {
    const response = await api.put(`/flashcards/${setId}/cards/${cardId}`, data);
    return response.data;
  },

  deleteFlashcardSet: async (id) => {
    const response = await api.delete(`/flashcards/${id}`);
    return response.data;
  }
};
