import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CheckCircle2, Battery, Clock, Star, Download, Mail } from 'lucide-react';
import { bookingAPI } from '../../lib/apiServices';

const SwapComplete = () => {
    const { stationId, bookingId } = useParams();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(30);
    const [swapData, setSwapData] = useState(null);

    // Fetch swap data
    useEffect(() => {
        const fetchSwapData = async () => {
            try {
                const response = await bookingAPI.getById(bookingId);
                const booking = response.data.booking;

                setSwapData({
                    bookingId: booking.booking_id,
                    userName: booking.driver?.fullname || 'Customer',
                    vehicleModel: booking.vehicle?.model?.name || 'Unknown Model',
                    vehiclePlate: booking.vehicle?.license_plate || 'N/A',
                    oldBatteryLevel: '15%', // Would come from battery data
                    newBatteryLevel: '100%',
                    swapDuration: '4 phút 32 giây', // Would be calculated
                    completedTime: new Date().toLocaleString('en-US'),
                    stationName: booking.station?.station_name || `Station #${stationId}`,
                    cost: '50,000 VNĐ', // Would come from pricing
                    nextServiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')
                });
            } catch (error) {
                console.error('Error fetching swap data:', error);
                // Fallback to mock data
                setSwapData({
                    bookingId: bookingId,
                    userName: 'hung le',
                    vehicleModel: 'VinFast Klara S',
                    vehiclePlate: '30B-98761',
                    oldBatteryLevel: '15%',
                    newBatteryLevel: '100%',
                    swapDuration: '4 phút 32 giây',
                    completedTime: new Date().toLocaleString('en-US'),
                    stationName: `Trạm #${stationId}`,
                    cost: '50,000 VNĐ',
                    nextServiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')
                });
            }
        };

        fetchSwapData();
    }, [bookingId, stationId]);

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
                                <div>
                                    <p className="text-muted-foreground mb-1">Booking ID</p>
                                    <p className="font-bold text-2xl">{swapData.bookingId}</p>
                                </div>
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
                                <div>
                                    <p className="text-muted-foreground mb-1">Cost</p>
                                    <p className="font-bold text-3xl text-green-600">{swapData.cost}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Battery Info */}
                <Card>
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <Battery className="h-16 w-16 text-green-600" />
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-2">New Batteries Installed</h3>
                                <p className="text-xl text-muted-foreground">
                                    Your batteries are now at <strong className="text-green-600">100%</strong> and ready
                                    for approximately <strong>200km</strong> of travel
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Next Service Reminder */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <Clock className="h-12 w-12 text-blue-600" />
                            <div>
                                <h3 className="text-2xl font-bold text-blue-800 mb-2">
                                    Next Maintenance Schedule
                                </h3>
                                <p className="text-xl text-blue-700">
                                    Recommended vehicle maintenance on: <strong>{swapData.nextServiceDate}</strong>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-xl py-6 h-auto"
                            onClick={() => alert('Email functionality will be implemented soon')}
                        >
                            <Mail className="mr-2 h-6 w-6" />
                            Send Invoice via Email
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-xl py-6 h-auto"
                            onClick={() => alert('Print invoice functionality will be implemented soon')}
                        >
                            <Download className="mr-2 h-6 w-6" />
                            Print Invoice
                        </Button>
                    </div>
                </div>

                {/* Rating Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">Service Rating</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <p className="text-xl text-muted-foreground mb-6">
                            Please rate your experience
                        </p>
                        <div className="flex justify-center space-x-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    className="hover:scale-110 transition-transform"
                                    onClick={() => {
                                        alert(`Thank you for rating ${star} stars!`);
                                    }}
                                >
                                    <Star className="h-16 w-16 text-yellow-400 hover:text-yellow-500 fill-yellow-400" />
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

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

