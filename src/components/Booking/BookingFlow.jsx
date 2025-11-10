import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { bookingAPI } from '../../lib/apiServices';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import BatterySelection from './BatterySelection';
import BookingConfirmation from './BookingConfirmation';
import BookingSuccess from './BookingSuccess';

const BookingFlow = ({ selectedStation, selectedVehicle, onBookingSuccess, onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedBatteries, setSelectedBatteries] = useState([]);
    const [availabilityData, setAvailabilityData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [bookingData, setBookingData] = useState(null);

    // Check availability when vehicle is selected
    useEffect(() => {
        if (selectedVehicle && selectedStation) {
            checkAvailability();
        }
    }, [selectedVehicle, selectedStation]);

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

            console.log('Availability check response:', response.data);

            // Extract availableBatteries from response (handle various response structures)
            // API might return: response.data, response.data.data, or response.data.payload
            const responseData = response.data;

            // Try multiple possible response structures
            const data = responseData?.payload ?? responseData?.data ?? responseData;

            // Extract availableBatteries with comprehensive fallback options
            let availableBatteries = data?.availableBatteries ??
                data?.available_batteries ??
                data?.availability_details?.available_batteries ??
                responseData?.availableBatteries ??
                responseData?.available_batteries ??
                responseData?.availability_details?.available_batteries ??
                0;

            // Convert to number if it's a string, and ensure it's a valid number
            if (typeof availableBatteries === 'string') {
                availableBatteries = parseInt(availableBatteries, 10);
            }
            if (isNaN(availableBatteries) || availableBatteries < 0) {
                availableBatteries = 0;
            }

            console.log('Extracted availableBatteries:', availableBatteries, 'from data:', data, 'responseData:', responseData);

            // Store the full response data for use in other components
            setAvailabilityData(data || responseData);

            // Only set error if no batteries are available (availableBatteries must be > 0 to book)
            if (availableBatteries > 0) {
                setError(null); // Clear error if batteries are available
                console.log('Batteries available, clearing error');
            } else {
                setError('Station does not have available batteries for this vehicle type');
                console.log('No batteries available, setting error');
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
        if (selectedVehicle) {
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
    }, [selectedVehicle]);

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
        if (!selectedVehicle || !selectedStation) {
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
                battery_quantity: batteryQuantity,
            };

            console.log('Creating booking with data:', {
                bookingData,
                selectedBatteries,
                batteryQuantity
            });

            const response = await bookingAPI.create(bookingData);

            if (response.data && response.data.booking) {
                console.log('Booking created successfully:', response.data.booking);
                const bookingResponse = response.data.booking;
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
                    expired_time: bookingResponse.expired_time
                });

                // Set correct step based on vehicle type
                const hasMultipleSlots = selectedVehicle?.model?.battery_slot > 1;
                const successStep = hasMultipleSlots ? 3 : 2;
                console.log('Booking created successfully, moving to step:', successStep, 'hasMultipleSlots:', hasMultipleSlots);
                console.log('Booking response data:', bookingResponse);
                setCurrentStep(successStep);
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

    const handleClose = () => {
        onClose?.();
    };

    const renderStepContent = () => {
        const hasMultipleSlots = selectedVehicle?.model?.battery_slot > 1;
        console.log('renderStepContent - currentStep:', currentStep, 'hasMultipleSlots:', hasMultipleSlots, 'bookingData exists:', !!bookingData);

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
                            selectedTime={null}
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
            }
        } else {
            // Single-slot vehicle flow: Confirmation -> Success
            switch (currentStep) {
                case 1:
                    return (
                        <BookingConfirmation
                            selectedVehicle={selectedVehicle}
                            selectedTime={null}
                            selectedStation={selectedStation}
                            selectedBatteries={selectedBatteries}
                            onConfirm={handleConfirmBooking}
                            onBack={handleBack}
                            isSubmitting={isSubmitting}
                        />
                    );
                case 2:
                    console.log('Rendering BookingSuccess for single-slot, bookingData:', bookingData);
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
