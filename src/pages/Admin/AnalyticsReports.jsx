import React, { useState } from 'react';
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
    AlertTriangle
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

// Simple Line Chart Component
const LineChart = ({ data, width = 400, height = 200, color = '#3B82F6' }) => {
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

                {/* X-axis labels */}
                {data.map((d, index) => {
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

    // Mock data - will be replaced with real API calls
    const subscriptionData = [
        { month: 'Jan', subscriptionRevenue: 45000, exceedFees: 3200, totalRevenue: 48200, swaps: 1200, activeSubscriptions: 150 },
        { month: 'Feb', subscriptionRevenue: 52000, exceedFees: 4100, totalRevenue: 56100, swaps: 1350, activeSubscriptions: 165 },
        { month: 'Mar', subscriptionRevenue: 48000, exceedFees: 2800, totalRevenue: 50800, swaps: 1280, activeSubscriptions: 160 },
        { month: 'Apr', subscriptionRevenue: 61000, exceedFees: 5200, totalRevenue: 66200, swaps: 1620, activeSubscriptions: 180 },
        { month: 'May', subscriptionRevenue: 58000, exceedFees: 4500, totalRevenue: 62500, swaps: 1540, activeSubscriptions: 175 },
        { month: 'Jun', subscriptionRevenue: 67000, exceedFees: 6800, totalRevenue: 73800, swaps: 1780, activeSubscriptions: 195 }
    ];

    // Format data for line charts
    const totalRevenueChartData = subscriptionData.map(item => ({
        label: item.month,
        value: item.totalRevenue
    }));

    const subscriptionRevenueChartData = subscriptionData.map(item => ({
        label: item.month,
        value: item.subscriptionRevenue
    }));

    const exceedFeesChartData = subscriptionData.map(item => ({
        label: item.month,
        value: item.exceedFees
    }));

    const swapsChartData = subscriptionData.map(item => ({
        label: item.month,
        value: item.swaps
    }));

    const stationPerformance = [
        { name: 'Station A1', location: 'Downtown', swaps: 45, efficiency: 95, usersServed: 38, avgSwapsPerUser: 1.18 },
        { name: 'Station A2', location: 'Mall Area', swaps: 32, efficiency: 88, usersServed: 28, avgSwapsPerUser: 1.14 },
        { name: 'Station B1', location: 'Airport', swaps: 52, efficiency: 92, usersServed: 45, avgSwapsPerUser: 1.16 },
        { name: 'Station B2', location: 'University', swaps: 28, efficiency: 85, usersServed: 25, avgSwapsPerUser: 1.12 },
        { name: 'Station C1', location: 'Business District', swaps: 58, efficiency: 98, usersServed: 48, avgSwapsPerUser: 1.21 }
    ];

    const peakHours = [
        { hour: '6:00 AM', swaps: 12 },
        { hour: '7:00 AM', swaps: 45 },
        { hour: '8:00 AM', swaps: 78 },
        { hour: '9:00 AM', swaps: 65 },
        { hour: '10:00 AM', swaps: 42 },
        { hour: '11:00 AM', swaps: 38 },
        { hour: '12:00 PM', swaps: 55 },
        { hour: '1:00 PM', swaps: 48 },
        { hour: '2:00 PM', swaps: 35 },
        { hour: '3:00 PM', swaps: 28 },
        { hour: '4:00 PM', swaps: 32 },
        { hour: '5:00 PM', swaps: 68 },
        { hour: '6:00 PM', swaps: 85 },
        { hour: '7:00 PM', swaps: 72 },
        { hour: '8:00 PM', swaps: 45 },
        { hour: '9:00 PM', swaps: 28 },
        { hour: '10:00 PM', swaps: 15 }
    ];

    // Format peak hours data for line chart
    const peakHoursChartData = peakHours.map(item => ({
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
                        <select
                            value={selectedStation}
                            onChange={(e) => setSelectedStation(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="all">All Stations</option>
                            <option value="A1">Station A1</option>
                            <option value="A2">Station A2</option>
                            <option value="B1">Station B1</option>
                            <option value="B2">Station B2</option>
                            <option value="C1">Station C1</option>
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
                                ${subscriptionData.reduce((sum, d) => sum + d.totalRevenue, 0).toLocaleString()}
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
                            <p className="text-2xl font-semibold text-gray-900">1,234</p>
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
                        <h3 className="text-lg font-semibold text-gray-900">Subscription Revenue Trend</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Revenue ($)</span>
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
                                ${subscriptionData.reduce((sum, d) => sum + d.totalRevenue, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-gray-600">Avg Monthly</p>
                            <p className="font-semibold text-blue-700">
                                ${Math.round(subscriptionData.reduce((sum, d) => sum + d.totalRevenue, 0) / subscriptionData.length).toLocaleString()}
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
                    <div className="flex justify-center">
                        <LineChart
                            data={peakHoursChartData}
                            width={400}
                            height={250}
                            color="#3B82F6"
                        />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-gray-600">Peak Hour</p>
                            <p className="font-semibold text-blue-700">
                                {peakHours.reduce((max, hour) => hour.swaps > max.swaps ? hour : max, peakHours[0]).hour}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-gray-600">Peak Swaps</p>
                            <p className="font-semibold text-purple-700">
                                {Math.max(...peakHours.map(h => h.swaps))} swaps
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Revenue Breakdown */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">Subscription Revenue vs Exceed Fees</h4>
                        <div className="flex justify-center">
                            <LineChart
                                data={subscriptionRevenueChartData}
                                width={350}
                                height={200}
                                color="#10B981"
                            />
                        </div>
                        <div className="mt-2 text-center">
                            <span className="text-sm text-gray-600">Subscription Revenue (Green)</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">Exceed Fees Trend</h4>
                        <div className="flex justify-center">
                            <LineChart
                                data={exceedFeesChartData}
                                width={350}
                                height={200}
                                color="#F59E0B"
                            />
                        </div>
                        <div className="mt-2 text-center">
                            <span className="text-sm text-gray-600">Exceed Fees (Orange)</span>
                        </div>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Total Subscription Revenue</p>
                        <p className="font-semibold text-green-700 text-lg">
                            ${subscriptionData.reduce((sum, d) => sum + d.subscriptionRevenue, 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Total Exceed Fees</p>
                        <p className="font-semibold text-orange-700 text-lg">
                            ${subscriptionData.reduce((sum, d) => sum + d.exceedFees, 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Active Subscriptions</p>
                        <p className="font-semibold text-blue-700 text-lg">
                            {subscriptionData[subscriptionData.length - 1].activeSubscriptions}
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
