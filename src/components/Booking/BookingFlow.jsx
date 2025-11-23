import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { bookingAPI } from '../../lib/apiServices';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import BatterySelection from './BatterySelection';
import BookingConfirmation from './BookingConfirmation';
import BookingSuccess from './BookingSuccess';

/**
 * BookingFlow Component
 * 
 * Multi-step booking flow that handles:
 * - Multi-slot vehicles: Battery Selection -> Confirmation -> Success (3 steps)
 * - Single-slot vehicles: Confirmation -> Success (2 steps)
 * 
 * Manages the entire booking process from selection to completion
 */
const BookingFlow = ({ selectedStation, selectedVehicle, onBookingSuccess, onClose }) => {
    // Step management
    const [currentStep, setCurrentStep] = useState(1);
    
    // Booking data
    const [selectedBatteries, setSelectedBatteries] = useState([]);
    const [availabilityData, setAvailabilityData] = useState(null);
    const [bookingData, setBookingData] = useState(null);
    
    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Check battery availability when vehicle and station are selected
     * Validates that the station has batteries compatible with the vehicle
     */
    useEffect(() => {
        if (selectedVehicle && selectedStation) {
            checkAvailability();
        }
    }, [selectedVehicle, selectedStation]);

    /**
     * Check battery availability at selected station for selected vehicle
     * Validates station and vehicle IDs before making API call
     */
    const checkAvailability = async () => {
        try {
            if (!selectedStation?.id || !selectedVehicle?.vehicle_id) {
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

    /**
     * Handle battery quantity selection from BatterySelection component
     * Clears any previous errors
     */
    const handleBatterySelection = (batteries) => {
        setSelectedBatteries(batteries);
        setError(null);
    };

    /**
     * Auto-advance to confirmation step when batteries are selected
     * Only applies to multi-slot vehicles (step 1 -> step 2)
     */
    useEffect(() => {
        const hasMultipleSlots = selectedVehicle?.model?.battery_slot > 1;
        if (hasMultipleSlots && currentStep === 1 && selectedBatteries.length > 0) {
            setCurrentStep(2);
        }
    }, [selectedBatteries, currentStep, selectedVehicle]);

    /**
     * Initialize step based on vehicle type
     * Multi-slot vehicles start at battery selection (step 1)
     * Single-slot vehicles start at confirmation (step 1) with default 1 battery
     */
    useEffect(() => {
        if (selectedVehicle) {
            if (selectedVehicle.model?.battery_slot > 1) {
                // Multi-slot: start at battery selection
                setCurrentStep(1);
            } else {
                // Single-slot: set default and start at confirmation
                setSelectedBatteries([1]);
                setCurrentStep(1);
            }
        }
    }, [selectedVehicle]);

    /**
     * Handle next button click
     * Moves from battery selection to confirmation for multi-slot vehicles
     */
    const handleNext = () => {
        const hasMultipleSlots = selectedVehicle?.model?.battery_slot > 1;
        if (hasMultipleSlots && currentStep === 1 && selectedBatteries.length > 0) {
            setCurrentStep(2); // Go to confirmation
        }
    };

    /**
     * Handle back button click
     * Moves to previous step in the flow
     */
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    /**
     * Create booking with selected vehicle, station, and battery quantity
     * Processes API response and navigates to success step
     */
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

            const response = await bookingAPI.create(bookingData);

            if (response.data && response.data.booking) {
                const bookingResponse = response.data.booking;
                
                // Transform API response to component-friendly format
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

                // Navigate to success step (step 3 for multi-slot, step 2 for single-slot)
                const hasMultipleSlots = selectedVehicle?.model?.battery_slot > 1;
                const successStep = hasMultipleSlots ? 3 : 2;
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

    /**
     * Close booking flow modal
     */
    const handleClose = () => {
        onClose?.();
    };

    /**
     * Render the appropriate step content based on current step and vehicle type
     * Multi-slot: Battery Selection -> Confirmation -> Success (3 steps)
     * Single-slot: Confirmation -> Success (2 steps)
     */
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
                            selectedTime={null}
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

    /**
     * Get title for current step
     * Different titles for multi-slot vs single-slot vehicles
     */
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

    /**
     * Get total number of steps based on vehicle type
     * Multi-slot vehicles have 3 steps, single-slot have 2
     */
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
