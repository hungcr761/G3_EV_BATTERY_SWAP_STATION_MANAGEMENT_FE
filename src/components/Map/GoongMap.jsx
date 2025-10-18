import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { stationAPI } from '../../lib/apiServices';

const GoongMap = ({ onStationSelect, selectedStation }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [stations, setStations] = useState([]);
    const [stationsLoading, setStationsLoading] = useState(false);
    const [stationsError, setStationsError] = useState(null);
    const [mapInitialized, setMapInitialized] = useState(false);

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

    // Goong Map API key
    const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY;

    // Load Goong Map script
    useEffect(() => {
        let isMounted = true;

        const loadGoongMap = () => {
            if (window.goongjs && isMounted) {
                initializeMap();
                return;
            }

            // Load Goong JS from jsDelivr CDN
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js';
            script.async = true;
            script.onload = () => {
                // Set the API key after the script loads
                if (window.goongjs && isMounted) {
                    window.goongjs.accessToken = GOONG_API_KEY;
                    initializeMap();
                }
            };
            script.onerror = () => {
                console.error('Failed to load Goong Map API');
            };
            document.head.appendChild(script);

            // Also load the CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css';
            document.head.appendChild(link);
        };

        loadGoongMap();

        // Cleanup function
        return () => {
            isMounted = false;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Initialize map
    const initializeMap = () => {
        if (!mapRef.current || !window.goongjs || mapInstanceRef.current || mapInitialized) return;

        // Clear any existing content in the map container
        if (mapRef.current) {
            mapRef.current.innerHTML = '';
        }

        try {
            // Default center to Ho Chi Minh City
            const defaultCenter = [106.6297, 10.8231];

            // Use basic map style without API key requirements
            mapInstanceRef.current = new window.goongjs.Map({
                container: mapRef.current,
                style: {
                    version: 8,
                    sources: {
                        'osm': {
                            type: 'raster',
                            tiles: [
                                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                            ],
                            tileSize: 256,
                            attribution: '© OpenStreetMap contributors'
                        }
                    },
                    layers: [
                        {
                            id: 'osm',
                            type: 'raster',
                            source: 'osm'
                        }
                    ]
                },
                center: defaultCenter,
                zoom: 12
            });

            // Add navigation control
            mapInstanceRef.current.addControl(new window.goongjs.NavigationControl(), 'top-right');

            // Get user location
            getCurrentLocation();

            // Add station markers
            addStationMarkers();

            setIsLoaded(true);
            setMapInitialized(true);
        } catch (error) {
            console.error('Error initializing Goong Map:', error);
            // Try fallback with basic style
            try {
                mapInstanceRef.current = new window.goongjs.Map({
                    container: mapRef.current,
                    style: {
                        version: 8,
                        sources: {},
                        layers: []
                    },
                    center: [106.6297, 10.8231],
                    zoom: 12
                });
                setIsLoaded(true);
                setMapInitialized(true);
            } catch (fallbackError) {
                console.error('Fallback map initialization failed:', fallbackError);
            }
        }
    };

    // Get user's current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([longitude, latitude]); // Use [lng, lat] format

                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setCenter([longitude, latitude]);
                        mapInstanceRef.current.setZoom(14);
                    }
                },
                (error) => {
                    console.warn('Could not get user location:', error);
                }
            );
        }
    };

    // Add station markers to map
    const addStationMarkers = () => {
        if (!mapInstanceRef.current || !window.goongjs) {
            console.warn('Map not ready for markers');
            return;
        }

        // Clear existing markers
        markersRef.current.forEach(marker => {
            try {
                marker.remove();
            } catch (e) {
                console.warn('Error removing marker:', e);
            }
        });
        markersRef.current = [];

        stations.forEach((station) => {
            // Use real coordinates from API
            const coord = [station.longitude, station.latitude];

            // Validate coordinates
            if (!station.longitude || !station.latitude ||
                isNaN(station.longitude) || isNaN(station.latitude)) {
                console.error('Invalid coordinates for station:', station.name, {
                    longitude: station.longitude,
                    latitude: station.latitude
                });
                return;
            }

            // Additional validation for coordinate ranges
            if (station.longitude < -180 || station.longitude > 180 ||
                station.latitude < -90 || station.latitude > 90) {
                console.error('Coordinates out of valid range for station:', station.name, {
                    longitude: station.longitude,
                    latitude: station.latitude
                });
                return;
            }

            // Debug logging
            console.log('Adding marker for station:', station.name, 'at coordinates:', coord);

            // Create simple marker element
            const markerElement = document.createElement('div');
            markerElement.className = 'custom-marker';
            markerElement.style.cssText = `
                width: 32px;
                height: 32px;
                background: white;
                border-radius: 50%;
                border: 2px solid #3b82f6;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;

            // Add marker icon
            markerElement.innerHTML = `
                <svg width="16" height="16" fill="#3b82f6" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                </svg>
            `;

            // Add click event
            markerElement.addEventListener('click', () => {
                onStationSelect && onStationSelect(station);
            });

            // Create marker with error handling
            try {
                // Create marker using the correct Goong Map API format
                const marker = new window.goongjs.Marker({
                    element: markerElement
                })
                    .setLngLat(coord)
                    .addTo(mapInstanceRef.current);

                markersRef.current.push(marker);
            } catch (markerError) {
                console.error('Error creating marker for station:', station.name, markerError);
            }
        });
    };

    // Update markers when stations change
    useEffect(() => {
        if (isLoaded && mapInstanceRef.current) {
            addStationMarkers();
        }
    }, [stations, isLoaded]);

    // Center map on selected station
    useEffect(() => {
        if (selectedStation && mapInstanceRef.current) {
            const station = stations.find(s => s.id === selectedStation.id);
            if (station && station.longitude && station.latitude) {
                mapInstanceRef.current.flyTo({
                    center: [station.longitude, station.latitude],
                    zoom: 15
                });
            }
        }
    }, [selectedStation, stations]);

    return (
        <div className="relative w-full h-full">
            <div
                ref={mapRef}
                id="goong-map-container"
                className="w-full h-full rounded-lg"
                style={{ minHeight: '400px' }}
            />

            {(!isLoaded || stationsLoading) && (
                <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">
                            {!isLoaded ? 'Đang tải bản đồ...' : 'Đang tải dữ liệu trạm...'}
                        </p>
                    </div>
                </div>
            )}

            {stationsError && (
                <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 mb-2">Lỗi tải dữ liệu trạm</p>
                        <p className="text-sm text-muted-foreground">
                            {stationsError.message || 'Không thể kết nối đến server'}
                        </p>
                    </div>
                </div>
            )}

            {/* Map controls */}
            {isLoaded && (
                <div className="absolute top-4 left-4 space-y-2">
                    <button
                        onClick={getCurrentLocation}
                        className="bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors"
                        title="Vị trí hiện tại"
                    >
                        <Navigation className="h-4 w-4 text-gray-600" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default GoongMap;
