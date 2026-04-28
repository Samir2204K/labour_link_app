import api from './axios';

export const chatService = {
  getChatHistory: async (user1, user2) => {
    const response = await api.get(`/chat/history?user1=${user1}&user2=${user2}`);
    return response.data;
  },
  getOnlineUsers: async () => {
    const response = await api.get('/chat/onlineUsers');
    return response.data;
  },
  getRecentChats: async (email) => {
    const response = await api.get(`/chat/recent?email=${email}`);
    return response.data;
  },
  getPartnerInfo: async (email) => {
    const response = await api.get(`/chat/partner/${email}`);
    return response.data;
  }
};
