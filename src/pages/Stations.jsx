import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import GoongMap from '../components/Map/GoongMap';
import BookingFlow from '../components/Booking/BookingFlow';
import VehicleSelector from '../components/Booking/VehicleSelector';
import NoVehicleSelected from '../components/Booking/NoVehicleSelected';
import { stationAPI, bookingAPI } from '../lib/apiServices';
import {
    MapPin,
    Battery,
    Clock,
    Star,
    Search,
    Filter,
    Navigation,
    Calendar
} from 'lucide-react';

const Stations = () => {
    const [selectedStation, setSelectedStation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [batteryType, setBatteryType] = useState('');
    const [stations, setStations] = useState([]);
    const [stationsLoading, setStationsLoading] = useState(false);
    const [stationsError, setStationsError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [nearestStation, setNearestStation] = useState(null);
    const [showBookingFlow, setShowBookingFlow] = useState(false);
    const [bookingStation, setBookingStation] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showVehicleSelector, setShowVehicleSelector] = useState(false);
    const [stationAvailability, setStationAvailability] = useState({});
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    // Fetch stations from API
    useEffect(() => {
        const fetchStations = async () => {
            setStationsLoading(true);
            setStationsError(null);
            try {
                const response = await stationAPI.getAll();
                if (response.data && response.data.success && response.data.payload && response.data.payload.stations) {
                    const processedStations = response.data.payload.stations.map(station => ({
                        id: station.station_id,
                        name: station.station_name,
                        address: station.address,
                        latitude: parseFloat(station.latitude),
                        longitude: parseFloat(station.longitude),
                        status: station.status === 'operational' ? 'available' : 'limited'
                    }));
                    setStations(processedStations);
                }
            } catch (error) {
                setStationsError(error);
                console.error('Error fetching stations:', error);
            } finally {
                setStationsLoading(false);
            }
        };

        fetchStations();
    }, []);

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
        if (selectedVehicle && stations.length > 0) {
            checkAllStationsAvailability();
        }
    }, [selectedVehicle, stations]);

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
                    const response = await bookingAPI.checkAvailability({
                        station_id: station.id,
                        battery_type: selectedVehicle.batteryTypeCode,
                        scheduled_time: new Date().toISOString()
                    });

                    return {
                        stationId: station.id,
                        data: response.data
                    };
                } catch (error) {
                    console.error(`Error checking availability for station ${station.id}:`, error);
                    return {
                        stationId: station.id,
                        data: { available: false, available_batteries_count: 0 }
                    };
                }
            });

            const results = await Promise.all(promises);

            // Process results
            results.forEach(({ stationId, data }) => {
                availabilityData[stationId] = {
                    available: data.available,
                    availableCount: data.availability_details?.available_batteries_count || 0,
                    totalSlots: data.availability_details?.total_slots || 0,
                    stationStatus: data.availability_details?.station_status || 'unknown'
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

                // Add a temporary highlight effect
                stationElement.classList.add('animate-pulse');
                setTimeout(() => {
                    stationElement.classList.remove('animate-pulse');
                }, 2000);
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
        setSelectedVehicle(vehicle);
        setShowVehicleSelector(false);

        // If there's a pending booking station, proceed to booking flow
        if (bookingStation) {
            setShowBookingFlow(true);
        }
    };

    const handleShowVehicleSelector = () => {
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
                                Tìm trạm đổi pin
                            </h1>
                            <p className="text-muted-foreground">
                                Tìm kiếm trạm đổi pin gần nhất với tình trạng pin sẵn có
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {selectedVehicle && (
                                <div className="flex items-center space-x-2">
                                    <Car className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">{selectedVehicle.modelName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedVehicle.batteryType} • SoH: {selectedVehicle.battery_soh}%
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleShowVehicleSelector}
                                    >
                                        Đổi xe
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
                                <span className="font-semibold text-green-800">Trạm gần nhất</span>
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Nhập địa chỉ hoặc tên trạm..."
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
                                    <option value="">Trạng thái</option>
                                    <option value="available">Sẵn sàng</option>
                                    <option value="limited">Hạn chế</option>
                                </select>
                            </div>
                            <div>
                                <Button className="w-full">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Lọc
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loading State */}
                {stationsLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Đang tải dữ liệu trạm...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {stationsError && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <p className="text-red-500 mb-2">Lỗi tải dữ liệu trạm</p>
                            <p className="text-sm text-muted-foreground">
                                {stationsError.message || 'Không thể kết nối đến server'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Stations List */}
                {!stationsLoading && !stationsError && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6 max-h-screen overflow-y-auto pr-2 scroll-smooth">
                            {filteredStations.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">Không tìm thấy trạm nào</p>
                                </div>
                            ) : (
                                filteredStations.map((station) => (
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
                                                                <Badge variant="default">Sẵn sàng</Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Hạn chế</Badge>
                                                            )}
                                                            {nearestStation?.id === station.id && (
                                                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                                                    Gần nhất
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center space-x-1">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>Trạm đổi pin</span>
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
                                                            <span className="font-medium text-sm">Trạm đổi pin EV</span>
                                                        </div>
                                                        {selectedVehicle && stationAvailability[station.id] ? (
                                                            <div className="text-right">
                                                                <div className="flex items-center space-x-1">
                                                                    <span className="text-sm font-medium">
                                                                        {stationAvailability[station.id].availableCount}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        / {stationAvailability[station.id].totalSlots}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    pin {selectedVehicle.batteryType} có sẵn
                                                                </p>
                                                            </div>
                                                        ) : selectedVehicle ? (
                                                            <div className="text-right">
                                                                <div className="flex items-center space-x-1">
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                                                                    <span className="text-xs text-muted-foreground">Đang kiểm tra...</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-right">
                                                                <p className="text-xs text-muted-foreground">
                                                                    Chọn xe để xem số pin
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Dịch vụ đổi pin cho xe điện 24/7
                                                    </p>
                                                    {loadingAvailability && (
                                                        <div className="mt-2 flex items-center space-x-1">
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                                                            <span className="text-xs text-muted-foreground">Đang kiểm tra...</span>
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
                                                        Chỉ đường
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => handleBooking(station)}
                                                    >
                                                        <Calendar className="mr-1 h-3 w-3" />
                                                        Đặt lịch
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
                                    <CardTitle>Bản đồ</CardTitle>
                                    <CardDescription>
                                        Vị trí các trạm đổi pin
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
            {showVehicleSelector && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Chọn xe</h2>
                                    <Button variant="outline" onClick={handleCloseVehicleSelector}>
                                        Đóng
                                    </Button>
                                </div>
                                <VehicleSelector
                                    onVehicleSelect={handleVehicleSelect}
                                    selectedVehicle={selectedVehicle}
                                    onContinue={handleCloseVehicleSelector}
                                    isForBooking={!!bookingStation}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Booking Flow Modal */}
            {showBookingFlow && bookingStation && (
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
            )}
        </div>
    );
};

export default Stations;
