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
import { useApi } from '../../hooks/useApi';
import { batteryAPI } from '../../lib/apiServices';
import { useUser } from '../../hooks/useUser';
import { useShifts } from '../../hooks/useShifts';

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
        longitude: ''
    });
    const [geocodingLoading, setGeocodingLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
    const [statusUpdateError, setStatusUpdateError] = useState(null);

    // Fetch all batteries
    const { data: batteriesData, loading: batteriesLoading } = useApi(batteryAPI.getAll, []);

    // Fetch all staff with role filter
    const { pagination: staffPagination, loading: staffLoading } = useUser({
        page: 1,
        pageSize: 1,
        role: 'staff',
        email: '',
        fullname: ''
    });

    // Fetch all shifts
    const { shifts, loading: shiftsLoading } = useShifts();

    const totalBatteries = batteriesData?.length || 0;

    // Get total staff from pagination
    const totalStaff = staffPagination?.total || 0;

    // Calculate staff count per station from shifts
    const staffCountByStation = useMemo(() => {
        const countMap = {};

        // Group shifts by station_id and count unique staff_id
        (shifts || []).forEach(shift => {
            const stationId = shift.station_id;
            const staffId = shift.staff_id;

            if (stationId && staffId) {
                if (!countMap[stationId]) {
                    countMap[stationId] = new Set();
                }
                countMap[stationId].add(staffId);
            }
        });

        // Convert Sets to counts
        const result = {};
        Object.keys(countMap).forEach(stationId => {
            result[stationId] = countMap[stationId].size;
        });

        return result;
    }, [shifts]);

    // Geocode address using Goong Map API
    const geocodeAddress = async (address) => {
        if (!address || address.trim() === '') {
            return;
        }

        setGeocodingLoading(true);
        try {
            const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY;
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(
                `https://rsapi.goong.io/Geocode?address=${encodedAddress}&api_key=${GOONG_API_KEY}`
            );

            if (!response.ok) {
                throw new Error('Geocoding failed');
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const firstResult = data.results[0];
                const location = firstResult.geometry?.location;

                if (location) {
                    setFormData(prev => ({
                        ...prev,
                        latitude: location.lat?.toString() || '',
                        longitude: location.lng?.toString() || ''
                    }));
                }
            }
        } catch (err) {
            console.error('Error geocoding address:', err);
            setCreateError('Failed to get coordinates for address. Please enter manually.');
        } finally {
            setGeocodingLoading(false);
        }
    };

    // Debounce timer ref
    const geocodeTimerRef = useRef(null);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (geocodeTimerRef.current) {
                clearTimeout(geocodeTimerRef.current);
            }
        };
    }, []);

    // Handle address input with debounce
    const handleAddressChange = (value) => {
        setFormData(prev => ({ ...prev, address: value }));
        setCreateError(null);

        // Clear existing timer
        if (geocodeTimerRef.current) {
            clearTimeout(geocodeTimerRef.current);
        }

        // Debounce geocoding
        geocodeTimerRef.current = setTimeout(() => {
            if (value && value.trim().length > 5) {
                geocodeAddress(value);
            }
        }, 1000);
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
                longitude: parseFloat(formData.longitude)
            };

            await createStation(stationData);

            // Reset form and close dialog
            setFormData({
                name: '',
                address: '',
                latitude: '',
                longitude: ''
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
                longitude: ''
            });
            setCreateError(null);
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

            {/* Stations Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredStations.map((station) => (
                    <Card key={station.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900">{station.name || 'Unnamed Station'}</h3>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 ml-7">ID: {station.id}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Badge
                                    className={`${getStatusColor(station.status || 'operational')} cursor-pointer hover:opacity-80 transition-opacity`}
                                    onClick={() => handleStatusClick(station)}
                                >
                                    <div className="flex items-center gap-1">
                                        {getStatusIcon(station.status || 'operational')}
                                        {getStatusText(station.status || 'operational')}
                                    </div>
                                </Badge>
                                {/* <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button> */}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">{station.address || 'No address provided'}</p>

                            {/* Battery Status */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Battery className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm text-gray-600">Batteries</span>
                                </div>
                                <span className="text-sm font-medium">
                                    {station.current_battery_count || 0}/{station.max_battery_capacity || 0}
                                </span>
                            </div>

                            {/* Staff Count */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-gray-600">Staff</span>
                                </div>
                                <span className="text-sm font-medium">
                                    {shiftsLoading ? '...' : (staffCountByStation[station.id] || 0)}
                                </span>
                            </div>


                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-3">
                                {/* <Button variant="outline" size="sm" className="flex-1">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </Button> */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleEditClick(station)}
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

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
                            <p className="text-sm font-medium text-gray-600">Total Batteries</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {batteriesLoading ? '...' : totalBatteries}
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
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleAddressChange(e.target.value)}
                                        placeholder="Enter address (will auto-get coordinates)"
                                        required
                                    />
                                    {geocodingLoading && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Coordinates will be automatically fetched when you enter an address
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
                                        id="edit-address"
                                        value={formData.address}
                                        onChange={(e) => handleAddressChange(e.target.value)}
                                        placeholder="Enter address (will auto-get coordinates)"
                                        required
                                    />
                                    {geocodingLoading && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Coordinates will be automatically fetched when you enter an address
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
