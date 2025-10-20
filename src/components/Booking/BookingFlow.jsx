import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { bookingAPI } from '../../lib/apiServices';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import VehicleSelection from './VehicleSelection';
import TimeSelection from './TimeSelection';
import BookingConfirmation from './BookingConfirmation';
import BookingSuccess from './BookingSuccess';

const BookingFlow = ({ selectedStation, selectedVehicle, onBookingSuccess, onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedTime, setSelectedTime] = useState(null);
    const [availabilityData, setAvailabilityData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const [isBookingActive, setIsBookingActive] = useState(false);
    const [bookingData, setBookingData] = useState(null);

    const timerRef = useRef(null);
    const deleteTimerRef = useRef(null);

    // Check availability when vehicle is selected
    useEffect(() => {
        if (selectedVehicle && selectedStation) {
            checkAvailability();
        }
    }, [selectedVehicle, selectedStation]);

    // Handle booking timer when time is selected
    useEffect(() => {
        if (selectedTime && currentStep === 3) {
            const now = new Date();
            const selectedDateTime = new Date(selectedTime.time);
            const timeDiff = selectedDateTime.getTime() - now.getTime();

            if (timeDiff > 0) {
                // Set timer to activate booking at selected time
                timerRef.current = setTimeout(() => {
                    setIsBookingActive(true);
                    // Set timer to delete booking after 15 minutes
                    deleteTimerRef.current = setTimeout(() => {
                        handleAutoDeleteBooking();
                    }, 15 * 60 * 1000); // 15 minutes
                }, timeDiff);
            }
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
        };
    }, [selectedTime, currentStep]);

    const checkAvailability = async () => {
        try {
            const response = await bookingAPI.checkAvailability({
                station_id: selectedStation.id,
                battery_type: selectedVehicle.batteryTypeCode,
                scheduled_time: selectedTime?.time?.toISOString()
            });

            setAvailabilityData(response.data);

            if (!response.data.available) {
                setError('Trạm không có pin loại này hoặc đã hết chỗ');
            }
        } catch (error) {
            console.error('Error checking availability:', error);
            setError('Không thể kiểm tra tình trạng pin tại trạm');
        }
    };


    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setError(null);
    };

    const handleNext = () => {
        if (currentStep === 1 && selectedTime) {
            setCurrentStep(2);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedVehicle || !selectedTime || !selectedStation) {
            setError('Thiếu thông tin cần thiết để đặt lịch');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const bookingData = {
                station_id: selectedStation.id,
                vehicle_id: selectedVehicle.vehicle_id,
                battery_type: selectedVehicle.batteryTypeCode,
                scheduled_time: selectedTime.time.toISOString(),
                status: 'pending'
            };

            const response = await bookingAPI.create(bookingData);

            if (response.data && response.data.success) {
                const bookingResponse = response.data;
                setBookingId(bookingResponse.payload?.booking_id || bookingResponse.booking_id);
                setBookingData({
                    ...bookingResponse,
                    vehicle: selectedVehicle,
                    station: selectedStation,
                    scheduled_time: selectedTime.time.toISOString()
                });
                setCurrentStep(4); // Success step
                onBookingSuccess?.(bookingResponse);
            } else {
                setError(response.data?.message || 'Không thể tạo lệnh đặt lịch');
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            setError(error.response?.data?.message || 'Lỗi khi tạo lệnh đặt lịch');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAutoDeleteBooking = async () => {
        if (bookingId) {
            try {
                await bookingAPI.delete(bookingId);
                console.log('Booking automatically deleted after 15 minutes');
            } catch (error) {
                console.error('Error auto-deleting booking:', error);
            }
        }
    };

    const handleClose = () => {
        // Clean up timers
        if (timerRef.current) clearTimeout(timerRef.current);
        if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
        onClose?.();
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <TimeSelection
                        onTimeSelect={handleTimeSelect}
                        selectedTime={selectedTime}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 2:
                return (
                    <BookingConfirmation
                        selectedVehicle={selectedVehicle}
                        selectedTime={selectedTime}
                        selectedStation={selectedStation}
                        onConfirm={handleConfirmBooking}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                    />
                );
            case 3:
                return (
                    <BookingSuccess
                        bookingData={bookingData}
                        onClose={handleClose}
                    />
                );
            default:
                return null;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return 'Chọn thời gian';
            case 2: return 'Xác nhận đặt lịch';
            case 3: return 'Hoàn thành';
            default: return '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-foreground">
                                Đặt lịch đổi pin
                            </h1>
                            <Button variant="outline" onClick={handleClose}>
                                Đóng
                            </Button>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center space-x-4">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {currentStep > step ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            step
                                        )}
                                    </div>
                                    {step < 3 && (
                                        <div className={`w-8 h-0.5 mx-2 ${currentStep > step ? 'bg-primary' : 'bg-muted'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                                Bước {currentStep}/3: {getStepTitle()}
                            </p>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <p className="text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Step Content */}
                    {renderStepContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default BookingFlow;
