import React, { useState } from 'react';
import {
    Battery,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    MapPin,
    Activity,
    Zap
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useApi } from '../../hooks/useApi';
import { batteryAPI, batteryTypeAPI, stationAPI } from '../../lib/apiServices';

const BatteryManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterStation, setFilterStation] = useState('all');


    const { data: apiBatteries, loading: batteriesLoading, error: batteriesError } = useApi(batteryAPI.getAll, []);
    const { data: apiBatteryTypes, loading: batteryTypesLoading, error: batteryTypesError } = useApi(batteryTypeAPI.getAll, []);
    const { data: apiStations, loading: stationsLoading, error: stationsError } = useApi(stationAPI.getAll, []);

    // Create a map of battery types by battery_type_id for quick lookup
    const batteryTypeMap = React.useMemo(() => {
        if (!apiBatteryTypes) {
            console.log('BatteryManagement: apiBatteryTypes is null/undefined');
            return {};
        }

        // Handle response structure: { success: true, payload: { batteryTypes: [...] } }
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
                // Use both string and number keys to handle type mismatches
                acc[type.battery_type_id] = type;
                acc[String(type.battery_type_id)] = type;
                acc[Number(type.battery_type_id)] = type;
            }
            return acc;
        }, {});

        console.log('BatteryManagement: batteryTypeMap created with keys:', Object.keys(map));
        return map;
    }, [apiBatteryTypes]);

    // Process stations from API response
    const stations = React.useMemo(() => {
        if (!apiStations) return [{ id: 'all', name: 'All Stations' }];

        // Handle response structure: { success: true, payload: { stations: [...] } }
        const stationsData = apiStations?.payload?.stations ||
            (Array.isArray(apiStations) ? apiStations : []);

        if (!Array.isArray(stationsData) || stationsData.length === 0) {
            return [{ id: 'all', name: 'All Stations' }];
        }

        // Transform stations to include 'All Stations' option
        const transformedStations = [
            { id: 'all', name: 'All Stations' },
            ...stationsData.map(station => ({
                id: station.station_id || station.id,
                name: station.station_name || station.name || 'Unknown Station'
            }))
        ];

        return transformedStations;
    }, [apiStations]);

    // Create a map of station IDs to station names for battery location lookup
    const stationMap = React.useMemo(() => {
        const map = {};
        stations.forEach(station => {
            if (station.id !== 'all') {
                map[station.id] = station.name;
                // Handle both string and number keys
                map[String(station.id)] = station.name;
                map[Number(station.id)] = station.name;
            }
        });
        return map;
    }, [stations]);

    // Handle batteries response structure - could be direct array or in payload
    const batteriesArray = Array.isArray(apiBatteries)
        ? apiBatteries
        : (apiBatteries?.payload?.batteries || apiBatteries?.batteries || []);

    const batteries = batteriesArray.map((b) => {
        const batteryTypeId = b?.battery_type_id;
        // Try both number and string keys for lookup
        const batteryType = batteryTypeId ?
            (batteryTypeMap[batteryTypeId] || batteryTypeMap[String(batteryTypeId)] || batteryTypeMap[Number(batteryTypeId)]) :
            null;

        if (batteryTypeId && !batteryType) {
            console.log('BatteryManagement: No battery type found for battery_type_id:', batteryTypeId, 'Available keys:', Object.keys(batteryTypeMap));
        }

        // Get station name from station_id
        const stationId = b?.station_id;
        const stationName = stationId ?
            (stationMap[stationId] || stationMap[String(stationId)] || stationMap[Number(stationId)] || null) :
            null;

        return {
            id: b?.battery_id ?? b?.battery_serial ?? null,
            serialNumber: b?.battery_serial ?? null,
            status: b?.status ?? null,
            soh: b?.current_soh != null ? parseFloat(b.current_soh) : null,
            soc: b?.current_soc != null ? parseFloat(b.current_soc) : null,
            model: batteryType?.battery_type_code ?? null,
            location: stationName,
            stationId: stationId,
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

    const filteredBatteries = batteries.filter(battery => {
        const matchesSearch = (battery.id ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (battery.serialNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (battery.model ?? '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || (battery.status === filterStatus);
        const matchesStation = filterStation === 'all' ||
            (battery.stationId != null && (String(battery.stationId) === String(filterStation) || battery.stationId === Number(filterStation)));
        return matchesSearch && matchesStatus && matchesStation;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Battery Management</h1>
                    <p className="mt-2 text-gray-600">Monitor and manage battery inventory and health</p>
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
                            <option value="all">All Status</option>
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
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            More Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Batteries Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredBatteries.map((battery) => (
                    <Card key={battery.serialNumber} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <Battery className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">{battery.serialNumber}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <Badge className={getStatusColor(battery.status)}>
                                    <div className="flex items-center gap-1">
                                        {getStatusIcon(battery.status)}
                                        {getStatusText(battery.status)}
                                    </div>
                                </Badge>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
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
                                    <p className="text-xs text-gray-500">State of Health</p>
                                    <p className={`text-lg font-semibold ${getSohColor(battery.soh)}`}>
                                        {battery.soh}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">State of Charge</p>
                                    <p className={`text-lg font-semibold ${getSocColor(battery.soc)}`}>
                                        {battery.soc}%
                                    </p>
                                </div>
                            </div>

                            {/* Technical Specs */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Battery Type</p>
                                    <p className="font-medium">{battery.model ?? 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Cell Chemistry</p>
                                    <p className="font-medium">{battery.cellChemistry ?? 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Capacity</p>
                                    <p className="font-medium">{battery.capacity != null ? `${battery.capacity} Ah` : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Voltage</p>
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

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Battery className="h-6 w-6 text-blue-a" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Batteries</p>
                            <p className="text-2xl font-semibold text-gray-900">{batteries.length}</p>
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
                                {batteries.filter(b => b.status === 'available').length}
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
                                {batteries.filter(b => b.status === 'maintenance' || b.status === 'degraded').length}
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
                                {batteries.length > 0 ? Math.round(batteries.reduce((sum, b) => sum + (b.soc ?? 0), 0) / batteries.length) : 0}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Health Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Battery Health Distribution</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Excellent (90-100%)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                                <span className="text-sm font-medium">3</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Good (80-89%)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                                </div>
                                <span className="text-sm font-medium">1</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Fair (70-79%)</span>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Alerts</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">BAT005 - Degraded</span>
                            </div>
                            <span className="text-xs text-red-600">Urgent</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">BAT003 - Maintenance Due</span>
                            </div>
                            <span className="text-xs text-yellow-600">Jan 25</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">BAT001 - Healthy</span>
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

