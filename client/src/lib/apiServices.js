// API service functions

import { api } from './api';
import { mockApi } from './mockApi';

// Check if we should use mock API (for development)
// Default to true for development, set to false when backend is ready
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false' && (!import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_USE_MOCK_API === 'true');

// Authentication APIs
export const authAPI = {
    login: (credentials) =>
        USE_MOCK_API ? mockApi.login(credentials) : api.post('/api/auth/login', credentials),
    register: (userData) =>
        USE_MOCK_API ? mockApi.register(userData) : api.post('/api/auth/register', userData),
    refreshToken: (refreshToken) =>
        USE_MOCK_API ? mockApi.refreshToken({ refreshToken }) : api.post('/api/auth/refresh', { refreshToken }),
    logout: () =>
        USE_MOCK_API ? mockApi.logout() : api.post('/api/auth/logout'),
    getProfile: () =>
        USE_MOCK_API ? mockApi.getProfile() : api.get('/api/auth/profile'),
};

// EV APIs
export const vehicleAPI = {
    getAll: () => api.get('/api/EV'),
    getById: (id) => api.get(`/api/EV/${id}`),
    create: (data) => api.post('/api/EV', data),
    update: (id, data) => api.put(`/api/EV/${id}`, data),
    delete: (id) => api.delete(`/api/EV/${id}`),
};

// user APIs
export const userAPI = {
    getAll: (params) => api.get('/api/user', { params }),
    getById: (id) => api.get(`/api/users/${id}`),
    create: (data) => api.post('/api/users', data),
    update: (id, data) => api.put(`/api/users/${id}`, data),
    delete: (id) => api.delete(`/api/users/${id}`),
};


