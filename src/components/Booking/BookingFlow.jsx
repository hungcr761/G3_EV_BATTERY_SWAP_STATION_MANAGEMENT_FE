import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { bookingAPI } from '../../lib/apiServices';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import VehicleSelection from './VehicleSelection';
import TimeSelection from './TimeSelection';
import BatterySelection from './BatterySelection';
import BookingConfirmation from './BookingConfirmation';
import BookingSuccess from './BookingSuccess';

const BookingFlow = ({ selectedStation, selectedVehicle, onBookingSuccess, onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedBatteries, setSelectedBatteries] = useState([]);
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


    // Handle booking timer when booking is created
    useEffect(() => {
        if (bookingId && selectedTime) {
            // Booking is active immediately when created
            setIsBookingActive(true);

            // Set timer to delete booking at selected time
            const now = new Date();
            const selectedDateTime = new Date(selectedTime.time);
            const timeDiff = selectedDateTime.getTime() - now.getTime();

            if (timeDiff > 0) {
                deleteTimerRef.current = setTimeout(() => {
                    handleAutoDeleteBooking();
                }, timeDiff);
            }
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
        };
    }, [bookingId, selectedTime]);

    const checkAvailability = async () => {
        try {
            console.log('Checking availability with:', {
                selectedStation,
                selectedVehicle,
                stationId: selectedStation?.id,
                vehicleId: selectedVehicle?.vehicle_id
            });

            if (!selectedStation?.id || !selectedVehicle?.vehicle_id) {
                console.error('Missing station or vehicle ID:', {
                    stationId: selectedStation?.id,
                    vehicleId: selectedVehicle?.vehicle_id
                });
                setError('Thiếu thông tin trạm hoặc xe');
                return;
            }

            const response = await bookingAPI.checkAvailability(
                selectedStation.id,
                selectedVehicle.vehicle_id
            );

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

    const handleBatterySelection = (batteries) => {
        console.log('BookingFlow handleBatterySelection called with:', batteries);
        setSelectedBatteries(batteries);
        setError(null);
    };

    // Auto-advance to next step when batteries are selected
    useEffect(() => {
        if (currentStep === 2 && selectedBatteries.length > 0) {
            console.log('Auto-advancing from step 2 to step 3, selectedBatteries:', selectedBatteries);
            setCurrentStep(3);
        }
    }, [selectedBatteries, currentStep]);

    const handleNext = () => {
        if (currentStep === 1 && selectedTime) {
            // Debug: Log vehicle info
            console.log('Vehicle info for battery selection:', {
                selectedVehicle,
                batterySlot: selectedVehicle.model?.battery_slot,
                modelName: selectedVehicle?.modelName
            });

            // Check if vehicle has multiple battery slots
            if (selectedVehicle.model?.battery_slot > 1) {
                console.log('Vehicle has multiple battery slots, going to battery selection');
                setCurrentStep(2); // Go to battery selection
            } else {
                console.log('Vehicle has single battery slot, skipping battery selection');
                // Set default battery selection for single battery vehicles
                setSelectedBatteries([1]);
                setCurrentStep(3); // Skip battery selection, go to confirmation
            }
        } else if (currentStep === 2 && selectedBatteries.length > 0) {
            console.log('BookingFlow: Moving from step 2 to step 3, selectedBatteries:', selectedBatteries);
            setCurrentStep(3); // Go to confirmation
        } else if (currentStep === 2) {
            console.log('BookingFlow: Still on step 2, selectedBatteries:', selectedBatteries, 'length:', selectedBatteries.length);
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
            const batteryQuantity = selectedBatteries.length > 0 ? selectedBatteries.length : 1;
            const bookingData = {
                station_id: selectedStation.id,
                vehicle_id: selectedVehicle.vehicle_id,
                scheduled_time: selectedTime.time.toISOString(),
                battery_quantity: batteryQuantity,
            };

            console.log('Creating booking with data:', {
                bookingData,
                selectedBatteries,
                batteryQuantity
            });

            const response = await bookingAPI.create(bookingData);

            if (response.data && response.data.booking) {
                const bookingResponse = response.data.booking;
                setBookingId(bookingResponse.booking_id);
                setBookingData({
                    booking_id: bookingResponse.booking_id,
                    status: bookingResponse.status,
                    scheduled_time: bookingResponse.scheduled_time,
                    vehicle: {
                        ...bookingResponse.vehicle,
                        modelName: bookingResponse.vehicle.model.name,
                        batteryType: bookingResponse.vehicle.model.batteryType.battery_type_code,
                        vin: bookingResponse.vehicle.vin,
                        license_plate: bookingResponse.vehicle.license_plate
                    },
                    station: {
                        ...bookingResponse.station,
                        name: bookingResponse.station.station_name,
                        address: bookingResponse.station.address,
                        status: bookingResponse.station.status
                    },
                    driver: bookingResponse.driver,
                    batteries: bookingResponse.batteries,
                    create_time: bookingResponse.create_time,
                    scheduled_time: bookingResponse.scheduled_time,
                    scheduled_end_time: bookingResponse.scheduled_end_time
                });
                setCurrentStep(4); // Success step
                onBookingSuccess?.(response.data);
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
                    <BatterySelection
                        selectedVehicle={selectedVehicle}
                        onBatterySelection={handleBatterySelection}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 3:
                return (
                    <BookingConfirmation
                        selectedVehicle={selectedVehicle}
                        selectedTime={selectedTime}
                        selectedStation={selectedStation}
                        selectedBatteries={selectedBatteries}
                        onConfirm={handleConfirmBooking}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                    />
                );
            case 4:
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
            case 2: return 'Chọn số lượng pin';
            case 3: return 'Xác nhận đặt lịch';
            case 4: return 'Hoàn thành';
            default: return '';
        }
    };

    const getTotalSteps = () => {
        return selectedVehicle.model?.battery_slot > 1 ? 4 : 3;
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
                            {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((step) => (
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
                                    {step < getTotalSteps() && (
                                        <div className={`w-8 h-0.5 mx-2 ${currentStep > step ? 'bg-primary' : 'bg-muted'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                                Bước {currentStep}/{getTotalSteps()}: {getStepTitle()}
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
