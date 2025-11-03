import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Battery, QrCode, AlertCircle, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import QRScanner from '../../components/Kiosk/QRScanner';
import { stationAPI, bookingAPI, userAPI } from '../../lib/apiServices';

const KioskHome = () => {
    const navigate = useNavigate();
    const { stationId } = useParams();
    const [showScanner, setShowScanner] = useState(false);
    const [scanMode, setScanMode] = useState(null); // 'booking' or 'user'
    const [error, setError] = useState(null);
    const [validating, setValidating] = useState(false);
    const [stationInfo, setStationInfo] = useState(null);

    // Fetch station info on mount
    useEffect(() => {
        const fetchStation = async () => {
            try {
                const response = await stationAPI.getById(stationId);
                if (response.data && response.data.success) {
                    const station = response.data.payload.station;
                    setStationInfo({
                        id: station.station_id,
                        name: station.station_name,
                        address: station.address,
                        status: station.status
                    });
                }
            } catch (error) {
                console.error('Error fetching station:', error);
            }
        };

        if (stationId) {
            fetchStation();
        }
    }, [stationId]);

    const handleQRScan = async (qrCode) => {
        setValidating(true);
        setError(null);

        try {
            if (scanMode === 'booking') {
                // Only try booking validation
                await validateBooking(qrCode);
            } else if (scanMode === 'user') {
                // Only try user validation
                await validateUser(qrCode);
            } else {
                // Fallback: try both (for backward compatibility)
                try {
                    await validateBooking(qrCode);
                } catch (bookingError) {
                    try {
                        await validateUser(qrCode);
                    } catch (userError) {
                        setError('Invalid QR code. Please check your booking code or account code.');
                        setValidating(false);
                    }
                }
            }
        } catch (error) {
            console.error('Error processing QR code:', error);
            setError('Unable to process QR code. Please try again.');
            setValidating(false);
        }
    };

    const validateBooking = async (bookingId) => {
        try {
            // Fetch booking details from backend
            const response = await bookingAPI.getById(bookingId);
            const bookingData = response.data;

            // Check if response is valid
            if (!bookingData || !bookingData.booking) {
                throw new Error('Booking not found');
            }

            const booking = bookingData.booking;

            // VALIDATION 1: Check if booking is for this station
            if (booking.station_id !== parseInt(stationId)) {
                const wrongStationName = booking.station?.station_name || `Station #${booking.station_id}`;
                setError(
                    `❌ Wrong Station!\n\n` +
                    `This booking is for: ${wrongStationName}\n` +
                    `You are at: ${stationInfo?.name || `Station #${stationId}`}\n\n` +
                    `Please go to the correct station or cancel and create a new booking.`
                );
                setValidating(false);
                return;
            }

            // VALIDATION 2: Check if booking is still valid (not expired)
            if (booking.scheduled_end_time) {
                const bookingEndTime = new Date(booking.scheduled_end_time);
                const now = new Date();
                if (now > bookingEndTime) {
                    setError(
                        `❌ Booking Expired!\n\n` +
                        `Expiration time: ${bookingEndTime.toLocaleString('en-US')}\n` +
                        `Current time: ${now.toLocaleString('en-US')}\n\n` +
                        `Please create a new booking through the app or website.`
                    );
                    setValidating(false);
                    return;
                }
            }

            // VALIDATION 3: Check booking status
            if (booking.status === 'completed') {
                setError(
                    `❌ Booking Already Used!\n\n` +
                    `This booking has been completed.\n` +
                    `If you need to swap batteries again, please create a new booking.`
                );
                setValidating(false);
                return;
            }

            if (booking.status === 'cancelled') {
                setError(
                    `❌ Booking Cancelled!\n\n` +
                    `Please create a new booking to use the service.`
                );
                setValidating(false);
                return;
            }

            // All validations passed - proceed to swap
            console.log('✅ Booking validated:', booking);
            navigate(`/kiosk/${stationId}/swap/${bookingId}`, {
                state: { booking } // Pass booking data to next screen
            });

        } catch (error) {
            console.error('Error validating booking:', error);
            throw error; // Re-throw to be caught by the calling function
        }
    };

    const validateUser = async (accountId) => {
        try {
            // Fetch user details from backend using /user/id/{account_id}
            const response = await userAPI.getById(accountId);
            const userData = response.data;

            // Check if response is valid
            if (!userData || !userData.success) {
                throw new Error('User not found');
            }

            const user = userData.payload.user;

            // VALIDATION: Check if account is active
            if (user.status && user.status.toLowerCase() !== 'active') {
                setError(
                    `❌ Account Suspended!\n\n` +
                    `Please contact customer support to activate your account.\n\n` +
                    `You cannot proceed with battery swap until your account is activated.`
                );
                setValidating(false);
                return;
            }

            // Navigate to user flow
            console.log('✅ User validated:', user);
            navigate(`/kiosk/${stationId}/user/${accountId}`, {
                state: { user } // Pass user data to next screen
            });

        } catch (error) {
            console.error('Error validating user:', error);
            throw error; // Re-throw to be caught by the calling function
        }
    };

    const handleScan = (qrCode) => {
        console.log('Scanned QR code:', qrCode);
        handleQRScan(qrCode);
    };

    const handleManualEntry = (qrCode) => {
        console.log('Manual QR code:', qrCode);
        handleQRScan(qrCode);
    };

    return (
        <div className="container mx-auto px-8 py-12">
            {!showScanner ? (
                // Welcome Screen
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* Hero Section */}
                    <div className="text-center space-y-6">
                        <Battery className="h-32 w-32 text-primary mx-auto" />
                        <h1 className="text-6xl font-bold text-primary">
                            Welcome to Battery Swap Station
                        </h1>
                        <p className="text-3xl text-muted-foreground max-w-3xl mx-auto">
                            Fast, safe and convenient battery swapping in minutes
                        </p>
                    </div>

                    {/* Main Action Card */}
                    <Card className="border-4 shadow-2xl">
                        <CardHeader className="text-center space-y-4 pb-6">
                            <CardTitle className="text-4xl">Start Battery Swap</CardTitle>
                            <CardDescription className="text-2xl">
                                Choose the type of QR code you want to scan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-12 space-y-6">
                            {/* Booking QR Button */}
                            <Button
                                size="lg"
                                onClick={() => {
                                    setScanMode('booking');
                                    setShowScanner(true);
                                }}
                                className="w-full text-3xl py-12 h-auto"
                            >
                                <QrCode className="mr-4 h-10 w-10" />
                                Scan Booking QR Code
                            </Button>

                            {/* Account QR Button */}
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => {
                                    setScanMode('user');
                                    setShowScanner(true);
                                }}
                                className="w-full text-3xl py-12 h-auto"
                            >
                                <QrCode className="mr-4 h-10 w-10" />
                                Scan Account QR Code
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Instructions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">Usage Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-6 text-2xl">
                                <li className="flex items-start space-x-4">
                                    <span className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                        1
                                    </span>
                                    <div>
                                        <p className="font-semibold">Choose QR code type</p>
                                        <p className="text-xl text-muted-foreground">
                                            Booking QR (pre-booked) or Account QR (walk-in)
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-4">
                                    <span className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                        2
                                    </span>
                                    <div>
                                        <p className="font-semibold">Scan QR code</p>
                                        <p className="text-xl text-muted-foreground">
                                            Use QR code from email, app or account
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-4">
                                    <span className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                        3
                                    </span>
                                    <div>
                                        <p className="font-semibold">Park in position</p>
                                        <p className="text-xl text-muted-foreground">
                                            Follow the instructions on screen
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-4">
                                    <span className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                        4
                                    </span>
                                    <div>
                                        <p className="font-semibold">Follow battery swap instructions</p>
                                        <p className="text-xl text-muted-foreground">
                                            Battery swap time: 3-5 minutes
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-4">
                                    <span className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                        5
                                    </span>
                                    <div>
                                        <p className="font-semibold">Complete and depart</p>
                                        <p className="text-xl text-muted-foreground">
                                            Receive completion notification and continue your journey
                                        </p>
                                    </div>
                                </li>
                            </ol>
                        </CardContent>
                    </Card>

                </div>
            ) : (
                // Scanner Screen
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                                setShowScanner(false);
                                setScanMode(null);
                                setError(null);
                            }}
                            className="text-xl px-8 py-6 h-auto"
                        >
                            ← Go Back
                        </Button>
                    </div>

                    {error && (
                        <Card className="mb-8 bg-red-50 border-red-300 border-4">
                            <CardContent className="p-8">
                                <div className="flex items-start space-x-4">
                                    <AlertCircle className="h-12 w-12 text-red-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-2xl font-bold text-red-800 mb-2">Authentication Error</p>
                                        <p className="text-xl text-red-700 whitespace-pre-line">{error}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {validating && (
                        <Card className="mb-8 bg-blue-50 border-blue-300 border-4">
                            <CardContent className="p-8">
                                <div className="flex items-center space-x-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-800">Validating booking...</p>
                                        <p className="text-xl text-blue-600">Please wait a moment</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <QRScanner
                        onScan={handleScan}
                        onManualEntry={handleManualEntry}
                    />
                </div>
            )}
        </div>
    );
};

export default KioskHome;


