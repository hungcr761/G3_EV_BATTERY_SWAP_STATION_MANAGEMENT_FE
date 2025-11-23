import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CheckCircle2, Battery, Clock, Star, Download, Mail, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { bookingAPI } from '../../lib/apiServices';

const SwapComplete = () => {
    const { stationId, bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [countdown, setCountdown] = useState(30);
    const [swapData, setSwapData] = useState(null);
    const [isUserFlow, setIsUserFlow] = useState(false);
    const [batteriesIn, setBatteriesIn] = useState([]);
    const [batteriesOut, setBatteriesOut] = useState([]);

    // Helper function to calculate average SOC from batteries
    const calculateAverageSOC = (batteries) => {
        if (!batteries || batteries.length === 0) return null;

        const validSOCs = batteries
            .map(b => b.current_soc || b.soc || null)
            .filter(soc => soc !== null && soc !== undefined);

        if (validSOCs.length === 0) return null;

        const sum = validSOCs.reduce((acc, soc) => acc + (typeof soc === 'number' ? soc : parseFloat(soc)), 0);
        return Math.round(sum / validSOCs.length);
    };

    // Helper function to calculate and format swap duration
    const calculateSwapDuration = (startTime, endTime = new Date()) => {
        if (!startTime) {
            return 'N/A';
        }

        // Handle both Date objects and string timestamps
        const start = startTime instanceof Date ? startTime : new Date(startTime);
        const end = endTime instanceof Date ? endTime : new Date(endTime);

        // Check if dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return 'N/A';
        }

        // Calculate difference in milliseconds
        const diffMs = end.getTime() - start.getTime();

        // Convert to seconds
        const totalSeconds = Math.floor(diffMs / 1000);

        // Calculate minutes and seconds
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        // Format in Vietnamese
        if (minutes > 0) {
            return `${minutes} minutes ${seconds} seconds`;
        } else {
            return `${seconds} seconds`;
        }
    };

    // Fetch swap data
    useEffect(() => {
        const fetchSwapData = async () => {
            // Check if data is passed from previous page (location.state)
            const stateData = location.state;

            // Determine if this is user flow (no booking) or booking flow
            // User flow: has userData or userId in state, no bookingId in URL params that matches booking format
            // Booking flow: has bookingId that we can fetch from API

            const hasStateData = stateData && (stateData.userData || stateData.bookingData || stateData.swapResult);
            const isUserFlowRoute = stateData?.isUserFlow || (stateData?.userData && !stateData?.bookingData);

            // Calculate battery levels from swap result
            let oldBatteryLevel = 'N/A';
            let newBatteryLevel = 'N/A';
            let swapDuration = 'N/A';

            // Calculate swap duration from start time
            if (stateData?.swapStartTime) {
                // Prefer swapEndTime from state, then swap result completion time, then current time
                const endTime = stateData?.swapEndTime
                    ? (stateData.swapEndTime instanceof Date ? stateData.swapEndTime : new Date(stateData.swapEndTime))
                    : (stateData?.swapResult?.data?.completed_at
                        ? new Date(stateData.swapResult.data.completed_at)
                        : new Date());
                swapDuration = calculateSwapDuration(stateData.swapStartTime, endTime);
            } else if (stateData?.swapResult?.data?.started_at && stateData?.swapResult?.data?.completed_at) {
                // Fallback: use timestamps from swap result if available
                swapDuration = calculateSwapDuration(
                    stateData.swapResult.data.started_at,
                    stateData.swapResult.data.completed_at
                );
            }

            // Extract battery information
            let batteriesOutList = [];
            let batteriesInList = [];

            if (stateData?.swapResult) {
                const swapResult = stateData.swapResult;

                // Get batteries OUT (removed from vehicle) - these are the old batteries
                if (stateData.vehicleBatteries && stateData.vehicleBatteries.length > 0) {
                    batteriesOutList = stateData.vehicleBatteries;
                    const avgOldSOC = calculateAverageSOC(stateData.vehicleBatteries);
                    oldBatteryLevel = avgOldSOC !== null ? `${avgOldSOC}%` : 'N/A';
                } else if (swapResult.data?.batteries_in_info && swapResult.data.batteries_in_info.length > 0) {
                    // Fallback: batteries_in_info contains batteries that went into the station (removed from vehicle)
                    batteriesOutList = swapResult.data.batteries_in_info;
                    const avgOldSOC = calculateAverageSOC(swapResult.data.batteries_in_info);
                    oldBatteryLevel = avgOldSOC !== null ? `${avgOldSOC}%` : 'N/A';
                }

                // Get batteries IN (given to user) - these are the new batteries
                if (swapResult.data?.batteries_out_info && swapResult.data.batteries_out_info.length > 0) {
                    batteriesInList = swapResult.data.batteries_out_info;
                } else if (stateData.validationData?.data?.booked_batteries_out && stateData.validationData.data.booked_batteries_out.length > 0) {
                    batteriesInList = stateData.validationData.data.booked_batteries_out;
                } else if (swapResult.data?.booked_batteries_out && swapResult.data.booked_batteries_out.length > 0) {
                    batteriesInList = swapResult.data.booked_batteries_out;
                }

                if (batteriesInList.length > 0) {
                    const avgNewSOC = calculateAverageSOC(batteriesInList);
                    newBatteryLevel = avgNewSOC !== null ? `${avgNewSOC}%` : 'N/A';
                }
            }

            // Set battery lists
            setBatteriesOut(batteriesOutList);
            setBatteriesIn(batteriesInList);

            if (hasStateData && isUserFlowRoute) {
                // User flow (no booking) - use data from location.state
                setIsUserFlow(true);
                const userData = stateData.userData || {};
                const swapResult = stateData.swapResult || {};
                console.log(userData)
                setSwapData({
                    bookingId: null, // No booking ID for user flow
                    userName: userData.userName || 'Customer',
                    vehicleModel: userData.vehicleModel || 'Unknown Model',
                    vehiclePlate: userData.vehiclePlate || 'N/A',
                    oldBatteryLevel: oldBatteryLevel,
                    newBatteryLevel: newBatteryLevel,
                    swapDuration: swapDuration,
                    completedTime: new Date().toLocaleString('en-US'),
                    stationName: userData.stationName || `Station #${stationId}`,
                });
            } else if (bookingId) {
                // Booking flow - try to fetch from API
                setIsUserFlow(false);
                try {
                    // Try to get from state first (faster, avoids API call)
                    if (stateData?.bookingData) {
                        const booking = stateData.bookingData;
                        console.log(booking)
                        setSwapData({
                            bookingId: booking.booking_id || bookingId,
                            userName: booking.driver?.fullname || booking.userName || 'Customer',
                            vehicleModel: booking.vehicle?.model?.name || booking.vehicleModel || 'Unknown Model',
                            vehiclePlate: booking.vehicle?.license_plate || booking.vehiclePlate || 'N/A',
                            oldBatteryLevel: oldBatteryLevel,
                            newBatteryLevel: newBatteryLevel,
                            swapDuration: swapDuration,
                            completedTime: new Date().toLocaleString('en-US'),
                            stationName: booking.station?.station_name || booking.stationName || `Station #${stationId}`,
                            // cost: stateData.swapResult?.data?.cost || '50,000 VNĐ', // Would come from pricing
                            nextServiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')
                        });
                    } else {

                        // Fetch from API if not in state
                        const response = await bookingAPI.getById(bookingId);
                        const booking = response.data.booking;
                        console.log(booking)
                        setSwapData({
                            bookingId: booking.booking_id,
                            userName: booking.driver?.fullname || 'Customer',
                            vehicleModel: booking.vehicle?.model?.name || 'Unknown Model',
                            vehiclePlate: booking.vehicle?.license_plate || 'N/A',
                            oldBatteryLevel: oldBatteryLevel,
                            newBatteryLevel: newBatteryLevel,
                            swapDuration: swapDuration,
                            completedTime: new Date().toLocaleString('en-US'),
                            stationName: booking.station?.station_name,
                            // cost: '50,000 VNĐ', // Would come from pricing
                        });
                    }
                } catch (error) {
                    console.error('Error fetching swap data:', error);
                    // If API call fails, try to use state data as fallback
                    if (stateData?.bookingData) {
                        const booking = stateData.bookingData;
                        setSwapData({
                            bookingId: booking.booking_id || bookingId,
                            userName: booking.driver?.fullname || booking.userName || 'Customer',
                            vehicleModel: booking.vehicle?.model?.name || booking.vehicleModel || 'Unknown Model',
                            vehiclePlate: booking.vehicle?.license_plate || booking.vehiclePlate || 'N/A',
                            oldBatteryLevel: oldBatteryLevel,
                            newBatteryLevel: newBatteryLevel,
                            swapDuration: swapDuration,
                            completedTime: new Date().toLocaleString('en-US'),
                            stationName: booking.station?.station_name || booking.stationName || `Station #${stationId}`
                        });
                    }
                }
            } else {
                // No data available - should not happen, but handle gracefully
                console.warn('No swap data available');
                setSwapData({
                    bookingId: null,
                    userName: 'Customer',
                    vehicleModel: 'Unknown Model',
                    vehiclePlate: 'N/A',
                    oldBatteryLevel: oldBatteryLevel !== 'N/A' ? oldBatteryLevel : 'N/A',
                    newBatteryLevel: newBatteryLevel !== 'N/A' ? newBatteryLevel : 'N/A',
                    swapDuration: swapDuration,
                    completedTime: new Date().toLocaleString('en-US'),
                    stationName: `Station #${stationId}`
                });
            }
        };

        fetchSwapData();
    }, [bookingId, stationId, location.state]);

    // Auto redirect countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate(`/kiosk/${stationId}`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, stationId]);

    const handleFinish = () => {
        navigate(`/kiosk/${stationId}`);
    };

    if (!swapData) {
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
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Success Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-green-100 rounded-full">
                        <CheckCircle2 className="h-20 w-20 text-green-600" />
                    </div>
                    <h1 className="text-6xl font-bold text-green-600">
                        Battery Swap Successful!
                    </h1>
                    <p className="text-3xl text-muted-foreground">
                        Your vehicle is ready to continue your journey
                    </p>
                </div>
                {/* Swap Summary Card */}
                <Card className="border-4 border-green-500 shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardTitle className="text-4xl">Battery Swap Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6 text-xl">
                                {!isUserFlow && swapData.bookingId && (
                                    <div>
                                        <p className="text-muted-foreground mb-1">Booking ID</p>
                                        <p className="font-bold text-2xl">{swapData.bookingId}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-muted-foreground mb-1">Customer</p>
                                    <p className="font-semibold text-2xl">{swapData.userName}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Vehicle</p>
                                    <p className="font-semibold text-2xl">{swapData.vehicleModel}</p>
                                    <p className="text-lg text-muted-foreground">{swapData.vehiclePlate}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Battery Swap Station</p>
                                    <p className="font-semibold text-2xl">{swapData.stationName}</p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6 text-xl">
                                <div>
                                    <p className="text-muted-foreground mb-1">Completion Time</p>
                                    <p className="font-semibold text-2xl">{swapData.completedTime}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Swap Duration</p>
                                    <p className="font-semibold text-2xl text-green-600">
                                        {swapData.swapDuration}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Battery Level</p>
                                    <div className="flex items-center space-x-3">
                                        <Badge variant="outline" className="text-lg px-3 py-1">
                                            {swapData.oldBatteryLevel}
                                        </Badge>
                                        <span className="text-2xl">→</span>
                                        <Badge variant="default" className="text-lg px-3 py-1 bg-green-500">
                                            {swapData.newBatteryLevel}
                                        </Badge>
                                    </div>
                                </div>
                                {/* <div>
                                    <p className="text-muted-foreground mb-1">Cost</p>
                                    <p className="font-bold text-3xl text-green-600">{swapData.cost}</p>
                                </div> */}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Battery Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Batteries OUT (Removed from Vehicle) */}
                    {batteriesOut.length > 0 && (
                        <Card className="border-2 border-red-200">
                            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
                                <CardTitle className="text-2xl flex items-center gap-3 text-red-800">
                                    <ArrowDownCircle className="h-6 w-6" />
                                    Batteries Removed
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {batteriesOut.length} battery{batteriesOut.length > 1 ? 'ies' : ''} removed from your vehicle
                                </p>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {batteriesOut.map((battery, index) => {
                                        const batteryId = battery.battery_id || battery.id || 'N/A';
                                        const batterySerial = battery.battery_serial || battery.serial_number || battery.serial || 'N/A';
                                        const soc = battery.current_soc || battery.soc || 'N/A';
                                        const soh = battery.current_soh || battery.soh || 'N/A';
                                        const displayId = batterySerial !== 'N/A' ? batterySerial : (batteryId !== 'N/A' ? batteryId : `Battery ${index + 1}`);
                                        const uniqueKey = batteryId !== 'N/A' ? batteryId : (batterySerial !== 'N/A' ? batterySerial : `battery-out-${index}`);

                                        return (
                                            <div key={uniqueKey} className="bg-red-50 p-4 rounded-lg border border-red-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-lg font-semibold text-red-800">
                                                        Battery #{index + 1}
                                                    </h4>
                                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                                        {soc !== 'N/A' ? `${soc}%` : 'N/A'}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground font-medium">Serial/ID:</span>
                                                        <span className="font-semibold">{displayId}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground font-medium">SOC:</span>
                                                        <span className="font-semibold">{soc !== 'N/A' ? `${soc}%` : 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground font-medium">SOH:</span>
                                                        <span className="font-semibold">{soh !== 'N/A' ? `${soh}%` : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Batteries IN (Given to User) */}
                    {batteriesIn.length > 0 && (
                        <Card className="border-2 border-green-200">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                                <CardTitle className="text-2xl flex items-center gap-3 text-green-800">
                                    <ArrowUpCircle className="h-6 w-6" />
                                    Batteries Installed
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {batteriesIn.length} battery{batteriesIn.length > 1 ? 'ies' : ''} installed in your vehicle
                                </p>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {batteriesIn.map((battery, index) => {
                                        const batteryId = battery.battery_id || battery.id || 'N/A';
                                        const batterySerial = battery.battery_serial || battery.serial_number || battery.serial || 'N/A';
                                        const soc = battery.current_soc || battery.soc || 'N/A';
                                        const soh = battery.current_soh || battery.soh || 'N/A';
                                        const slotId = battery.slot_id;
                                        const slotNumber = battery.slot_number;
                                        const displayId = batterySerial !== 'N/A' ? batterySerial : (batteryId !== 'N/A' ? batteryId : `Battery ${index + 1}`);
                                        const uniqueKey = batteryId !== 'N/A' ? batteryId : (batterySerial !== 'N/A' ? batterySerial : `battery-in-${index}`);

                                        return (
                                            <div key={uniqueKey} className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-lg font-semibold text-green-800">
                                                        Battery #{index + 1}
                                                    </h4>
                                                    <Badge variant="default" className="bg-green-500 text-white">
                                                        {soc !== 'N/A' ? `${soc}%` : 'N/A'}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground font-medium">Serial/ID:</span>
                                                        <span className="font-semibold">{displayId}</span>
                                                    </div>
                                                    {(slotId || slotNumber) && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground font-medium">Slot:</span>
                                                            <span className="font-semibold">{slotNumber || `Slot ${slotId}`}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground font-medium">SOC:</span>
                                                        <span className="font-semibold text-green-600">{soc !== 'N/A' ? `${soc}%` : 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground font-medium">SOH:</span>
                                                        <span className="font-semibold text-green-600">{soh !== 'N/A' ? `${soh}%` : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Battery Summary Info */}
                {(batteriesOut.length > 0 || batteriesIn.length > 0) && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-6">
                                <Battery className="h-16 w-16 text-blue-600" />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold mb-2">Battery Swap Summary</h3>
                                    <p className="text-xl text-muted-foreground">
                                        {batteriesOut.length > 0 && batteriesIn.length > 0 ? (
                                            <>
                                                Swapped <strong className="text-blue-600">{batteriesOut.length} battery{batteriesOut.length > 1 ? 'ies' : ''}</strong> from{' '}
                                                <strong className="text-red-600">{swapData.oldBatteryLevel}</strong> to{' '}
                                                <strong className="text-green-600">{swapData.newBatteryLevel}</strong>
                                            </>
                                        ) : batteriesIn.length > 0 ? (
                                            <>
                                                Installed <strong className="text-green-600">{batteriesIn.length} battery{batteriesIn.length > 1 ? 'ies' : ''}</strong> at{' '}
                                                <strong className="text-green-600">{swapData.newBatteryLevel}</strong>
                                            </>
                                        ) : (
                                            <>
                                                Removed <strong className="text-red-600">{batteriesOut.length} battery{batteriesOut.length > 1 ? 'ies' : ''}</strong> at{' '}
                                                <strong className="text-red-600">{swapData.oldBatteryLevel}</strong>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Button
                        size="lg"
                        onClick={handleFinish}
                        className="w-full text-3xl py-10 h-auto"
                    >
                        <CheckCircle2 className="mr-3 h-8 w-8" />
                        Complete ({countdown}s)
                    </Button>

                </div>


                {/* Thank You Message */}
                <div className="text-center py-8">
                    <p className="text-3xl font-semibold text-primary">
                        Thank you for using G3 services!
                    </p>
                    <p className="text-2xl text-muted-foreground mt-2">
                        Have a safe and pleasant journey
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SwapComplete;

