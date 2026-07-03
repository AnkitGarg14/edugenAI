import api from './api';

export const studyPlanApi = {
  generateStudyPlan: async (data) => {
    const response = await api.post('/study-plans/generate', data);
    return response.data;
  },

  getStudyPlans: async () => {
    const response = await api.get('/study-plans');
    return response.data;
  },

  getStudyPlanById: async (id) => {
    const response = await api.get(`/study-plans/${id}`);
    return response.data;
  },

  updateTaskStatus: async (planId, taskId, isRevision, completionStatus) => {
    const response = await api.put(`/study-plans/${planId}/tasks`, {
      taskId,
      isRevision,
      completionStatus
    });
    return response.data;
  },

  deleteStudyPlan: async (id) => {
    const response = await api.delete(`/study-plans/${id}`);
    return response.data;
  }
};
