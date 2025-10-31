import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Battery, CheckCircle2, AlertCircle, Clock, User, Motorbike } from 'lucide-react';
import { bookingAPI, swapAPI, batteryAPI } from '../../lib/apiServices';

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
    const [vehicleBatteries, setVehicleBatteries] = useState([]);
    const [bookedBatteries, setBookedBatteries] = useState([]);
    const [validationData, setValidationData] = useState(null);
    const [swapResult, setSwapResult] = useState(null);
    const [isUserFlow, setIsUserFlow] = useState(false);
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
                    });
                } else {
                    // Booking flow
                    setIsUserFlow(false);
                    if (location.state?.booking) {
                        const booking = location.state.booking;
                        // Store booked batteries from booking response
                        setBookedBatteries(booking.batteries || []);

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
                            requestedQuantity: booking.batteries?.length || 1,
                        });
                    } else {
                        // Fetch from API
                        const response = await bookingAPI.getById(bookingId);
                        const booking = response.data.booking;

                        // Store booked batteries from booking response
                        setBookedBatteries(booking.batteries || []);

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
                            requestedQuantity: booking.batteries?.length || 1,
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

    // Fetch vehicle batteries
    const fetchVehicleBatteries = async (vehicleId) => {
        try {
            const response = await batteryAPI.getByVehicleId(vehicleId);
            const batteries = response.data || [];
            setVehicleBatteries(batteries);
            return batteries;
        } catch (error) {
            console.error('Error validating first time pickup:', error);
            throw error;
        }
    };

    // Execute swap (for user flow)
    const executeSwap = async (batteryData) => {
        try {
            const currentData = isUserFlow ? userData : bookingData;
            const response = await swapAPI.execute({
                driver_id: isUserFlow ? currentData.userId : currentData.driverId,
                vehicle_id: currentData.vehicleId,
                station_id: parseInt(stationId),
                battery_type_id: currentData.batteryTypeId,
                batteriesIn: batteryData
            });
            return response.data;
        } catch (error) {
            console.error('Error executing swap:', error);
            throw error;
        }
    };

    // Execute swap with booking (for booking flow)
    const executeSwapWithBooking = async (batteryData, batteriesOut) => {
        try {
            const currentData = bookingData;
            const response = await swapAPI.executeWithBooking({
                booking_id: currentData.bookingId,
                driver_id: currentData.driverId,
                vehicle_id: currentData.vehicleId,
                station_id: parseInt(stationId),
                battery_type_id: currentData.batteryTypeId,
                batteriesIn: batteryData,
                batteriesOut: batteriesOut
            });
            return response.data;
        } catch (error) {
            console.error('Error executing swap with booking:', error);
            throw error;
        }
    };

    // Validate and prepare swap (for user flow)
    const validateAndPrepareSwap = async (batteryData) => {
        try {
            const currentData = isUserFlow ? userData : bookingData;
            const response = await swapAPI.validateAndPrepare({
                driver_id: isUserFlow ? currentData.userId : currentData.driverId,
                vehicle_id: currentData.vehicleId,
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

    // Validate with booking (for booking flow)
    const validateSwapWithBooking = async (batteryData) => {
        try {
            const currentData = bookingData;
            const response = await swapAPI.validateWithBooking({
                booking_id: currentData.bookingId,
                driver_id: currentData.driverId,
                vehicle_id: currentData.vehicleId,
                station_id: parseInt(stationId),
                battery_type_id: currentData.batteryTypeId,
                batteriesIn: batteryData
            });
            return response.data;
        } catch (error) {
            console.error('Error validating swap with booking:', error);
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

            // Regular swap flow (both user flow and booking flow)
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

            // Step 3: Fetch vehicle batteries to get battery IDs
            const currentData = isUserFlow ? userData : bookingData;
            setCurrentAction(prev => ({
                ...prev,
                title: 'Fetching Battery Information',
                description: 'Retrieving current battery information from vehicle',
                progress: 40,
                status: 'in_progress'
            }));

            const batteries = await fetchVehicleBatteries(currentData.vehicleId);
            if (batteries.length === 0) {
                setCurrentAction(prev => ({
                    ...prev,
                    title: 'Error',
                    description: 'No batteries found on vehicle',
                    status: 'error'
                }));
                return;
            }

            // Step 4: Select random slots for battery insertion
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
            if (currentAction.title === 'Insert Old Batteries') {
                // Step 5: Validate and prepare (different for user flow vs booking flow)
                try {
                    setCurrentAction({
                        title: 'Validate and Prepare',
                        description: 'System is validating and preparing new batteries',
                        progress: 66,
                        status: 'in_progress',
                        showButton: false
                    });

                    // Prepare battery data for validation - map selected slots with vehicle batteries
                    const batteryData = selectedSlots.map((slot, index) => ({
                        slot_id: slot.slot_id,
                        battery_id: vehicleBatteries[index]?.battery_id || vehicleBatteries[0]?.battery_id
                    }));

                    if (!batteryData.every(b => b.battery_id)) {
                        throw new Error('Missing battery ID information');
                    }

                    let validationResponse;
                    if (isUserFlow) {
                        // User flow: use validateAndPrepare
                        validationResponse = await validateAndPrepareSwap(batteryData);
                    } else {
                        // Booking flow: use validateWithBooking
                        validationResponse = await validateSwapWithBooking(batteryData);
                    }
                    setValidationData(validationResponse);

                    // Check if validation passed
                    if (!validationResponse.ready_to_execute) {
                        setCurrentAction(prev => ({
                            ...prev,
                            title: 'Validation Failed',
                            description: validationResponse.message || 'Unable to proceed with swap',
                            status: 'error'
                        }));
                        return;
                    }

                    // Step 6: Execute swap
                    setCurrentAction({
                        title: 'Executing Swap',
                        description: 'Processing battery swap',
                        progress: 75,
                        status: 'in_progress',
                        showButton: false
                    });

                    let executeResponse;
                    if (isUserFlow) {
                        // User flow: use execute
                        const validBatteriesIn = validationResponse.data?.valid_batteries_in || batteryData;
                        executeResponse = await executeSwap(validBatteriesIn);
                    } else {
                        // Booking flow: use executeWithBooking
                        const validBatteriesIn = validationResponse.data?.valid_batteries_in || batteryData;
                        // Prepare batteriesOut from booked_batteries_out in validation response
                        const batteriesOut = validationResponse.data?.booked_batteries_out?.map(b => ({
                            battery_id: b.battery_id
                        })) || [];
                        executeResponse = await executeSwapWithBooking(validBatteriesIn, batteriesOut);
                    }
                    setSwapResult(executeResponse);

                    // Step 7: Get new batteries - show which slots have batteries ready
                    let batteriesOutInfo = [];
                    if (isUserFlow) {
                        batteriesOutInfo = executeResponse.data?.batteries_out_info || [];
                    } else {
                        // For booking flow, use booked_batteries_out from validation or execute response
                        batteriesOutInfo = executeResponse.data?.batteries_out_info ||
                            validationResponse.data?.booked_batteries_out || [];
                    }

                    // Map slot_id to slot_number from available slots
                    const batteriesOutSlots = batteriesOutInfo.map(b => {
                        // Try to find slot_number from empty slots or use slot_id
                        const slotInfo = emptySlots.find(s => s.slot_id === b.slot_id);
                        return slotInfo?.slot_number || b.slot_number || `Slot ${b.slot_id}`;
                    });

                    setCurrentAction({
                        title: 'Get New Batteries',
                        description: `New batteries are ready at slots: ${batteriesOutSlots.join(', ')}. Please take the batteries.`,
                        progress: 83,
                        status: 'in_progress',
                        showButton: true,
                        buttonText: 'Batteries Retrieved'
                    });

                } catch (error) {
                    console.error('Error in swap process:', error);
                    setCurrentAction(prev => ({
                        ...prev,
                        title: 'Error',
                        description: error.message || 'Unable to complete battery swap',
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

                {/* Selected Slots Display */}
                {selectedSlots.length > 0 && currentAction.title === 'Insert Old Batteries' && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-2xl text-blue-800">Assigned Slots</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {selectedSlots.map((slot, index) => {
                                    const battery = vehicleBatteries[index];
                                    return (
                                        <div key={slot.slot_id} className="bg-white p-4 rounded-lg border-2 border-blue-500 text-center">
                                            <Badge variant="default" className="text-lg px-3 py-1 bg-blue-600">
                                                {slot.slot_number}
                                            </Badge>
                                            {battery && (
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    <p>Battery: {battery.battery_serial || battery.battery_id.slice(0, 8)}</p>
                                                    <p>SOC: {battery.current_soc}% | SOH: {battery.current_soh}%</p>
                                                </div>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Cabinet {slot.cabinet_id}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Swap Result Display */}
                {swapResult && currentAction.title === 'Get New Batteries' && (
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                            <CardTitle className="text-2xl text-green-800">Batteries Ready for Pickup</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-xl text-green-700 mb-2">
                                        {swapResult.message || 'Swap completed successfully'}
                                    </p>
                                    {swapResult.data?.swap_summary && (
                                        <p className="text-lg text-green-600">
                                            Swapped {swapResult.data.swap_summary.batteries_in} battery/batteries
                                        </p>
                                    )}
                                </div>
                                {((swapResult.data?.batteries_out_info && swapResult.data.batteries_out_info.length > 0) ||
                                    (validationData?.data?.booked_batteries_out && validationData.data.booked_batteries_out.length > 0)) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(swapResult.data?.batteries_out_info || validationData?.data?.booked_batteries_out || []).map((battery, index) => {
                                                // Handle both user flow (batteries_out_info) and booking flow (booked_batteries_out) formats
                                                const slotId = battery.slot_id;
                                                const slotNumber = battery.slot_number;
                                                const soc = battery.soc || battery.current_soc;
                                                const soh = battery.soh || battery.current_soh;
                                                const serial = battery.battery_serial;

                                                const slotInfo = emptySlots.find(s => s.slot_id === slotId);
                                                const displaySlot = slotNumber || slotInfo?.slot_number || `Slot ${slotId}`;

                                                return (
                                                    <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                                                        <h4 className="font-semibold text-green-800 mb-2">
                                                            Battery #{index + 1}
                                                        </h4>
                                                        <div className="space-y-1 text-sm">
                                                            <p className="text-muted-foreground">
                                                                <span className="font-medium">Slot:</span> {displaySlot}
                                                            </p>
                                                            {serial && (
                                                                <p className="text-muted-foreground">
                                                                    <span className="font-medium">Serial:</span> {serial}
                                                                </p>
                                                            )}
                                                            <p className="text-muted-foreground">
                                                                <span className="font-medium">SOC:</span> {soc}%
                                                            </p>
                                                            <p className="text-muted-foreground">
                                                                <span className="font-medium">SOH:</span> {soh}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default SwapStatus;