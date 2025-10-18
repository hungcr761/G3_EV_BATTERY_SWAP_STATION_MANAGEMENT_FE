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
    forgotPassword: (data) =>
        USE_MOCK_API ? mockApi.forgotPassword(data) : api.post('/user/forgot-password', data),
    resetPassword: (data) =>
        USE_MOCK_API ? mockApi.resetPassword(data) : api.post('/user/reset-password', data),
    requestVerification: (data) =>
        USE_MOCK_API ? mockApi.requestVerification(data) : api.post('/user/request-verification', data),
    verifyEmail: (data) =>
        USE_MOCK_API ? mockApi.verifyEmail(data) : api.post('/user/verify-email', data),
};

// EV APIs
export const vehicleAPI = {
    getAll: () => api.get('/api/vehicle'),
    getById: (id) => api.get(`/api/vehicle/${id}`),
    create: (data) =>
        USE_MOCK_API ? mockApi.createVehicle(data) : api.post('/api/vehicle', data),
    update: (id, data) =>
        USE_MOCK_API ? mockApi.updateVehicle(id, data) : api.put(`/api/vehicle/${id}`, data),
    delete: (id) =>
        USE_MOCK_API ? mockApi.deleteVehicle(id) : api.delete(`/api/vehicle/${id}`),
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

// Station APIs
export const stationAPI = {
    getAll: () => api.get('/station'),
    getById: (id) => api.get(`/station/${id}`),
    create: (data) => api.post('/station', data),
    update: (id, data) => api.put(`/station/${id}`, data),
    delete: (id) => api.delete(`/station/${id}`),
};


