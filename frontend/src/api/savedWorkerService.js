import api from './axios';

export const savedWorkerService = {
  getSavedWorkers: async () => {
    const response = await api.get('/saved-workers');
    return response.data;
  },
  getSavedWorkerIds: async () => {
    const response = await api.get('/saved-workers/ids');
    return response.data;
  },
  saveWorker: async (workerId) => {
    const response = await api.post(`/saved-workers/${workerId}`);
    return response.data;
  },
  removeWorker: async (workerId) => {
    const response = await api.delete(`/saved-workers/${workerId}`);
    return response.data;
  },
};
