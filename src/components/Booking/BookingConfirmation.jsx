import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    Car,
    MapPin,
    Clock,
    Battery,
    CheckCircle,
    AlertTriangle,
    Loader2
} from 'lucide-react';

const BookingConfirmation = ({
    selectedVehicle,
    selectedTime,
    selectedStation,
    onConfirm,
    onBack,
    isSubmitting = false
}) => {
    const [countdown, setCountdown] = useState(15 * 60); // 15 minutes in seconds

    React.useEffect(() => {
        if (selectedTime) {
            const now = new Date();
            const selectedDateTime = new Date(selectedTime.time);
            const timeDiff = selectedDateTime.getTime() - now.getTime();
            const secondsDiff = Math.max(0, Math.floor(timeDiff / 1000));

            setCountdown(secondsDiff);

            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 0) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [selectedTime]);

    const formatCountdown = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatTime = (time) => {
        return time.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isTimeExpired = countdown <= 0;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Xác nhận đặt lịch
                </h2>
                <p className="text-muted-foreground">
                    Vui lòng kiểm tra thông tin trước khi xác nhận
                </p>
            </div>

            {/* Countdown Timer */}
            <div className={`p-4 rounded-lg border ${countdown > 300
                    ? 'bg-green-50 border-green-200'
                    : countdown > 60
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                }`}>
                <div className="flex items-center justify-center space-x-2">
                    <Clock className={`h-5 w-5 ${countdown > 300
                            ? 'text-green-600'
                            : countdown > 60
                                ? 'text-yellow-600'
                                : 'text-red-600'
                        }`} />
                    <span className={`font-bold text-lg ${countdown > 300
                            ? 'text-green-700'
                            : countdown > 60
                                ? 'text-yellow-700'
                                : 'text-red-700'
                        }`}>
                        {formatCountdown(countdown)}
                    </span>
                </div>
                <p className={`text-center text-sm mt-1 ${countdown > 300
                        ? 'text-green-600'
                        : countdown > 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                    }`}>
                    {isTimeExpired
                        ? 'Thời gian đặt lịch đã hết hạn'
                        : 'Thời gian còn lại để xác nhận đặt lịch'
                    }
                </p>
            </div>

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
                            <span className="font-medium">{selectedVehicle?.modelName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">VIN:</span>
                            <span className="font-medium">{selectedVehicle?.vin}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Biển số:</span>
                            <span className="font-medium">{selectedVehicle?.license_plate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Loại pin:</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {selectedVehicle?.batteryType}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tình trạng pin:</span>
                            <span className="font-medium">{selectedVehicle?.battery_soh}%</span>
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
                            <span className="font-medium">{selectedStation?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Địa chỉ:</span>
                            <span className="font-medium text-right max-w-xs">{selectedStation?.address}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Trạng thái:</span>
                            <Badge variant={selectedStation?.status === 'available' ? 'default' : 'secondary'}>
                                {selectedStation?.status === 'available' ? 'Sẵn sàng' : 'Hạn chế'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Time Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Thời gian đặt lịch</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ngày:</span>
                            <span className="font-medium">{formatDate(selectedTime?.time)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Giờ đến:</span>
                            <span className="font-medium">{formatTime(selectedTime?.time)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Thời gian active:</span>
                            <span className="font-medium">
                                {formatTime(selectedTime?.time)} - {formatTime(new Date(selectedTime?.time.getTime() + 15 * 60000))}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Lệnh đặt lịch chỉ có hiệu lực trong 15 phút từ thời điểm bạn chọn</li>
                            <li>Nếu không đến trạm trong thời gian quy định, lệnh đặt sẽ tự động bị hủy</li>
                            <li>Vui lòng đến trạm đúng giờ để đảm bảo có pin sẵn sàng</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
                    Quay lại
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isSubmitting || isTimeExpired}
                    size="lg"
                    className="min-w-[140px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Xác nhận đặt lịch
                        </>
                    )}
                </Button>
            </div>

            {isTimeExpired && (
                <div className="text-center py-4">
                    <p className="text-red-600 font-medium">
                        Thời gian đặt lịch đã hết hạn. Vui lòng chọn lại thời gian.
                    </p>
                </div>
            )}
        </div>
    );
};

export default BookingConfirmation;
