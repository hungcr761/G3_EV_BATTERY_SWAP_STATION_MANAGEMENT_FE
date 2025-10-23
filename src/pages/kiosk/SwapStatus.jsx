import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Battery, CheckCircle2, AlertCircle, Clock, User, Car } from 'lucide-react';
import SwapProgress from '../../components/Kiosk/SwapProgress';
import { bookingAPI } from '../../lib/apiServices';

const SwapStatus = () => {
    const { stationId, bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(0);
    const [swapComplete, setSwapComplete] = useState(false);
    const [bookingData, setBookingData] = useState(null);

    // Fetch booking data
    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                // Check if booking data was passed from previous page
                if (location.state?.booking) {
                    const booking = location.state.booking;
                    setBookingData({
                        bookingId: booking.booking_id,
                        userName: booking.user?.full_name || 'Khách hàng',
                        vehicleModel: booking.vehicle?.model?.name || 'Unknown Model',
                        vehiclePlate: booking.vehicle?.license_plate || 'N/A',
                        batteryType: booking.battery_type?.battery_type_code || 'Type 2',
                        stationName: booking.station?.station_name || `Trạm #${stationId}`,
                        scheduledTime: new Date(booking.booking_start_time).toLocaleString('vi-VN'),
                    });
                } else {
                    // Fetch from API
                    const response = await bookingAPI.getById(bookingId);
                    const booking = response.data.payload.booking;

                    setBookingData({
                        bookingId: booking.booking_id,
                        userName: booking.user?.full_name || 'Khách hàng',
                        vehicleModel: booking.vehicle?.model?.name || 'Unknown Model',
                        vehiclePlate: booking.vehicle?.license_plate || 'N/A',
                        batteryType: booking.battery_type?.battery_type_code || 'Type 2',
                        stationName: booking.station?.station_name || `Trạm #${stationId}`,
                        scheduledTime: new Date(booking.booking_start_time).toLocaleString('vi-VN'),
                    });
                }
            } catch (error) {
                console.error('Error fetching booking:', error);
                // Fallback to mock data
                setBookingData({
                    bookingId: bookingId,
                    userName: 'Khách hàng',
                    vehicleModel: 'VinFast Evo200',
                    vehiclePlate: '29A-12345',
                    batteryType: 'Type 2',
                    stationName: `Trạm #${stationId}`,
                    scheduledTime: new Date().toLocaleTimeString('vi-VN'),
                });
            }
        };

        fetchBookingData();
    }, [bookingId, stationId, location.state]);

    const [steps, setSteps] = useState([
        {
            title: 'Xác thực booking',
            description: 'Đang kiểm tra thông tin booking của bạn',
            status: 'in_progress',
            progress: 0,
            estimatedTime: '10 giây'
        },
        {
            title: 'Chuẩn bị vị trí đỗ xe',
            description: 'Hệ thống đang chuẩn bị vị trí đổi pin',
            status: 'pending',
        },
        {
            title: 'Tháo pin cũ',
            description: 'Robot đang tháo pin cũ khỏi xe',
            status: 'pending',
        },
        {
            title: 'Lắp pin mới',
            description: 'Robot đang lắp pin đầy vào xe',
            status: 'pending',
        },
        {
            title: 'Kiểm tra và hoàn tất',
            description: 'Kiểm tra kết nối và hoàn tất quy trình',
            status: 'pending',
        }
    ]);

    // Simulate swap progress
    useEffect(() => {
        const stepDurations = [3000, 4000, 8000, 8000, 3000]; // milliseconds for each step
        const stepEstimatedTimes = ['10 giây', '15 giây', '30 giây', '30 giây', '10 giây'];

        let currentStepIndex = 0;
        let progressInterval;

        const progressStep = () => {
            if (currentStepIndex < steps.length) {
                // Update progress for current step
                let progress = 0;
                progressInterval = setInterval(() => {
                    progress += 5;
                    if (progress <= 100) {
                        setSteps(prev => prev.map((step, idx) => {
                            if (idx === currentStepIndex) {
                                return {
                                    ...step,
                                    status: 'in_progress',
                                    progress: progress,
                                    estimatedTime: stepEstimatedTimes[idx]
                                };
                            }
                            return step;
                        }));
                    } else {
                        clearInterval(progressInterval);

                        // Mark current step as completed
                        setSteps(prev => prev.map((step, idx) => {
                            if (idx === currentStepIndex) {
                                return { ...step, status: 'completed', progress: 100 };
                            }
                            return step;
                        }));

                        currentStepIndex++;
                        setCurrentStep(currentStepIndex);

                        if (currentStepIndex < steps.length) {
                            setTimeout(progressStep, 500);
                        } else {
                            // All steps completed
                            setTimeout(() => {
                                setSwapComplete(true);
                                navigate(`/kiosk/${stationId}/complete/${bookingId}`);
                            }, 1000);
                        }
                    }
                }, stepDurations[currentStepIndex] / 20);
            }
        };

        const timer = setTimeout(progressStep, 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [bookingId, stationId, navigate]);

    if (!bookingData) {
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
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Booking Info Card */}
                <Card className="border-4 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-4xl mb-2">
                                    Đang thực hiện đổi pin
                                </CardTitle>
                                <CardDescription className="text-2xl text-primary-foreground/90">
                                    Mã booking: <strong>{bookingData.bookingId}</strong>
                                </CardDescription>
                            </div>
                            <Battery className="h-20 w-20 animate-pulse" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-2 gap-8 text-xl">
                            <div className="flex items-center space-x-3">
                                <User className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-muted-foreground">Khách hàng</p>
                                    <p className="font-semibold text-2xl">{bookingData.userName}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Car className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-muted-foreground">Xe</p>
                                    <p className="font-semibold text-2xl">
                                        {bookingData.vehicleModel}
                                    </p>
                                    <p className="text-lg text-muted-foreground">
                                        {bookingData.vehiclePlate}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Battery className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-muted-foreground">Loại pin</p>
                                    <p className="font-semibold text-2xl">{bookingData.batteryType}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-muted-foreground">Thời gian</p>
                                    <p className="font-semibold text-2xl">{bookingData.scheduledTime}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Progress Section */}
                <div>
                    <h2 className="text-3xl font-bold mb-6">Tiến trình đổi pin</h2>
                    <SwapProgress currentStep={currentStep} steps={steps} />
                </div>

                {/* Safety Notice */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-8">
                        <div className="flex items-start space-x-4">
                            <AlertCircle className="h-10 w-10 text-blue-600 flex-shrink-0" />
                            <div>
                                <h3 className="text-2xl font-bold text-blue-800 mb-3">
                                    Lưu ý an toàn
                                </h3>
                                <ul className="space-y-2 text-xl text-blue-700">
                                    <li>• Vui lòng không rời khỏi vị trí khi đang đổi pin</li>
                                    <li>• Không chạm vào xe hoặc thiết bị đổi pin</li>
                                    <li>• Trong trường hợp khẩn cấp, nhấn nút "Dừng khẩn cấp" màu đỏ</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Button */}
                <div className="flex justify-center">
                    <Button
                        variant="destructive"
                        size="lg"
                        className="text-2xl px-12 py-8 h-auto"
                        onClick={() => {
                            if (confirm('Bạn có chắc muốn dừng quy trình đổi pin khẩn cấp?')) {
                                navigate(`/kiosk/${stationId}`);
                            }
                        }}
                    >
                        <AlertCircle className="mr-3 h-8 w-8" />
                        Dừng khẩn cấp
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SwapStatus;

