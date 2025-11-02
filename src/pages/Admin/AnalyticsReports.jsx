import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Download,
    Calendar,
    Filter,
    DollarSign,
    Battery,
    Users,
    MapPin,
    Clock,
    Activity,
    Zap,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { analysisAPI, userAPI } from '../../lib/apiServices';

// Simple Line Chart Component
const LineChart = ({ data, width = 400, height = 200, color = '#3B82F6', labelInterval = 1 }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    const points = data.map((d, index) => {
        const x = (index / (data.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((d.value - minValue) / range) * (height - 40);
        return `${x},${y}`;
    }).join(' ');

    const pathData = `M ${points}`;

    return (
        <div className="relative">
            <svg width={width} height={height} className="overflow-visible">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                    <g key={index}>
                        <line
                            x1="20"
                            y1={20 + ratio * (height - 40)}
                            x2={width - 20}
                            y2={20 + ratio * (height - 40)}
                            stroke="#E5E7EB"
                            strokeWidth="1"
                        />
                        <text
                            x="10"
                            y={20 + ratio * (height - 40) + 4}
                            fontSize="10"
                            fill="#6B7280"
                            textAnchor="end"
                        >
                            {Math.round(minValue + (1 - ratio) * range).toLocaleString()}
                        </text>
                    </g>
                ))}

                {/* Chart line */}
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {data.map((d, index) => {
                    const x = (index / (data.length - 1)) * (width - 40) + 20;
                    const y = height - 20 - ((d.value - minValue) / range) * (height - 40);
                    return (
                        <g key={index}>
                            <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill={color}
                                stroke="white"
                                strokeWidth="2"
                            />
                            <text
                                x={x}
                                y={y - 8}
                                fontSize="10"
                                fill="#374151"
                                textAnchor="middle"
                                className="font-medium"
                            >
                                {d.value.toLocaleString()}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis labels - only show every nth label based on labelInterval */}
                {data.map((d, index) => {
                    // Show label if:
                    // 1. Index is divisible by labelInterval, OR
                    // 2. It's the first item (index === 0), OR
                    // 3. It's the last item (index === data.length - 1)
                    const isIntervalLabel = index % labelInterval === 0;
                    const isFirst = index === 0;
                    const isLast = index === data.length - 1;

                    if (!isIntervalLabel && !isFirst && !isLast) return null;

                    const x = (index / (data.length - 1)) * (width - 40) + 20;
                    return (
                        <text
                            key={index}
                            x={x}
                            y={height - 5}
                            fontSize="10"
                            fill="#6B7280"
                            textAnchor="middle"
                        >
                            {d.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

const AnalyticsReports = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('30d');
    const [selectedStation, setSelectedStation] = useState('all');
    const [revenueData, setRevenueData] = useState([]);
    const [revenueLoading, setRevenueLoading] = useState(true);
    const [peakHoursData, setPeakHoursData] = useState([]);
    const [peakHoursLoading, setPeakHoursLoading] = useState(true);
    const [activeUsersCount, setActiveUsersCount] = useState(0);
    const [activeUsersLoading, setActiveUsersLoading] = useState(true);

    // Calculate date range based on selected period
    const getDateRange = (period) => {
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                return { startDate, endDate, groupDate: 'day' };
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                return { startDate, endDate, groupDate: 'day' };
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                return { startDate, endDate, groupDate: 'week' };
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                return { startDate, endDate, groupDate: 'month' };
            default:
                startDate.setDate(endDate.getDate() - 30);
                return { startDate, endDate, groupDate: 'day' };
        }
    };

    // Fetch revenue data
    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                setRevenueLoading(true);
                const { startDate, endDate, groupDate } = getDateRange(selectedPeriod);

                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = endDate.toISOString().split('T')[0];

                const response = await analysisAPI.getRevenue({
                    startDate: startDateStr,
                    endDate: endDateStr,
                    groupDate: groupDate
                });

                if (response.data?.success && response.data?.payload) {
                    // Transform API data to match component format
                    const transformedData = response.data.payload.map((item, index) => {
                        const periodDate = new Date(item.period);
                        let label = '';

                        if (groupDate === 'month') {
                            label = periodDate.toLocaleDateString('en-US', { month: 'short' });
                        } else if (groupDate === 'week') {
                            label = `Week ${index + 1}`;
                        } else {
                            label = periodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }

                        return {
                            period: item.period,
                            label: label,
                            totalRevenue: parseFloat(item.totalRevenue || 0),
                            totalPlanFee: parseFloat(item.totalPlanFee || 0),
                            totalSwapFee: parseFloat(item.totalSwapFee || 0),
                            totalPenaltyFee: parseFloat(item.totalPenaltyFee || 0)
                        };
                    });

                    setRevenueData(transformedData);
                } else {
                    setRevenueData([]);
                }
            } catch (err) {
                console.error('Error fetching revenue data:', err);
                setRevenueData([]);
            } finally {
                setRevenueLoading(false);
            }
        };

        fetchRevenueData();
    }, [selectedPeriod]);

    // Fetch swaps data for peak hours analysis
    useEffect(() => {
        const fetchSwapsData = async () => {
            try {
                setPeakHoursLoading(true);
                // Use the same date range as revenue but always group by hour for peak hours analysis
                const { startDate, endDate } = getDateRange(selectedPeriod);

                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = endDate.toISOString().split('T')[0];

                const response = await analysisAPI.getSwaps({
                    startDate: startDateStr,
                    endDate: endDateStr,
                    groupDate: 'hour'
                });

                if (response.data?.success && response.data?.payload) {
                    // Initialize hour buckets (0-23 hours)
                    const hourBuckets = {};
                    for (let i = 0; i < 24; i++) {
                        hourBuckets[i] = 0;
                    }

                    // Aggregate swaps by hour across all stations (or filter by selected station)
                    response.data.payload.forEach((item) => {
                        // Filter by station if selected (assuming selectedStation matches station_id or station name)
                        if (selectedStation !== 'all') {
                            // Check if station_id matches or if we need to compare station_name
                            // For now, process all stations if 'all' is selected
                            // You can add more sophisticated filtering here if needed
                            const stationIdStr = String(item.station_id);
                            if (stationIdStr !== selectedStation && item.station_name !== selectedStation) {
                                return; // Skip this item if it doesn't match the selected station
                            }
                        }

                        const periodDate = new Date(item.period);
                        const hour = periodDate.getHours();
                        const swaps = parseInt(item.totalSwaps || 0);

                        // Aggregate swaps for each hour
                        hourBuckets[hour] = (hourBuckets[hour] || 0) + swaps;
                    });

                    // Convert to array format for display, only including hours from 7 AM (7) to 10 PM (22)
                    // Generate all hours from 7 to 22 to ensure all hours are displayed even with 0 swaps
                    const formattedPeakHours = Array.from({ length: 16 }, (_, i) => {
                        const hourNum = i + 7; // Start from 7 (7 AM) to 22 (10 PM)
                        const hour12 = hourNum % 12 || 12;
                        const ampm = hourNum < 12 ? 'AM' : 'PM';
                        return {
                            hour: `${hour12}:00 ${ampm}`,
                            swaps: hourBuckets[hourNum] || 0
                        };
                    });

                    setPeakHoursData(formattedPeakHours);
                } else {
                    setPeakHoursData([]);
                }
            } catch (err) {
                console.error('Error fetching swaps data:', err);
                setPeakHoursData([]);
            } finally {
                setPeakHoursLoading(false);
            }
        };

        fetchSwapsData();
    }, [selectedPeriod, selectedStation]);

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

    // Format data for line charts
    const totalRevenueChartData = revenueData.map(item => ({
        label: item.label,
        value: item.totalRevenue
    }));

    const subscriptionRevenueChartData = revenueData.map(item => ({
        label: item.label,
        value: item.totalPlanFee
    }));

    const exceedFeesChartData = revenueData.map(item => ({
        label: item.label,
        value: item.totalPenaltyFee
    }));

    // Calculate totals
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalPlanFee = revenueData.reduce((sum, item) => sum + item.totalPlanFee, 0);
    const totalPenaltyFee = revenueData.reduce((sum, item) => sum + item.totalPenaltyFee, 0);
    const avgMonthlyRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

    const stationPerformance = [
        { name: 'Station A1', location: 'Downtown', swaps: 45, efficiency: 95, usersServed: 38, avgSwapsPerUser: 1.18 },
        { name: 'Station A2', location: 'Mall Area', swaps: 32, efficiency: 88, usersServed: 28, avgSwapsPerUser: 1.14 },
        { name: 'Station B1', location: 'Airport', swaps: 52, efficiency: 92, usersServed: 45, avgSwapsPerUser: 1.16 },
        { name: 'Station B2', location: 'University', swaps: 28, efficiency: 85, usersServed: 25, avgSwapsPerUser: 1.12 },
        { name: 'Station C1', location: 'Business District', swaps: 58, efficiency: 98, usersServed: 48, avgSwapsPerUser: 1.21 }
    ];

    // Format peak hours data for line chart
    const peakHoursChartData = peakHoursData.map(item => ({
        label: item.hour,
        value: item.swaps
    }));

    const batteryHealthTrends = [
        { date: '2024-01-01', avgHealth: 92.5, totalBatteries: 120 },
        { date: '2024-01-08', avgHealth: 91.8, totalBatteries: 125 },
        { date: '2024-01-15', avgHealth: 90.2, totalBatteries: 130 },
        { date: '2024-01-22', avgHealth: 89.7, totalBatteries: 135 },
        { date: '2024-01-29', avgHealth: 88.9, totalBatteries: 140 }
    ];

    // Format battery health data for line chart
    const batteryHealthChartData = batteryHealthTrends.map(item => ({
        label: item.date.split('-')[2], // Extract day
        value: item.avgHealth
    }));

    const aiInsights = [
        {
            type: 'demand_forecast',
            title: 'Demand Forecast',
            description: 'AI predicts 15% increase in battery swap demand for next month',
            confidence: 87,
            impact: 'high',
            recommendation: 'Consider adding 2 new stations in downtown area'
        },
        {
            type: 'maintenance_alert',
            title: 'Maintenance Optimization',
            description: 'Schedule maintenance during low-traffic hours (2-4 AM)',
            confidence: 92,
            impact: 'medium',
            recommendation: 'Update maintenance schedule to reduce downtime'
        },
        {
            type: 'battery_lifecycle',
            title: 'Battery Lifecycle Analysis',
            description: 'Batteries showing 8% faster degradation than expected',
            confidence: 78,
            impact: 'high',
            recommendation: 'Review charging protocols and temperature controls'
        }
    ];

    const getImpactColor = (impact) => {
        switch (impact) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                    <p className="mt-2 text-gray-600">Comprehensive insights and AI-powered recommendations</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date Range
                    </Button>
                    <Button className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-2">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            More Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {revenueLoading ? '...' : `${totalRevenue.toLocaleString()} VND`}
                            </p>
                            <div className="flex items-center mt-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 ml-1">+12.5%</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Battery className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Swaps</p>
                            <p className="text-2xl font-semibold text-gray-900">1,780</p>
                            <div className="flex items-center mt-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 ml-1">+8.3%</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {activeUsersLoading ? '...' : activeUsersCount.toLocaleString()}
                            </p>
                            <div className="flex items-center mt-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 ml-1">+5.2%</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <Zap className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                            <p className="text-2xl font-semibold text-gray-900">91.6%</p>
                            <div className="flex items-center mt-1">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-red-600 ml-1">-2.1%</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Revenue and Swaps Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Revenue (VND)</span>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <LineChart
                            data={totalRevenueChartData}
                            width={400}
                            height={250}
                            color="#10B981"
                        />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-gray-600">Total Revenue</p>
                            <p className="font-semibold text-green-700">
                                {revenueLoading ? '...' : `${totalRevenue.toLocaleString()} VND`}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-gray-600">Avg Period</p>
                            <p className="font-semibold text-blue-700">
                                {revenueLoading ? '...' : `${Math.round(avgMonthlyRevenue).toLocaleString()} VND`}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Peak Hours Analysis</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Swaps per Hour</span>
                        </div>
                    </div>
                    {peakHoursLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Loading peak hours data...</span>
                            </div>
                        </div>
                    ) : peakHoursChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center text-gray-500">
                                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                                <p>No swap data available for the selected period</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center">
                                <LineChart
                                    data={peakHoursChartData}
                                    width={400}
                                    height={250}
                                    color="#3B82F6"
                                    labelInterval={2}
                                />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <p className="text-gray-600">Peak Hour</p>
                                    <p className="font-semibold text-blue-700">
                                        {peakHoursData.length > 0
                                            ? peakHoursData.reduce((max, hour) => hour.swaps > max.swaps ? hour : max, peakHoursData[0]).hour
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <p className="text-gray-600">Peak Swaps</p>
                                    <p className="font-semibold text-purple-700">
                                        {peakHoursData.length > 0
                                            ? `${Math.max(...peakHoursData.map(h => h.swaps))} swaps`
                                            : '0 swaps'}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Revenue Breakdown */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">Plan Fee Trend</h4>
                        <div className="flex justify-center">
                            <LineChart
                                data={subscriptionRevenueChartData}
                                width={350}
                                height={200}
                                color="#10B981"
                            />
                        </div>
                        <div className="mt-2 text-center">
                            <span className="text-sm text-gray-600">Plan Fee (Green)</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">Penalty Fee Trend</h4>
                        <div className="flex justify-center">
                            <LineChart
                                data={exceedFeesChartData}
                                width={350}
                                height={200}
                                color="#F59E0B"
                            />
                        </div>
                        <div className="mt-2 text-center">
                            <span className="text-sm text-gray-600">Penalty Fee (Orange)</span>
                        </div>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Total Plan Fee</p>
                        <p className="font-semibold text-green-700 text-lg">
                            {revenueLoading ? '...' : `${totalPlanFee.toLocaleString()} VND`}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Total Penalty Fee</p>
                        <p className="font-semibold text-orange-700 text-lg">
                            {revenueLoading ? '...' : `${totalPenaltyFee.toLocaleString()} VND`}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Total Swap Fee</p>
                        <p className="font-semibold text-blue-700 text-lg">
                            {revenueLoading ? '...' : `${revenueData.reduce((sum, d) => sum + d.totalSwapFee, 0).toLocaleString()} VND`}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Station Performance */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Station Performance</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Station
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Swaps
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Users Served
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Avg Swaps/User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Efficiency
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trend
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stationPerformance.map((station, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{station.name}</div>
                                            <div className="text-sm text-gray-500">{station.location}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {station.swaps}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {station.usersServed}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {station.avgSwapsPerUser}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${station.efficiency}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium">{station.efficiency}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                            <span className="text-sm text-green-600 ml-1">+5.2%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* AI Insights */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        AI Generated
                    </Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {aiInsights.map((insight, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                <Badge className={getImpactColor(insight.impact)}>
                                    {insight.impact}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Confidence</span>
                                    <span className="font-medium">{insight.confidence}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div
                                        className="bg-blue-500 h-1 rounded-full"
                                        style={{ width: `${insight.confidence}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{insight.recommendation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Battery Health Trends */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Battery Health Trends</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Health %</span>
                    </div>
                </div>
                <div className="flex justify-center mb-6">
                    <LineChart
                        data={batteryHealthChartData}
                        width={500}
                        height={200}
                        color="#F59E0B"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Current Health</p>
                        <p className="font-semibold text-orange-700 text-lg">
                            {batteryHealthTrends[batteryHealthTrends.length - 1].avgHealth}%
                        </p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Total Batteries</p>
                        <p className="font-semibold text-blue-700 text-lg">
                            {batteryHealthTrends[batteryHealthTrends.length - 1].totalBatteries}
                        </p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Health Decline</p>
                        <p className="font-semibold text-red-700 text-lg">
                            -{Math.round(batteryHealthTrends[0].avgHealth - batteryHealthTrends[batteryHealthTrends.length - 1].avgHealth)}%
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsReports;
