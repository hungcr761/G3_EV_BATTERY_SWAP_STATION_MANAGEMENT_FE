import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router';
import GoongMap from '@/components/Map/GoongMap';
import BookingFlow from '@/components/Booking/BookingFlow';
import VehicleSelector from '@/components/Booking/VehicleSelector';
import NoVehicleSelected from '@/components/Booking/NoVehicleSelected';
import { bookingAPI, vehicleAPI, modelAPI, batteryTypeAPI } from '@/lib/apiServices';
import { useStation } from '@/hooks/useStation';
import { useAuth } from '@/hooks/useAuth';
import {
    MapPin,
    Battery,
    Clock,
    Star,
    Search,
    Navigation,
    Calendar,
    Motorbike,
    ArrowUpDown,
    ArrowDownNarrowWide,
    ArrowUpNarrowWide
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const Stations = () => {
    const [selectedStation, setSelectedStation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [batteryType, setBatteryType] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [sortDirection, setSortDirection] = useState('asc');
    const [stations, setStations] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [nearestStation, setNearestStation] = useState(null);
    const [showBookingFlow, setShowBookingFlow] = useState(false);
    const [bookingStation, setBookingStation] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showVehicleSelector, setShowVehicleSelector] = useState(false);
    const [stationAvailability, setStationAvailability] = useState({});
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [userVehicles, setUserVehicles] = useState([]);
    const [vehiclesLoading, setVehiclesLoading] = useState(true);
    const [showVehiclePrompt, setShowVehiclePrompt] = useState(false);

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Use station hook
    const { stations: stationsData, loading: stationsLoading, error: stationsError } = useStation();

    // Process stations for booking (convert status for booking display)
    useEffect(() => {
        const processedStations = stationsData.map(station => ({
            ...station,
            latitude: parseFloat(station.latitude),
            longitude: parseFloat(station.longitude),
            status: station.status === 'operational' ? 'available' : 'closed'
        }));
        setStations(processedStations);
        // setStationsError(stationsError || null);
    }, [stationsData, stationsError]);

    // Fetch user vehicles and auto-select if only one vehicle
    useEffect(() => {
        // Only fetch vehicles if user is authenticated
        if (!isAuthenticated) {
            setVehiclesLoading(false);
            return;
        }

        const fetchUserVehicles = async () => {
            setVehiclesLoading(true);
            try {
                // Fetch vehicle models, battery types, and vehicles in parallel
                const [modelsResponse, batteryResponse, vehiclesResponse, vehiclesWithoutSubscriptionResponse] = await Promise.all([
                    modelAPI.getAll(),
                    batteryTypeAPI.getAll(),
                    vehicleAPI.getAll(),
                    vehicleAPI.getWithoutSubscription()
                ]);

                const models = modelsResponse.data?.payload?.vehicleModels || [];
                const batteryTypesData = batteryResponse.data?.payload?.batteryTypes || [];
                const vehiclesData = vehiclesResponse.data?.vehicles || [];
                const vehiclesWithoutSubscription = vehiclesWithoutSubscriptionResponse.data?.payload?.vehicles ||
                    vehiclesWithoutSubscriptionResponse.data?.vehicles || [];

                // Get vehicle IDs without subscription
                const vehicleIdsWithoutSubscription = new Set(
                    vehiclesWithoutSubscription.map(v => v.vehicle_id || v.id)
                );

                // Filter to only include vehicles WITH subscriptions
                const vehiclesWithSubscription = vehiclesData.filter(vehicle => {
                    const vehicleId = vehicle.vehicle_id || vehicle.id;
                    return !vehicleIdsWithoutSubscription.has(vehicleId);
                });

                // Map vehicles with battery type information
                const mappedVehicles = vehiclesWithSubscription.map(vehicle => {
                    const modelName = vehicle.model?.name || 'Unknown Model';
                    const vehicleModel = models.find(vm => vm.model_id === vehicle.model_id);

                    let batteryName = 'Unknown Battery';
                    let batteryTypeCode = 'type2'; // default
                    if (vehicleModel?.battery_type_id) {
                        const batteryType = batteryTypesData.find(bt => bt.battery_type_id === vehicleModel.battery_type_id);
                        batteryName = batteryType?.battery_type_code || 'Unknown Battery';
                        batteryTypeCode = batteryType?.battery_type_code || 'type2';
                    }

                    return {
                        ...vehicle,
                        modelName,
                        batteryName,
                        batteryType: batteryName,
                        batteryTypeCode
                    };
                });

                setUserVehicles(mappedVehicles);

                // Auto-select vehicle if only one exists
                if (mappedVehicles.length === 1) {
                    setSelectedVehicle(mappedVehicles[0]);
                } else if (mappedVehicles.length > 1) {
                    // Show prompt to select vehicle
                    setShowVehiclePrompt(true);
                }
            } catch (error) {
                console.error('Error fetching user vehicles:', error);
            } finally {
                setVehiclesLoading(false);
            }
        };

        fetchUserVehicles();
    }, [isAuthenticated]);

    // Get user location and find nearest station
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    findNearestStation(latitude, longitude);
                },
                (error) => {
                    console.warn('Could not get user location:', error);
                }
            );
        }
    }, [stations]);

    // Check availability for all stations when vehicle is selected
    useEffect(() => {
        if (selectedVehicle && stations.length > 0 && isAuthenticated) {
            checkAllStationsAvailability();
        }
    }, [selectedVehicle, stations, isAuthenticated]);

    // Calculate distance between two points using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Find nearest station
    const findNearestStation = (userLat, userLng) => {
        if (stations.length === 0) return;

        let nearest = null;
        let minDistance = Infinity;

        stations.forEach(station => {
            const distance = calculateDistance(
                userLat,
                userLng,
                station.latitude,
                station.longitude
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = { ...station, distance: distance.toFixed(1) };
            }
        });

        setNearestStation(nearest);
    };

    // Check availability for all stations
    const checkAllStationsAvailability = async () => {
        if (!selectedVehicle || stations.length === 0) return;

        setLoadingAvailability(true);
        const availabilityData = {};

        try {
            // Check availability for each station
            const promises = stations.map(async (station) => {
                try {
                    const response = await bookingAPI.checkAvailability(
                        station.id,
                        selectedVehicle.vehicle_id
                    );

                    return {
                        stationId: station.id,
                        data: response.data
                    };
                } catch (error) {
                    console.error(`Error checking availability for station ${station.id}:`, error);
                    return {
                        stationId: station.id,
                        data: { available: false, availableBatteries: 0, totalBatteriesOfType: 0 }
                    };
                }
            });

            const results = await Promise.all(promises);

            // Process results - new API structure returns availableBatteries/totalBatteriesOfType
            results.forEach(({ stationId, data }) => {
                // Extract availableBatteries and totalBatteriesOfType from response
                const availableBatteries = data.availableBatteries ?? data.available_batteries ?? data.availability_details?.available_batteries ?? 0;
                const totalBatteriesOfType = data.totalBatteriesOfType ?? data.total_batteries_of_type ?? data.availability_details?.total_batteries_of_type ?? 0;

                availabilityData[stationId] = {
                    available: availableBatteries > 0, // Can book if availableBatteries > 0
                    availableBatteries: availableBatteries,
                    totalSlots: data.availability_details?.total_slots || 0,
                    totalBatteriesOfType: totalBatteriesOfType,
                    stationStatus: data.availability_details?.station_status || data.stationStatus || 'unknown',
                    batteryType: data.battery_type || data.batteryType,
                    station: data.station,
                    message: data.message
                };
            });

            setStationAvailability(availabilityData);
        } catch (error) {
            console.error('Error checking stations availability:', error);
        } finally {
            setLoadingAvailability(false);
        }
    };

    // Filter stations based on search and status
    const filteredStations = stations.filter(station => {
        const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            station.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !batteryType || station.status === batteryType;
        return matchesSearch && matchesStatus;
    });

    // Sort filtered stations
    const sortedStations = React.useMemo(() => {
        if (sortBy === 'default') {
            return filteredStations;
        }

        const stationsWithData = filteredStations.map(station => {
            let distance = null;
            if (userLocation) {
                distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    station.latitude,
                    station.longitude
                );
            }

            const availability = stationAvailability[station.id];
            const totalBatteriesReady = availability?.totalBatteriesReady || 0;

            return {
                ...station,
                distance,
                totalBatteriesReady
            };
        });

        const isAscending = sortDirection === 'asc';

        if (sortBy === 'distance') {
            return stationsWithData.sort((a, b) => {
                if (a.distance === null && b.distance === null) return 0;
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return isAscending ? a.distance - b.distance : b.distance - a.distance;
            });
        }

        if (sortBy === 'totalBatteriesReady') {
            return stationsWithData.sort((a, b) => {
                return isAscending
                    ? a.totalBatteriesReady - b.totalBatteriesReady
                    : b.totalBatteriesReady - a.totalBatteriesReady;
            });
        }

        return stationsWithData;
    }, [filteredStations, sortBy, sortDirection, userLocation, stationAvailability]);

    // Toggle sort direction
    const toggleSortDirection = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleStationSelect = (station) => {
        setSelectedStation(station);

        // Scroll to the selected station in the list
        setTimeout(() => {
            const stationElement = document.getElementById(`station-${station.id}`);
            if (stationElement) {
                stationElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 100);
    };

    // Handle navigation/directions
    const handleNavigation = (station) => {
        if (userLocation) {
            // Open Google Maps with directions
            const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${station.latitude},${station.longitude}`;
            window.open(url, '_blank');
        } else {
            // Fallback to station location only
            const url = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;
            window.open(url, '_blank');
        }
    };

    // Handle booking
    const handleBooking = (station) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!selectedVehicle) {
            // Show vehicle selector first
            setBookingStation(station);
            setShowVehicleSelector(true);
        } else {
            // Proceed with booking
            setBookingStation(station);
            setShowBookingFlow(true);
        }
    };

    const handleBookingSuccess = (bookingData) => {
        console.log('Booking created successfully:', bookingData);
        // You can add success notification here
    };

    const handleCloseBooking = () => {
        setShowBookingFlow(false);
        setBookingStation(null);
    };

    // Handle vehicle selection
    const handleVehicleSelect = (vehicle) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setSelectedVehicle(vehicle);
        setShowVehicleSelector(false);

        // If there's a pending booking station, proceed to booking flow
        if (bookingStation) {
            setShowBookingFlow(true);
        }
    };

    const handleShowVehicleSelector = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setShowVehicleSelector(true);
    };

    const handleCloseVehicleSelector = () => {
        setShowVehicleSelector(false);
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                Find Battery Swap Station
                            </h1>
                            <p className="text-muted-foreground">
                                Search for the nearest battery swap station with available batteries
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {vehiclesLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                    <span className="text-sm text-muted-foreground">Loading vehicles...</span>
                                </div>
                            ) : selectedVehicle ? (
                                <div className="flex items-center space-x-2">
                                    <Motorbike className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">{selectedVehicle.modelName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedVehicle.batteryType}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleShowVehicleSelector}
                                    >
                                        Change Vehicle
                                    </Button>
                                </div>
                            ) : userVehicles.length > 0 ? (
                                <div className="flex items-center space-x-2">
                                    <Motorbike className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-muted-foreground">No vehicle selected</p>
                                        <p className="text-sm text-muted-foreground">
                                            Select a vehicle to view battery status at stations
                                        </p>
                                    </div>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleShowVehicleSelector}
                                    >
                                        Select Vehicle
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Motorbike className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-muted-foreground">No vehicles with subscription</p>
                                        <p className="text-sm text-muted-foreground">
                                            Subscribe to a plan for your vehicle to book battery swaps
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate('/services')}
                                    >
                                        View Plans
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Nearest Station Info */}
                    {nearestStation && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-green-800">Nearest Station</span>
                            </div>
                            <p className="text-green-700 mt-1">
                                {nearestStation.name} - {nearestStation.distance} km
                            </p>
                            <p className="text-sm text-green-600">{nearestStation.address}</p>
                        </div>
                    )}
                </div>

                {/* Search and Filter */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-[6.5fr_1.2fr_2fr] gap-4">
                            <div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Enter address or station name..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    value={batteryType}
                                    onChange={(e) => setBatteryType(e.target.value)}
                                >
                                    <option value="">Status</option>
                                    <option value="available">Available</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                        <SelectItem value="distance">Distance</SelectItem>
                                        <SelectItem value="totalBatteriesReady">Total Batteries Ready</SelectItem>
                                    </SelectContent>
                                </Select>
                                {sortBy !== 'default' && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={toggleSortDirection}
                                        className="flex-shrink-0"
                                        title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                                    >
                                        {sortDirection === 'asc' ? (
                                            <ArrowUpNarrowWide className="h-4 w-4" />
                                        ) : (
                                            <ArrowDownNarrowWide className="h-4 w-4" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loading State */}
                {stationsLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading station data...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {stationsError && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <p className="text-red-500 mb-2">Station data loading error</p>
                            <p className="text-sm text-muted-foreground">
                                {stationsError.message || 'Unable to connect to server'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Stations List */}
                {!stationsLoading && !stationsError && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6 max-h-screen overflow-y-auto pr-2 scroll-smooth">
                            {sortedStations.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No stations found</p>
                                </div>
                            ) : (
                                sortedStations.map((station) => (
                                    <Card
                                        key={station.id}
                                        id={`station-${station.id}`}
                                        className={`hover:shadow-lg transition-shadow cursor-pointer ${selectedStation?.id === station.id ? 'ring-2 ring-primary ring-inset' : ''
                                            } ${nearestStation?.id === station.id ? 'bg-green-50 border-green-200' : ''
                                            }`}
                                        onClick={() => handleStationSelect(station)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                {/* Header */}
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h3 className="text-base font-semibold">{station.name}</h3>
                                                            {station.status === 'available' ? (
                                                                <Badge variant="default">Available</Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Closed</Badge>
                                                            )}
                                                            {nearestStation?.id === station.id && (
                                                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                                                    Nearest
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center space-x-1">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>Battery Swap Station</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Clock className="h-4 w-4" />
                                                                <span>24/7</span>
                                                            </div>
                                                            {userLocation && (
                                                                <div className="flex items-center space-x-1">
                                                                    <Navigation className="h-4 w-4" />
                                                                    <span>{calculateDistance(
                                                                        userLocation.lat,
                                                                        userLocation.lng,
                                                                        station.latitude,
                                                                        station.longitude
                                                                    ).toFixed(1)} km</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{station.address}</p>
                                                    </div>
                                                </div>

                                                {/* Station Info */}
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Battery className="h-4 w-4 text-blue-600" />
                                                            <span className="font-medium text-sm">EV Battery Swap Station</span>
                                                        </div>
                                                        {selectedVehicle && stationAvailability[station.id] ? (
                                                            <div className="text-right">
                                                                <div className="flex items-center space-x-1">
                                                                    <span className="text-sm font-medium">
                                                                        {stationAvailability[station.id].availableBatteries}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        / {stationAvailability[station.id].totalBatteriesOfType}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {stationAvailability[station.id].batteryType?.battery_type_code || selectedVehicle.batteryType} batteries available
                                                                </p>
                                                                {stationAvailability[station.id].reservedByPendingBookings > 0 && (
                                                                    <p className="text-xs text-orange-600">
                                                                        {stationAvailability[station.id].reservedByPendingBookings} batteries reserved
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : selectedVehicle ? (
                                                            <div className="text-right">
                                                                <div className="flex items-center space-x-1">
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                                                                    <span className="text-xs text-muted-foreground">Checking...</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-right">
                                                                <p className="text-xs text-muted-foreground">
                                                                    Select vehicle to view battery count
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        24/7 electric vehicle battery swap service
                                                    </p>
                                                    {loadingAvailability && (
                                                        <div className="mt-2 flex items-center space-x-1">
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                                                            <span className="text-xs text-muted-foreground">Checking...</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => handleNavigation(station)}
                                                    >
                                                        <Navigation className="mr-1 h-3 w-3" />
                                                        Get Directions
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        disabled={!selectedVehicle || !stationAvailability[station.id] || (stationAvailability[station.id]?.availableBatteries || 0) === 0}
                                                        onClick={() => handleBooking(station)}
                                                    >
                                                        <Calendar className="mr-1 h-3 w-3" />
                                                        {!selectedVehicle
                                                            ? 'Select Vehicle First'
                                                            : !stationAvailability[station.id]
                                                                ? 'Checking...'
                                                                : (stationAvailability[station.id]?.availableBatteries || 0) === 0
                                                                    ? 'Out of Batteries'
                                                                    : 'Book Appointment'
                                                        }
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Map Placeholder */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle>Map</CardTitle>
                                    <CardDescription>
                                        Location of battery swap stations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <GoongMap
                                        onStationSelect={handleStationSelect}
                                        selectedStation={selectedStation}
                                        nearestStation={nearestStation}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* Vehicle Selector Modal */}
            {
                showVehicleSelector && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold">Select Vehicle</h2>
                                        <Button variant="outline" onClick={handleCloseVehicleSelector}>
                                            Close
                                        </Button>
                                    </div>
                                    <VehicleSelector
                                        onVehicleSelect={handleVehicleSelect}
                                        selectedVehicle={selectedVehicle}
                                        onContinue={handleCloseVehicleSelector}
                                        isForBooking={!!bookingStation}
                                        vehicles={userVehicles}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            }

            {/* Booking Flow Modal */}
            {
                showBookingFlow && bookingStation && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <BookingFlow
                                selectedStation={bookingStation}
                                selectedVehicle={selectedVehicle}
                                onBookingSuccess={handleBookingSuccess}
                                onClose={handleCloseBooking}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Stations;
