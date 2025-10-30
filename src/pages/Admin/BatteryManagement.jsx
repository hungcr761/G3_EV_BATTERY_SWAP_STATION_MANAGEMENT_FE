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
import { batteryAPI } from '../../lib/apiServices';

const BatteryManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterStation, setFilterStation] = useState('all');


    const { data: apiBatteries, loading: batteriesLoading, error: batteriesError } = useApi(batteryAPI.getAll, []);

    const batteries = Array.isArray(apiBatteries)
        ? apiBatteries.map((b) => ({
            id: b?.battery_id ?? b?.battery_serial ?? null,
            serialNumber: b?.battery_serial ?? null,
            status: b?.status ?? null,
            soh: b?.current_soh != null ? parseFloat(b.current_soh) : null,
            soc: b?.current_soc != null ? parseFloat(b.current_soc) : null,
            // Fields not provided by API -> leave null
            model: null,
            cycles: null,
            lastCharge: null,
            location: null,
            capacity: null,
            voltage: null,
            temperature: null,
            healthScore: null,
            nextMaintenance: null,
            totalSwaps: null,
        }))
        : [];

    const stations = ['All Stations', 'Station A1', 'Station A2', 'Station B1', 'Station B2', 'Station C1'];

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
        const matchesStation = filterStation === 'all' || (battery.location === filterStation);
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
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Battery
                </Button>
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
                        >
                            {stations.map(station => (
                                <option key={station} value={station === 'All Stations' ? 'all' : station}>
                                    {station}
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
                                <p className="font-medium">{battery.model}</p>
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
                                    <p className="text-gray-500">Cycles</p>
                                    <p className="font-medium">{battery.cycles}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Voltage</p>
                                    <p className="font-medium">{battery.voltage}V</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Temperature</p>
                                    <p className="font-medium">{battery.temperature}°C</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Total Swaps</p>
                                    <p className="font-medium">{battery.totalSwaps}</p>
                                </div>
                            </div>

                            {/* Last Charge */}
                            <div className="pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500">Last Charge</p>
                                <p className="text-sm text-gray-900">{battery.lastCharge}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-3">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
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
                            <Battery className="h-6 w-6 text-blue-600" />
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

