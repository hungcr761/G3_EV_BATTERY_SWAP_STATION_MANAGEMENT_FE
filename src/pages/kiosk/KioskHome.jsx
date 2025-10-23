import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Battery, QrCode, AlertCircle, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import QRScanner from '../../components/Kiosk/QRScanner';
import { stationAPI, bookingAPI } from '../../lib/apiServices';

const KioskHome = () => {
    const navigate = useNavigate();
    const { stationId } = useParams();
    const [showScanner, setShowScanner] = useState(false);
    const [error, setError] = useState(null);
    const [validating, setValidating] = useState(false);
    const [stationInfo, setStationInfo] = useState(null);

    // Fetch station info on mount
    useEffect(() => {
        const fetchStation = async () => {
            try {
                const response = await stationAPI.getById(stationId);
                if (response.data && response.data.success) {
                    const station = response.data.payload.station;
                    setStationInfo({
                        id: station.station_id,
                        name: station.station_name,
                        address: station.address,
                        status: station.status
                    });
                }
            } catch (error) {
                console.error('Error fetching station:', error);
            }
        };

        if (stationId) {
            fetchStation();
        }
    }, [stationId]);

    const validateAndProceed = async (bookingId) => {
        setValidating(true);
        setError(null);

        try {
            // Fetch booking details from backend
            const response = await bookingAPI.getById(bookingId);
            const bookingData = response.data;

            // Check if response is valid
            if (!bookingData || !bookingData.payload) {
                setError('Không tìm thấy booking. Vui lòng kiểm tra lại mã booking.');
                setValidating(false);
                return;
            }

            const booking = bookingData.payload.booking;

            // VALIDATION 1: Check if booking is for this station
            if (booking.station_id !== parseInt(stationId)) {
                const wrongStationName = booking.station?.station_name || `Trạm #${booking.station_id}`;
                setError(
                    `❌ Sai trạm!\n\n` +
                    `Booking này dành cho: ${wrongStationName}\n` +
                    `Bạn đang ở: ${stationInfo?.name || `Trạm #${stationId}`}\n\n` +
                    `Vui lòng đến đúng trạm đã đặt hoặc hủy và đặt lại booking mới.`
                );
                setValidating(false);
                return;
            }

            // VALIDATION 2: Check if booking is still valid (not expired)
            if (booking.booking_end_time) {
                const bookingEndTime = new Date(booking.booking_end_time);
                const now = new Date();
                if (now > bookingEndTime) {
                    setError(
                        `❌ Booking đã hết hạn!\n\n` +
                        `Thời gian hết hạn: ${bookingEndTime.toLocaleString('vi-VN')}\n` +
                        `Hiện tại: ${now.toLocaleString('vi-VN')}\n\n` +
                        `Vui lòng đặt booking mới qua app hoặc website.`
                    );
                    setValidating(false);
                    return;
                }
            }

            // VALIDATION 3: Check booking status
            if (booking.booking_status === 'completed') {
                setError(
                    `❌ Booking đã được sử dụng!\n\n` +
                    `Booking này đã được hoàn thành.\n` +
                    `Nếu cần đổi pin lại, vui lòng tạo booking mới.`
                );
                setValidating(false);
                return;
            }

            if (booking.booking_status === 'cancelled') {
                setError(
                    `❌ Booking đã bị hủy!\n\n` +
                    `Vui lòng tạo booking mới để sử dụng dịch vụ.`
                );
                setValidating(false);
                return;
            }

            // All validations passed - proceed to swap
            console.log('✅ Booking validated:', booking);
            navigate(`/kiosk/${stationId}/swap/${bookingId}`, {
                state: { booking } // Pass booking data to next screen
            });

        } catch (error) {
            console.error('Error validating booking:', error);
            setError(
                `❌ Không thể xác thực booking\n\n` +
                `${error.response?.data?.message || 'Lỗi kết nối đến server'}\n\n` +
                `Vui lòng kiểm tra lại mã booking hoặc liên hệ hotline: 1900-XXXX`
            );
        } finally {
            setValidating(false);
        }
    };

    const handleScan = (bookingId) => {
        console.log('Scanned booking ID:', bookingId);
        validateAndProceed(bookingId);
    };

    const handleManualEntry = (bookingId) => {
        console.log('Manual booking ID:', bookingId);
        validateAndProceed(bookingId);
    };

    return (
        <div className="container mx-auto px-8 py-12">
            {!showScanner ? (
                // Welcome Screen
                <div className="max-w-5xl mx-auto space-y-12">
                    {/* Station Info Banner */}
                    {stationInfo && (
                        <Card className="bg-gradient-to-r from-primary to-blue-600 text-white border-0">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-6">
                                        <MapPin className="h-16 w-16" />
                                        <div>
                                            <h2 className="text-4xl font-bold mb-2">
                                                {stationInfo.name}
                                            </h2>
                                            <p className="text-2xl opacity-90">
                                                {stationInfo.address}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-xl px-6 py-3 bg-white text-primary">
                                        <Clock className="h-5 w-5 mr-2" />
                                        Hoạt động 24/7
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Hero Section */}
                    <div className="text-center space-y-6">
                        <Battery className="h-32 w-32 text-primary mx-auto" />
                        <h1 className="text-6xl font-bold text-primary">
                            Chào mừng đến trạm đổi pin G3
                        </h1>
                        <p className="text-3xl text-muted-foreground max-w-3xl mx-auto">
                            Đổi pin nhanh chóng, an toàn và tiện lợi trong vài phút
                        </p>
                    </div>

                    {/* Main Action Card */}
                    <Card className="border-4 shadow-2xl">
                        <CardHeader className="text-center space-y-4 pb-6">
                            <CardTitle className="text-4xl">Bắt đầu đổi pin</CardTitle>
                            <CardDescription className="text-2xl">
                                Để tiếp tục, vui lòng quét mã QR booking của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-12">
                            <Button
                                size="lg"
                                onClick={() => setShowScanner(true)}
                                className="w-full text-3xl py-12 h-auto"
                            >
                                <QrCode className="mr-4 h-10 w-10" />
                                Quét mã QR
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Instructions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">Hướng dẫn sử dụng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-6 text-2xl">
                                <li className="flex items-start space-x-4">
                                    <span className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                        1
                                    </span>
                                    <div>
                                        <p className="font-semibold">Quét mã QR booking</p>
                                        <p className="text-xl text-muted-foreground">
                                            Sử dụng mã QR từ email hoặc app booking
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-4">
                                    <span className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                        2
                                    </span>
                                    <div>
                                        <p className="font-semibold">Đỗ xe vào vị trí</p>
                                        <p className="text-xl text-muted-foreground">
                                            Làm theo hướng dẫn trên màn hình
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-4">
                                    <span className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                        3
                                    </span>
                                    <div>
                                        <p className="font-semibold">Chờ đổi pin tự động</p>
                                        <p className="text-xl text-muted-foreground">
                                            Thời gian đổi pin: 3-5 phút
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-4">
                                    <span className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                        4
                                    </span>
                                    <div>
                                        <p className="font-semibold">Hoàn tất và khởi hành</p>
                                        <p className="text-xl text-muted-foreground">
                                            Nhận thông báo hoàn thành và tiếp tục hành trình
                                        </p>
                                    </div>
                                </li>
                            </ol>
                        </CardContent>
                    </Card>

                    {/* Help Section */}
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-8">
                            <div className="flex items-start space-x-4">
                                <AlertCircle className="h-12 w-12 text-yellow-600 flex-shrink-0" />
                                <div>
                                    <h3 className="text-2xl font-bold text-yellow-800 mb-2">
                                        Cần trợ giúp?
                                    </h3>
                                    <p className="text-xl text-yellow-700 mb-4">
                                        Vui lòng liên hệ số hotline: <strong>1900-XXXX</strong>
                                    </p>
                                    <p className="text-lg text-yellow-600">
                                        Hoặc nhấn nút "Trợ giúp" trên màn hình khi cần hỗ trợ khẩn cấp
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                // Scanner Screen
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                                setShowScanner(false);
                                setError(null);
                            }}
                            className="text-xl px-8 py-6 h-auto"
                        >
                            ← Quay lại
                        </Button>
                    </div>

                    {error && (
                        <Card className="mb-8 bg-red-50 border-red-300 border-4">
                            <CardContent className="p-8">
                                <div className="flex items-start space-x-4">
                                    <AlertCircle className="h-12 w-12 text-red-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-2xl font-bold text-red-800 mb-2">Lỗi xác thực</p>
                                        <p className="text-xl text-red-700 whitespace-pre-line">{error}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {validating && (
                        <Card className="mb-8 bg-blue-50 border-blue-300 border-4">
                            <CardContent className="p-8">
                                <div className="flex items-center space-x-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-800">Đang xác thực booking...</p>
                                        <p className="text-xl text-blue-600">Vui lòng đợi trong giây lát</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <QRScanner
                        onScan={handleScan}
                        onManualEntry={handleManualEntry}
                    />
                </div>
            )}
        </div>
    );
};

export default KioskHome;

