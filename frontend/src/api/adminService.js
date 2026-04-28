import api from './axios';

export const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    getAllWorkers: async () => {
        const response = await api.get('/admin/workers');
        return response.data;
    },
    deleteUser: async (id) => {
        await api.delete(`/admin/user/${id}`);
    },
    deleteWorker: async (id) => {
        await api.delete(`/admin/worker/${id}`);
    }
};
