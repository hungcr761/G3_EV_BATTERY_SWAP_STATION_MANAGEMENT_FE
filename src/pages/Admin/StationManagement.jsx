import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    MapPin,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Battery,
    Users,
    AlertTriangle,
    CheckCircle,
    Clock,
    Loader2
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { useStation } from '../../hooks/useStation';
import { cabinetAPI } from '../../lib/apiServices';
import { useUser } from '../../hooks/useUser';

const StationManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const { stations, loading, error, fetchStations, createStation, updateStation, updateStationStatus } = useStation();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [statusStation, setStatusStation] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('operational');
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        status: 'operational'
    });
    const [geocodingLoading, setGeocodingLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
    const [statusUpdateError, setStatusUpdateError] = useState(null);

    // Autocomplete states
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [autocompleteLoading, setAutocompleteLoading] = useState(false);
    const addressInputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Fetch all staff with role filter
    const { pagination: staffPagination, loading: staffLoading } = useUser({
        page: 1,
        pageSize: 1,
        role: 'staff',
        email: '',
        fullname: ''
    });

    // State to store cabinet data per station
    const [cabinetDataByStation, setCabinetDataByStation] = useState({});
    const [cabinetLoadingByStation, setCabinetLoadingByStation] = useState({});

    // Get total staff from pagination
    const totalStaff = staffPagination?.total || 0;

    // Fetch cabinet data for all stations
    useEffect(() => {
        const fetchCabinetData = async () => {
            if (!stations || stations.length === 0) return;

            const newCabinetData = {};
            const newCabinetLoading = {};

            // Initialize loading states
            stations.forEach(station => {
                newCabinetLoading[station.id] = true;
            });
            setCabinetLoadingByStation(newCabinetLoading);

            // Fetch cabinet data for each station
            const promises = stations.map(async (station) => {
                try {
                    const response = await cabinetAPI.getAll({ station_id: station.id });
                    // Handle different response structures: with/without pagination
                    // Structure 1: { success: true, payload: { cabinets: [...] } }
                    // Structure 2: { success: true, payload: { cabinets: { data: [...], total: N } } }
                    let cabinets = [];
                    if (response.data?.payload?.cabinets) {
                        cabinets = Array.isArray(response.data.payload.cabinets)
                            ? response.data.payload.cabinets
                            : response.data.payload.cabinets.data || [];
                    } else if (response.data?.cabinets) {
                        cabinets = Array.isArray(response.data.cabinets)
                            ? response.data.cabinets
                            : response.data.cabinets.data || [];
                    }
                    newCabinetData[station.id] = Array.isArray(cabinets) ? cabinets : [];
                } catch (err) {
                    console.error(`Error fetching cabinets for station ${station.id}:`, err);
                    newCabinetData[station.id] = [];
                } finally {
                    newCabinetLoading[station.id] = false;
                }
            });

            await Promise.all(promises);
            setCabinetDataByStation(newCabinetData);
            setCabinetLoadingByStation(newCabinetLoading);
        };

        fetchCabinetData();
    }, [stations]);

    // Calculate battery counts per station from cabinet data
    const batteryCountsByStation = useMemo(() => {
        const result = {};

        Object.keys(cabinetDataByStation).forEach(stationId => {
            const cabinets = cabinetDataByStation[stationId] || [];

            let totalSlots = 0;
            let availableBatteries = 0;

            if (Array.isArray(cabinets)) {
                cabinets.forEach(cabinet => {
                    // Sum battery_capacity to get total slots (convert to number if string)
                    const capacity = Number(cabinet.battery_capacity) || 0;
                    totalSlots += capacity;

                    // Count slots with non-null, non-undefined battery
                    // A battery is considered available if it exists and is an object
                    if (cabinet.slots && Array.isArray(cabinet.slots)) {
                        cabinet.slots.forEach(slot => {
                            // Check if battery exists and is a valid object (not null, not undefined)
                            if (slot.battery !== null && slot.battery !== undefined && typeof slot.battery === 'object') {
                                availableBatteries++;
                            }
                        });
                    }
                });
            }

            result[stationId] = {
                available: availableBatteries,
                total: totalSlots
            };
        });

        return result;
    }, [cabinetDataByStation]);

    const totalSwapBatteries = useMemo(() => {
        return Object.values(batteryCountsByStation).reduce((sum, counts) => {
            return sum + (counts?.available || 0);
        }, 0);
    }, [batteryCountsByStation]);



    // Fetch address autocomplete suggestions using Goong API
    const fetchAddressSuggestions = async (input) => {
        if (!input || input.trim().length < 3) {
            setAddressSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setAutocompleteLoading(true);
        try {
            const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY;
            const encodedInput = encodeURIComponent(input);

            // Use Goong Place Autocomplete API
            const response = await fetch(
                `https://rsapi.goong.io/Place/AutoComplete?input=${encodedInput}&api_key=${GOONG_API_KEY}`
            );

            if (!response.ok) {
                throw new Error('Autocomplete failed');
            }

            const data = await response.json();

            // Handle different possible response formats
            const predictions = data.predictions || [];

            if (predictions.length > 0) {
                setAddressSuggestions(predictions);
                setShowSuggestions(true);
            } else {
                setAddressSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            setAddressSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setAutocompleteLoading(false);
        }
    };

    // Handle selecting an address suggestion
    const handleAddressSelect = async (placeId, description) => {
        setShowSuggestions(false);
        setAddressSuggestions([]);
        setGeocodingLoading(true);

        try {
            const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY;

            // Get place details using Place Detail API or Geocode
            // First try to get coordinates from the place_id
            try {
                const detailResponse = await fetch(
                    `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GOONG_API_KEY}`
                );

                if (detailResponse.ok) {
                    const detailData = await detailResponse.json();
                    const result = detailData.result || detailData;
                    const location = result?.geometry?.location || result?.location;

                    if (location) {
                        const lat = location.lat?.toString() || location.lat;
                        const lng = location.lng?.toString() || location.lng;
                        const formattedAddress = result?.formatted_address || result?.name || description;

                        setFormData(prev => ({
                            ...prev,
                            address: formattedAddress,
                            latitude: lat || '',
                            longitude: lng || ''
                        }));
                        setGeocodingLoading(false);
                        return;
                    }
                }
            } catch (detailErr) {
                console.warn('Place Detail API failed, falling back to geocoding:', detailErr);
            }

            // Fallback to geocoding the description
            const encodedAddress = encodeURIComponent(description);
            const geocodeResponse = await fetch(
                `https://rsapi.goong.io/Geocode?address=${encodedAddress}&api_key=${GOONG_API_KEY}`
            );

            if (geocodeResponse.ok) {
                const geocodeData = await geocodeResponse.json();

                // Handle different possible response formats
                const results = geocodeData.results || geocodeData.predictions || [];

                if (results.length > 0) {
                    const firstResult = results[0];
                    const location = firstResult.geometry?.location || firstResult.location;
                    const formattedAddress = firstResult.formatted_address || firstResult.description || description;

                    if (location) {
                        const lat = location.lat?.toString() || location.lat;
                        const lng = location.lng?.toString() || location.lng;

                        setFormData(prev => ({
                            ...prev,
                            address: formattedAddress,
                            latitude: lat || '',
                            longitude: lng || ''
                        }));
                    }
                }
            }
        } catch (err) {
            console.error('Error getting address details:', err);
            // Still set the address even if geocoding fails
            setFormData(prev => ({
                ...prev,
                address: description
            }));
        } finally {
            setGeocodingLoading(false);
        }
    };

    // Debounce timer ref for autocomplete
    const autocompleteTimerRef = useRef(null);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (autocompleteTimerRef.current) {
                clearTimeout(autocompleteTimerRef.current);
            }
        };
    }, []);

    // Handle clicks outside suggestions dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target) &&
                addressInputRef.current &&
                !addressInputRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle address input with debounce for autocomplete
    const handleAddressChange = (value) => {
        setFormData(prev => ({ ...prev, address: value }));
        setCreateError(null);
        setUpdateError(null);

        // Clear existing timer
        if (autocompleteTimerRef.current) {
            clearTimeout(autocompleteTimerRef.current);
        }

        // Hide suggestions if input is cleared
        if (!value || value.trim().length < 3) {
            setAddressSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // Debounce autocomplete suggestions
        autocompleteTimerRef.current = setTimeout(() => {
            fetchAddressSuggestions(value);
        }, 300);
    };

    // Handle keyboard navigation in suggestions
    const handleAddressKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false);
        } else if (e.key === 'Enter' && addressSuggestions.length > 0 && showSuggestions) {
            e.preventDefault();
            // Select first suggestion on Enter
            const firstSuggestion = addressSuggestions[0];
            handleAddressSelect(firstSuggestion.place_id, firstSuggestion.description);
        }
    };

    // Handle form submission
    const handleCreateStation = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
            setCreateError('Please fill in all required fields');
            return;
        }

        setCreateLoading(true);
        setCreateError(null);

        try {
            const stationData = {
                station_name: formData.name,
                address: formData.address,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                status: formData.status
            };

            console.log(stationData);
            await createStation(stationData);

            // Reset form and close dialog
            setFormData({
                name: '',
                address: '',
                latitude: '',
                longitude: '',
                status: 'operational'
            });
            setIsCreateDialogOpen(false);
            setCreateError(null);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create station';
            setCreateError(errorMessage);
        } finally {
            setCreateLoading(false);
        }
    };

    // Handle edit button click
    const handleEditClick = (station) => {
        setEditingStation(station);
        setFormData({
            name: station.name || '',
            address: station.address || '',
            latitude: station.latitude?.toString() || '',
            longitude: station.longitude?.toString() || ''
        });
        setUpdateError(null);
        setIsEditDialogOpen(true);
    };

    // Handle status update button click
    const handleStatusClick = (station) => {
        setStatusStation(station);
        setSelectedStatus(station.status || 'operational');
        setStatusUpdateError(null);
        setIsStatusDialogOpen(true);
    };

    // Handle update station
    const handleUpdateStation = async (e) => {
        e.preventDefault();

        if (!editingStation || !formData.name || !formData.address || !formData.latitude || !formData.longitude) {
            setUpdateError('Please fill in all required fields');
            return;
        }

        setUpdateLoading(true);
        setUpdateError(null);

        try {
            const stationData = {
                station_name: formData.name,
                address: formData.address,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude)
            };

            await updateStation(editingStation.id, stationData);

            // Reset form and close dialog
            setFormData({
                name: '',
                address: '',
                latitude: '',
                longitude: ''
            });
            setEditingStation(null);
            setIsEditDialogOpen(false);
            setUpdateError(null);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update station';
            setUpdateError(errorMessage);
        } finally {
            setUpdateLoading(false);
        }
    };

    // Handle status update
    const handleUpdateStatus = async (e) => {
        e.preventDefault();

        if (!statusStation) {
            setStatusUpdateError('No station selected');
            return;
        }

        setStatusUpdateLoading(true);
        setStatusUpdateError(null);

        try {
            await updateStationStatus(statusStation.id, selectedStatus);

            // Close dialog and reset
            setStatusStation(null);
            setSelectedStatus('operational');
            setIsStatusDialogOpen(false);
            setStatusUpdateError(null);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update station status';
            setStatusUpdateError(errorMessage);
        } finally {
            setStatusUpdateLoading(false);
        }
    };

    // Reset form when create dialog closes
    const handleCreateDialogClose = (open) => {
        setIsCreateDialogOpen(open);
        if (!open) {
            setFormData({
                name: '',
                address: '',
                latitude: '',
                longitude: '',
                status: 'operational'
            });
            setCreateError(null);
            setAddressSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Reset form when edit dialog closes
    const handleEditDialogClose = (open) => {
        setIsEditDialogOpen(open);
        if (!open) {
            setFormData({
                name: '',
                address: '',
                latitude: '',
                longitude: ''
            });
            setEditingStation(null);
            setUpdateError(null);
            setAddressSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Reset form when status dialog closes
    const handleStatusDialogClose = (open) => {
        setIsStatusDialogOpen(open);
        if (!open) {
            setStatusStation(null);
            setSelectedStatus('operational');
            setStatusUpdateError(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'operational': return 'bg-green-100 text-green-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'closed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'operational': return 'Operational';
            case 'maintenance': return 'Maintenance';
            case 'closed': return 'Closed';
            default: return 'Unknown';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'operational': return <CheckCircle className="h-4 w-4" />;
            case 'maintenance': return <Clock className="h-4 w-4" />;
            case 'low_stock': return <AlertTriangle className="h-4 w-4" />;
            default: return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const filteredStations = (stations || []).filter(station => {
        const matchesSearch = station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            station.address?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || station.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading stations...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Stations</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={fetchStations} className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Station Management</h1>
                    <p className="mt-2 text-gray-600">Manage and monitor all battery swap stations</p>
                </div>
                <Button
                    className="flex items-center gap-2"
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Add New Station
                </Button>
            </div>

            {/* Filters and Search */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search stations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="operational">Operational</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="closed">Closed</option>
                        </select>
                        {/* <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            More Filters
                        </Button> */}
                    </div>
                </div>
            </Card>

            {/* Stations Table */}
            <Card className="overflow-hidden">
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400 mb-4">
                        <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading stations...</span>
                        </div>
                    </div>
                ) : filteredStations.length === 0 ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="text-center text-gray-500">
                            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No stations found</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Station
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Batteries
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStations.map((station) => (
                                    <tr key={station.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <MapPin className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {station.name || 'Unnamed Station'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {station.address || 'No address provided'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">ID: {station.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                className={`${getStatusColor(station.status || 'operational')} cursor-pointer hover:opacity-80 transition-opacity`}
                                                onClick={() => handleStatusClick(station)}
                                            >
                                                <div className="flex items-center gap-1">
                                                    {getStatusIcon(station.status || 'operational')}
                                                    {getStatusText(station.status || 'operational')}
                                                </div>
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Battery className="h-4 w-4 text-orange-600" />
                                                <span className="text-sm text-gray-900">
                                                    {cabinetLoadingByStation[station.id] ? (
                                                        '...'
                                                    ) : (
                                                        `${batteryCountsByStation[station.id]?.available || 0}/${batteryCountsByStation[station.id]?.total || 0}`
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditClick(station)}
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Stations</p>
                            <p className="text-2xl font-semibold text-gray-900">{(stations || []).length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Operational</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {(stations || []).filter(s => s.status === 'operational').length}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <Battery className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Available Swap Batteries</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {totalSwapBatteries}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Staff</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {staffLoading ? '...' : totalStaff}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Create Station Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Station</DialogTitle>
                        <DialogDescription>
                            Add a new battery swap station. Enter the address to automatically get coordinates.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateStation}>
                        <div className="space-y-4 py-4">
                            {/* Station Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Station Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter station name"
                                    required
                                />
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Address *</Label>
                                <div className="relative">
                                    <Input
                                        ref={addressInputRef}
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleAddressChange(e.target.value)}
                                        onKeyDown={handleAddressKeyDown}
                                        onFocus={() => {
                                            if (addressSuggestions.length > 0) {
                                                setShowSuggestions(true);
                                            }
                                        }}
                                        placeholder="Start typing an address..."
                                        required
                                        autoComplete="off"
                                    />
                                    {(geocodingLoading || autocompleteLoading) && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                        </div>
                                    )}

                                    {/* Autocomplete Suggestions Dropdown */}
                                    {showSuggestions && addressSuggestions.length > 0 && (
                                        <div
                                            ref={suggestionsRef}
                                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                                        >
                                            {addressSuggestions.map((suggestion, index) => (
                                                <div
                                                    key={suggestion.place_id || index}
                                                    onClick={() => handleAddressSelect(suggestion.place_id, suggestion.description)}
                                                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {suggestion.description}
                                                            </p>
                                                            {suggestion.structured_formatting?.secondary_text && (
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {suggestion.structured_formatting.secondary_text}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Start typing to see address suggestions. Select an address to auto-fill coordinates.
                                </p>
                            </div>

                            {/* Latitude and Longitude */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude *</Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                                        placeholder="0.0000"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude *</Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                                        placeholder="0.0000"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    required
                                >
                                    <option value="operational">Operational</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            {/* Error Message */}
                            {createError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        {createError}
                                    </p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleCreateDialogClose(false)}
                                disabled={createLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createLoading}>
                                {createLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Station'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Station Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Station</DialogTitle>
                        <DialogDescription>
                            Update station information. Enter the address to automatically get coordinates.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateStation}>
                        <div className="space-y-4 py-4">
                            {/* Station Name */}
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Station Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter station name"
                                    required
                                />
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="edit-address">Address *</Label>
                                <div className="relative">
                                    <Input
                                        ref={addressInputRef}
                                        id="edit-address"
                                        value={formData.address}
                                        onChange={(e) => handleAddressChange(e.target.value)}
                                        onKeyDown={handleAddressKeyDown}
                                        onFocus={() => {
                                            if (addressSuggestions.length > 0) {
                                                setShowSuggestions(true);
                                            }
                                        }}
                                        placeholder="Start typing an address..."
                                        required
                                        autoComplete="off"
                                    />
                                    {(geocodingLoading || autocompleteLoading) && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                        </div>
                                    )}

                                    {/* Autocomplete Suggestions Dropdown */}
                                    {showSuggestions && addressSuggestions.length > 0 && (
                                        <div
                                            ref={suggestionsRef}
                                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                                        >
                                            {addressSuggestions.map((suggestion, index) => (
                                                <div
                                                    key={suggestion.place_id || index}
                                                    onClick={() => handleAddressSelect(suggestion.place_id, suggestion.description)}
                                                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {suggestion.description}
                                                            </p>
                                                            {suggestion.structured_formatting?.secondary_text && (
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {suggestion.structured_formatting.secondary_text}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Start typing to see address suggestions. Select an address to auto-fill coordinates.
                                </p>
                            </div>

                            {/* Latitude and Longitude */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-latitude">Latitude *</Label>
                                    <Input
                                        id="edit-latitude"
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                                        placeholder="0.0000"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-longitude">Longitude *</Label>
                                    <Input
                                        id="edit-longitude"
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                                        placeholder="0.0000"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {updateError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        {updateError}
                                    </p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleEditDialogClose(false)}
                                disabled={updateLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateLoading}>
                                {updateLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Station'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog open={isStatusDialogOpen} onOpenChange={handleStatusDialogClose}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Update Station Status</DialogTitle>
                        <DialogDescription>
                            Change the status of {statusStation?.name || 'this station'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateStatus}>
                        <div className="space-y-4 py-4">
                            {/* Current Status Display */}
                            {statusStation && (
                                <div className="p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm text-gray-600 mb-1">Current Status</p>
                                    <Badge className={getStatusColor(statusStation.status || 'operational')}>
                                        <div className="flex items-center gap-1">
                                            {getStatusIcon(statusStation.status || 'operational')}
                                            {getStatusText(statusStation.status || 'operational')}
                                        </div>
                                    </Badge>
                                </div>
                            )}

                            {/* Status Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="status-select">New Status *</Label>
                                <select
                                    id="status-select"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    required
                                >
                                    <option value="operational">Operational</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            {/* Error Message */}
                            {statusUpdateError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        {statusUpdateError}
                                    </p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleStatusDialogClose(false)}
                                disabled={statusUpdateLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={statusUpdateLoading}>
                                {statusUpdateLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Status'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StationManagement;
