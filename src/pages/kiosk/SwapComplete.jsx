import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CheckCircle2, Battery, Clock, Star, Download, Mail } from 'lucide-react';
import { bookingAPI } from '../../lib/apiServices';

const SwapComplete = () => {
    const { stationId, bookingId } = useParams();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(30);
    const [swapData, setSwapData] = useState(null);

    // Fetch swap data
    useEffect(() => {
        const fetchSwapData = async () => {
            try {
                const response = await bookingAPI.getById(bookingId);
                const booking = response.data.booking;

                setSwapData({
                    bookingId: booking.booking_id,
                    userName: booking.driver?.fullname || 'Khách hàng',
                    vehicleModel: booking.vehicle?.model?.name || 'Unknown Model',
                    vehiclePlate: booking.vehicle?.license_plate || 'N/A',
                    oldBatteryLevel: '15%', // Would come from battery data
                    newBatteryLevel: '100%',
                    swapDuration: '4 phút 32 giây', // Would be calculated
                    completedTime: new Date().toLocaleString('vi-VN'),
                    stationName: booking.station?.station_name || `Trạm #${stationId}`,
                    cost: '50,000 VNĐ', // Would come from pricing
                    nextServiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')
                });
            } catch (error) {
                console.error('Error fetching swap data:', error);
                // Fallback to mock data
                setSwapData({
                    bookingId: bookingId,
                    userName: 'hung le',
                    vehicleModel: 'VinFast Klara S',
                    vehiclePlate: '30B-98761',
                    oldBatteryLevel: '15%',
                    newBatteryLevel: '100%',
                    swapDuration: '4 phút 32 giây',
                    completedTime: new Date().toLocaleString('vi-VN'),
                    stationName: `Trạm #${stationId}`,
                    cost: '50,000 VNĐ',
                    nextServiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')
                });
            }
        };

        fetchSwapData();
    }, [bookingId, stationId]);

    // Auto redirect countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate(`/kiosk/${stationId}`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, stationId]);

    const handleFinish = () => {
        navigate(`/kiosk/${stationId}`);
    };

    if (!swapData) {
        return (
            <div className="container mx-auto px-8 py-12">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto mb-6"></div>
                        <p className="text-2xl text-muted-foreground">Đang tải thông tin...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-8 py-12">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Success Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-green-100 rounded-full">
                        <CheckCircle2 className="h-20 w-20 text-green-600" />
                    </div>
                    <h1 className="text-6xl font-bold text-green-600">
                        Đổi pin thành công!
                    </h1>
                    <p className="text-3xl text-muted-foreground">
                        Xe của bạn đã sẵn sàng để tiếp tục hành trình
                    </p>
                </div>

                {/* Swap Summary Card */}
                <Card className="border-4 border-green-500 shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardTitle className="text-4xl">Thông tin đổi pin</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6 text-xl">
                                <div>
                                    <p className="text-muted-foreground mb-1">Mã booking</p>
                                    <p className="font-bold text-2xl">{swapData.bookingId}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Khách hàng</p>
                                    <p className="font-semibold text-2xl">{swapData.userName}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Xe</p>
                                    <p className="font-semibold text-2xl">{swapData.vehicleModel}</p>
                                    <p className="text-lg text-muted-foreground">{swapData.vehiclePlate}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Trạm đổi pin</p>
                                    <p className="font-semibold text-2xl">{swapData.stationName}</p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6 text-xl">
                                <div>
                                    <p className="text-muted-foreground mb-1">Thời gian hoàn thành</p>
                                    <p className="font-semibold text-2xl">{swapData.completedTime}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Thời gian đổi pin</p>
                                    <p className="font-semibold text-2xl text-green-600">
                                        {swapData.swapDuration}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Mức pin</p>
                                    <div className="flex items-center space-x-3">
                                        <Badge variant="outline" className="text-lg px-3 py-1">
                                            {swapData.oldBatteryLevel}
                                        </Badge>
                                        <span className="text-2xl">→</span>
                                        <Badge variant="default" className="text-lg px-3 py-1 bg-green-500">
                                            {swapData.newBatteryLevel}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Chi phí</p>
                                    <p className="font-bold text-3xl text-green-600">{swapData.cost}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Battery Info */}
                <Card>
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <Battery className="h-16 w-16 text-green-600" />
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-2">Pin mới đã được lắp đặt</h3>
                                <p className="text-xl text-muted-foreground">
                                    Pin của bạn hiện ở mức <strong className="text-green-600">100%</strong> và sẵn sàng
                                    cho quãng đường <strong>khoảng 200km</strong>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Next Service Reminder */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <Clock className="h-12 w-12 text-blue-600" />
                            <div>
                                <h3 className="text-2xl font-bold text-blue-800 mb-2">
                                    Lịch bảo dưỡng tiếp theo
                                </h3>
                                <p className="text-xl text-blue-700">
                                    Khuyến nghị bảo dưỡng xe vào: <strong>{swapData.nextServiceDate}</strong>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Button
                        size="lg"
                        onClick={handleFinish}
                        className="w-full text-3xl py-10 h-auto"
                    >
                        <CheckCircle2 className="mr-3 h-8 w-8" />
                        Hoàn tất ({countdown}s)
                    </Button>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-xl py-6 h-auto"
                            onClick={() => alert('Chức năng gửi email sẽ sớm được triển khai')}
                        >
                            <Mail className="mr-2 h-6 w-6" />
                            Gửi hóa đơn qua email
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-xl py-6 h-auto"
                            onClick={() => alert('Chức năng in hóa đơn sẽ sớm được triển khai')}
                        >
                            <Download className="mr-2 h-6 w-6" />
                            In hóa đơn
                        </Button>
                    </div>
                </div>

                {/* Rating Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">Đánh giá dịch vụ</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <p className="text-xl text-muted-foreground mb-6">
                            Vui lòng đánh giá trải nghiệm của bạn
                        </p>
                        <div className="flex justify-center space-x-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    className="hover:scale-110 transition-transform"
                                    onClick={() => {
                                        alert(`Cảm ơn bạn đã đánh giá ${star} sao!`);
                                    }}
                                >
                                    <Star className="h-16 w-16 text-yellow-400 hover:text-yellow-500 fill-yellow-400" />
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Thank You Message */}
                <div className="text-center py-8">
                    <p className="text-3xl font-semibold text-primary">
                        Cảm ơn bạn đã sử dụng dịch vụ của G3!
                    </p>
                    <p className="text-2xl text-muted-foreground mt-2">
                        Chúc bạn có hành trình an toàn và vui vẻ
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SwapComplete;

