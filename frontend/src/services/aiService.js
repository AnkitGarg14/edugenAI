import api from './api';

export const aiService = {
  getChats: async () => {
    const response = await api.get('/ai/chats');
    return response.data;
  },
  
  getMessages: async (chatId) => {
    const response = await api.get(`/ai/chats/${chatId}/messages`);
    return response.data;
  },

  askQuestion: async (chatId, question, documentIds = []) => {
    const payload = {
      chatId,
      question,
      documentIds
    };
    const response = await api.post('/ai/chat', payload);
    return response.data;
  }
};
