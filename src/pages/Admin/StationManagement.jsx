import React, { useState } from 'react';
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
    Clock
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

const StationManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Mock data - will be replaced with real API calls
    const stations = [
        {
            id: 1,
            name: 'Station A1 - Downtown',
            location: '123 Main St, Downtown',
            coordinates: { lat: 10.7769, lng: 106.7009 },
            status: 'operational',
            batteryCount: 12,
            capacity: 20,
            staffCount: 3,
            lastMaintenance: '2024-01-15',
            nextMaintenance: '2024-02-15',
            swapsToday: 45,
            usersServed: 38
        },
        {
            id: 2,
            name: 'Station A2 - Mall Area',
            location: '456 Shopping Ave, Mall District',
            coordinates: { lat: 10.7869, lng: 106.7109 },
            status: 'operational',
            batteryCount: 8,
            capacity: 15,
            staffCount: 2,
            lastMaintenance: '2024-01-10',
            nextMaintenance: '2024-02-10',
            swapsToday: 32,
            usersServed: 28
        },
        {
            id: 3,
            name: 'Station B1 - Airport',
            location: '789 Airport Blvd, Terminal 2',
            coordinates: { lat: 10.7969, lng: 106.7209 },
            status: 'maintenance',
            batteryCount: 0,
            capacity: 25,
            staffCount: 4,
            lastMaintenance: '2024-01-20',
            nextMaintenance: '2024-01-25',
            swapsToday: 0,
            usersServed: 0
        },
        {
            id: 4,
            name: 'Station B2 - University',
            location: '321 Campus Rd, University Area',
            coordinates: { lat: 10.8069, lng: 106.7309 },
            status: 'low_stock',
            batteryCount: 3,
            capacity: 18,
            staffCount: 2,
            lastMaintenance: '2024-01-12',
            nextMaintenance: '2024-02-12',
            swapsToday: 28,
            usersServed: 25
        },
        {
            id: 5,
            name: 'Station C1 - Business District',
            location: '654 Corporate St, Business Center',
            coordinates: { lat: 10.8169, lng: 106.7409 },
            status: 'operational',
            batteryCount: 15,
            capacity: 20,
            staffCount: 3,
            lastMaintenance: '2024-01-18',
            nextMaintenance: '2024-02-18',
            swapsToday: 52,
            usersServed: 48
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'operational': return 'bg-green-100 text-green-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'low_stock': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'operational': return 'Operational';
            case 'maintenance': return 'Maintenance';
            case 'low_stock': return 'Low Stock';
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

    const filteredStations = stations.filter(station => {
        const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            station.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || station.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Station Management</h1>
                    <p className="mt-2 text-gray-600">Manage and monitor all battery swap stations</p>
                </div>
                <Button className="flex items-center gap-2">
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
                            <option value="low_stock">Low Stock</option>
                        </select>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            More Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Stations Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredStations.map((station) => (
                    <Card key={station.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">{station.name}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <Badge className={getStatusColor(station.status)}>
                                    <div className="flex items-center gap-1">
                                        {getStatusIcon(station.status)}
                                        {getStatusText(station.status)}
                                    </div>
                                </Badge>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">{station.location}</p>

                            {/* Battery Status */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Battery className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm text-gray-600">Batteries</span>
                                </div>
                                <span className="text-sm font-medium">
                                    {station.batteryCount}/{station.capacity}
                                </span>
                            </div>

                            {/* Staff Count */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-gray-600">Staff</span>
                                </div>
                                <span className="text-sm font-medium">{station.staffCount}</span>
                            </div>

                            {/* Today's Stats */}
                            <div className="pt-3 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Swaps Today</p>
                                        <p className="font-semibold text-gray-900">{station.swapsToday}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Users Served</p>
                                        <p className="font-semibold text-gray-900">{station.usersServed}</p>
                                    </div>
                                </div>
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
                            <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Stations</p>
                            <p className="text-2xl font-semibold text-gray-900">{stations.length}</p>
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
                                {stations.filter(s => s.status === 'operational').length}
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
                                {stations.reduce((sum, s) => sum + s.batteryCount, 0)}
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
                                {stations.reduce((sum, s) => sum + s.staffCount, 0)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StationManagement;
