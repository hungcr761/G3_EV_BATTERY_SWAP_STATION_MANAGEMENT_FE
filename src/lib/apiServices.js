import { api } from './api';
import { mockApi } from './mockApi';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false' && (!import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_USE_MOCK_API === 'true');

// Authentication APIs
export const authAPI = {
    login: (credentials) =>
        USE_MOCK_API ? mockApi.login(credentials) : api.post('/auth/login', credentials),
    register: (userData) =>
        USE_MOCK_API ? mockApi.register(userData) : api.post('/auth/register', userData),
    logout: () =>
        USE_MOCK_API ? mockApi.logout() : api.post('/auth/logout'),
    getProfile: (userId) =>
        USE_MOCK_API ? mockApi.getProfile() : api.get(`/users/id/${userId}`),
    forgotPassword: (email) =>
        USE_MOCK_API ? mockApi.forgotPassword(email) : api.post('/auth/forgot-password', email),
    resetPassword: (data) =>
        USE_MOCK_API ? mockApi.resetPassword(data) : api.post('/auth/reset-password', data),
    requestVerification: (data) =>
        USE_MOCK_API ? mockApi.requestVerification(data) : api.post('/auth/request-verification', data),
    verifyEmail: (data) =>
        USE_MOCK_API ? mockApi.verifyEmail(data) : api.post('/auth/verify-email', data),
};

// Vehicle APIs
export const vehicleAPI = {
    getAll: () => USE_MOCK_API ? mockApi.getUserVehicles() : api.get('/vehicles'),
    getById: (id) => USE_MOCK_API ? mockApi.getVehicleById(id) : api.get(`/vehicles/${id}`),
    getByUserId: (userId) => api.get(`/vehicles/user/${userId}`),
    getWithoutSubscription: () => USE_MOCK_API ? mockApi.getVehiclesWithoutSubscription() : api.get('/subscription/vehicles-without-subscription'),
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

// Battery Type API
export const batteryTypeAPI = {
    getAll: () => api.get('/battery-type')
}

// user APIs
export const userAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/id/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    updateProfile: (data) =>
        USE_MOCK_API ? mockApi.updateProfile(data) : api.put(`/users/driver/profile`, data),
    updateStatus: (accountId, status) => api.put(`/users/${accountId}/status`, { status }),
    updateProfileByAccountId: (accountId, data) => api.put(`/users/${accountId}/profile`, data),
    createStaff: (data) => api.post('/users/staff', data),
};


// Subscription Plan APIs
export const subscriptionPlanAPI = {
    getAll: () =>
        USE_MOCK_API ? mockApi.getSubscriptionPlans() : api.get('/subscription-plans'),
    getById: (id) => USE_MOCK_API ? mockApi.getSubscriptionPlanById(id) : api.get(`/subscription-plans/${id}`)
};

// Subscription APIs (User đăng ký gói cho xe)
export const subscriptionAPI = {
    create: (data) => api.post('/subscription', data),
    getByVehicleId: (vehicleId) => api.get(`/subscription/vehicle/${vehicleId}`),
    cancel: (subscriptionId) => api.put(`/subscription/cancel/${subscriptionId}`),
    getAll: () => api.get('/subscription'),
    getByDriverId: (driverId) => api.get(`/subscription/driver/${driverId}`),
    renew: (subscriptionId, data) => api.post(`/subscription/${subscriptionId}/renew`, data)
};

export const stationAPI = {
    getAll: () => api.get('/stations'),
    getById: (id) => api.get(`/stations/${id}`),
    create: (data) => api.post('/stations', data),
    update: (id, data) => api.put(`/stations/${id}`, data),
    updateStatus: (id, status) => api.put(`/stations/${id}/status`, { status }),
    delete: (id) => api.delete(`/stations/${id}`),
};

// Booking APIs
export const bookingAPI = {
    checkAvailability: (stationId, vehicleId) => api.get(`/booking/check-availability?station_id=${stationId}&vehicle_id=${vehicleId}`),
    create: (data) => api.post('/booking', data),
    getById: (id) => api.get(`/booking/${id}`),
    update: (id, data) => api.put(`/booking/${id}`, data),
    delete: (id) => api.delete(`/booking/${id}`),
    getByUserId: (userId) => api.get(`/booking/user/${userId}`),
    getMyBookings: () => api.get('/booking/my-bookings?status=pending'),
    getByStatus: (status) => api.get(`/booking/my-bookings?status=${status}`),
    cancel: (id) => api.patch(`/booking/${id}/cancel`),
};

// Invoice APIs
export const invoiceAPI = {
    createFromSubscription: (data) =>
        USE_MOCK_API ? mockApi.createInvoiceFromSubscription(data) : api.post('/invoice/create-from-subscription', data),
    getPaymentHistoryByDriverId: (driverId) => api.get(`/invoice/payment-history/driver/${driverId}`)
};

// Payment APIs
export const paymentAPI = {
    create: (data) =>
        USE_MOCK_API ? mockApi.createPayment(data) : api.post('/payment/create', data)
};

export const swapAPI = {
    checkAvailableBatteries: (stationId, batteryTypeId, Quantity) => api.get(`/swap/available-batteries?station_id=${stationId}&battery_type_id=${batteryTypeId}&quantity=${Quantity}`),
    getEmptySlots: (stationId) => api.get(`/swap/empty-slots?station_id=${stationId}`),
    validateAndPrepare: (data) => api.post('/swap/validate-and-prepare', data),
    execute: (data) => api.post('/swap/execute', data),
    firstTimePickup: (driverId, vehicleId, stationId) => api.post('/swap/first-time-pickup', { driver_id: driverId, vehicle_id: vehicleId, station_id: stationId }),
    validateWithBooking: (data) => api.post('/swap/validate-with-booking', data),
    executeWithBooking: (data) => api.post('/swap/execute-with-booking', data),
    executeFirstTimeWithBooking: (data) => api.post('/swap/execute-first-time-with-booking', data),
    checkFirstTimePickup: (vehicleId) => api.get(`/swap/check-first-time-pickup?vehicle_id=${vehicleId}`),
    getSwapRecordsByDriver: (driverId) => api.get(`/swap-records/driver/${driverId}`),
};

// Ticket APIs 
export const ticketAPI = {
    create: (data) => api.post('/support-ticket', data),
    getByDriverId: (driverId) => api.get(`/support-ticket/creator/${driverId}`)
};
// Battery APIs
export const batteryAPI = {
    getAll: (params) => api.get('/batteries/all', { params }),
    getByVehicleId: (vehicleId) => api.get(`/batteries/vehicle/${vehicleId}`),
    createForVehicle: (vehicleId) => api.post(`/batteries/vehicle/${vehicleId}`),
    getSummaryByStation: (stationId) => api.get(`/batteries/station/${stationId}`),
};

// Analysis APIs
export const analysisAPI = {
    getRevenue: (params) => api.get('/analysis/revenue', { params }),
    getSwaps: (params) => api.get('/analysis/swaps', { params }),
    getSubscriptions: (params) => api.get('/analysis/subscriptions', { params }),
    exportReport: (params) => api.get('/analysis/export', {
        params,
        responseType: 'blob' // Set response type to blob for binary file download
    }),
};


// Shift API 
export const shiftAPI = {
    getCurrentShift: (params) => api.get('/shifts/current', { params }),
    getAll: (params) => api.get('/shifts', { params })
};

// Transfer API
export const transferAPI = {
    getByStation: (params) => api.get('/transfers/request', { params }),
    create: (data) => api.post('/transfers/request', data),
    // Admin direct-create transfer orders without a prior staff request
    // Payload shape:
    // { transfer_orders: [{ source_station_id, target_station_id, transfer_quantity }] }
    // Adjust endpoint if your backend differs.
    createDirect: (data) => api.post('/transfers/orders', data),
    cancel: (id) => USE_MOCK_API ? mockApi.cancelTransferRequest(id) : api.patch(`/transfers/${id}/cancel`),
    confirmArrival: (id) => USE_MOCK_API ? mockApi.confirmTransferArrival(id) : api.patch(`/transfers/${id}/confirm-arrival`),
    reject: (id) => api.post(`/transfers/${id}/reject`),
    approve: (id, data) => api.post(`/transfers/${id}/approve`, data),
    confirmOrder: (orderId) => api.post(`/transfers/${orderId}/confirm`),
};

// Cabinet API (Station cabinets with slots & batteries)
export const cabinetAPI = {
    getAll: (params) => api.get('/cabinets', { params })

};

// Config API (System Settings)
export const configAPI = {
    get: () => api.get('/config'),
    update: (data) => api.put('/config', data),
    reset: () => api.post('/config/reset'),
};

