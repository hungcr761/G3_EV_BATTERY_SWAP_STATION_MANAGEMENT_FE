import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { vehicleAPI } from '../../lib/apiServices';
import { Motorbike, Battery, CheckCircle, ArrowRight } from 'lucide-react';

/**
 * VehicleSelector Component
 * 
 * Displays list of user's vehicles with active subscriptions
 * Allows user to select a vehicle for booking or viewing station availability
 * Filters out vehicles without active subscriptions
 */
const VehicleSelector = ({ onVehicleSelect, selectedVehicle, onContinue, isForBooking = false, vehicles = null }) => {
    const [internalVehicles, setInternalVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Filter vehicles to only show those with active subscriptions
     * Fetches list of vehicles without subscriptions and filters them out
     */
    const filterVehiclesWithSubscription = useCallback(async (vehiclesToFilter) => {
        try {
            setLoading(true);
            // Fetch vehicles without subscription to filter them out
            const vehiclesWithoutSubscriptionResponse = await vehicleAPI.getWithoutSubscription();
            const vehiclesWithoutSubscription = vehiclesWithoutSubscriptionResponse.data?.payload?.vehicles ||
                vehiclesWithoutSubscriptionResponse.data?.vehicles || [];

            // Get vehicle IDs without subscription
            const vehicleIdsWithoutSubscription = new Set(
                vehiclesWithoutSubscription.map(v => v.vehicle_id || v.id)
            );

            // Filter to only show vehicles WITH subscriptions (not in the "without subscription" list)
            const vehiclesWithSubscription = vehiclesToFilter.filter(vehicle => {
                const vehicleId = vehicle.vehicle_id || vehicle.id;
                return !vehicleIdsWithoutSubscription.has(vehicleId);
            });

            setInternalVehicles(vehiclesWithSubscription);
        } catch (error) {
            console.error('Error filtering vehicles:', error);
            // If filtering fails, show all vehicles as fallback
            setInternalVehicles(vehiclesToFilter);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch and filter vehicles on component mount
     * If vehicles are provided via props, filters them
     * Otherwise fetches all vehicles and filters to show only those with subscriptions
     */
    useEffect(() => {
        if (vehicles && vehicles.length > 0) {
            filterVehiclesWithSubscription(vehicles);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all vehicles and vehicles without subscription in parallel
                const [allVehiclesResponse, vehiclesWithoutSubscriptionResponse] = await Promise.all([
                    vehicleAPI.getAll(),
                    vehicleAPI.getWithoutSubscription()
                ]);

                const allVehicles = allVehiclesResponse.data?.vehicles || [];
                const vehiclesWithoutSubscription = vehiclesWithoutSubscriptionResponse.data?.payload?.vehicles ||
                    vehiclesWithoutSubscriptionResponse.data?.vehicles || [];

                // Get vehicle IDs without subscription
                const vehicleIdsWithoutSubscription = new Set(
                    vehiclesWithoutSubscription.map(v => v.vehicle_id || v.id)
                );

                // Filter to only show vehicles WITH subscriptions
                const vehiclesWithSubscription = allVehicles.filter(vehicle => {
                    const vehicleId = vehicle.vehicle_id || vehicle.id;
                    return !vehicleIdsWithoutSubscription.has(vehicleId);
                });

                setInternalVehicles(vehiclesWithSubscription);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Unable to load vehicle list');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [vehicles, filterVehiclesWithSubscription]);

    /**
     * Handle vehicle selection
     * Calls parent component's onVehicleSelect callback
     */
    const handleVehicleSelect = (vehicle) => {
        onVehicleSelect(vehicle);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading vehicle list...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-2">Data loading error</p>
                <p className="text-sm text-muted-foreground">{error}</p>
            </div>
        );
    }

    if (internalVehicles.length === 0 && !loading) {
        return (
            <div className="text-center py-8">
                <Motorbike className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No vehicles with active subscription found</p>
                <p className="text-sm text-muted-foreground mb-4">
                    You need to subscribe to a plan for your vehicle before booking a battery swap
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/services'}>
                    View Subscription Plans
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    {isForBooking ? 'Select Vehicle to Book' : 'Select Vehicle to Find Station'}
                </h2>
                <p className="text-muted-foreground">
                    {isForBooking
                        ? 'Select a vehicle to continue scheduling battery swap'
                        : 'Select a vehicle to view available battery quantities at stations'
                    }
                </p>
            </div>

            <div className="grid gap-4">
                {internalVehicles.map((vehicle) => (
                    <Card
                        key={vehicle.vehicle_id}
                        className={`cursor-pointer transition-all hover:shadow-md ${selectedVehicle?.vehicle_id === vehicle.vehicle_id
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:border-primary/50'
                            }`}
                        onClick={() => handleVehicleSelect(vehicle)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Motorbike className="h-5 w-5 text-primary" />
                                        <h3 className="font-semibold text-lg">{vehicle.model?.name || 'Unknown Model'}</h3>
                                        {selectedVehicle?.vehicle_id === vehicle.vehicle_id && (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        )}
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center space-x-4">
                                            <span>VIN: {vehicle.vin}</span>
                                            <span>License Plate: {vehicle.license_plate}</span>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                {vehicle.model?.batteryType?.battery_type_code || 'Unknown Battery'}
                                            </Badge>
                                            {vehicle.model?.battery_slot > 0 && (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {vehicle.model.battery_slot} batteries
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedVehicle && !isForBooking && (
                <div className="flex justify-end pt-4">
                    <Button onClick={onContinue} size="lg">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Continue Finding Station
                    </Button>
                </div>
            )}
        </div>
    );
};

export default VehicleSelector;
