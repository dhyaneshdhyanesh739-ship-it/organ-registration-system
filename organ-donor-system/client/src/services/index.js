import api from './api';
import axios from 'axios';

const LOCATION_API_BASE = 'https://india-location-hub.in/api';

export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },

    sendOTP: async (email, phone) => {
        const response = await api.post('/auth/send-otp', { email, phone });
        return response.data;
    },

    verifyOTP: async (email, emailOTP, phoneOTP) => {
        const response = await api.post('/auth/verify-otp', { email, emailOTP, phoneOTP });
        return response.data;
    },
};

export const donorService = {
    createProfile: async (formData) => {
        const response = await api.post('/donor/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/donor/profile');
        return response.data;
    },

    updateProfile: async (formData) => {
        const response = await api.put('/donor/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    updateConsent: async (consentData) => {
        const response = await api.put('/donor/consent', consentData);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/donor/stats');
        return response.data;
    },

    getActivity: async () => {
        const response = await api.get('/donor/activity');
        return response.data;
    },
};

export const hospitalService = {
    createProfile: async (formData) => {
        const response = await api.post('/hospital/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/hospital/profile');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/hospital/profile', profileData);
        return response.data;
    },

    createRequest: async (requestData) => {
        const response = await api.post('/hospital/request', requestData);
        return response.data;
    },

    getRequests: async () => {
        const response = await api.get('/hospital/requests');
        return response.data;
    },

    getRequestById: async (id) => {
        const response = await api.get(`/hospital/request/${id}`);
        return response.data;
    },

    cancelRequest: async (id, reason) => {
        const response = await api.put(`/hospital/request/${id}/cancel`, { reason });
        return response.data;
    },

    getActivity: async () => {
        const response = await api.get('/hospital/activity');
        return response.data;
    },
};

export const matchingService = {
    findMatches: async (requestId) => {
        const response = await api.post(`/matching/find/${requestId}`);
        return response.data;
    },

    getMatches: async (requestId) => {
        const response = await api.get(`/matching/request/${requestId}/matches`);
        return response.data;
    },

    acceptMatch: async (requestId, donorId) => {
        const response = await api.post(`/matching/accept/${requestId}/${donorId}`);
        return response.data;
    },
};

export const chatService = {
    getMessages: async (roomId) => {
        const response = await api.get(`/chat/messages/${roomId}`);
        return response.data;
    },

    getConversations: async () => {
        const response = await api.get('/chat/conversations');
        return response.data;
    },

    markAsRead: async (roomId) => {
        const response = await api.put(`/chat/read/${roomId}`);
        return response.data;
    },
};

export const aiService = {
    getSuggestions: async (context) => {
        const response = await api.post('/ai/suggest', context);
        return response.data;
    },

    explainTerm: async (term) => {
        const response = await api.post('/ai/explain', { term });
        return response.data;
    },

    chat: async (message, role) => {
        const response = await api.post('/ai/chat', { message, role });
        return response.data;
    },
};

export const adminService = {
    getAnalytics: async () => {
        const response = await api.get('/admin/analytics');
        return response.data;
    },

    getPendingVerifications: async () => {
        const response = await api.get('/admin/pending-verifications');
        return response.data;
    },

    verifyDonor: async (id) => {
        const response = await api.put(`/admin/verify-donor/${id}`);
        return response.data;
    },

    verifyHospital: async (id, status, rejectionReason) => {
        const response = await api.put(`/admin/verify-hospital/${id}`, {
            status,
            rejectionReason,
        });
        return response.data;
    },

    getAuditLogs: async (params) => {
        const response = await api.get('/admin/audit-logs', { params });
        return response.data;
    },

    getAllUsers: async (params) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },
};

export const locationService = {
    getStates: async () => {
        const response = await axios.get(`${LOCATION_API_BASE}/locations/states`);
        return response.data;
    },

    getDistricts: async (stateId) => {
        const response = await axios.get(`${LOCATION_API_BASE}/locations/districts`, {
            params: { state_id: stateId }
        });
        return response.data;
    },

    getTalukas: async (districtId) => {
        const response = await axios.get(`${LOCATION_API_BASE}/locations/talukas`, {
            params: { district_id: districtId }
        });
        return response.data;
    },

    getVillages: async (state, district, taluka) => {
        const response = await axios.get(`${LOCATION_API_BASE}/locations/villages`, {
            params: { state, district, taluka }
        });
        return response.data;
    },

    searchVillages: async (query) => {
        // Simple search if query is provided
        const response = await axios.get(`${LOCATION_API_BASE}/locations/villages`, {
            params: { search: query }
        });
        return response.data;
    }
};
