import api from './axios';

export const bookingService = {
    createBooking: async (bookingData) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },
    getMyBookings: async () => {
        const response = await api.get('/bookings');
        return response.data;
    },
    updateBookingStatus: async (bookingId, status) => {
        const response = await api.put(`/bookings/${bookingId}/status`, { status });
        return response.data;
    }
};
