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
    requestVerification: (data) =>
        USE_MOCK_API ? mockApi.requestVerification(data) : api.post('/user/request-verification', data),
    verifyEmail: (data) =>
        USE_MOCK_API ? mockApi.verifyEmail(data) : api.post('/user/verify-email', data),
};

// Vehicle APIs
export const vehicleAPI = {
    getAll: () => USE_MOCK_API ? mockApi.getUserVehicles() : api.get('/vehicles'),
    getById: (id) => api.get(`/vehicles/${id}`),
    // Luôn dùng mock cho vehicles without subscription vì backend chưa có API này
    getWithoutSubscription: () => mockApi.getVehiclesWithoutSubscription(),
    create: (data) =>
        USE_MOCK_API ? mockApi.createVehicle(data) : api.post('/vehicles', data),
    update: (id, data) =>
        USE_MOCK_API ? mockApi.updateVehicle(id, data) : api.put(`/vehicles/${id}`, data),
    delete: (id) =>
        USE_MOCK_API ? mockApi.deleteVehicle(id) : api.delete(`/vehicles/${id}`)
};

// Model API 
export const modelAPI = {
    getAll: () => api.get('/vehicle-model')
}

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


// Subscription Plan APIs
export const subscriptionPlanAPI = {
    getAll: () =>
        USE_MOCK_API ? mockApi.getSubscriptionPlans() : api.get('/subscription-plan'),
    getById: (id) => api.get(`/subscription-plan/${id}`)
};

// Subscription APIs (User đăng ký gói cho xe)
export const subscriptionAPI = {
    // Tạo subscription mới cho xe
    create: (data) => api.post('/subscription', data),
    // Lấy danh sách subscription của user (luôn dùng mock vì chưa có API)
    getByUserId: (userId) => mockApi.getSubscriptionsByUserId(userId),
    // Lấy subscription của một xe
    getByVehicleId: (vehicleId) => api.get(`/subscription/vehicle/${vehicleId}`),
    // Hủy subscription
    cancel: (subscriptionId) => api.delete(`/subscription/${subscriptionId}`)
};

export const stationAPI = {
    getAll: () => api.get('/station'),
    getById: (id) => api.get(`/station/${id}`),
    create: (data) => api.post('/station', data),
    update: (id, data) => api.put(`/station/${id}`, data),
    delete: (id) => api.delete(`/station/${id}`),
};

// Booking APIs
export const bookingAPI = {
    checkAvailability: (data) => api.post('/booking/check-availability', data),
    create: (data) => api.post('/booking', data),
    getById: (id) => api.get(`/booking/${id}`),
    update: (id, data) => api.put(`/booking/${id}`, data),
    delete: (id) => api.delete(`/booking/${id}`),
    getByUserId: (userId) => api.get(`/booking/user/${userId}`),
    cancel: (id) => api.post(`/booking/${id}/cancel`),
};