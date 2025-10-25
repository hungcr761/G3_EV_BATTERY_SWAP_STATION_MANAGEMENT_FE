import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import KioskLayout from './components/Layout/KioskLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Stations from './pages/Booking.jsx';
import Services from './pages/Services';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import Support from './pages/Support';
// Kiosk pages
import KioskHome from './pages/kiosk/KioskHome';
import SwapStatus from './pages/kiosk/SwapStatus';
import SwapComplete from './pages/kiosk/SwapComplete';
// User flow pages
import UserVerification from './pages/kiosk/UserVerification';
import UserVehicleSelection from './pages/kiosk/UserVehicleSelection';
import UserBatterySelection from './pages/kiosk/UserBatterySelection';
import UserAvailabilityCheck from './pages/kiosk/UserAvailabilityCheck';
import './App.css';

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

          {/* Protected routes with layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />

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

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
