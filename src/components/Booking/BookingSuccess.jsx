import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, Clock, MapPin, Motorbike, Battery, QrCode } from 'lucide-react';
import QRCodeLib from 'qrcode';

const BookingSuccess = ({ bookingData, onClose }) => {
    const qrCodeRef = useRef(null);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (bookingData?.booking_id && qrCodeRef.current) {
            QRCodeLib.toCanvas(qrCodeRef.current, bookingData.booking_id, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }).catch(err => {
                console.error('Error generating QR code:', err);
            });
        }
    }, [bookingData?.booking_id]);

    // Update countdown every second
    useEffect(() => {
        if (bookingData?.scheduled_time) {
            const updateCountdown = () => {
                const now = new Date();
                const scheduledTime = new Date(bookingData.scheduled_time);
                const timeDiff = scheduledTime.getTime() - now.getTime();
                setCountdown(Math.max(0, Math.floor(timeDiff / 1000)));
            };

            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);

            return () => clearInterval(interval);
        }
    }, [bookingData?.scheduled_time]);

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (timeString) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getActiveTimeRange = () => {
        if (!bookingData?.scheduled_time) return { start: '', end: '' };
        const now = new Date();
        const endTime = new Date(bookingData.scheduled_time);

        return {
            start: formatTime(now.toISOString()),
            end: formatTime(endTime.toISOString())
        };
    };

    const formatCountdown = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Đặt lịch thành công!
                </h2>
                <p className="text-muted-foreground">
                    Lệnh đặt lịch đã được tạo và sẽ có hiệu lực đến {bookingData?.scheduled_time ? formatTime(bookingData.scheduled_time) : 'N/A'}
                </p>
            </div>

            {/* Booking Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Thông tin đặt lịch</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Active Time Range */}
                        {bookingData?.scheduled_time && (
                            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 mb-4">
                                <div className="flex items-center justify-center space-x-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    <span className="font-bold text-lg text-blue-700">
                                        {getActiveTimeRange().start} - {getActiveTimeRange().end}
                                    </span>
                                </div>
                                <p className="text-center text-sm mt-1 text-blue-600">
                                    Thời gian lệnh đặt sẽ active
                                </p>
                                {countdown > 0 && (
                                    <div className="mt-2 text-center">
                                        <p className="text-sm text-blue-600">
                                            Còn lại: {formatCountdown(countdown)} để đến trạm
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mã đặt lịch:</span>
                                    <span className="font-medium font-mono text-sm">
                                        {bookingData?.booking_id || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Trạng thái:</span>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        Đã đặt lịch
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ngày:</span>
                                    <span className="font-medium">
                                        {bookingData?.scheduled_time ? formatDate(bookingData.scheduled_time) : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Giờ đến trạm:</span>
                                    <span className="font-medium">
                                        {bookingData?.scheduled_time ? formatTime(bookingData.scheduled_time) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-3 -mt-12">
                                <div className="text-center">
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <QrCode className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Mã QR đặt lịch</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                                        <canvas ref={qrCodeRef} className="block" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 max-w-[200px] text-center ml-3">
                                        Quét mã QR này tại kiosk để xác nhận đặt lịch
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Motorbike className="h-5 w-5" />
                        <span>Thông tin xe</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Mẫu xe:</span>
                            <span className="font-medium">{bookingData?.vehicle?.modelName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">VIN:</span>
                            <span className="font-medium font-mono text-sm">{bookingData?.vehicle?.vin || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Biển số:</span>
                            <span className="font-medium">{bookingData?.vehicle?.license_plate || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Loại pin:</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {bookingData?.vehicle?.batteryType || 'N/A'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Battery Information */}
            {bookingData?.batteries && bookingData.batteries.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Battery className="h-5 w-5" />
                            <span>Thông tin pin được phân bổ</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {bookingData.batteries.map((battery, index) => (
                                <div key={battery.battery_id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Pin #{index + 1}</span>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {battery.current_soc}% SOC
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Serial:</span>
                                            <span className="font-mono ml-1">{battery.battery_serial}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">SOH:</span>
                                            <span className="ml-1">{battery.current_soh}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Station Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Thông tin trạm</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tên trạm:</span>
                            <span className="font-medium">{bookingData?.station?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Địa chỉ:</span>
                            <span className="font-medium text-right max-w-xs">{bookingData?.station?.address || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Trạng thái:</span>
                            <Badge variant={bookingData?.station?.status === 'operational' ? 'default' : 'secondary'}>
                                {bookingData?.station?.status === 'operational' ? 'Hoạt động' : 'Hạn chế'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Action Button */}
            <div className="flex justify-center pt-4">
                <Button onClick={onClose} size="lg" className="min-w-[200px]">
                    Hoàn thành
                </Button>
            </div>
        </div>
    );
};

export default BookingSuccess;
