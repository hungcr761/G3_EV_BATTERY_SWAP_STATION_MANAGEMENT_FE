import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { User, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { userAPI, vehicleAPI } from '../../lib/apiServices';

const UserVerification = () => {
    const { stationId, userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState(null);
    const [userVehicles, setUserVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoNavigate, setAutoNavigate] = useState(false);
    const [countdown, setCountdown] = useState(3);

    // Get user data from location state or fetch from API
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (location.state?.user) {
                    setUserData(location.state.user);
                } else {
                    const response = await userAPI.getById(userId);
                    if (response.data && response.data.success) {
                        setUserData(response.data.payload.user);
                    } else {
                        setError('User information not found');
                        return;
                    }
                }

                // Fetch user's vehicles
                const vehiclesResponse = await vehicleAPI.getByUserId(userId);
                if (vehiclesResponse.data && vehiclesResponse.data.vehicles) {
                    setUserVehicles(vehiclesResponse.data.vehicles);
                }

                // Start auto-navigation countdown after successful data load
                setAutoNavigate(true);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Unable to load user information');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, location.state]);

    // Auto-navigation countdown
    useEffect(() => {
        if (autoNavigate && userVehicles.length > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate(`/kiosk/${stationId}/user/${userId}/vehicle`);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [autoNavigate, userVehicles.length, navigate, stationId, userId]);

    const handleContinue = () => {
        if (userVehicles.length === 0) {
            setError('You have no vehicles. Please add a vehicle in the app before using the service.');
            return;
        }
        // Stop auto-navigation and proceed immediately
        setAutoNavigate(false);
        navigate(`/kiosk/${stationId}/user/${userId}/vehicle`);
    };

    if (loading) {
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

    if (error) {
        return (
            <div className="container mx-auto px-8 py-12">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-red-300 bg-red-50">
                        <CardContent className="p-8">
                            <div className="flex items-start space-x-4">
                                <AlertCircle className="h-12 w-12 text-red-600 flex-shrink-0" />
                                <div>
                                    <h3 className="text-2xl font-bold text-red-800 mb-2">Authentication Error</h3>
                                    <p className="text-xl text-red-600">{error}</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(`/kiosk/${stationId}`)}
                                        className="mt-4"
                                    >
                                        Go Back
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-8 py-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Success Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
                        <CheckCircle2 className="h-16 w-16 text-green-600" />
                    </div>
                    <h1 className="text-5xl font-bold text-green-600">
                        Verification Successful!
                    </h1>
                    <p className="text-2xl text-muted-foreground">
                        Welcome to the battery swap service
                    </p>
                </div>

                {/* User Info Card */}
                <Card className="border-4 border-green-500 shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardTitle className="text-3xl">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <User className="h-16 w-16 text-primary" />
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold mb-2">
                                    {userData?.fullname || 'Customer'}
                                </h2>
                                <p className="text-xl text-muted-foreground mb-1">
                                    {userData?.email || 'N/A'}
                                </p>
                                <p className="text-lg text-muted-foreground">
                                    {userData?.phone_number || 'N/A'}
                                </p>
                            </div>
                            <Badge variant="secondary" className="text-xl px-6 py-3 bg-green-100 text-green-800">
                                Verified
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Continue Button */}
                <div className="text-center space-y-4">
                    {autoNavigate && userVehicles.length > 0 && (
                        <div className="text-2xl text-muted-foreground mb-4">
                            Auto redirect in <span className="font-bold text-primary">{countdown}</span> seconds
                        </div>
                    )}
                    <Button
                        size="lg"
                        onClick={handleContinue}
                        disabled={userVehicles.length === 0}
                        className="text-3xl px-16 py-12 h-auto"
                    >
                        <ArrowRight className="mr-4 h-8 w-8" />
                        {autoNavigate && userVehicles.length > 0 ? 'Continue Now' : 'Continue to Select Vehicle'}
                    </Button>
                </div>

                {/* Help Text */}
                {userVehicles.length === 0 && (
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                                <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-yellow-800 mb-2">
                                        No Vehicles
                                    </h3>
                                    <p className="text-lg text-yellow-700">
                                        Please add a vehicle in the app before using the battery swap service.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default UserVerification;
