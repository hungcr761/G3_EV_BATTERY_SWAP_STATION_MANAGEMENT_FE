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
import VehicleManagement from '../components/Dashboard/VehicleManagement';
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

    // If showing vehicle management, render that component
    if (showVehicleManagement) {
        return <VehicleManagement onBack={() => setShowVehicleManagement(false)} />;
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Chào mừng, {user?.fullname}!
                            </h1>
                            <p className="text-muted-foreground">
                                {user?.role === 'driver' ? 'Tài xế xe điện' : 'Quản trị viên'} • {user?.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tổng lượt đổi pin</p>
                                    <p className="text-2xl font-bold text-foreground">{userStats.totalSwaps}</p>
                                </div>
                                <Battery className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tháng này</p>
                                    <p className="text-2xl font-bold text-foreground">{userStats.thisMonthSwaps}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">SoH hiện tại</p>
                                    <p className="text-2xl font-bold text-foreground">{userStats.currentBatterySoH}%</p>
                                </div>
                                <Motorbike className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Chi phí tháng</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {userStats.monthlyCost.toLocaleString()}đ
                                    </p>
                                </div>
                                <CreditCard className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Swaps */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Lịch sử đổi pin gần đây</CardTitle>
                                        <CardDescription>
                                            Các lần đổi pin của bạn trong thời gian qua
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Xem tất cả
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentSwaps.map((swap) => (
                                        <div key={swap.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <Battery className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{swap.station}</p>
                                                    <p className="text-sm text-muted-foreground">{swap.date}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="secondary">{swap.batteryType}</Badge>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {swap.cost.toLocaleString()}đ
                                                </p>
                                                <p className="text-xs text-red-600">
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Lịch đặt trước
                                </CardTitle>
                                <CardDescription>
                                    Các lịch đổi pin sắp tới
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {bookingsLoading ? (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
                                        </div>
                                    ) : bookingsError ? (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-red-500">Lỗi tải dữ liệu: {bookingsError}</p>
                                        </div>
                                    ) : upcomingBookings.length === 0 ? (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-muted-foreground">Chưa có lịch đặt trước nào</p>
                                        </div>
                                    ) : (
                                        upcomingBookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => setSelectedBooking(booking)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{booking.station}</p>
                                                        <p className="text-xs text-muted-foreground">{booking.address}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {booking.date} từ {booking.time} - {booking.endTime}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Xe: {booking.vehicle} ({booking.vehicleBrand} {booking.vehicleModel})
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-1">
                                                        <Badge variant="outline">
                                                            {booking.batteryCount} pin
                                                        </Badge>
                                                        {booking.status && (
                                                            <Badge variant={
                                                                booking.status === 'confirmed' ? 'default' :
                                                                    booking.status === 'pending' ? 'secondary' :
                                                                        'outline'
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
                                        className="w-full"
                                        onClick={() => navigate('/booking')}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Đặt lịch mới
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác nhanh</CardTitle>
                                <CardDescription>
                                    Các chức năng thường dùng
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full justify-start" variant="outline">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Lịch sử thanh toán
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Lịch sử đổi pin
                                </Button>
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                    onClick={() => setShowVehicleManagement(true)}
                                >
                                    <Motorbike className="mr-2 h-4 w-4" />
                                    Quản lý xe
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
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
                                    <DialogTitle className="flex items-center space-x-2">
                                        <Calendar className="h-5 w-5" />
                                        <span>Chi tiết lịch đặt trước</span>
                                    </DialogTitle>
                                    <DialogDescription className="mt-2">
                                        Thông tin chi tiết về lịch đổi pin của bạn
                                    </DialogDescription>
                                </div>
                                {selectedBooking && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowQRCode(true)}
                                        className="flex items-center space-x-2"
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
                                    <Card>
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg">
                                                <MapPin className="h-5 w-5 text-blue-500" />
                                                <span>Thông tin trạm</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            <div className="space-y-2">
                                                <p className="font-semibold text-base">{selectedBooking.station}</p>
                                                <p className="text-sm text-muted-foreground flex items-start">
                                                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                    {selectedBooking.address}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Vehicle Info */}
                                    <Card>
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg">
                                                <Motorbike className="h-5 w-5 text-green-500" />
                                                <span>Thông tin xe</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            <div className="space-y-2">
                                                <p className="font-semibold text-base">{selectedBooking.vehicle}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedBooking.vehicleBrand} {selectedBooking.vehicleModel}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Booking Schedule */}
                                    <Card>
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg">
                                                <Calendar className="h-5 w-5 text-purple-500" />
                                                <span>Lịch trình</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="font-semibold text-base">{selectedBooking.date}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedBooking.time} - {selectedBooking.endTime}
                                                    </p>
                                                </div>
                                                <div className="pt-2 border-t">
                                                    <p className="text-xs text-muted-foreground">
                                                        Đặt lúc: {new Date(selectedBooking.createTime).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Battery Info */}
                                    <Card>
                                        <CardHeader className="pb-3 px-5 pt-5">
                                            <CardTitle className="flex items-center space-x-2 text-lg">
                                                <Battery className="h-5 w-5 text-orange-500" />
                                                <span>Thông tin pin</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5">
                                            {selectedBooking.batteries && selectedBooking.batteries.length > 0 ? (
                                                <div className="space-y-3">
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        {selectedBooking.batteryCount} pin được đặt
                                                    </p>
                                                    <div className="space-y-2">
                                                        {selectedBooking.batteries.map((battery, index) => (
                                                            <div key={battery.battery_id} className="bg-orange-50 p-3 rounded-lg border">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="font-medium text-sm">Pin #{index + 1}</p>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {battery.current_soc}% SoC
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Serial: {battery.battery_serial}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Không có thông tin pin</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between items-center pt-6 px-2 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        ID đặt lịch: {selectedBooking.id}
                                    </div>
                                    <div className="flex space-x-3">
                                        <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                                            Đóng
                                        </Button>
                                        {selectedBooking.status === 'pending' && (
                                            <Button
                                                variant="destructive"
                                                onClick={handleCancelClick}
                                                disabled={isCancelling}
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
                        <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <span>Xác nhận hủy lịch</span>
                            </DialogTitle>
                            <DialogDescription>
                                Bạn có chắc chắn muốn hủy lịch đặt trước này? Hành động này không thể hoàn tác.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {selectedBooking && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium">{selectedBooking.station}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedBooking.date} từ {selectedBooking.time} - {selectedBooking.endTime}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Xe: {selectedBooking.vehicle}
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCancelConfirm(false)}
                                    disabled={isCancelling}
                                >
                                    Không
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleCancelBooking}
                                    disabled={isCancelling}
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
                        <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                                <QrCode className="h-5 w-5" />
                                <span>Mã QR đặt lịch</span>
                            </DialogTitle>
                            <DialogDescription>
                                Quét mã QR này tại kiosk để xác nhận đặt lịch
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4 py-6">
                            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
                                <canvas ref={largeQrCodeRef} className="block" />
                            </div>
                            {selectedBooking && (
                                <div className="text-center space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        ID đặt lịch: {selectedBooking.id}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Trạm: {selectedBooking.station}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setShowQRCode(false)}>
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
