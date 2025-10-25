import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useAuth } from '../hooks/useAuth'
import { useApi } from '../hooks/useApi';
import { bookingAPI } from '../lib/apiServices';
import ProfileUpdate from '../components/Dashboard/ProfileUpdate';
import VehicleManagement from './EVDriver/VehicleManagement';
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
    QrCode
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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

    // Mock data - in real app, this would come from API
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
            await bookingAPI.delete(selectedBooking.id);
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
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
                        <div className="flex items-center space-x-4">
                            <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
                                <User className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Chào mừng, {user?.fullname}!
                                </h1>
                                <p className="text-slate-600 mt-1 text-lg">
                                    {user?.role === 'driver' ? 'Tài xế xe điện' : 'Quản trị viên'} • {user?.email}
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
                                    <p className="text-sm font-medium text-slate-600">Tổng lượt đổi pin</p>
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
                                    <p className="text-sm font-medium text-slate-600">Tháng này</p>
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
                                    <p className="text-sm font-medium text-slate-600">SoH hiện tại</p>
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
                                    <p className="text-sm font-medium text-slate-600">Chi phí tháng</p>
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
                                        <CardTitle className="text-2xl font-bold text-slate-800">Lịch sử đổi pin gần đây</CardTitle>
                                        <CardDescription className="text-slate-600 mt-1">
                                            Các lần đổi pin của bạn trong thời gian qua
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" className="border-slate-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Xem tất cả
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
                                    Lịch đặt trước
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Các lịch đổi pin sắp tới
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {bookingsLoading ? (
                                        <div className="text-center py-8">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-3">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                                            </div>
                                            <p className="text-sm text-slate-600">Đang tải dữ liệu...</p>
                                        </div>
                                    ) : bookingsError ? (
                                        <div className="text-center py-6 bg-red-50 rounded-lg border border-red-200">
                                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                            <p className="text-sm text-red-600">Lỗi tải dữ liệu: {bookingsError}</p>
                                        </div>
                                    ) : upcomingBookings.length === 0 ? (
                                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                                            <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                            <p className="text-sm text-slate-600">Chưa có lịch đặt trước nào</p>
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
                                                            {booking.date} từ {booking.time} - {booking.endTime}
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
                                                                booking.status === 'confirmed' ? 'default' :
                                                                    booking.status === 'pending' ? 'secondary' :
                                                                        'outline'
                                                            } className={
                                                                booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                                    booking.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                                        ''
                                                            }>
                                                                {booking.status === 'confirmed' ? 'Đã xác nhận' :
                                                                    booking.status === 'pending' ? 'Chờ xác nhận' :
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
                                        className="w-full border-slate-300 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-all duration-200"
                                        onClick={() => navigate('/booking')}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Đặt lịch mới
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="border-slate-200/60 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-800">Thao tác nhanh</CardTitle>
                                <CardDescription className="text-slate-600">
                                    Các chức năng thường dùng
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full justify-start bg-white border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200" variant="outline">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Lịch sử thanh toán
                                </Button>
                                <Button className="w-full justify-start bg-white border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-400 hover:text-purple-700 transition-all duration-200" variant="outline">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Lịch sử đổi pin
                                </Button>
                                <Button
                                    className="w-full justify-start bg-white border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-400 hover:text-emerald-700 transition-all duration-200"
                                    variant="outline"
                                    onClick={() => navigate('/vehiclesManagement')}
                                >
                                    <Motorbike className="mr-2 h-4 w-4" />
                                    Quản lý xe
                                </Button>
                                <Button className="w-full justify-start bg-white border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-400 hover:text-amber-700 transition-all duration-200" variant="outline">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Quản lý gói dịch vụ
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Booking Details Dialog */}
                <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <DialogTitle className="flex items-center space-x-2 text-2xl font-bold text-slate-800">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Calendar className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <span>Chi tiết lịch đặt trước</span>
                                    </DialogTitle>
                                    <DialogDescription className="mt-2 text-base text-slate-600">
                                        Thông tin chi tiết về lịch đổi pin của bạn
                                    </DialogDescription>
                                </div>
                                {selectedBooking && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowQRCode(true)}
                                        className="flex items-center space-x-2 border-slate-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200"
                                    >
                                        <QrCode className="h-4 w-4" />
                                        <span>Hiển thị mã QR</span>
                                    </Button>
                                )}
                            </div>
                        </DialogHeader>
                        {selectedBooking && (
                            <div className="space-y-6 pt-2">
                                {/* Status Header */}


                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                                    {/* Station Info */}
                                    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg">
                                                <MapPin className="h-5 w-5 text-blue-600" />
                                                <span className="text-blue-900">Thông tin trạm</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            <div className="space-y-2">
                                                <p className="font-semibold text-base text-blue-900">{selectedBooking.station}</p>
                                                <p className="text-sm text-blue-700 flex items-start">
                                                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                    {selectedBooking.address}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Vehicle Info */}
                                    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg">
                                                <Motorbike className="h-5 w-5 text-emerald-600" />
                                                <span className="text-emerald-900">Thông tin xe</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            <div className="space-y-2">
                                                <p className="font-semibold text-base text-emerald-900">{selectedBooking.vehicle}</p>
                                                <p className="text-sm text-emerald-700">
                                                    {selectedBooking.vehicleBrand} {selectedBooking.vehicleModel}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Booking Schedule */}
                                    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-pink-50">
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg">
                                                <Calendar className="h-5 w-5 text-purple-600" />
                                                <span className="text-purple-900">Lịch trình</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="font-semibold text-base text-purple-900">{selectedBooking.date}</p>
                                                    <p className="text-sm text-purple-700">
                                                        {selectedBooking.time} - {selectedBooking.endTime}
                                                    </p>
                                                </div>
                                                <div className="pt-2 border-t border-purple-200">
                                                    <p className="text-xs text-purple-600">
                                                        Đặt lúc: {new Date(selectedBooking.createTime).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Battery Info */}
                                    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-orange-50">
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg">
                                                <Battery className="h-5 w-5 text-amber-600" />
                                                <span className="text-amber-900">Thông tin pin</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            {selectedBooking.batteries && selectedBooking.batteries.length > 0 ? (
                                                <div className="space-y-3">
                                                    <p className="text-sm font-medium text-amber-800">
                                                        {selectedBooking.batteryCount} pin được đặt
                                                    </p>
                                                    <div className="space-y-2">
                                                        {selectedBooking.batteries.map((battery, index) => (
                                                            <div key={battery.battery_id} className="bg-white p-3 rounded-lg border border-amber-200 shadow-sm">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="font-medium text-sm text-amber-900">Pin #{index + 1}</p>
                                                                    <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                                                                        {battery.current_soc}% SoC
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-amber-700 mt-1">
                                                                    Serial: {battery.battery_serial}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-amber-700">Không có thông tin pin</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between items-center pt-6 px-2 border-t border-slate-200">
                                    <div className="text-sm text-slate-600 font-medium">
                                        ID đặt lịch: <span className="font-mono text-slate-800">{selectedBooking.id}</span>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setSelectedBooking(null)}
                                            className="border-slate-300 hover:bg-slate-50"
                                        >
                                            Đóng
                                        </Button>
                                        {selectedBooking.status === 'pending' && (
                                            <Button
                                                variant="destructive"
                                                onClick={handleCancelClick}
                                                disabled={isCancelling}
                                                className="bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                                            >
                                                Hủy lịch
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
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
                                Xác nhận hủy lịch
                            </DialogTitle>
                            <DialogDescription className="text-center text-base text-slate-600">
                                Bạn có chắc chắn muốn hủy lịch đặt trước này? 
                                <br />
                                <span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
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
                                        Xe: {selectedBooking.vehicle}
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
                                    Không
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
                                <span>Mã QR đặt lịch</span>
                            </DialogTitle>
                            <DialogDescription className="text-center text-base text-slate-600">
                                Quét mã QR này tại kiosk để xác nhận đặt lịch
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4 py-6">
                            <div className="bg-white p-6 rounded-xl border-2 border-slate-300 shadow-lg">
                                <canvas ref={largeQrCodeRef} className="block" />
                            </div>
                            {selectedBooking && (
                                <div className="text-center space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200 w-full">
                                    <p className="text-sm font-semibold text-slate-800">
                                        ID đặt lịch: <span className="font-mono">{selectedBooking.id}</span>
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        Trạm: {selectedBooking.station}
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
                                Đóng
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Dashboard;
