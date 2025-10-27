import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Battery, CheckCircle2, AlertCircle, Clock, User, Motorbike } from 'lucide-react';
import { bookingAPI, swapAPI } from '../../lib/apiServices';

const SwapStatus = () => {
    const { stationId, bookingId, userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(0);
    const [swapComplete, setSwapComplete] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [emptySlots, setEmptySlots] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [isUserFlow, setIsUserFlow] = useState(false);
    const [isFirstTimeSwap, setIsFirstTimeSwap] = useState(false);
    const [firstTimePickupData, setFirstTimePickupData] = useState(null);
    const [bookingValidationData, setBookingValidationData] = useState(null);
    const [isFirstTimeWithBooking, setIsFirstTimeWithBooking] = useState(false);
    const [firstTimeValidationData, setFirstTimeValidationData] = useState(null);
    const [currentAction, setCurrentAction] = useState({
        title: 'Verification',
        description: 'Checking information',
        progress: 0,
        status: 'in_progress',
        showButton: false,
        buttonText: '',
        slotNumber: null
    });

    // Fetch data based on flow type
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if this is user flow (no booking)
                if (userId && !bookingId) {
                    setIsUserFlow(true);
                    const userFlowData = location.state;
                    const isFirstTime = userFlowData?.isFirstTimeSwap || false;
                    setIsFirstTimeSwap(isFirstTime);

                    setUserData({
                        userId: userId,
                        userName: userFlowData?.selectedVehicle?.driver?.fullname || 'Customer',
                        vehicleModel: userFlowData?.selectedVehicle?.modelName || 'Unknown Model',
                        vehiclePlate: userFlowData?.selectedVehicle?.license_plate || 'N/A',
                        batteryType: userFlowData?.selectedVehicle?.batteryTypeCode || 'Type 2',
                        batteryTypeId: userFlowData?.selectedVehicle?.model?.batteryType?.battery_type_id,
                        requestedQuantity: userFlowData?.selectedBatteries?.length || 1,
                        stationName: `Station #${stationId}`,
                        vehicleId: userFlowData?.selectedVehicle?.vehicle_id,
                        firstTimeData: userFlowData?.firstTimeData,
                    });
                } else {
                    // Booking flow
                    setIsUserFlow(false);
                    if (location.state?.booking) {
                        const booking = location.state.booking;
                        setBookingData({
                            bookingId: booking.booking_id,
                            driverId: booking.driver_id,
                            userName: booking.driver?.fullname || 'Customer',
                            vehicleModel: booking.vehicle?.model?.name || 'Unknown Model',
                            vehiclePlate: booking.vehicle?.license_plate || 'N/A',
                            batteryType: booking.vehicle?.model?.batteryType?.battery_type_code || 'Type 2',
                            batteryTypeId: booking.vehicle?.model?.batteryType?.battery_type_id,
                            stationName: booking.station?.station_name || `Trạm #${stationId}`,
                            scheduledTime: new Date(booking.scheduled_time).toLocaleString('en-US'),
                            vehicleId: booking.vehicle?.vehicle_id,
                        });
                    } else {
                        // Fetch from API
                        const response = await bookingAPI.getById(bookingId);
                        const booking = response.data.booking;

                        setBookingData({
                            bookingId: booking.booking_id,
                            driverId: booking.driver_id,
                            userName: booking.driver?.fullname || 'Customer',
                            vehicleModel: booking.vehicle?.model?.name || 'Unknown Model',
                            vehiclePlate: booking.vehicle?.license_plate || 'N/A',
                            batteryType: booking.vehicle?.model?.batteryType?.battery_type_code || 'Type 2',
                            batteryTypeId: booking.vehicle?.model?.batteryType?.battery_type_id,
                            stationName: booking.station?.station_name || `Trạm #${stationId}`,
                            scheduledTime: new Date(booking.scheduled_time).toLocaleString('en-US'),
                            vehicleId: booking.vehicle?.vehicle_id,
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // Fallback to mock data
                if (userId && !bookingId) {
                    setUserData({
                        userId: userId,
                        userName: 'Customer',
                        vehicleModel: 'VinFast Klara S',
                        vehiclePlate: '30B-98761',
                        batteryType: 'NMC-50',
                        batteryTypeId: 2,
                        requestedQuantity: 1,
                        stationName: `Station #${stationId}`,
                    });
                } else {
                    setBookingData({
                        bookingId: bookingId,
                        userName: 'Customer',
                        vehicleModel: 'VinFast Klara S',
                        vehiclePlate: '30B-98761',
                        batteryType: 'NMC-50',
                        batteryTypeId: 2,
                        stationName: `Station #${stationId}`,
                        scheduledTime: new Date().toLocaleTimeString('en-US'),
                    });
                }
            }
        };

        fetchData();
    }, [bookingId, userId, stationId, location.state]);

    // Fetch empty slots when starting swap
    const fetchEmptySlots = async () => {
        try {
            const response = await swapAPI.getEmptySlots(stationId);
            const slots = response.data.data.empty_slots || [];
            setEmptySlots(slots);
            return slots;
        } catch (error) {
            console.error('Error fetching empty slots:', error);
            return [];
        }
    };

    // Validate first time pickup
    const validateFirstTimePickup = async () => {
        try {
            const currentData = isUserFlow ? userData : bookingData;
            const response = await swapAPI.validateAndPrepare({
                driver_id: currentData.userId,
                vehicle_id: currentData.vehicleId,
                station_id: parseInt(stationId),
                battery_type_id: currentData.batteryTypeId,
                requested_quantity: currentData.requestedQuantity || 1
            });
            return response.data;
        } catch (error) {
            console.error('Error validating first time pickup:', error);
            throw error;
        }
    };

    // First time pickup
    const performFirstTimePickup = async () => {
        try {
            const currentData = isUserFlow ? userData : bookingData;
            const response = await swapAPI.firstTimePickup(
                currentData.userId,
                currentData.vehicleId,
                parseInt(stationId)
            );
            return response.data;
        } catch (error) {
            console.error('Error performing first time pickup:', error);
            throw error;
        }
    };

    // Validate with booking for first time
    const validateWithBooking = async () => {
        try {
            const currentData = isUserFlow ? userData : bookingData;
            const response = await swapAPI.validateWithBooking(
                currentData.bookingId,
                currentData.driverId,
                currentData.vehicleId,
                parseInt(stationId),
                currentData.batteryTypeId
            );
            return response.data;
        } catch (error) {
            console.error('Error validating with booking:', error);
            throw error;
        }
    };

    // Execute first time with booking
    const executeFirstTimeWithBooking = async (bookedBatteries) => {
        try {
            const currentData = isUserFlow ? userData : bookingData;
            const response = await swapAPI.executeFirstTimeWithBooking({
                booking_id: currentData.bookingId,
                driver_id: currentData.driverId,
                vehicle_id: currentData.vehicleId,
                station_id: parseInt(stationId),
                bookedBatteries: bookedBatteries
            });
            return response.data;
        } catch (error) {
            console.error('Error executing first time with booking:', error);
            throw error;
        }
    };

    // Validate and prepare swap
    const validateAndPrepareSwap = async (batteryData) => {
        try {
            const currentData = isUserFlow ? userData : bookingData;
            const response = await swapAPI.validateAndPrepare({
                driver_id: isUserFlow ? currentData.userId : currentData.bookingId,
                vehicle_id: isUserFlow ? currentData.vehicleId : currentData.vehicleId,
                station_id: parseInt(stationId),
                battery_type_id: currentData.batteryTypeId,
                requested_quantity: currentData.requestedQuantity || 1,
                batteriesIn: batteryData
            });
            return response.data;
        } catch (error) {
            console.error('Error validating and preparing swap:', error);
            throw error;
        }
    };

    // Start the swap process when data is loaded
    useEffect(() => {
        if ((isUserFlow && userData) || (!isUserFlow && bookingData)) {
            startSwapProcess();
        }
    }, [isUserFlow, userData, bookingData]);

    const startSwapProcess = async () => {
        try {
            // Step 1: Verification
            setCurrentAction({
                title: isUserFlow ? 'Account Verification' : 'Booking Verification',
                description: isUserFlow ? 'Checking your account information' : 'Checking your booking information',
                progress: 16,
                status: 'in_progress',
                showButton: false
            });

            // Simulate verification delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check if this is first time pickup
            if (isUserFlow && isFirstTimeSwap) {
                // First time pickup flow (no booking)
                setCurrentAction({
                    title: 'Validating First Time Pickup',
                    description: 'Checking battery availability for first time pickup',
                    progress: 33,
                    status: 'in_progress',
                    showButton: false
                });

                // Step 1: Validate first time pickup
                const validationData = await validateFirstTimePickup();
                setFirstTimeValidationData(validationData);

                if (!validationData.ready_to_execute) {
                    setCurrentAction({
                        title: 'Validation Failed',
                        description: validationData.message || 'Unable to proceed with first time pickup',
                        progress: 33,
                        status: 'error',
                        showButton: false
                    });
                    return;
                }

                setCurrentAction({
                    title: 'First Time Battery Pickup',
                    description: 'Processing your first time battery pickup',
                    progress: 66,
                    status: 'in_progress',
                    showButton: false
                });

                // Step 2: Execute first time pickup
                const pickupData = await performFirstTimePickup();
                setFirstTimePickupData(pickupData);

                setCurrentAction({
                    title: 'Battery Ready for Pickup',
                    description: `Battery is ready at slot ${pickupData.data.slot_number}. Please take your battery.`,
                    progress: 83,
                    status: 'in_progress',
                    showButton: true,
                    buttonText: 'Battery Retrieved'
                });
            } else if (!isUserFlow && bookingData) {
                // Check if this is first time with booking
                setCurrentAction({
                    title: 'Validating Booking for First Time',
                    description: 'Checking if this is a first time battery pickup with booking',
                    progress: 33,
                    status: 'in_progress',
                    showButton: false
                });

                const validationData = await validateWithBooking();
                setBookingValidationData(validationData);
                setIsFirstTimeWithBooking(validationData.is_first_time);

                if (validationData.is_first_time) {
                    // First time with booking flow
                    setCurrentAction({
                        title: 'First Time Battery Pickup with Booking',
                        description: 'Processing your first time battery pickup with booking',
                        progress: 66,
                        status: 'in_progress',
                        showButton: false
                    });

                    const bookedBatteries = validationData.data.booked_batteries_out.map(battery => ({
                        slot_id: battery.slot_id,
                        battery_id: battery.battery_id
                    }));

                    const executionData = await executeFirstTimeWithBooking(bookedBatteries);
                    setFirstTimePickupData(executionData);

                    setCurrentAction({
                        title: 'Batteries Ready for Pickup',
                        description: `Batteries are ready at slots: ${validationData.data.booked_batteries_out.map(b => b.slot_id).join(', ')}. Please take your batteries.`,
                        progress: 83,
                        status: 'in_progress',
                        showButton: true,
                        buttonText: 'Batteries Retrieved'
                    });
                } else {
                    // Regular booking flow
                    // Step 2: Get empty slots
                    setCurrentAction(prev => ({
                        ...prev,
                        title: 'Getting Empty Slots',
                        description: 'Retrieving list of empty slots at station',
                        progress: 33,
                        status: 'in_progress'
                    }));

                    const slots = await fetchEmptySlots();
                    if (slots.length === 0) {
                        setCurrentAction(prev => ({
                            ...prev,
                            title: 'Error',
                            description: 'No empty slots available at station',
                            status: 'error'
                        }));
                        return;
                    }

                    // Step 3: Select random slots for battery insertion
                    const currentData = isUserFlow ? userData : bookingData;
                    const requestedQuantity = currentData.requestedQuantity || 1;
                    const selectedSlotsForInsertion = selectRandomSlots(slots, requestedQuantity);
                    setSelectedSlots(selectedSlotsForInsertion);

                    setCurrentAction({
                        title: 'Insert Old Batteries',
                        description: `Please insert ${requestedQuantity} old batteries into slots: ${selectedSlotsForInsertion.map(s => s.slot_number).join(', ')}`,
                        progress: 50,
                        status: 'in_progress',
                        showButton: true,
                        buttonText: 'Batteries Inserted'
                    });
                }
            } else {
                // Regular swap flow
                // Step 2: Get empty slots
                setCurrentAction(prev => ({
                    ...prev,
                    title: 'Getting Empty Slots',
                    description: 'Retrieving list of empty slots at station',
                    progress: 33,
                    status: 'in_progress'
                }));

                const slots = await fetchEmptySlots();
                if (slots.length === 0) {
                    setCurrentAction(prev => ({
                        ...prev,
                        title: 'Error',
                        description: 'No empty slots available at station',
                        status: 'error'
                    }));
                    return;
                }

                // Step 3: Select random slots for battery insertion
                const currentData = isUserFlow ? userData : bookingData;
                const requestedQuantity = currentData.requestedQuantity || 1;
                const selectedSlotsForInsertion = selectRandomSlots(slots, requestedQuantity);
                setSelectedSlots(selectedSlotsForInsertion);

                setCurrentAction({
                    title: 'Insert Old Batteries',
                    description: `Please insert ${requestedQuantity} old batteries into slots: ${selectedSlotsForInsertion.map(s => s.slot_number).join(', ')}`,
                    progress: 50,
                    status: 'in_progress',
                    showButton: true,
                    buttonText: 'Batteries Inserted'
                });
            }

        } catch (error) {
            console.error('Error starting swap process:', error);
            setCurrentAction(prev => ({
                ...prev,
                title: 'Error',
                description: 'Unable to start battery swap process',
                status: 'error'
            }));
        }
    };

    // Select random slots based on requested quantity
    const selectRandomSlots = (availableSlots, quantity) => {
        const shuffled = [...availableSlots].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, quantity);
    };

    const handleActionComplete = async () => {
        setCurrentAction(prev => ({
            ...prev,
            showButton: false,
            status: 'completed'
        }));

        // Move to next step
        setTimeout(async () => {
            if (currentAction.title === 'Battery Ready for Pickup' || currentAction.title === 'Batteries Ready for Pickup') {
                // First time pickup completed
                setCurrentAction({
                    title: isFirstTimeWithBooking ? 'First Time Pickup with Booking Complete' : 'First Time Pickup Complete',
                    description: isFirstTimeWithBooking ? 'Your first battery pickup with booking has been completed successfully' : 'Your first battery pickup has been completed successfully',
                    progress: 100,
                    status: 'in_progress',
                    showButton: false
                });

                // Simulate completion time
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Navigate to completion page
                setSwapComplete(true);
                const completeId = isUserFlow ? userId : bookingId;
                navigate(`/kiosk/${stationId}/complete/${completeId}`);
            } else if (currentAction.title === 'Insert Old Batteries') {
                // Step 4: Validate and prepare
                try {
                    setCurrentAction({
                        title: 'Validate and Prepare',
                        description: 'System is validating and preparing new batteries',
                        progress: 66,
                        status: 'in_progress',
                        showButton: false
                    });

                    // Prepare battery data for validation
                    const batteryData = selectedSlots.map(slot => ({
                        slot_id: slot.slot_id,
                        battery_id: `battery_${Date.now()}_${Math.random()}` // Mock battery ID
                    }));

                    await validateAndPrepareSwap(batteryData);

                    // Simulate processing time
                    await new Promise(resolve => setTimeout(resolve, 3000));

                    // Step 5: Get new batteries
                    setCurrentAction({
                        title: 'Get New Batteries',
                        description: 'New battery slots are open, please take the batteries',
                        progress: 83,
                        status: 'in_progress',
                        showButton: true,
                        buttonText: 'Batteries Retrieved'
                    });

                } catch (error) {
                    setCurrentAction(prev => ({
                        ...prev,
                        title: 'Error',
                        description: 'Unable to validate and prepare batteries',
                        status: 'error'
                    }));
                }
            } else if (currentAction.title === 'Get New Batteries') {
                // Step 6: Complete swap
                setCurrentAction({
                    title: 'Complete Battery Swap',
                    description: 'Checking and completing battery swap process',
                    progress: 100,
                    status: 'in_progress',
                    showButton: false
                });

                // Simulate completion time
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Navigate to completion page
                setSwapComplete(true);
                const completeId = isUserFlow ? userId : bookingId;
                navigate(`/kiosk/${stationId}/complete/${completeId}`);
            }
        }, 1000);
    };

    const currentData = isUserFlow ? userData : bookingData;

    if (!currentData) {
        return (
            <div className="container mx-auto px-8 py-12">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto mb-6"></div>
                        <p className="text-2xl text-muted-foreground">Loading information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-8 py-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Info Card */}
                <Card className="border-4 shadow-xl">
                    <CardHeader className="bg-primary text-white">
                        <CardTitle className="text-3xl flex items-center">
                            <Motorbike className="mr-4 h-8 w-8" />
                            {isUserFlow ? 'Walk-in Battery Swap' : 'Scheduled Battery Swap'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <User className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="text-lg font-semibold">{currentData.userName}</p>
                                        <p className="text-muted-foreground">Customer</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Motorbike className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="text-lg font-semibold">{currentData.vehicleModel}</p>
                                        <p className="text-muted-foreground">{currentData.vehiclePlate}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Battery className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="text-lg font-semibold">{currentData.batteryType}</p>
                                        <p className="text-muted-foreground">Battery Type</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Clock className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="text-lg font-semibold">{currentData.stationName}</p>
                                        <p className="text-muted-foreground">
                                            {isUserFlow ? 'Current Time' : currentData.scheduledTime}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Progress Card */}
                <Card className="border-4 shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-4xl text-primary mb-2">
                            {currentAction.title}
                        </CardTitle>
                        <CardDescription className="text-2xl text-muted-foreground">
                            {currentAction.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-8">
                                <div
                                    className="bg-primary h-8 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${currentAction.progress}%` }}
                                ></div>
                            </div>

                            {/* Progress Percentage */}
                            <div className="text-center">
                                <span className="text-3xl font-bold text-primary">
                                    {Math.round(currentAction.progress)}%
                                </span>
                            </div>

                            {/* Action Button */}
                            {currentAction.showButton && (
                                <div className="text-center">
                                    <Button
                                        size="lg"
                                        onClick={handleActionComplete}
                                        className="text-2xl px-12 py-8 h-auto"
                                    >
                                        {currentAction.buttonText}
                                    </Button>
                                </div>
                            )}

                            {/* Status Icon */}
                            <div className="text-center">
                                {currentAction.status === 'error' ? (
                                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                                ) : currentAction.status === 'completed' ? (
                                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                                ) : (
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* First Time Pickup Display */}
                {firstTimePickupData && (currentAction.title === 'Battery Ready for Pickup' || currentAction.title === 'Batteries Ready for Pickup') && (
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                            <CardTitle className="text-2xl text-green-800">
                                {isFirstTimeWithBooking ? 'First Time Battery Pickup with Booking' : 'First Time Battery Pickup'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-xl text-green-700 mb-2">
                                        {firstTimePickupData.message}
                                    </p>
                                    {isFirstTimeWithBooking ? (
                                        <p className="text-lg text-green-600">
                                            Batteries ready at slots: <span className="font-bold">
                                                {firstTimePickupData.data.batteries_out.map(b => b.slot_id).join(', ')}
                                            </span>
                                        </p>
                                    ) : (
                                        <p className="text-lg text-green-600">
                                            Battery ready at slot: <span className="font-bold">
                                                {firstTimeValidationData?.data?.available_batteries_out?.[0]?.slot_number || firstTimePickupData.data.slot_number}
                                            </span>
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-green-200">
                                        <h4 className="font-semibold text-green-800 mb-2">Vehicle Information</h4>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">License Plate:</span> {isFirstTimeWithBooking ? firstTimePickupData.data.vehicle.license_plate : firstTimePickupData.data.vehicle.license_plate}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">Model:</span> {isFirstTimeWithBooking ? firstTimePickupData.data.vehicle.model : firstTimePickupData.data.vehicle.model}
                                        </p>
                                        {!isFirstTimeWithBooking && userData?.firstTimeData && (
                                            <>
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Status:</span> {userData.firstTimeData.data.status}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Total Swaps:</span> {userData.firstTimeData.data.total_swap_count}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-green-200">
                                        <h4 className="font-semibold text-green-800 mb-2">Battery Information</h4>
                                        {isFirstTimeWithBooking ? (
                                            <>
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Batteries Ready:</span> {firstTimePickupData.data.batteries_out.length}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Slot Numbers:</span> {firstTimePickupData.data.batteries_out.map(b => b.slot_id).join(', ')}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Batteries Picked:</span> {firstTimePickupData.data.batteries_picked}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Slot Number:</span> {firstTimePickupData.data.slot_number}
                                                </p>
                                                {userData?.firstTimeData && (
                                                    <>
                                                        <p className="text-sm text-muted-foreground">
                                                            <span className="font-medium">Battery Type:</span> {userData.firstTimeData.data.battery_type_id}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            <span className="font-medium">Battery Slots:</span> {userData.firstTimeData.data.battery_slot}
                                                        </p>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                {!isFirstTimeWithBooking && firstTimeValidationData && (
                                    <div className="bg-white p-4 rounded-lg border border-green-200">
                                        <h4 className="font-semibold text-green-800 mb-2">Validation Information</h4>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">Available Batteries:</span> {firstTimeValidationData.data.available_batteries_out.length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">Battery Serial:</span> {firstTimeValidationData.data.available_batteries_out[0]?.battery_serial}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">SOC:</span> {firstTimeValidationData.data.available_batteries_out[0]?.current_soc}%
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">SOH:</span> {firstTimeValidationData.data.available_batteries_out[0]?.current_soh}%
                                        </p>
                                    </div>
                                )}
                                {isFirstTimeWithBooking && bookingValidationData && (
                                    <div className="bg-white p-4 rounded-lg border border-green-200">
                                        <h4 className="font-semibold text-green-800 mb-2">Booking Information</h4>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">Booking ID:</span> {bookingValidationData.data.booking_id}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">Status:</span> {firstTimePickupData.data.booking.status}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">Scheduled Time:</span> {new Date(bookingValidationData.data.booking_info.scheduled_time).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Selected Slots Display */}
                {selectedSlots.length > 0 && currentAction.title === 'Insert Old Batteries' && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-2xl text-blue-800">Assigned Slots</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {selectedSlots.map((slot) => (
                                    <div key={slot.slot_id} className="bg-white p-4 rounded-lg border-2 border-blue-500 text-center">
                                        <Badge variant="default" className="text-lg px-3 py-1 bg-blue-600">
                                            {slot.slot_number}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Cabinet {slot.cabinet_id}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default SwapStatus;