import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, Clock, MapPin, Car, Battery } from 'lucide-react';

const BookingSuccess = ({ bookingData, onClose }) => {
    const formatTime = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getActiveTimeRange = (scheduledTime) => {
        const startTime = new Date(scheduledTime);
        const endTime = new Date(startTime.getTime() + 15 * 60000); // +15 minutes

        return {
            start: formatTime(startTime),
            end: formatTime(endTime)
        };
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
                    Lệnh đặt lịch đã được tạo và sẽ có hiệu lực vào thời gian bạn chọn
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mã đặt lịch:</span>
                                    <span className="font-medium font-mono">
                                        #{bookingData?.booking_id || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Trạng thái:</span>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        Đã đặt lịch
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ngày:</span>
                                    <span className="font-medium">
                                        {bookingData?.scheduled_time ? formatDate(bookingData.scheduled_time) : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Giờ đến:</span>
                                    <span className="font-medium">
                                        {bookingData?.scheduled_time ? formatTime(bookingData.scheduled_time) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {bookingData?.scheduled_time && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <span className="font-medium text-yellow-800">Thời gian active:</span>
                                </div>
                                <p className="text-sm text-yellow-700">
                                    {getActiveTimeRange(bookingData.scheduled_time).start} - {getActiveTimeRange(bookingData.scheduled_time).end}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Car className="h-5 w-5" />
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
                            <Badge variant={bookingData?.station?.status === 'available' ? 'default' : 'secondary'}>
                                {bookingData?.station?.status === 'available' ? 'Sẵn sàng' : 'Hạn chế'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                    <Battery className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">Lưu ý quan trọng:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Lệnh đặt lịch chỉ có hiệu lực trong 15 phút từ thời điểm bạn chọn</li>
                            <li>Nếu không đến trạm trong thời gian quy định, lệnh đặt sẽ tự động bị hủy</li>
                            <li>Vui lòng đến trạm đúng giờ để đảm bảo có pin sẵn sàng</li>
                            <li>Mang theo giấy tờ tùy thân và thông tin xe khi đến trạm</li>
                        </ul>
                    </div>
                </div>
            </div>

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
