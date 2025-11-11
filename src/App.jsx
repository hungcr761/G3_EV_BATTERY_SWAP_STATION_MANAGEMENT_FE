import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import KioskLayout from './components/Layout/KioskLayout';
import AdminLayout from './components/Layout/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Support from './pages/Support';
import KioskHome from './pages/kiosk/KioskHome';
import SwapStatus from './pages/kiosk/SwapStatus';
import SwapComplete from './pages/kiosk/SwapComplete';
import UserVerification from './pages/kiosk/UserVerification';
import UserVehicleSelection from './pages/kiosk/UserVehicleSelection';
import UserBatterySelection from './pages/kiosk/UserBatterySelection';
import UserAvailabilityCheck from './pages/kiosk/UserAvailabilityCheck';
import './App.css';
import VehicleManagement from './pages/EVDriver/VehicleManagement.jsx';
import SubscriptionManagement from './pages/EVDriver/SubscriptionManagement.jsx';
import Services from './pages/EVDriver/Services.jsx';
import Payment from './pages/EVDriver/Payment.jsx';
import PaymentSuccess from './pages/EVDriver/PaymentSuccess.jsx';
import Stations from './pages/EVDriver/Booking.jsx';
import Dashboard from './pages/EVDriver/Dashboard.jsx';
// Admin pages
import StationManagement from './pages/Admin/StationManagement';
import UserManagement from './pages/Admin/UserManagement';
import BatteryManagement from './pages/Admin/BatteryManagement';
import AnalyticsReports from './pages/Admin/AnalyticsReports';
import SystemSettings from './pages/Admin/SystemSettings';
import PaymentHistory from './pages/EVDriver/PaymentHistory.jsx';
import ShiftSchedule from './pages/Admin/ShiftSchedule';
import StaffLayout from './components/Layout/StaffLayout.jsx';
import StaffDashboard from './pages/staff/StaffBatteryManagement.jsx';
import TransferManagement from './pages/staff/TransferManagement.jsx';
import StaffBatteryManagement from './pages/staff/StaffBatteryManagement.jsx';
import ShiftManagement from './pages/staff/ShiftManagement.jsx';
import SwapManagement from './pages/EVDriver/SwapHistory.jsx';
import AdminTransferManagement from './pages/Admin/AdminTransferManagement.jsx';
import SwapHistory from './pages/EVDriver/SwapHistory.jsx';
import BookingHistory from './pages/EVDriver/BookingHistory.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// // Admin Protected Route Component
// const AdminProtectedRoute = ({ children }) => {
//   const { isAuthenticated, loading, user } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   // Check if user has admin role (this would come from your auth system)
//   if (user?.role !== 'admin') {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

const RoleProtectedRoute = ({ children, allowedRoute = [], redirectTo = '/dashboard' }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoute.includes(user?.role)) {
    return <Navigate to={redirectTo} replace />
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public routes with layout */}
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path="/booking" element={
            <Layout>
              <Stations />
            </Layout>
          } />
          <Route path="/services" element={
            <Layout>
              <Services />
            </Layout>
          } />
          <Route path="/payment" element={
            <ProtectedRoute>
              <Layout>
                <Payment />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/payment-success" element={
            <ProtectedRoute>
              <Layout>
                <PaymentSuccess />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/support" element={
            <Layout>
              <Support />
            </Layout>
          } />

          {/* Auth routes without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/*Ev routes*/}
          <Route path="/dashboard" element={
            <RoleProtectedRoute allowedRoute={['driver']}>
              <Layout>
                <Dashboard />
              </Layout>
            </RoleProtectedRoute>
          } />
          <Route path="/profile" element={
            <RoleProtectedRoute allowedRoute={['driver']}>
              <Layout>
                <Profile />
              </Layout>
            </RoleProtectedRoute>
          } />
          <Route path="/vehiclesManagement" element={
            <RoleProtectedRoute allowedRoute={['driver']}>
              <Layout>
                <VehicleManagement />
              </Layout>
            </RoleProtectedRoute>
          } />

          <Route path="/subscriptionManagement" element={
            <RoleProtectedRoute allowedRoute={['driver']}>
              <Layout>
                <SubscriptionManagement />
              </Layout>
            </RoleProtectedRoute>
          } />
          <Route path='/paymentHistory' element={
            <RoleProtectedRoute allowedRoute={['driver']}>
              <Layout>
                <PaymentHistory />
              </Layout>
            </RoleProtectedRoute>
          } />

          <Route path="/swapHistory" element={
            <RoleProtectedRoute allowedRoute={['driver']}>
              <Layout>
                <SwapHistory />
              </Layout>
            </RoleProtectedRoute>
          } />
          <Route path="/bookingHistory" element={
            <RoleProtectedRoute allowedRoute={['driver']}>
              <Layout>
                <BookingHistory />
              </Layout>
            </RoleProtectedRoute>
          } />
          <Route path="/settings" element={
            <RoleProtectedRoute allowedRoute={['driver', 'admin', 'staff']}>
              <Layout>
                <Settings />
              </Layout>
            </RoleProtectedRoute>
          } />


          {/* Staff routes */}
          <Route path="/staff" element={
            <RoleProtectedRoute allowedRoute={['staff']}>
              <StaffLayout>
                <StaffBatteryManagement />
              </StaffLayout>
            </RoleProtectedRoute>
          }
          />
          <Route path="/staff/shift-calendar" element={
            <RoleProtectedRoute allowedRoute={['staff']}>
              <StaffLayout>
                <ShiftManagement />
              </StaffLayout>
            </RoleProtectedRoute>
          } />
          <Route path="/staff/transfer-management" element={
            <RoleProtectedRoute allowedRoute={['staff']}>
              <StaffLayout>
                <TransferManagement />
              </StaffLayout>
            </RoleProtectedRoute>
          }
          />

          {/* Kiosk routes - separate layout, no auth required */}
          <Route path="/kiosk/:stationId" element={<KioskLayout><KioskHome /></KioskLayout>} />
          <Route path="/kiosk/:stationId/swap/:bookingId" element={<KioskLayout><SwapStatus /></KioskLayout>} />
          <Route path="/kiosk/:stationId/complete/:bookingId" element={<KioskLayout><SwapComplete /></KioskLayout>} />

          {/* User flow routes - no booking required */}
          <Route path="/kiosk/:stationId/user/:userId" element={<KioskLayout><UserVerification /></KioskLayout>} />
          <Route path="/kiosk/:stationId/user/:userId/vehicle" element={<KioskLayout><UserVehicleSelection /></KioskLayout>} />
          <Route path="/kiosk/:stationId/user/:userId/battery" element={<KioskLayout><UserBatterySelection /></KioskLayout>} />
          <Route path="/kiosk/:stationId/user/:userId/availability" element={<KioskLayout><UserAvailabilityCheck /></KioskLayout>} />
          <Route path="/kiosk/:stationId/user/:userId/swap" element={<KioskLayout><SwapStatus /></KioskLayout>} />

          {/* Admin routes */}
          <Route path="/admin" element={
            <RoleProtectedRoute allowedRoute={['admin']}>
              <AdminLayout>
                <AnalyticsReports />
              </AdminLayout>
            </RoleProtectedRoute>
          } />
          <Route path="/admin/shifts" element={
            <RoleProtectedRoute allowedRoute={['admin']}>
              <AdminLayout>
                <ShiftSchedule />
              </AdminLayout>
            </RoleProtectedRoute>
          } />
          <Route path="/admin/stations" element={
            <RoleProtectedRoute allowedRoute={['admin']}>
              <AdminLayout>
                <StationManagement />
              </AdminLayout>
            </RoleProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <RoleProtectedRoute allowedRoute={['admin']}>
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            </RoleProtectedRoute>
          } />
          <Route path="/admin/batteries" element={
            <RoleProtectedRoute allowedRoute={['admin']}>
              <AdminLayout>
                <BatteryManagement />
              </AdminLayout>
            </RoleProtectedRoute>
          } />
          <Route path="/admin/transfer" element={
            <RoleProtectedRoute allowedRoute={['admin']}>
              <AdminLayout>
                <AdminTransferManagement />
              </AdminLayout>
            </RoleProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <RoleProtectedRoute allowedRoute={['admin']}>
              <AdminLayout>
                <SystemSettings />
              </AdminLayout>
            </RoleProtectedRoute>
          } />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
