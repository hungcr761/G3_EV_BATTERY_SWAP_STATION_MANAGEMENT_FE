import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { bookingAPI } from '../../lib/apiServices';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import VehicleSelection from './VehicleSelection';
import BatterySelection from './BatterySelection';
import BookingConfirmation from './BookingConfirmation';
import BookingSuccess from './BookingSuccess';

const BookingFlow = ({ selectedStation, selectedVehicle, onBookingSuccess, onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [scheduledTime, setScheduledTime] = useState(null);
    const [selectedBatteries, setSelectedBatteries] = useState([]);
    const [availabilityData, setAvailabilityData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const [isBookingActive, setIsBookingActive] = useState(false);
    const [bookingData, setBookingData] = useState(null);

    const timerRef = useRef(null);
    const deleteTimerRef = useRef(null);

    // Auto-set scheduled_time to now + 1 hour
    useEffect(() => {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        setScheduledTime(oneHourLater);
    }, []);

    // Check availability when vehicle is selected
    useEffect(() => {
        if (selectedVehicle && selectedStation) {
            checkAvailability();
        }
    }, [selectedVehicle, selectedStation]);


    // Handle booking timer when booking is created
    useEffect(() => {
        if (bookingId && scheduledTime) {
            // Booking is active immediately when created
            setIsBookingActive(true);

            // Set timer to cancel booking at scheduled time
            const now = new Date();
            const scheduledDateTime = new Date(scheduledTime);
            const timeDiff = scheduledDateTime.getTime() - now.getTime();

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
    }, [bookingId, scheduledTime]);

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
                setError('Missing station or vehicle information');
                return;
            }

            const response = await bookingAPI.checkAvailability(
                selectedStation.id,
                selectedVehicle.vehicle_id
            );

            setAvailabilityData(response.data);

            if (!response.data.available) {
                setError('Station does not have this battery type or is out of space');
            }
        } catch (error) {
            console.error('Error checking availability:', error);
            setError('Unable to check battery status at station');
        }
    };


    const handleBatterySelection = (batteries) => {
        console.log('BookingFlow handleBatterySelection called with:', batteries);
        setSelectedBatteries(batteries);
        setError(null);
    };

    // Auto-advance to next step when batteries are selected (only for multi-slot vehicles)
    useEffect(() => {
        const hasMultipleSlots = selectedVehicle?.model?.battery_slot > 1;
        if (hasMultipleSlots && currentStep === 1 && selectedBatteries.length > 0) {
            console.log('Auto-advancing from step 1 to step 2, selectedBatteries:', selectedBatteries);
            setCurrentStep(2);
        }
    }, [selectedBatteries, currentStep, selectedVehicle]);

    // Auto-navigate to appropriate step based on vehicle battery slots
    useEffect(() => {
        if (selectedVehicle && scheduledTime) {
            // Check if vehicle has multiple battery slots
            if (selectedVehicle.model?.battery_slot > 1) {
                // Stay on step 1 (battery selection) for multi-slot vehicles
                setCurrentStep(1);
            } else {
                // Set default battery selection for single battery vehicles and go to confirmation (step 1 for single-slot vehicles)
                setSelectedBatteries([1]);
                setCurrentStep(1);
            }
        }
    }, [selectedVehicle, scheduledTime]);

    const handleNext = () => {
        const hasMultipleSlots = selectedVehicle?.model?.battery_slot > 1;
        if (hasMultipleSlots && currentStep === 1 && selectedBatteries.length > 0) {
            console.log('BookingFlow: Moving from step 1 to step 2, selectedBatteries:', selectedBatteries);
            setCurrentStep(2); // Go to confirmation
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedVehicle || !scheduledTime || !selectedStation) {
            setError('Missing required information to make a booking');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const batteryQuantity = selectedBatteries.length > 0 ? selectedBatteries.length : 1;
            const bookingData = {
                station_id: selectedStation.id,
                vehicle_id: selectedVehicle.vehicle_id,
                scheduled_time: scheduledTime.toISOString(),
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
                    scheduled_end_time: bookingResponse.scheduled_end_time
                });
                setCurrentStep(4); // Success step
                onBookingSuccess?.(response.data);
            } else {
                setError(response.data?.message || 'Unable to create booking');
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            setError(error.response?.data?.message || 'Error creating booking');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAutoDeleteBooking = async () => {
        if (bookingId) {
            try {
                await bookingAPI.cancel(bookingId);
                console.log('Booking automatically cancelled after scheduled time');
            } catch (error) {
                console.error('Error auto-cancelling booking:', error);
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
        const hasMultipleSlots = selectedVehicle?.model?.battery_slot > 1;

        if (hasMultipleSlots) {
            // Multi-slot vehicle flow: Battery Selection -> Confirmation -> Success
            switch (currentStep) {
                case 1:
                    return (
                        <BatterySelection
                            selectedVehicle={selectedVehicle}
                            onBatterySelection={handleBatterySelection}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    );
                case 2:
                    return (
                        <BookingConfirmation
                            selectedVehicle={selectedVehicle}
                            selectedTime={{ time: scheduledTime }}
                            selectedStation={selectedStation}
                            selectedBatteries={selectedBatteries}
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
        } else {
            // Single-slot vehicle flow: Confirmation -> Success
            switch (currentStep) {
                case 1:
                    return (
                        <BookingConfirmation
                            selectedVehicle={selectedVehicle}
                            selectedTime={{ time: scheduledTime }}
                            selectedStation={selectedStation}
                            selectedBatteries={selectedBatteries}
                            onConfirm={handleConfirmBooking}
                            onBack={handleBack}
                            isSubmitting={isSubmitting}
                        />
                    );
                case 2:
                    return (
                        <BookingSuccess
                            bookingData={bookingData}
                            onClose={handleClose}
                        />
                    );
                default:
                    return null;
            }
        }
    };

    const getStepTitle = () => {
        const hasMultipleSlots = selectedVehicle?.model?.battery_slot > 1;

        if (hasMultipleSlots) {
            switch (currentStep) {
                case 1: return 'Select Battery Quantity';
                case 2: return 'Confirm Booking';
                case 3: return 'Complete';
                default: return '';
            }
        } else {
            switch (currentStep) {
                case 1: return 'Confirm Booking';
                case 2: return 'Complete';
                default: return '';
            }
        }
    };

    const getTotalSteps = () => {
        return selectedVehicle?.model?.battery_slot > 1 ? 3 : 2;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-foreground">
                                Schedule Battery Swap
                            </h1>
                            <Button variant="outline" onClick={handleClose}>
                                Close
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
                                Step {currentStep}/{getTotalSteps()}: {getStepTitle()}
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
