import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Motorbike, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { vehicleAPI, subscriptionAPI } from '../../lib/apiServices';

const UserVehicleSelection = () => {
    const { stationId, userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to make battery type names more user-friendly
    const getBatteryDisplayName = (batteryTypeCode) => {
        const batteryNames = {
            'NMC-50': 'NMC 50kWh',
            'LFP-60': 'LFP 60kWh',
            'NMC-100': 'NMC 100kWh',
            'LFP-80': 'LFP 80kWh'
        };
        return batteryNames[batteryTypeCode] || batteryTypeCode;
    };

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                // Fetch vehicles by user ID with complete model and battery information
                const response = await vehicleAPI.getByUserId(userId);
                const vehiclesData = response.data?.vehicles || [];

                // Fetch subscription data for each vehicle
                const vehiclesWithSubscriptions = await Promise.all(
                    vehiclesData.map(async (vehicle) => {
                        try {
                            // Fetch subscription data
                            const subscriptionResponse = await subscriptionAPI.getByVehicleId(vehicle.vehicle_id);
                            const subscriptionData = subscriptionResponse.data;

                            // Check if vehicle has active subscription
                            const hasActiveSubscription = subscriptionData?.payload?.subscription?.some(
                                sub => sub.status === 'active'
                            ) || false;

                            const modelName = vehicle.model?.name || 'Unknown Model';
                            const batteryTypeCode = vehicle.model?.batteryType?.battery_type_code || 'Unknown';
                            const batteryCapacity = vehicle.model?.batteryType?.nominal_capacity || 'N/A';
                            const batterySlots = vehicle.model?.battery_slot || 1;

                            return {
                                ...vehicle,
                                modelName,
                                batteryType: getBatteryDisplayName(batteryTypeCode),
                                batteryTypeCode,
                                batteryCapacity,
                                batterySlots,
                                hasActiveSubscription,
                                subscription: subscriptionData?.payload?.subscription || []
                            };
                        } catch (subscriptionError) {
                            console.error(`Error fetching subscription for vehicle ${vehicle.vehicle_id}:`, subscriptionError);
                            // If subscription fetch fails, assume no subscription
                            const modelName = vehicle.model?.name || 'Unknown Model';
                            const batteryTypeCode = vehicle.model?.batteryType?.battery_type_code || 'Unknown';
                            const batteryCapacity = vehicle.model?.batteryType?.nominal_capacity || 'N/A';
                            const batterySlots = vehicle.model?.battery_slot || 1;

                            return {
                                ...vehicle,
                                modelName,
                                batteryType: getBatteryDisplayName(batteryTypeCode),
                                batteryTypeCode,
                                batteryCapacity,
                                batterySlots,
                                hasActiveSubscription: false,
                                subscription: []
                            };
                        }
                    })
                );

                setVehicles(vehiclesWithSubscriptions);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
                setError('Unable to load vehicle list');
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
    };

    const handleContinue = () => {
        if (!selectedVehicle || !selectedVehicle.hasActiveSubscription) return;
        navigate(`/kiosk/${stationId}/user/${userId}/battery`, {
            state: {
                selectedVehicle
            }
        });
    };

    const handleBack = () => {
        navigate(`/kiosk/${stationId}/user/${userId}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-8 py-12">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto mb-6"></div>
                        <p className="text-2xl text-muted-foreground">Loading vehicle list...</p>
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
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-red-800 mb-2">Error</h3>
                                <p className="text-xl text-red-600">{error}</p>
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="mt-4"
                                >
                                    Go Back
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-8 py-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-primary">Select Vehicle</h1>
                    <p className="text-2xl text-muted-foreground">
                        Choose the vehicle you want to swap batteries for
                    </p>
                </div>

                {/* Vehicle List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vehicles.map((vehicle) => (
                        <Card
                            key={vehicle.vehicle_id}
                            className={`transition-all ${!vehicle.hasActiveSubscription
                                ? 'border-2 border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                                : selectedVehicle?.vehicle_id === vehicle.vehicle_id
                                    ? 'border-4 border-primary shadow-xl scale-105 cursor-pointer'
                                    : 'border-2 border-gray-200 hover:border-primary hover:shadow-lg cursor-pointer'
                                }`}
                            onClick={() => vehicle.hasActiveSubscription && handleVehicleSelect(vehicle)}
                        >
                            <CardContent className="p-8">
                                <div className="flex items-center space-x-6">
                                    <div className="flex-shrink-0">
                                        <Motorbike className="h-16 w-16 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold mb-2">
                                            {vehicle.modelName}
                                        </h3>
                                        <p className="text-xl text-muted-foreground mb-2">
                                            {vehicle.license_plate}
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline" className="text-lg px-3 py-1">
                                                    {vehicle.batteryType}
                                                </Badge>
                                                {vehicle.hasActiveSubscription ? (
                                                    <Badge variant="default" className="text-lg px-3 py-1 bg-green-100 text-green-800">
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Subscription
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-lg px-3 py-1 border-red-300 text-red-600">
                                                        No Subscription
                                                    </Badge>
                                                )}
                                                {/* {selectedVehicle?.vehicle_id === vehicle.vehicle_id && (
                                                    <Badge variant="default" className="text-lg px-3 py-1">
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Selected
                                                    </Badge>
                                                )} */}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                <p>Battery slots: {vehicle.batterySlots} {vehicle.batterySlots === 1 ? 'battery' : 'batteries'}</p>
                                                {!vehicle.hasActiveSubscription && (
                                                    <p className="text-red-600 font-semibold">Need to buy subscription to use</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleBack}
                        className="text-2xl px-12 py-8 h-auto"
                    >
                        <ArrowLeft className="mr-3 h-6 w-6" />
                        Go Back
                    </Button>

                    <Button
                        size="lg"
                        onClick={handleContinue}
                        disabled={!selectedVehicle || !selectedVehicle.hasActiveSubscription}
                        className="text-2xl px-12 py-8 h-auto"
                    >
                        Continue
                        <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default UserVehicleSelection;
