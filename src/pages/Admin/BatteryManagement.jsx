import React, { useState, useEffect, useCallback } from 'react';
import {
    Battery,
    Search,
    Trash2,
    Eye,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    MapPin,
    Activity,
    Zap,
    ArrowUpNarrowWide,
    ArrowDownNarrowWide,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useApi } from '../../hooks/useApi';
import { batteryAPI, batteryTypeAPI, stationAPI, cabinetAPI } from '../../lib/apiServices';
// Removed transfer management from this page; handled in AdminTransferManagement

const BatteryManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterStation, setFilterStation] = useState('all');
    const [sortField, setSortField] = useState('none');
    const [sortDirection, setSortDirection] = useState('desc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 12,
        total: 0,
        totalPages: 0
    });
    const [batteriesData, setBatteriesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { data: apiBatteryTypes } = useApi(batteryTypeAPI.getAll, []);
    const { data: apiStations, loading: stationsLoading } = useApi(stationAPI.getAll, []);
    const { data: apiCabinets } = useApi(() => cabinetAPI.getAll({ page: 1, pageSize: 100 }), []);

    // Fetch batteries with pagination
    const fetchBatteries = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                pageSize,
                ...(filterStatus !== 'all' && { status: filterStatus }),
                ...(filterStation !== 'all' && { station_id: filterStation }),
                ...(searchTerm && searchTerm.trim() && { search: searchTerm.trim() })
            };

            const response = await batteryAPI.getAll(params);

            if (response.data?.success && response.data?.payload) {
                const batteriesArray = response.data.payload.data || response.data.payload.batteries?.data || [];
                const total = response.data.payload.total || response.data.payload.batteries?.total || 0;
                const pageSizeFromApi = response.data.payload.pageSize || response.data.payload.batteries?.pageSize || pageSize;
                const totalPages = Math.ceil(total / pageSizeFromApi);

                setBatteriesData(batteriesArray);
                setPagination({
                    page,
                    pageSize: pageSizeFromApi,
                    total,
                    totalPages
                });
            } else if (response.data?.payload?.batteries) {
                // Handle nested structure: payload.batteries.data
                const batteriesArray = Array.isArray(response.data.payload.batteries.data)
                    ? response.data.payload.batteries.data
                    : Array.isArray(response.data.payload.batteries)
                        ? response.data.payload.batteries
                        : [];
                const total = response.data.payload.batteries.total || batteriesArray.length;
                const totalPages = Math.ceil(total / pageSize);

                setBatteriesData(batteriesArray);
                setPagination({
                    page,
                    pageSize,
                    total,
                    totalPages
                });
            } else if (Array.isArray(response.data)) {
                // Handle direct array response
                setBatteriesData(response.data);
                setPagination({
                    page: 1,
                    pageSize: response.data.length,
                    total: response.data.length,
                    totalPages: 1
                });
            } else {
                setBatteriesData([]);
                setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
            }
        } catch (err) {
            console.error('Error fetching batteries:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch batteries');
            setBatteriesData([]);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, filterStatus, filterStation, searchTerm]);

    useEffect(() => {
        fetchBatteries();
    }, [fetchBatteries]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [filterStatus, filterStation]);

    // Debounce search and reset page
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(1);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Create a map of battery types by battery_type_id for quick lookup
    const batteryTypeMap = (() => {
        if (!apiBatteryTypes) {
            console.log('BatteryManagement: apiBatteryTypes is null/undefined');
            return {};
        }

        const types = apiBatteryTypes?.payload?.batteryTypes ||
            (Array.isArray(apiBatteryTypes) ? apiBatteryTypes : []);

        console.log('BatteryManagement: apiBatteryTypes structure:', {
            hasPayload: !!apiBatteryTypes?.payload,
            hasBatteryTypes: !!apiBatteryTypes?.payload?.batteryTypes,
            isArray: Array.isArray(apiBatteryTypes),
            typesCount: Array.isArray(types) ? types.length : 0,
            firstType: Array.isArray(types) && types.length > 0 ? types[0] : null
        });

        if (!Array.isArray(types) || types.length === 0) {
            console.log('BatteryManagement: No battery types found');
            return {};
        }

        const map = types.reduce((acc, type) => {
            if (type?.battery_type_id != null) {
                acc[type.battery_type_id] = type;
                acc[String(type.battery_type_id)] = type;
                acc[Number(type.battery_type_id)] = type;
            }
            return acc;
        }, {});

        console.log('BatteryManagement: batteryTypeMap created with keys:', Object.keys(map));
        return map;
    })();

    const stations = (() => {
        if (!apiStations) return [{ id: 'all', name: 'All Stations' }];

        const stationsData = apiStations?.payload?.stations ||
            (Array.isArray(apiStations) ? apiStations : []);

        if (!Array.isArray(stationsData) || stationsData.length === 0) {
            return [{ id: 'all', name: 'All Stations' }];
        }

        return [
            { id: 'all', name: 'All Stations' },
            ...stationsData.map(station => ({
                id: station.station_id || station.id,
                name: station.station_name || station.name || 'Unknown Station'
            }))
        ];
    })();

    const stationMap = (() => {
        const map = {};
        stations.forEach(station => {
            if (station.id !== 'all') {
                map[station.id] = station.name;
                map[String(station.id)] = station.name;
                map[Number(station.id)] = station.name;
            }
        });
        return map;
    })();

    const cabinets = (() => {
        if (!apiCabinets) return [];

        const payloadCabinets = apiCabinets?.payload?.cabinets;
        const dataArray = Array.isArray(payloadCabinets?.data)
            ? payloadCabinets.data
            : Array.isArray(payloadCabinets)
                ? payloadCabinets
                : Array.isArray(apiCabinets?.cabinets?.data)
                    ? apiCabinets.cabinets.data
                    : Array.isArray(apiCabinets?.cabinets)
                        ? apiCabinets.cabinets
                        : Array.isArray(apiCabinets)
                            ? apiCabinets
                            : [];

        return Array.isArray(dataArray) ? dataArray : [];
    })();

    const batteryLocationMap = (() => {
        const map = {};

        const addEntry = (key, value) => {
            if (key == null) return;
            map[key] = value;
            map[String(key)] = value;
            const numericKey = Number(key);
            if (!Number.isNaN(numericKey)) {
                map[numericKey] = value;
            }
        };

        cabinets.forEach(cabinet => {
            const stationId =
                cabinet?.station_id ??
                cabinet?.stationId ??
                cabinet?.station?.station_id ??
                cabinet?.station?.id ??
                null;

            const cabinetInfo = {
                cabinetId: cabinet?.cabinet_id ?? cabinet?.id ?? null,
                cabinetCode: cabinet?.cabinet_code ?? cabinet?.code ?? null,
                stationId
            };

            (cabinet?.slots ?? []).forEach(slot => {
                const battery = slot?.battery;
                if (!battery) {
                    return;
                }

                const locationInfo = {
                    ...cabinetInfo,
                    slotId: slot?.slot_id ?? slot?.id ?? null,
                    slotNumber: slot?.slot_number ?? slot?.slotNumber ?? null
                };

                const possibleKeys = [
                    battery?.battery_id,
                    battery?.id,
                    battery?.battery_serial,
                    battery?.batteryId
                ];

                possibleKeys.forEach(key => addEntry(key, locationInfo));
            });
        });

        return map;
    })();

    // Process batteries data
    const batteries = batteriesData.map((b) => {
        const batteryTypeId = b?.battery_type_id;
        // Try both number and string keys for lookup
        const batteryType = batteryTypeId ?
            (batteryTypeMap[batteryTypeId] || batteryTypeMap[String(batteryTypeId)] || batteryTypeMap[Number(batteryTypeId)]) :
            null;

        if (batteryTypeId && !batteryType) {
            console.log('BatteryManagement: No battery type found for battery_type_id:', batteryTypeId, 'Available keys:', Object.keys(batteryTypeMap));
        }

        // Get station name from station_id
        const slotId = b?.slot_id ?? b?.slotId ?? null;
        const vehicleId = b?.vehicle_id ?? b?.vehicleId ?? null;
        const batteryId = b?.battery_id ?? b?.id ?? b?.battery_serial ?? null;

        const locationInfo = batteryLocationMap[batteryId] ||
            (batteryId != null ? batteryLocationMap[String(batteryId)] : null) ||
            (batteryId != null ? batteryLocationMap[Number(batteryId)] : null);

        const resolvedStationId = locationInfo?.stationId ??
            b?.station_id ??
            b?.stationId ??
            null;

        const stationName = resolvedStationId != null ?
            (stationMap[resolvedStationId] ||
                stationMap[String(resolvedStationId)] ||
                stationMap[Number(resolvedStationId)] ||
                null) :
            null;

        let location = 'Unknown';

        if (!slotId) {
            location = 'Vehicle';
        } else if (vehicleId == null) {
            location = stationName ? `${stationName}` : 'Station';
        }

        return {
            id: b?.battery_id ?? b?.battery_serial ?? null,
            serialNumber: b?.battery_serial ?? null,
            status: b?.status ?? null,
            soh: b?.current_soh != null ? parseFloat(b.current_soh) : null,
            soc: b?.current_soc != null ? parseFloat(b.current_soc) : null,
            model: batteryType?.battery_type_code ?? null,
            location,
            stationId: resolvedStationId,
            capacity: batteryType?.nominal_capacity ?? null,
            voltage: batteryType?.nominal_voltage ?? null,
            cellChemistry: batteryType?.cell_chemistry ?? null
        };
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'charging': return 'bg-blue-100 text-blue-800';
            case 'in_use': return 'bg-purple-100 text-purple-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'degraded': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'available': return 'Available';
            case 'charging': return 'Charging';
            case 'in_use': return 'In Use';
            case 'maintenance': return 'Maintenance';
            case 'degraded': return 'Degraded';
            default: return 'Unknown';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'available': return <CheckCircle className="h-4 w-4" />;
            case 'charging': return <Zap className="h-4 w-4" />;
            case 'in_use': return <Activity className="h-4 w-4" />;
            case 'maintenance': return <Clock className="h-4 w-4" />;
            case 'degraded': return <AlertTriangle className="h-4 w-4" />;
            default: return <Battery className="h-4 w-4" />;
        }
    };

    const getSocColor = (soc) => {
        if (soc >= 90) return 'text-green-600';
        if (soc >= 80) return 'text-yellow-600';
        if (soc >= 70) return 'text-orange-600';
        return 'text-red-600';
    };

    const getSohColor = (soh) => {
        if (soh >= 90) return 'text-green-600';
        if (soh >= 80) return 'text-yellow-600';
        if (soh >= 70) return 'text-orange-600';
        return 'text-red-600';
    };

    // Apply client-side sorting only (filtering is done server-side via API)
    const filteredBatteries = (() => {
        if (sortField === 'none') {
            return batteries;
        }

        const sorted = [...batteries];

        const getSortValue = (battery) => {
            const value = sortField === 'soc' ? battery.soc : battery.soh;
            return typeof value === 'number' && !Number.isNaN(value) ? value : null;
        };

        sorted.sort((a, b) => {
            const aVal = getSortValue(a);
            const bVal = getSortValue(b);

            const aHas = aVal != null;
            const bHas = bVal != null;

            if (!aHas && !bHas) return 0;
            if (!aHas) return 1;
            if (!bHas) return -1;

            if (aVal === bVal) return 0;

            return sortDirection === 'asc' ? (aVal - bVal) : (bVal - aVal);
        });

        return sorted;
    })();

    const toggleSortDirection = () => {
        setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(parseInt(newPageSize));
        setPage(1);
    };

    // Debounce search term - removed to avoid conflicts with fetchBatteries dependency


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Battery Management</h1>
                    <p className="mt-2 text-gray-600">Monitor and manage battery inventory and health.</p>
                </div>
            </div>

            {/* Filters and Search */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search batteries..."
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
                            <option value="all">All Statuses</option>
                            <option value="available">Available</option>
                            <option value="charging">Charging</option>
                            <option value="in_use">In Use</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="degraded">Degraded</option>
                        </select>
                        <select
                            value={filterStation}
                            onChange={(e) => setFilterStation(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            disabled={stationsLoading}
                        >
                            {stations.map(station => (
                                <option key={station.id} value={station.id}>
                                    {station.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="12">12 per page</option>
                            <option value="24">24 per page</option>
                            <option value="48">48 per page</option>
                            <option value="96">96 per page</option>
                        </select>
                        <div className="flex items-center gap-2">
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="none">Default</option>
                                <option value="soh">SOH</option>
                                <option value="soc">SOC</option>
                            </select>
                            <Button
                                type="button"
                                variant="outline"
                                className={`flex items-center gap-1 px-3 ${sortField === 'none' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={toggleSortDirection}
                                aria-label="Toggle sort direction"
                                disabled={sortField === 'none'}
                            >
                                {sortDirection === 'asc' ? (
                                    <>
                                        <ArrowDownNarrowWide className="h-4 w-4" />
                                        {/* <span className="text-sm">Asc</span> */}
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpNarrowWide className="h-4 w-4" />
                                        {/* <span className="text-sm">Desc</span> */}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Transfer requests are now managed on AdminTransferManagement page */}

            {/* Error Message */}
            {error && (
                <Card className="p-4 bg-red-50 border-l-4 border-red-400">
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </Card>
            )}

            {/* Batteries Grid */}
            {loading ? (
                <Card className="p-12">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading batteries...</span>
                        </div>
                    </div>
                </Card>
            ) : filteredBatteries.length === 0 ? (
                <Card className="p-12">
                    <div className="flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <Battery className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No batteries found</p>
                        </div>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredBatteries.map((battery) => (
                            <Card key={battery.serialNumber} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <Battery className="h-5 w-5 text-blue-600" />
                                        <h3 className="font-semibold text-gray-900 text-md">{battery.serialNumber}</h3>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Badge className={getStatusColor(battery.status)}>
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon(battery.status)}
                                                {getStatusText(battery.status)}
                                            </div>
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-sm text-gray-600">
                                        <p className="text-xs">ID: {battery.id}</p>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{battery.location}</span>
                                    </div>

                                    {/* Health Metrics */}
                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                                        <div>
                                            <p className="text-xs text-gray-500">State of Health (SOH)</p>
                                            <p className={`text-lg font-semibold ${getSohColor(battery.soh)}`}>
                                                {battery.soh}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">State of Charge (SOC)</p>
                                            <p className={`text-lg font-semibold ${getSocColor(battery.soc)}`}>
                                                {battery.soc}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Technical Specs */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Battery Type Code</p>
                                            <p className="font-medium">{battery.model ?? 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Cell Chemistry</p>
                                            <p className="font-medium">{battery.cellChemistry ?? 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Nominal Capacity</p>
                                            <p className="font-medium">{battery.capacity != null ? `${battery.capacity} Ah` : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Nominal Voltage</p>
                                            <p className="font-medium">{battery.voltage != null ? `${battery.voltage}V` : 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-3">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                                    </span> of{' '}
                                    <span className="font-medium">{pagination.total}</span> results
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1 || loading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <div className="text-sm text-gray-700">
                                        Page <span className="font-medium">{pagination.page}</span> of{' '}
                                        <span className="font-medium">{pagination.totalPages}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages || loading}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Battery className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Batteries</p>
                            <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Available</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {filteredBatteries.filter(b => b.status === 'available').length}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Need Maintenance</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {filteredBatteries.filter(b => b.status === 'maintenance' || b.status === 'degraded').length}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Avg SOC</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {filteredBatteries.length > 0 ? Math.round(filteredBatteries.reduce((sum, b) => sum + (b.soc ?? 0), 0) / filteredBatteries.length) : 0}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Health Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Battery Health Distribution (Sample)</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Excellent (90–100%)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                                <span className="text-sm font-medium">3</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Good (80–89%)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                                </div>
                                <span className="text-sm font-medium">1</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Fair (70–79%)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                                </div>
                                <span className="text-sm font-medium">1</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Poor (Below 70%)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                <span className="text-sm font-medium">0</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Alerts (Sample)</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">BAT005 – Degraded</span>
                            </div>
                            <span className="text-xs text-red-600">Urgent</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">BAT003 – Maintenance Due</span>
                            </div>
                            <span className="text-xs text-yellow-600">Jan 25</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">BAT001 – Healthy</span>
                            </div>
                            <span className="text-xs text-blue-600">Good</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default BatteryManagement;

