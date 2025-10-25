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

    const [currentAction, setCurrentAction] = useState({
        title: 'Xác thực booking',
        description: 'Đang kiểm tra thông tin booking của bạn',
        progress: 0,
        status: 'in_progress',
        showButton: false,
        buttonText: '',
        slotNumber: null
    });

    // Single progress bar with different phases
    useEffect(() => {
        const phases = [
            { title: 'Xác thực booking', description: 'Đang kiểm tra thông tin booking của bạn', duration: 3000, progress: 16 },
            { title: 'Chuẩn bị slot pin', description: 'Hệ thống đang chuẩn bị slot pin cho bạn', duration: 2000, progress: 33 },
            { title: 'Lắp pin cũ vào slot', description: 'Vui lòng lắp pin cũ vào slot được chỉ định', duration: 0, progress: 50, manual: true, slotNumber: 3, buttonText: 'Đã lắp pin cũ' },
            { title: 'Kiểm tra pin cũ', description: 'Hệ thống đang kiểm tra tình trạng pin cũ', duration: 5000, progress: 66 },
            { title: 'Lấy pin mới', description: 'Slot pin mới đã mở, vui lòng lấy pin', duration: 0, progress: 83, manual: true, slotNumber: 7, buttonText: 'Đã lấy pin mới' },
            { title: 'Hoàn tất đổi pin', description: 'Kiểm tra và hoàn tất quy trình đổi pin', duration: 2000, progress: 100 }
        ];

        let currentPhaseIndex = 0;
        let progressInterval;

        const processPhase = () => {
            if (currentPhaseIndex < phases.length) {
                const phase = phases[currentPhaseIndex];

                setCurrentAction({
                    title: phase.title,
                    description: phase.description,
                    progress: phase.progress,
                    status: 'in_progress',
                    showButton: phase.manual || false,
                    buttonText: phase.buttonText || '',
                    slotNumber: phase.slotNumber || null
                });

                if (phase.duration > 0) {
                    // Auto-progress phase
                    let progress = 0;
                    progressInterval = setInterval(() => {
                        progress += 5;
                        if (progress <= 100) {
                            setCurrentAction(prev => ({
                                ...prev,
                                progress: Math.min(phase.progress, (progress / 100) * phase.progress)
                            }));
                        } else {
                            clearInterval(progressInterval);
                            currentPhaseIndex++;
                            setCurrentStep(currentPhaseIndex);

                            if (currentPhaseIndex < phases.length) {
                                setTimeout(processPhase, 500);
                            } else {
                                // All phases completed
                                setTimeout(() => {
                                    setSwapComplete(true);
                                    navigate(`/kiosk/${stationId}/complete/${bookingId}`);
                                }, 1000);
                            }
                        }
                    }, phase.duration / 20);
                } else {
                    // Manual phase - wait for user action
                    setCurrentAction(prev => ({
                        ...prev,
                        progress: phase.progress,
                        showButton: true
                    }));
                }
            }
        };

        const timer = setTimeout(processPhase, 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [bookingId, stationId, navigate]);

    // Handle manual action completion
    const handleActionComplete = () => {
        setCurrentAction(prev => ({
            ...prev,
            showButton: false,
            status: 'completed'
        }));

        // Move to next phase
        setTimeout(() => {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);

            // Continue with next phase
            const phases = [
                { title: 'Xác thực booking', description: 'Đang kiểm tra thông tin booking của bạn', duration: 3000, progress: 16 },
                { title: 'Chuẩn bị slot pin', description: 'Hệ thống đang chuẩn bị slot pin cho bạn', duration: 2000, progress: 33 },
                { title: 'Lắp pin cũ vào slot', description: 'Vui lòng lắp pin cũ vào slot được chỉ định', duration: 0, progress: 50, manual: true, slotNumber: 3, buttonText: 'Đã lắp pin cũ' },
                { title: 'Kiểm tra pin cũ', description: 'Hệ thống đang kiểm tra tình trạng pin cũ', duration: 5000, progress: 66 },
                { title: 'Lấy pin mới', description: 'Slot pin mới đã mở, vui lòng lấy pin', duration: 0, progress: 83, manual: true, slotNumber: 7, buttonText: 'Đã lấy pin mới' },
                { title: 'Hoàn tất đổi pin', description: 'Kiểm tra và hoàn tất quy trình đổi pin', duration: 2000, progress: 100 }
            ];

            if (nextStep < phases.length) {
                const nextPhase = phases[nextStep];
                setCurrentAction({
                    title: nextPhase.title,
                    description: nextPhase.description,
                    progress: nextPhase.progress,
                    status: 'in_progress',
                    showButton: nextPhase.manual || false,
                    buttonText: nextPhase.buttonText || '',
                    slotNumber: nextPhase.slotNumber || null
                });

                if (nextPhase.duration > 0) {
                    // Auto-progress next phase
                    let progress = 0;
                    const progressInterval = setInterval(() => {
                        progress += 5;
                        if (progress <= 100) {
                            setCurrentAction(prev => ({
                                ...prev,
                                progress: Math.min(nextPhase.progress, (progress / 100) * nextPhase.progress)
                            }));
                        } else {
                            clearInterval(progressInterval);
                            const nextStep2 = nextStep + 1;
                            setCurrentStep(nextStep2);

                            if (nextStep2 < phases.length) {
                                setTimeout(() => {
                                    const nextPhase2 = phases[nextStep2];
                                    setCurrentAction({
                                        title: nextPhase2.title,
                                        description: nextPhase2.description,
                                        progress: nextPhase2.progress,
                                        status: 'in_progress',
                                        showButton: nextPhase2.manual || false,
                                        buttonText: nextPhase2.buttonText || '',
                                        slotNumber: nextPhase2.slotNumber || null
                                    });
                                }, 500);
                            } else {
                                // All phases completed
                                setTimeout(() => {
                                    setSwapComplete(true);
                                    navigate(`/kiosk/${stationId}/complete/${bookingId}`);
                                }, 1000);
                            }
                        }
                    }, nextPhase.duration / 20);
                }
            } else {
                // All phases completed
                setTimeout(() => {
                    setSwapComplete(true);
                    navigate(`/kiosk/${stationId}/complete/${bookingId}`);
                }, 1000);
            }
        }, 500);
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

                {/* Single Progress Section */}
                <div>
                    <h2 className="text-3xl font-bold mb-6">Tiến trình đổi pin</h2>

                    {/* Single Progress Card */}
                    <Card className="border-4 shadow-xl">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {/* Current Action */}
                                <div className="text-center">
                                    <h3 className="text-4xl font-bold mb-4">{currentAction.title}</h3>
                                    <p className="text-2xl text-muted-foreground">{currentAction.description}</p>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-semibold">Tiến độ</span>
                                        <span className="text-xl font-bold">{Math.round(currentAction.progress)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-8">
                                        <div
                                            className="bg-primary h-8 rounded-full transition-all duration-500"
                                            style={{ width: `${currentAction.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Manual Action Button */}
                                {currentAction.showButton && (
                                    <div className="text-center">
                                        {currentAction.slotNumber && (
                                            <div className="text-6xl font-bold text-primary mb-4">
                                                Slot #{currentAction.slotNumber}
                                            </div>
                                        )}
                                        <Button
                                            size="lg"
                                            onClick={handleActionComplete}
                                            className="text-3xl px-16 py-10 h-auto"
                                        >
                                            {currentAction.buttonText}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
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

