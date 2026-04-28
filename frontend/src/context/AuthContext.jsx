import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage on mount
        const savedUser = localStorage.getItem('user');
        const savedRole = localStorage.getItem('role');
        const token = localStorage.getItem('jwtToken');

        if (savedUser && savedRole) {
            setUser(JSON.parse(savedUser));
            setRole(savedRole);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Backend login
        try {
            const response = await api.post('/auth/login', {
                email: email,
                password: password
            });
            handleAuthResponse(response.data);
            return response.data;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const sendOtp = async (email) => {
        try {
            // Updated to use the new otp endpoint
            const response = await api.post('/send-otp', { email });
            return response.data;
        } catch (error) {
            console.error("Failed to send OTP", error);
            throw error;
        }
    };

    const sendOtpForRegistration = async (email) => {
        try {
            // Updated to use the new otp endpoint which is more reliable
            const response = await api.post('/send-otp', { email });
            return response.data;
        } catch (error) {
            console.error("Failed to send registration OTP", error);
            throw error;
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            // The /auth/verify-otp endpoint already handles OTP verification via OtpService
            // and completes the registration/login process by returning a JWT token.
            const response = await api.post('/auth/verify-otp', { email, otp });
            handleAuthResponse(response.data);
            return response.data;
        } catch (error) {
            console.error("OTP verification failed", error);
            throw error;
        }
    };

    const handleAuthResponse = (data) => {
        if (!data || !data.token) return;
        
        const { token, user: backendUser } = data;
        const normalizedRole = backendUser.role.toLowerCase();

        localStorage.setItem('jwtToken', token);
        localStorage.setItem('user', JSON.stringify(backendUser));
        localStorage.setItem('role', normalizedRole);

        setUser(backendUser);
        setRole(normalizedRole);
    };

    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        setUser(null);
        setRole(null);
    };

    const resendOtp = async (email) => {
        try {
            const response = await api.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error("Failed to resend OTP", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, loading, sendOtp, sendOtpForRegistration, verifyOtp, resendOtp }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
