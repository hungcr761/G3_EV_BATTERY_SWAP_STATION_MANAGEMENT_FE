import React from 'react';
import {
    MapPin,
    Users,
    Battery,
    TrendingUp,
    AlertTriangle,
    Clock,
    DollarSign,
    Activity,
    BarChart3,
    Loader2
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useStation } from '../../hooks/useStation';

const AdminDashboard = () => {
    const { stations, loading: stationsLoading, error: stationsError } = useStation();

    // Mock data - will be replaced with real API calls
    const stats = [
        {
            name: 'Total Stations',
            value: stationsLoading ? '...' : (stations || []).length.toString(),
            changeType: 'positive',
            icon: MapPin,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            name: 'Active Users',
            value: '1,234',
            change: '+12%',
            changeType: 'positive',
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            name: 'Batteries in Stock',
            value: '456',
            change: '-8',
            changeType: 'negative',
            icon: Battery,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            name: 'Monthly Revenue',
            value: '$45,678',
            change: '+23%',
            changeType: 'positive',
            icon: DollarSign,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        }
    ];

    const recentActivities = [
        {
            id: 1,
            type: 'swap',
            message: 'Battery swap completed at Station A1',
            time: '2 minutes ago',
            status: 'success'
        },
        {
            id: 2,
            type: 'alert',
            message: 'Low battery stock at Station B2',
            time: '15 minutes ago',
            status: 'warning'
        },
        {
            id: 3,
            type: 'user',
            message: 'New user registration: John Doe',
            time: '1 hour ago',
            status: 'info'
        },
        {
            id: 4,
            type: 'maintenance',
            message: 'Station C3 maintenance scheduled',
            time: '2 hours ago',
            status: 'info'
        }
    ];

    // Use real station data or fallback to mock data
    const stationStatus = (stations || []).length > 0 ? stations.slice(0, 5).map(station => ({
        name: station.name || 'Unnamed Station',
        location: station.address || 'No address',
        status: station.status || 'operational',
        batteries: station.current_battery_count || 0,
        capacity: station.max_battery_capacity || 0,
        swapsToday: 0, // This would come from a separate API call
        usersServed: 0 // This would come from a separate API call
    })) : [
        { name: 'Station A1', location: 'Downtown', status: 'operational', batteries: 12, capacity: 20, swapsToday: 45, usersServed: 38 },
        { name: 'Station A2', location: 'Mall Area', status: 'operational', batteries: 8, capacity: 15, swapsToday: 32, usersServed: 28 },
        { name: 'Station B1', location: 'Airport', status: 'maintenance', batteries: 0, capacity: 25, swapsToday: 0, usersServed: 0 },
        { name: 'Station B2', location: 'University', status: 'low_stock', batteries: 3, capacity: 18, swapsToday: 28, usersServed: 25 },
        { name: 'Station C1', location: 'Business District', status: 'operational', batteries: 15, capacity: 20, swapsToday: 52, usersServed: 48 },
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

    if (stationsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    if (stationsError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
                    <p className="text-gray-600 mb-4">{stationsError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your battery swap stations.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.name} className="p-6">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                </div>
                            </div>

                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Activities */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                        <Badge variant="outline">Live</Badge>
                    </div>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3">
                                <div className={`p-2 rounded-full ${activity.status === 'success' ? 'bg-green-100' :
                                    activity.status === 'warning' ? 'bg-yellow-100' :
                                        'bg-blue-100'
                                    }`}>
                                    {activity.type === 'swap' && <Activity className="h-4 w-4 text-green-600" />}
                                    {activity.type === 'alert' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                                    {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                                    {activity.type === 'maintenance' && <Clock className="h-4 w-4 text-blue-600" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">{activity.message}</p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Station Status */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Station Status</h3>
                        <Badge variant="outline">Real-time</Badge>
                    </div>
                    <div className="space-y-3">
                        {stationStatus.map((station, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{station.name}</p>
                                    <p className="text-sm text-gray-500">{station.location}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {station.batteries}/{station.capacity}
                                        </p>
                                        <p className="text-xs text-gray-500">batteries</p>
                                        <p className="text-xs text-gray-500">{station.swapsToday} swaps today</p>
                                    </div>
                                    <Badge className={getStatusColor(station.status)}>
                                        {getStatusText(station.status)}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <MapPin className="h-6 w-6 text-blue-600 mb-2" />
                        <p className="font-medium text-gray-900">Add New Station</p>
                        <p className="text-sm text-gray-500">Register a new battery swap station</p>
                    </button>
                    <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Users className="h-6 w-6 text-green-600 mb-2" />
                        <p className="font-medium text-gray-900">Manage Staff</p>
                        <p className="text-sm text-gray-500">Add or update station staff</p>
                    </button>
                    <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Battery className="h-6 w-6 text-orange-600 mb-2" />
                        <p className="font-medium text-gray-900">Battery Inventory</p>
                        <p className="text-sm text-gray-500">Check and manage battery stock</p>
                    </button>
                    <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
                        <p className="font-medium text-gray-900">View Reports</p>
                        <p className="text-sm text-gray-500">Generate analytics and reports</p>
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
