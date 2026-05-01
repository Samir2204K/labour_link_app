import api from './axios';

export const profileService = {
  getMyProfile: async () => {
    const response = await api.get('/me');
    return response.data;
  },
  updateMyProfile: async (payload) => {
    const response = await api.put('/me', payload);
    return response.data;
  },
};
