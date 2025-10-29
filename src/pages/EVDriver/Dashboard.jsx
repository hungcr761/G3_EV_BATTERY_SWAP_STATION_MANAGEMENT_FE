import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi';
import { bookingAPI } from '@/lib/apiServices';
import ProfileUpdate from '@/components/Dashboard/ProfileUpdate';
import QRCodeLib from 'qrcode';
import {
    Battery,
    Motorbike,
    MapPin,
    Calendar,
    CreditCard,
    Settings,
    Plus,
    Eye,
    TrendingUp,
    TestTube,
    User,
    AlertCircle,
    QrCode,
    ChevronRight,
    MessageSquare
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
 
    const toTitleCase = (s) => {
        if (!s) return '';
        return s
            .toString()
            .split(' ')
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    const [showMockTest, setShowMockTest] = useState(false);
    const [showProfileUpdate, setShowProfileUpdate] = useState(false);
    const [showVehicleManagement, setShowVehicleManagement] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const largeQrCodeRef = useRef(null);

    // Generate large QR code for modal
    useEffect(() => {
        if (selectedBooking?.id && showQRCode && largeQrCodeRef.current) {
            // Small delay to ensure canvas is rendered
            const timer = setTimeout(() => {
                QRCodeLib.toCanvas(largeQrCodeRef.current, selectedBooking.id.toString(), {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                }).catch(err => {
                    console.error('Error generating large QR code:', err);
                });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [selectedBooking?.id, showQRCode]);

    // Reset QR code state when dialog closes
    useEffect(() => {
        if (!selectedBooking) {
            setShowQRCode(false);
        }
    }, [selectedBooking]);

    // Fetch bookings from API
    const { data: bookingsData, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useApi(bookingAPI.getMyBookings);

    const userStats = {
        totalSwaps: 45,
        thisMonthSwaps: 8,
        currentBatterySoH: 87,
        monthlyCost: 150000,
        nextSwapPrediction: '3 ngày'
    };

    const recentSwaps = [
        {
            id: 1,
            station: 'Trạm ABC - Quận 1',
            date: '2024-01-15',
            batteryType: 'Type 1',
            cost: 15000,
            sohChange: -2
        },
        {
            id: 2,
            station: 'Trạm XYZ - Quận 3',
            date: '2024-01-10',
            batteryType: 'Type 1',
            cost: 15000,
            sohChange: -1
        }
    ];

    // Show cancel confirmation
    const handleCancelClick = () => {
        setShowCancelConfirm(true);
    };

    // Cancel booking function
    const handleCancelBooking = async () => {
        if (!selectedBooking) return;

        setIsCancelling(true);
        try {
            await bookingAPI.cancel(selectedBooking.id);
            // Refresh bookings list
            await refetchBookings();
            // Close the dialogs
            setSelectedBooking(null);
            setShowCancelConfirm(false);
            // Show success message (you could add a toast notification here)
            console.log('Booking cancelled successfully');
        } catch (error) {
            console.error('Error cancelling booking:', error);
            // You could add error handling/toast notification here
        } finally {
            setIsCancelling(false);
        }
    };

    // Format bookings data for display
    const upcomingBookings = bookingsData && bookingsData.bookings && Array.isArray(bookingsData.bookings) ? bookingsData.bookings.map(booking => ({
        id: booking.booking_id,
        station: booking.station?.station_name || 'Trạm không xác định',
        address: booking.station?.address || '',
        date: new Date(booking.scheduled_time).toLocaleDateString('vi-VN'),
        time: new Date(booking.scheduled_time).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        endTime: new Date(booking.scheduled_end_time).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        vehicle: booking.vehicle?.license_plate || 'Không xác định',
        vehicleModel: booking.vehicle?.model?.name || '',
        vehicleBrand: booking.vehicle?.model?.brand || '',
        status: booking.status,
        batteryCount: booking.batteries?.length || 0,
        batteries: booking.batteries || [],
        createTime: booking.create_time,
        scheduledStartTime: booking.scheduled_time,
        scheduledEndTime: booking.scheduled_end_time
    })) : [];

    // If showing profile update, render that component
    if (showProfileUpdate) {
        return <ProfileUpdate onBack={() => setShowProfileUpdate(false)} />;
    }

    // Vehicle management is now a separate route (/vehiclesManagement) — navigation handled via router

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Background with welcome */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                </div>
                
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }} />
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
                                <User className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Welcome, {toTitleCase(user?.fullname)}!
                                </h1>
                                <p className="text-slate-600 mt-1 text-lg">
                                    {user?.role === 'driver' ? 'EV Driver' : 'Administrator'} • {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1 group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Battery Swaps</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{userStats.totalSwaps}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
                                    <Battery className="h-7 w-7 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1 group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">This Month</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{userStats.thisMonthSwaps}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
                                    <TrendingUp className="h-7 w-7 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1 group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Current SoH</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{userStats.currentBatterySoH}%</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
                                    <Motorbike className="h-7 w-7 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1 group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Monthly Cost</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">
                                        {userStats.monthlyCost.toLocaleString()}đ
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
                                    <CreditCard className="h-7 w-7 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Swaps */}
                    <div className="lg:col-span-2">
                        <Card className="border-slate-200/60 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl flex items-center gap-2">
                                            <Battery className="h-6 w-6 text-blue-600" />
                                            Recent Battery Swaps
                                        </CardTitle>
                                        <CardDescription className="text-slate-600 mt-1">
                                            Your recent battery swap history
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" className="border-slate-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200">
                                        <Eye className="mr-2 h-4 w-4" />
                                        View All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentSwaps.map((swap) => (
                                        <div key={swap.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all duration-200 bg-white">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md flex items-center justify-center">
                                                    <Battery className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{swap.station}</p>
                                                    <p className="text-sm text-slate-600">{swap.date}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 mb-1">{swap.batteryType}</Badge>
                                                <p className="text-sm text-slate-600 font-medium">
                                                    {swap.cost.toLocaleString()}đ
                                                </p>
                                                <p className="text-xs text-red-600 font-medium">
                                                    SoH: {swap.sohChange > 0 ? '+' : ''}{swap.sohChange}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upcoming Bookings & Quick Actions */}
                    <div className="space-y-6">
                        {/* Upcoming Bookings */}
                        <Card className="border-slate-200/60 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                                    <Calendar className="mr-2 h-6 w-6 text-purple-600" />
                                    Upcoming Bookings
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Your upcoming battery swap appointments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {bookingsLoading ? (
                                        <div className="text-center py-8">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-3">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                                            </div>
                                            <p className="text-sm text-slate-600">Loading data...</p>
                                        </div>
                                    ) : bookingsError ? (
                                        <div className="text-center py-6 bg-red-50 rounded-lg border border-red-200">
                                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                            <p className="text-sm text-red-600">Error loading data: {bookingsError}</p>
                                        </div>
                                    ) : upcomingBookings.length === 0 ? (
                                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                                            <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                            <p className="text-sm text-slate-600">No upcoming bookings</p>
                                        </div>
                                    ) : (
                                        upcomingBookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="p-4 border border-slate-200 rounded-xl cursor-pointer hover:shadow-md hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 bg-white"
                                                onClick={() => setSelectedBooking(booking)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm text-slate-800">{booking.station}</p>
                                                        <p className="text-xs text-slate-600 mt-1">{booking.address}</p>
                                                        <p className="text-xs text-slate-600 mt-1 flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {booking.date} from {new Date(booking.createTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {booking.time}
                                                        </p>
                                                        <p className="text-xs text-slate-600 flex items-center mt-1">
                                                            <Motorbike className="h-3 w-3 mr-1" />
                                                            {booking.vehicle} ({booking.vehicleBrand} {booking.vehicleModel})
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-1.5">
                                                        <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                                                            {booking.batteryCount} pin
                                                        </Badge>
                                                        {booking.status && (
                                                            <Badge variant={
                                                                booking.status === 'pending' ? 'secondary' :
                                                                    'outline'
                                                            } className={
                                                                booking.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                                    ''
                                                            }>
                                                                {booking.status === 'pending' ? 'Pending' :
                                                                    booking.status}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 hover:text-purple-700 transition-all duration-200"
                                        onClick={() => navigate('/booking')}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Booking
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="border-slate-200/60 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-800">Quick Actions</CardTitle>
                                <CardDescription className="text-xl">
                                    Frequently used functions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full justify-between group bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-slate-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 hover:text-blue-700 transition-all duration-200"
                                    variant="outline"
                                    onClick={() => navigate('/paymentHistory')}>
                                    <span className="flex items-center">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Payment History
                                    </span>
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </Button>
                                <Button className="w-full justify-between group bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-slate-700 hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 hover:text-purple-700 transition-all duration-200"
                                    variant="outline">
                                    <span className="flex items-center">
                                        <Battery className="mr-2 h-4 w-4" />
                                        Battery Swap History
                                    </span>
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </Button>
                                <Button
                                    className="w-full justify-between group bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-slate-700 hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-400 hover:text-emerald-700 transition-all duration-200"
                                    variant="outline"
                                    onClick={() => navigate('/vehiclesManagement')}
                                >
                                    <span className="flex items-center">
                                        <Motorbike className="mr-2 h-4 w-4" />
                                        Vehicle Management
                                    </span>
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </Button>
                                <Button className="w-full justify-between group bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-slate-700 hover:from-amber-100 hover:to-orange-100 hover:border-amber-400 hover:text-amber-700 transition-all duration-200"
                                    variant="outline"
                                    onClick={() => navigate('/subscriptionManagement')}>
                                    <span className="flex items-center">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Subscriptions Management
                                    </span>
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Booking Details Dialog */}
                <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Booking Details</h3>
                                        <p className="text-white/90 text-sm">Battery swap schedule information</p>
                                    </div>
                                </div>
                                {selectedBooking && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowQRCode(true)}
                                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                                    >
                                        <QrCode className="h-4 w-4 mr-2" />
                                        Show QR Code
                                    </Button>
                                )}
                            </div>
                        </div>

                        {selectedBooking && (
                            <div className="px-6 pt-6 pb-2 space-y-6">
                                <DialogHeader className="p-0">
                                    <DialogTitle className="text-xl font-bold text-slate-900">
                                        Booking Information
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-600">
                                        Complete details about your scheduled battery swap appointment
                                    </DialogDescription>
                                </DialogHeader>

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Station Info */}
                                    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg text-slate-800">
                                                <MapPin className="h-5 w-5 text-blue-600" />
                                                <span>Station Information</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            <div className="space-y-2">
                                                <p className="font-semibold text-base text-slate-900">{selectedBooking.station}</p>
                                                <p className="text-sm text-slate-600 flex items-start">
                                                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                    {selectedBooking.address}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Vehicle Info */}
                                    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg text-slate-800">
                                                <Motorbike className="h-5 w-5 text-emerald-600" />
                                                <span>Vehicle Information</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            <div className="space-y-2">
                                                <p className="font-semibold text-base text-slate-900">{selectedBooking.vehicle}</p>
                                                <p className="text-sm text-slate-600">
                                                    {selectedBooking.vehicleBrand} {selectedBooking.vehicleModel}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Booking Schedule */}
                                    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg text-slate-800">
                                                <Calendar className="h-5 w-5 text-purple-600" />
                                                <span>Booking Schedule</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="font-semibold text-base text-slate-900">{selectedBooking.date}</p>
                                                    <p className="text-sm text-slate-600">
                                                        {new Date(selectedBooking.createTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {selectedBooking.time}
                                                    </p>
                                                </div>
                                                <div className="pt-2 border-t border-slate-200">
                                                    <p className="text-xs text-slate-500">
                                                        Created at: {new Date(selectedBooking.createTime).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Battery Info */}
                                    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg text-slate-800">
                                                <Battery className="h-5 w-5 text-amber-600" />
                                                <span>Battery Information</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            {selectedBooking.batteries && selectedBooking.batteries.length > 0 ? (
                                                <div className="space-y-3">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {selectedBooking.batteryCount} battery(ies) booked
                                                    </p>
                                                    <div className="space-y-2">
                                                        {selectedBooking.batteries.map((battery, index) => (
                                                            <div key={battery.battery_id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="font-medium text-sm text-slate-900">Pin #{index + 1}</p>
                                                                    <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                                                                        {battery.current_soc}% SoC
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-slate-600 mt-1">
                                                                    Serial: {battery.battery_serial}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-600">No battery information</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        <div className="px-6 pb-6 flex justify-between items-center">
                            <div className="flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedBooking(null)}
                                    className="border-slate-300 hover:bg-slate-50"
                                >
                                    Close
                                </Button>
                                {selectedBooking?.status === 'pending' && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancelClick}
                                        disabled={isCancelling}
                                        className="bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        {isCancelling ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Cancelling...
                                            </>
                                        ) : (
                                            'Cancel Booking'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Cancel Confirmation Dialog */}
                <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
                    <DialogContent className="max-w-md">
                        <DialogHeader className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <DialogTitle className="text-center text-2xl font-bold text-slate-800">
                                Confirm Cancel Booking
                            </DialogTitle>
                            <DialogDescription className="text-center text-base text-slate-600">
                                Are you sure you want to cancel this booking?
                                <br />
                                <span className="text-red-600 font-medium">This action cannot be undone.</span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {selectedBooking && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="font-semibold text-slate-800">{selectedBooking.station}</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {selectedBooking.date} từ {selectedBooking.time} - {selectedBooking.endTime}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        Vehicle: {selectedBooking.vehicle}
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCancelConfirm(false)}
                                    disabled={isCancelling}
                                    className="border-slate-300 hover:bg-slate-50"
                                >
                                    No
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleCancelBooking}
                                    disabled={isCancelling}
                                    className="bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    {isCancelling ? 'Đang hủy...' : 'Có, hủy lịch'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* QR Code Modal */}
                <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
                    <DialogContent className="max-w-md">
                        <DialogHeader className="space-y-3">
                            <DialogTitle className="flex items-center justify-center space-x-2 text-2xl font-bold text-slate-800">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <QrCode className="h-6 w-6 text-blue-600" />
                                </div>
                                <span>Booking QR Code</span>
                            </DialogTitle>
                            <DialogDescription className="text-center text-base text-slate-600">
                                Scan this QR code at the kiosk to confirm your booking
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4 py-6">
                            <div className="bg-white p-6 rounded-xl border-2 border-slate-300 shadow-lg">
                                <canvas ref={largeQrCodeRef} className="block" />
                            </div>
                            {selectedBooking && (
                                <div className="text-center space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200 w-full">
                                    <p className="text-sm font-semibold text-slate-800">
                                        Booking ID: <span className="font-mono">{selectedBooking.id}</span>
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        Station: {selectedBooking.station}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowQRCode(false)}
                                className="border-slate-300 hover:bg-slate-50"
                            >
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Dashboard;
