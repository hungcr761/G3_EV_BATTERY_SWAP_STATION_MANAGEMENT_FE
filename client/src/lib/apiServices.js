// API service functions

import { api } from './api';
import { mockApi } from './mockApi';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false' && (!import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_USE_MOCK_API === 'true');

// Authentication APIs
export const authAPI = {
    login: (credentials) =>
        USE_MOCK_API ? mockApi.login(credentials) : api.post('/user/login', credentials),
    register: (userData) =>
        USE_MOCK_API ? mockApi.register(userData) : api.post('/user/register', userData),
    logout: () =>
        USE_MOCK_API ? mockApi.logout() : api.post('/user/logout'),
    getProfile: (userId) =>
        USE_MOCK_API ? mockApi.getProfile() : api.get(`/user/id/${userId}`),
    forgotPassword: (email) =>
        USE_MOCK_API ? mockApi.forgotPassword(email) : api.post('/user/forgot-password', email),
    resetPassword: (data) =>
        USE_MOCK_API ? mockApi.resetPassword(data) : api.post('/user/reset-password', data),
};

// EV APIs
export const vehicleAPI = {
    getAll: () => api.get('/api/EV'),
    getById: (id) => api.get(`/api/EV/${id}`),
    create: (data) =>
        USE_MOCK_API ? mockApi.createVehicle(data) : api.post('/api/EV', data),
    update: (id, data) =>
        USE_MOCK_API ? mockApi.updateVehicle(id, data) : api.put(`/api/EV/${id}`, data),
    delete: (id) =>
        USE_MOCK_API ? mockApi.deleteVehicle(id) : api.delete(`/api/EV/${id}`),
    getUserVehicles: () =>
        USE_MOCK_API ? mockApi.getUserVehicles() : api.get('/api/user/vehicles'),
};

// user APIs
export const userAPI = {
    getAll: (params) => api.get('/api/user', { params }),
    getById: (id) => api.get(`/user/id/${id}`),
    create: (data) => api.post('/api/users', data),
    update: (id, data) => api.put(`/user/id/${id}`, data),
    delete: (id) => api.delete(`/user/id/${id}`),
    updateProfile: (id, data) =>
        USE_MOCK_API ? mockApi.updateProfile(data) : api.put(`/user/id/${id}`, data),
};


