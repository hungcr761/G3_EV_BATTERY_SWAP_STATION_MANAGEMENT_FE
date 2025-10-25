import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Battery, CheckCircle2, AlertCircle, Clock, User, Motorbike } from 'lucide-react';
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
                        userName: booking.driver?.fullname || 'Khách hàng',
                        vehicleModel: booking.vehicle?.model?.name || 'Unknown Model',
                        vehiclePlate: booking.vehicle?.license_plate || 'N/A',
                        batteryType: booking.vehicle?.model?.batteryType?.battery_type_code || 'Type 2',
                        stationName: booking.station?.station_name || `Trạm #${stationId}`,
                        scheduledTime: new Date(booking.scheduled_time).toLocaleString('vi-VN'),
                    });
                } else {
                    // Fetch from API
                    const response = await bookingAPI.getById(bookingId);
                    const booking = response.data.booking;

                    setBookingData({
                        bookingId: booking.booking_id,
                        userName: booking.driver?.fullname || 'Khách hàng',
                        vehicleModel: booking.vehicle?.model?.name || 'Unknown Model',
                        vehiclePlate: booking.vehicle?.license_plate || 'N/A',
                        batteryType: booking.vehicle?.model?.batteryType?.battery_type_code || 'Type 2',
                        stationName: booking.station?.station_name || `Trạm #${stationId}`,
                        scheduledTime: new Date(booking.scheduled_time).toLocaleString('vi-VN'),
                    });
                }
            } catch (error) {
                console.error('Error fetching booking:', error);
                // Fallback to mock data
                setBookingData({
                    bookingId: bookingId,
                    userName: 'Khách hàng',
                    vehicleModel: 'VinFast Klara S',
                    vehiclePlate: '30B-98761',
                    batteryType: 'NMC-50',
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
            title: 'Chuẩn bị slot pin',
            description: 'Hệ thống đang chuẩn bị slot pin cho bạn',
            status: 'pending',
        },
        {
            title: 'Lắp pin cũ vào slot',
            description: 'Vui lòng lắp pin cũ vào slot được chỉ định',
            status: 'pending',
        },
        {
            title: 'Kiểm tra pin cũ',
            description: 'Hệ thống đang kiểm tra tình trạng pin cũ',
            status: 'pending',
        },
        {
            title: 'Lấy pin mới',
            description: 'Slot pin mới đã mở, vui lòng lấy pin',
            status: 'pending',
        },
        {
            title: 'Hoàn tất đổi pin',
            description: 'Kiểm tra và hoàn tất quy trình đổi pin',
            status: 'pending',
        }
    ]);

    // Manual swap process - wait for user actions
    useEffect(() => {
        const stepDurations = [3000, 2000, 0, 5000, 0, 2000]; // milliseconds for each step
        const stepEstimatedTimes = ['10 giây', '5 giây', 'Chờ người dùng', '10 giây', 'Chờ người dùng', '5 giây'];

        let currentStepIndex = 0;
        let progressInterval;

        const progressStep = () => {
            if (currentStepIndex < steps.length) {
                // Update progress for current step
                let progress = 0;
                const duration = stepDurations[currentStepIndex];

                if (duration > 0) {
                    // Auto-progress steps
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
                    }, duration / 20);
                } else {
                    // Manual steps - wait for user action
                    setSteps(prev => prev.map((step, idx) => {
                        if (idx === currentStepIndex) {
                            return {
                                ...step,
                                status: 'in_progress',
                                progress: 0,
                                estimatedTime: stepEstimatedTimes[idx]
                            };
                        }
                        return step;
                    }));
                }
            }
        };

        const timer = setTimeout(progressStep, 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [bookingId, stationId, navigate]);

    // Handle manual step completion
    const handleStepComplete = () => {
        if (currentStep < steps.length) {
            // Mark current step as completed
            setSteps(prev => prev.map((step, idx) => {
                if (idx === currentStep) {
                    return { ...step, status: 'completed', progress: 100 };
                }
                return step;
            }));

            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);

            if (nextStep < steps.length) {
                // Start next step
                setTimeout(() => {
                    setSteps(prev => prev.map((step, idx) => {
                        if (idx === nextStep) {
                            return {
                                ...step,
                                status: 'in_progress',
                                progress: 0,
                                estimatedTime: step.estimatedTime
                            };
                        }
                        return step;
                    }));
                }, 500);
            } else {
                // All steps completed
                setTimeout(() => {
                    setSwapComplete(true);
                    navigate(`/kiosk/${stationId}/complete/${bookingId}`);
                }, 1000);
            }
        }
    };

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
                                <Motorbike className="h-8 w-8 text-primary" />
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

                    {/* Manual Action Buttons */}
                    {currentStep === 2 && steps[2]?.status === 'in_progress' && (
                        <Card className="mt-6 bg-blue-50 border-blue-300">
                            <CardContent className="p-8">
                                <div className="text-center space-y-6">
                                    <div className="text-6xl font-bold text-blue-600">Slot #3</div>
                                    <h3 className="text-2xl font-bold">Lắp pin cũ vào slot</h3>
                                    <p className="text-xl text-muted-foreground">
                                        Vui lòng lắp pin cũ vào slot #3 được chỉ định
                                    </p>
                                    <Button
                                        size="lg"
                                        onClick={handleStepComplete}
                                        className="text-2xl px-12 py-8 h-auto"
                                    >
                                        Đã lắp pin cũ
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {currentStep === 4 && steps[4]?.status === 'in_progress' && (
                        <Card className="mt-6 bg-green-50 border-green-300">
                            <CardContent className="p-8">
                                <div className="text-center space-y-6">
                                    <div className="text-6xl font-bold text-green-600">Slot #7</div>
                                    <h3 className="text-2xl font-bold">Lấy pin mới</h3>
                                    <p className="text-xl text-muted-foreground">
                                        Slot pin mới đã mở, vui lòng lấy pin từ slot #7
                                    </p>
                                    <Button
                                        size="lg"
                                        onClick={handleStepComplete}
                                        className="text-2xl px-12 py-8 h-auto"
                                    >
                                        Đã lấy pin mới
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Safety Notice */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-8">
                        <div className="flex items-start space-x-4">
                            <AlertCircle className="h-10 w-10 text-blue-600 flex-shrink-0" />
                            <div>
                                <h3 className="text-2xl font-bold text-blue-800 mb-3">
                                    Hướng dẫn đổi pin
                                </h3>
                                <ul className="space-y-2 text-xl text-blue-700">
                                    <li>• Lắp pin cũ vào slot được chỉ định (thường là slot #3)</li>
                                    <li>• Chờ hệ thống kiểm tra pin cũ</li>
                                    <li>• Lấy pin mới từ slot được mở (thường là slot #7)</li>
                                    <li>• Lắp pin mới vào xe của bạn</li>
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

