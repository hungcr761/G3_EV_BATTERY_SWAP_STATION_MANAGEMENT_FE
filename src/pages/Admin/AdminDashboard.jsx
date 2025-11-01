import React from 'react';
import { Link } from 'react-router';
import {
    MapPin,
    Users,
    Battery,
    TrendingUp,
    TrendingDown,
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
import { useApi } from '../../hooks/useApi';
import { batteryAPI, analysisAPI, userAPI } from '../../lib/apiServices';
import { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const { stations, loading: stationsLoading, error: stationsError } = useStation();
    const { data: batteries, loading: batteriesLoading, error: batteriesError } = useApi(batteryAPI.getAll, []);

    // Fetch monthly revenue
    const [monthlyRevenue, setMonthlyRevenue] = useState(null);
    const [previousMonthRevenue, setPreviousMonthRevenue] = useState(null);
    const [revenueLoading, setRevenueLoading] = useState(true);
    const [revenueChange, setRevenueChange] = useState(null);

    // Fetch active users count
    const [activeUsersCount, setActiveUsersCount] = useState(0);
    const [activeUsersLoading, setActiveUsersLoading] = useState(true);

    useEffect(() => {
        const fetchMonthlyRevenue = async () => {
            try {
                setRevenueLoading(true);
                const now = new Date();

                // Get date range covering current and previous month
                const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = endDate.toISOString().split('T')[0];

                // Fetch revenue data grouped by month
                const response = await analysisAPI.getRevenue({
                    startDate: startDateStr,
                    endDate: endDateStr,
                    groupDate: 'month'
                });

                let currentRevenue = 0;
                let previousRevenue = 0;

                if (response.data?.success && response.data?.payload) {
                    const payload = response.data.payload;

                    // The API returns months in order, so the last item is current month
                    // and second to last is previous month
                    if (payload.length >= 2) {
                        previousRevenue = parseFloat(payload[0].totalRevenue || 0);
                        currentRevenue = parseFloat(payload[1].totalRevenue || 0);
                    } else if (payload.length === 1) {
                        // Only one month of data (current month)
                        currentRevenue = parseFloat(payload[0].totalRevenue || 0);
                    }
                }

                setMonthlyRevenue(currentRevenue);
                setPreviousMonthRevenue(previousRevenue);

                // Calculate percentage change
                if (previousRevenue > 0) {
                    const change = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
                    setRevenueChange(change);
                } else if (currentRevenue > 0) {
                    // If previous month had no revenue but current month does, it's 100% increase
                    setRevenueChange(100);
                } else {
                    // Both are 0, no change
                    setRevenueChange(0);
                }
            } catch (err) {
                console.error('Error fetching revenue:', err);
                setMonthlyRevenue(0);
                setPreviousMonthRevenue(0);
                setRevenueChange(0);
            } finally {
                setRevenueLoading(false);
            }
        };

        fetchMonthlyRevenue();
    }, []);

    // Fetch active users count - fetch all pages to get accurate count
    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                setActiveUsersLoading(true);
                let allActiveUsers = [];

                // Fetch first page to get total pages
                const firstResponse = await userAPI.getAll({ page: 1, pageSize: 100 });

                if (firstResponse.data?.success && firstResponse.data?.payload) {
                    const firstPageUsers = firstResponse.data.payload.data || [];
                    // Filter active users from first page
                    const activeFromFirstPage = firstPageUsers.filter(user => user.status === 'active');
                    allActiveUsers = [...allActiveUsers, ...activeFromFirstPage];

                    const total = firstResponse.data.payload.total || 0;
                    const pageSize = firstResponse.data.payload.pageSize || 100;
                    const totalPages = Math.ceil(total / pageSize);

                    // Fetch remaining pages
                    for (let page = 2; page <= totalPages; page++) {
                        const response = await userAPI.getAll({ page, pageSize });

                        if (response.data?.success && response.data?.payload) {
                            const users = response.data.payload.data || [];
                            const activeUsers = users.filter(user => user.status === 'active');
                            allActiveUsers = [...allActiveUsers, ...activeUsers];
                        }
                    }

                    setActiveUsersCount(allActiveUsers.length);
                } else {
                    setActiveUsersCount(0);
                }
            } catch (err) {
                console.error('Error fetching active users:', err);
                setActiveUsersCount(0);
            } finally {
                setActiveUsersLoading(false);
            }
        };

        fetchActiveUsers();
    }, []);

    const batteriesInStock = Array.isArray(batteries)
        ? batteries.filter(b => (b?.vehicle_id == null) && (b?.slot_id != null)).length
        : 0;

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
            value: activeUsersLoading ? '...' : activeUsersCount.toLocaleString(),
            // change: '+12%',
            changeType: 'positive',
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            name: 'Batteries in Stock',
            value: batteriesLoading ? '...' : batteriesInStock.toString(),
            // change: '-8',
            changeType: 'negative',
            icon: Battery,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            name: 'Monthly Revenue',
            value: revenueLoading ? '...' : `${(monthlyRevenue || 0).toLocaleString()} VND`,
            change: revenueLoading || revenueChange === null ? '...' :
                revenueChange === 0 ? '0%' :
                    revenueChange > 0 ? `+${revenueChange.toFixed(1)}%` : `${revenueChange.toFixed(1)}%`,
            changeType: revenueChange === null || revenueChange === 0 ? 'neutral' :
                revenueChange > 0 ? 'positive' : 'negative',
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
            case 'closed': return 'Closed';
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
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                    {stat.change && (
                                        <div className="flex items-center mt-1">
                                            {stat.changeType === 'positive' && (
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                            )}
                                            {stat.changeType === 'negative' && (
                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                            )}
                                            <span className={`text-sm ml-1 ${stat.changeType === 'positive' ? 'text-green-600' :
                                                stat.changeType === 'negative' ? 'text-red-600' :
                                                    'text-gray-600'
                                                }`}>
                                                {stat.change}
                                            </span>
                                        </div>
                                    )}
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

        </div>
    );
};

export default AdminDashboard;
