import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Download,
    Calendar as CalendarIcon,
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
import { Line, LineChart as RechartsLineChart, BarChart as RechartsBarChart, Bar, AreaChart as RechartsAreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ChartContainer, ChartTooltip } from '../../components/ui/chart';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar } from '../../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { analysisAPI, userAPI, batteryAPI } from '../../lib/apiServices';
import { useStation } from '../../hooks/useStation';
import { cn } from '../../lib/utils';

// Format large numbers to abbreviated format
const formatNumber = (value) => {
    if (value >= 1000000000) {
        // Billions
        return `${(value / 1000000000).toFixed(1)} bn`;
    } else if (value >= 1000000) {
        // Millions (Tr)
        return `${(value / 1000000).toFixed(1)} tr`;
    } else if (value >= 1000) {
        // Thousands
        return `${(value / 1000)} k`;
    }
    return value.toString();
};

// Custom Tooltip Component to show date label
const CustomLineChartTooltip = ({ active, payload, className }) => {
    if (!active || !payload || !payload.length) {
        return null;
    }

    const data = payload[0].payload;
    const item = payload[0];

    return (
        <div
            className={cn(
                "rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl",
                className
            )}
        >
            <div className="font-semibold mb-2">{data.label}</div>
            <div className="flex items-center gap-2">
                <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                        backgroundColor: item.color,
                    }}
                />
                <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">
                        {item.name || item.dataKey}
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-foreground">
                        {typeof item.value === "number"
                            ? item.value.toLocaleString()
                            : item.value}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Line Chart Component using shadcn/ui and Recharts
const LineChart = ({ data, height = 250, color = '#3B82F6', name = 'Value' }) => {
    if (!data || data.length === 0) return null;

    // Calculate domain for Y-axis
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    const yAxisDomain = [
        Math.max(0, minValue - range),
        maxValue + range * 0.1
    ];

    const chartConfig = {
        value: {
            label: name,
            color: color,
        }
    };

    return (
        <ChartContainer config={chartConfig} className="w-full" style={{ height: `${height}px` }}>
            <RechartsLineChart
                data={data}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={yAxisDomain}
                    tickFormatter={(value) => formatNumber(value)}
                />
                <ChartTooltip content={<CustomLineChartTooltip />} />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: color }}
                    activeDot={{ r: 6 }}
                    name={name}
                />
            </RechartsLineChart>
        </ChartContainer>
    );
};

// Custom Tooltip Component for Bar Chart
const CustomBarChartTooltip = ({ active, payload, className }) => {
    if (!active || !payload || !payload.length) {
        return null;
    }

    const data = payload[0].payload;

    return (
        <div
            className={cn(
                "rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl",
                className
            )}
        >
            <div className="font-semibold mb-2">{data.planName}</div>
            {payload.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-1">
                    <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                            backgroundColor: item.color,
                        }}
                    />
                    <div className="flex items-baseline gap-2">
                        <span className="text-muted-foreground">
                            {item.name || item.dataKey}
                        </span>
                        <span className="font-mono font-semibold tabular-nums text-foreground">
                            {typeof item.value === "number"
                                ? item.value.toLocaleString()
                                : item.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Grouped Bar Chart Component using shadcn/ui and Recharts
const GroupedBarChart = ({ data, height = 300 }) => {
    if (!data || data.length === 0) return null;

    const chartConfig = {
        totalSubscriptions: {
            label: "Total Subscribers",
            color: "hsl(var(--chart-1))",
        },
        activeSubscriptions: {
            label: "Active",
            color: "hsl(142, 76%, 36%)", // green-600
        },
        inactiveSubscriptions: {
            label: "Inactive",
            color: "hsl(0, 84%, 60%)", // red-500
        },
    };

    // Calculate max value for Y-axis scaling
    const maxValue = Math.max(
        ...data.map(d => Math.max(
            d.totalSubscriptions || 0,
            d.activeSubscriptions || 0,
            d.inactiveSubscriptions || 0
        ))
    );

    return (
        <ChartContainer config={chartConfig} className="w-full" style={{ height: `${height}px` }}>
            <RechartsBarChart
                data={data}
                margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="planName"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    textAnchor="middle"
                    height={80}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, Math.ceil(maxValue * 1.1)]}
                    tickFormatter={(value) => formatNumber(value)}
                />
                <ChartTooltip content={<CustomBarChartTooltip />} />
                <Legend />
                <Bar
                    dataKey="totalSubscriptions"
                    fill="hsl(var(--chart-1))"
                    name="Total Subscribers"
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey="activeSubscriptions"
                    fill="hsl(142, 76%, 36%)"
                    name="Active Subscriptions"
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey="inactiveSubscriptions"
                    fill="hsl(0, 84%, 60%)"
                    name="Inactive Subscriptions"
                    radius={[4, 4, 0, 0]}
                />
            </RechartsBarChart>
        </ChartContainer>
    );
};

// Custom Tooltip Component for Area Chart
const CustomAreaChartTooltip = ({ active, payload, label, className }) => {
    if (!active || !payload || !payload.length) {
        return null;
    }

    return (
        <div
            className={cn(
                "rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl",
                className
            )}
        >
            <div className="font-semibold mb-2">{label}</div>
            {payload.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-1">
                    <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                            backgroundColor: item.color,
                        }}
                    />
                    <div className="flex items-baseline gap-2">
                        <span className="text-muted-foreground">
                            {item.name || item.dataKey}
                        </span>
                        <span className="font-mono font-semibold tabular-nums text-foreground">
                            {typeof item.value === "number"
                                ? `${item.value.toLocaleString()} VND`
                                : item.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Stacked Area Chart Component for Revenue Distribution using shadcn/ui and Recharts
const RevenueStackedAreaChart = ({ data, height = 350 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
                <p className="text-muted-foreground">No revenue data available</p>
            </div>
        );
    }

    // Get all unique plan names from the data
    const allKeys = data.flatMap(item => Object.keys(item));
    const planNames = [...new Set(allKeys.filter(key => key !== 'label' && key !== 'period'))];

    if (planNames.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
                <p className="text-muted-foreground">No revenue data available</p>
            </div>
        );
    }

    // Color palette for area chart
    const COLORS = [
        'hsl(217, 91%, 60%)', // blue-500
        'hsl(142, 76%, 36%)', // green-600
        'hsl(38, 92%, 50%)',  // amber-500
        'hsl(262, 83%, 58%)', // purple-500
        'hsl(0, 84%, 60%)',   // red-500
        'hsl(199, 89%, 48%)', // cyan-500
        'hsl(280, 100%, 70%)', // fuchsia-400
        'hsl(24, 95%, 53%)',  // orange-500
    ];

    // Build chart config dynamically
    const chartConfig = {};
    planNames.forEach((planName, index) => {
        chartConfig[planName] = {
            label: planName,
            color: COLORS[index % COLORS.length],
        };
    });

    // Normalize data for expanded (100% stacked) area chart
    const normalizedData = data.map((item) => {
        const result = { ...item };
        const total = planNames.reduce((sum, planName) => sum + (item[planName] || 0), 0);

        if (total > 0) {
            let remainingPercentage = 100;
            planNames.forEach((planName, index) => {
                if (index === planNames.length - 1) {
                    // Last plan gets the remaining percentage to ensure total is exactly 100%
                    result[planName] = remainingPercentage;
                } else {
                    const percentage = ((item[planName] || 0) / total) * 100;
                    result[planName] = Math.round(percentage * 100) / 100; // Round to 2 decimal places
                    remainingPercentage -= result[planName];
                }
            });
        } else {
            planNames.forEach((planName) => {
                result[planName] = 0;
            });
        }

        return result;
    });

    return (
        <ChartContainer config={chartConfig} className="w-full" style={{ height: `${height}px` }}>
            <RechartsAreaChart
                data={normalizedData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => {
                        // Ensure value is capped at 100 and rounded
                        const roundedValue = Math.min(100, Math.round(value * 100) / 100);
                        return `${roundedValue}%`;
                    }}
                />
                <ChartTooltip
                    content={(props) => {
                        const { active, payload, label } = props;
                        if (!active || !payload || !payload.length) return null;

                        const originalItem = data.find(item => item.label === label);
                        const total = planNames.reduce((sum, planName) => sum + (originalItem?.[planName] || 0), 0);

                        return (
                            <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                                <div className="font-semibold mb-2">{label}</div>
                                {payload.map((item, index) => {
                                    const planName = item.dataKey;
                                    const percentage = Math.min(100, Math.round((item.value || 0) * 100) / 100);
                                    const actualValue = originalItem?.[planName] || 0;
                                    return (
                                        <div key={index} className="flex items-center gap-2 mb-1">
                                            <div
                                                className="h-2 w-2 shrink-0 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-muted-foreground">{planName}</span>
                                                <span className="font-mono font-semibold tabular-nums text-foreground">
                                                    {percentage.toFixed(2)}% ({actualValue.toLocaleString()} VND)
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {total > 0 && (
                                    <div className="mt-2 pt-2 border-t border-border/50">
                                        <span className="text-muted-foreground">Total: </span>
                                        <span className="font-semibold">{total.toLocaleString()} VND</span>
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />
                <Legend />
                {planNames.map((planName, index) => (
                    <Area
                        key={planName}
                        type="monotone"
                        dataKey={planName}
                        stackId="1"
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.6}
                        name={planName}
                    />
                ))}
            </RechartsAreaChart>
        </ChartContainer>
    );
};

const AnalyticsReports = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('30d');
    const [selectedStation, setSelectedStation] = useState('all');
    const [customDateRange, setCustomDateRange] = useState(null); // { from: Date, to: Date }
    const [customGroupDate, setCustomGroupDate] = useState(null); // 'day' | 'week' | 'month'
    const [revenueData, setRevenueData] = useState([]);
    const [revenueLoading, setRevenueLoading] = useState(true);
    const [peakHoursData, setPeakHoursData] = useState([]);
    const [peakHoursLoading, setPeakHoursLoading] = useState(true);
    const [activeUsersCount, setActiveUsersCount] = useState(0);
    const [activeUsersLoading, setActiveUsersLoading] = useState(true);
    const [avgBatterySoh, setAvgBatterySoh] = useState(0);
    const [batterySohLoading, setBatterySohLoading] = useState(true);
    const [stationPerformance, setStationPerformance] = useState([]);
    const [stationPerformanceLoading, setStationPerformanceLoading] = useState(true);
    const [subscriptionPlanBarData, setSubscriptionPlanBarData] = useState([]); // Aggregated data for bar chart
    const [subscriptionPlanAreaData, setSubscriptionPlanAreaData] = useState([]); // Time-series data for area chart
    const [subscriptionPlanLoading, setSubscriptionPlanLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);

    // Use station hook
    const { stations, loading: stationsLoading } = useStation();

    // Helper function to format date to YYYY-MM-DD in local timezone
    const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper function to set preset date ranges
    const setPresetDateRange = (preset) => {
        const today = new Date();
        let startDate = new Date();
        let daysAgo = 0;
        let groupDate = 'day';

        switch (preset) {
            case 'lastWeek':
                daysAgo = 7;
                groupDate = 'day';
                break;
            case 'lastMonth':
                daysAgo = 30;
                groupDate = 'day';
                break;
            case 'last6Months':
                daysAgo = 180;
                groupDate = 'week';
                break;
            case 'allTime':
                // For all time, set dates to null and group by month
                setCustomDateRange(null);
                setCustomGroupDate('month');
                return;
            case 'lastYear':
                daysAgo = 365;
                groupDate = 'month';
                break;
            default:
                return;
        }

        startDate = new Date(today);
        startDate.setDate(today.getDate() - daysAgo);

        setCustomDateRange({ from: startDate, to: today });
        setCustomGroupDate(groupDate);
    };

    // Calculate date range based on selected period or custom date range
    const getDateRange = (period) => {
        // If custom date range is null (all time), return null dates with month grouping
        if (customDateRange === null && customGroupDate === 'month') {
            return { startDate: null, endDate: null, groupDate: 'month' };
        }

        // If custom date range is set, use it
        if (customDateRange?.from && customDateRange?.to) {
            const startDate = new Date(customDateRange.from);
            const endDate = new Date(customDateRange.to);

            // Use custom groupDate if provided, otherwise determine based on date range length
            let groupDate = customGroupDate;
            if (!groupDate) {
                const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                if (daysDiff > 90) {
                    groupDate = 'month';
                } else if (daysDiff > 30) {
                    groupDate = 'week';
                } else {
                    groupDate = 'day';
                }
            }

            return { startDate, endDate, groupDate };
        }

        // Otherwise use period-based range
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

                // For all time, send null dates
                const requestParams = {
                    groupDate: groupDate
                };

                if (startDate && endDate) {
                    requestParams.startDate = formatDateLocal(startDate);
                    requestParams.endDate = formatDateLocal(endDate);
                }

                const response = await analysisAPI.getRevenue(requestParams);

                if (response.data?.success && response.data?.payload) {
                    // Transform API data to match component format
                    const transformedData = response.data.payload.map((item, index) => {
                        const periodDate = new Date(item.period);
                        let label = '';

                        if (groupDate === 'month') {
                            label = periodDate.toLocaleDateString('en-US', { month: 'short' });
                        } else {
                            label = periodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }

                        return {
                            period: item.period,
                            label: label,
                            totalRevenue: parseFloat(item.totalRevenue || 0),
                            totalPlanFee: parseFloat(item.totalPlanFee || 0),
                            totalSwapFee: parseFloat(item.totalSwapFee || 0)
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
    }, [selectedPeriod, customDateRange, customGroupDate]);

    // Fetch swaps data for peak hours analysis
    useEffect(() => {
        const fetchSwapsData = async () => {
            try {
                setPeakHoursLoading(true);
                // Use the same date range as revenue but always group by hour for peak hours analysis
                const { startDate, endDate } = getDateRange(selectedPeriod);

                // For all time, send null dates
                const requestParams = {
                    groupDate: 'hour'
                };

                if (startDate && endDate) {
                    requestParams.startDate = formatDateLocal(startDate);
                    requestParams.endDate = formatDateLocal(endDate);
                }

                const response = await analysisAPI.getSwaps(requestParams);

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
                            hour: `${hour12} ${ampm}`,
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
    }, [selectedPeriod, selectedStation, customDateRange]);

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

    // Fetch batteries and calculate average SOH
    useEffect(() => {
        const fetchBatterySoh = async () => {
            try {
                setBatterySohLoading(true);
                const response = await batteryAPI.getAll();
                if (response.data.payload.batteries.data && Array.isArray(response.data.payload.batteries.data)) {
                    const batteries = response.data.payload.batteries.data;

                    // Filter batteries that have current_soh and calculate average
                    const sohValues = batteries
                        .map(b => b?.current_soh != null ? parseFloat(b.current_soh) : null)
                        .filter(soh => soh !== null && !isNaN(soh));

                    if (sohValues.length > 0) {
                        const avgSoh = sohValues.reduce((sum, soh) => sum + soh, 0) / sohValues.length;
                        setAvgBatterySoh(avgSoh);
                    } else {
                        setAvgBatterySoh(0);
                    }
                } else {
                    setAvgBatterySoh(0);
                }
            } catch (err) {
                console.error('Error fetching battery SOH data:', err);
                setAvgBatterySoh(0);
            } finally {
                setBatterySohLoading(false);
            }
        };

        fetchBatterySoh();
    }, []);

    // Fetch station performance data
    useEffect(() => {
        // Skip if stations are still loading
        if (stationsLoading) {
            return;
        }

        const fetchStationPerformance = async () => {
            try {
                setStationPerformanceLoading(true);
                const { startDate, endDate } = getDateRange(selectedPeriod);

                // For all time, send null dates
                const requestParams = {
                    groupDate: 'day' // Group by day to get totals, we'll aggregate by station
                };

                if (startDate && endDate) {
                    requestParams.startDate = formatDateLocal(startDate);
                    requestParams.endDate = formatDateLocal(endDate);
                }

                // Fetch swaps data
                const swapsResponse = await analysisAPI.getSwaps(requestParams);

                // Use stations from hook
                const stationsData = stations || [];

                // Extract swaps data
                const swapsData = swapsResponse.data?.success && swapsResponse.data?.payload
                    ? swapsResponse.data.payload
                    : swapsResponse.data?.payload || [];

                // Aggregate swaps by station_id
                const swapsByStation = {};
                swapsData.forEach((item) => {
                    const stationId = item.station_id;
                    if (stationId != null) {
                        if (!swapsByStation[stationId]) {
                            swapsByStation[stationId] = {
                                stationId: stationId,
                                stationName: item.station_name || '',
                                totalSwaps: 0,
                                totalUsers: item.totalUsers || 0
                            };
                        }
                        // Parse totalSwaps (can be string or number from API)
                        const swapsCount = typeof item.totalSwaps === 'string'
                            ? parseInt(item.totalSwaps, 10)
                            : parseInt(item.totalSwaps || 0, 10);
                        swapsByStation[stationId].totalSwaps += isNaN(swapsCount) ? 0 : swapsCount;
                        // If there's user information in the swap data, track unique users
                        if (item.user_id) {
                            swapsByStation[stationId].totalUsers++;
                        }
                    }
                });

                // Combine station info with swaps data
                const performanceData = stationsData.map(station => {
                    const stationId = station.station_id || station.id;
                    const swapData = swapsByStation[stationId] || {
                        totalSwaps: 0,
                        totalUsers: 0
                    };

                    const totalUsersCount = swapData.totalUsers || 0;
                    const totalSwaps = swapData.totalSwaps || 0;
                    const avgSwapsPerUser = totalUsersCount > 0 ? (totalSwaps / totalUsersCount).toFixed(2) : 0;

                    return {
                        name: station.station_name || station.name || 'Unknown Station',
                        location: station.address || 'N/A',
                        swaps: totalSwaps,
                        usersServed: totalUsersCount,
                        avgSwapsPerUser: parseFloat(avgSwapsPerUser)
                    };
                });

                // Sort by swaps (descending)
                performanceData.sort((a, b) => b.swaps - a.swaps);

                setStationPerformance(performanceData);
            } catch (err) {
                console.error('Error fetching station performance data:', err);
                setStationPerformance([]);
            } finally {
                setStationPerformanceLoading(false);
            }
        };

        fetchStationPerformance();
    }, [selectedPeriod, customDateRange, stations, stationsLoading]);

    // Helper function to format period label
    const formatPeriodLabel = (period, groupDate) => {
        if (!period) return '';
        const periodDate = new Date(period);

        if (groupDate === 'month') {
            return periodDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } else if (groupDate === 'week') {
            return periodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            return periodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    // Fetch subscription plan analysis data
    useEffect(() => {
        const fetchSubscriptionPlanData = async () => {
            try {
                setSubscriptionPlanLoading(true);
                const { startDate, endDate, groupDate } = getDateRange(selectedPeriod);

                // For all time, send null dates
                const requestParams = {
                    groupDate: groupDate || 'month'
                };

                if (startDate && endDate) {
                    requestParams.startDate = formatDateLocal(startDate);
                    requestParams.endDate = formatDateLocal(endDate);
                }

                const response = await analysisAPI.getSubscriptions(requestParams);

                if (response.data?.success && response.data?.payload) {
                    const rawData = response.data.payload;

                    // Aggregate data for bar chart (sum across all periods)
                    const planAggregation = {};
                    rawData.forEach((item) => {
                        const planName = item.plan_name || 'Unknown Plan';
                        if (!planAggregation[planName]) {
                            planAggregation[planName] = {
                                planName: planName,
                                totalSubscriptions: 0,
                                activeSubscriptions: 0,
                                inactiveSubscriptions: 0,
                            };
                        }
                        planAggregation[planName].totalSubscriptions += parseInt(item.totalSubscriptions || 0, 10);
                        planAggregation[planName].activeSubscriptions += parseInt(item.activeSubscriptions || 0, 10);
                        planAggregation[planName].inactiveSubscriptions += parseInt(item.inactiveSubscriptions || 0, 10);
                    });

                    const aggregatedBarData = Object.values(planAggregation);
                    setSubscriptionPlanBarData(aggregatedBarData);

                    // Transform data for area chart (time-series by period)
                    // Group by period and create data points for each plan
                    const periodDataMap = {};
                    const allPlanNames = new Set();

                    rawData.forEach((item) => {
                        const period = item.period || item.date || '';
                        const planName = item.plan_name || 'Unknown Plan';
                        allPlanNames.add(planName);

                        if (!periodDataMap[period]) {
                            periodDataMap[period] = {
                                period: period,
                                label: formatPeriodLabel(period, groupDate || 'month'),
                            };
                        }

                        // Store totalPaidFee for each plan in this period
                        periodDataMap[period][planName] = parseFloat(item.totalPaidFee || 0);
                    });

                    // Convert to array and ensure all plans are present in each period (with 0 if missing)
                    const areaChartData = Object.values(periodDataMap).map((periodItem) => {
                        const result = { ...periodItem };
                        allPlanNames.forEach((planName) => {
                            if (!(planName in result)) {
                                result[planName] = 0;
                            }
                        });
                        return result;
                    });

                    // Sort by period
                    areaChartData.sort((a, b) => {
                        const dateA = new Date(a.period);
                        const dateB = new Date(b.period);
                        return dateA - dateB;
                    });

                    setSubscriptionPlanAreaData(areaChartData);
                } else {
                    setSubscriptionPlanBarData([]);
                    setSubscriptionPlanAreaData([]);
                }
            } catch (err) {
                console.error('Error fetching subscription plan data:', err);
                setSubscriptionPlanBarData([]);
                setSubscriptionPlanAreaData([]);
            } finally {
                setSubscriptionPlanLoading(false);
            }
        };

        fetchSubscriptionPlanData();
    }, [selectedPeriod, customDateRange, customGroupDate]);

    // Format data for line charts
    const totalRevenueChartData = revenueData.map(item => ({
        label: item.label,
        value: item.totalRevenue
    }));

    const subscriptionRevenueChartData = revenueData.map(item => ({
        label: item.label,
        value: item.totalPlanFee
    }));

    const swapFeeChartData = revenueData.map(item => ({
        label: item.label,
        value: item.totalSwapFee
    }));

    // Calculate totals
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalPlanFee = revenueData.reduce((sum, item) => sum + item.totalPlanFee, 0);
    const totalSwapFee = revenueData.reduce((sum, item) => sum + item.totalSwapFee, 0);
    const avgMonthlyRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;
    // Calculate total swaps from station performance (includes all swaps across all hours)
    // This ensures total swaps matches the sum of all stations
    const totalSwaps = stationPerformanceLoading
        ? 0
        : stationPerformance.reduce((sum, station) => sum + station.swaps, 0);

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

    // Handle export report
    const handleExportReport = async () => {
        try {
            setExportLoading(true);
            const { startDate, endDate } = getDateRange(selectedPeriod);

            // Prepare request parameters
            const requestParams = {};
            if (startDate && endDate) {
                requestParams.startDate = formatDateLocal(startDate);
                requestParams.endDate = formatDateLocal(endDate);
            } else {
                // If no date range, show error or use default range
                alert('Please select a date range to export the report');
                setExportLoading(false);
                return;
            }

            const response = await analysisAPI.exportReport(requestParams);

            // Get filename from response headers or use default
            // Axios normalizes headers to lowercase
            const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
            let filename = 'analysis-report.xlsx';

            if (contentDisposition) {
                // Match filename in quotes: filename="analysis-report-1762425271413.xlsx"
                // or without quotes: filename=analysis-report.xlsx
                const quotedMatch = contentDisposition.match(/filename="([^"]+)"/i);
                const unquotedMatch = contentDisposition.match(/filename=([^;]+)/i);

                if (quotedMatch) {
                    filename = quotedMatch[1];
                } else if (unquotedMatch) {
                    filename = unquotedMatch[1].trim();
                }
            }

            // Create blob URL and trigger download
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('Failed to export report. Please try again.');
        } finally {
            setExportLoading(false);
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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                {customDateRange === null && customGroupDate === 'month'
                                    ? 'All Time'
                                    : customDateRange?.from && customDateRange?.to
                                        ? `${customDateRange.from.toLocaleDateString('vi-VN')} - ${customDateRange.to.toLocaleDateString('vi-VN')}`
                                        : 'Date Range'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <div className="p-3 border-b">
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setPresetDateRange('lastWeek')}
                                    >
                                        Last Week
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setPresetDateRange('lastMonth')}
                                    >
                                        Last Month
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setPresetDateRange('last6Months')}
                                    >
                                        Last 6 Months
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setPresetDateRange('allTime')}
                                    >
                                        All Time
                                    </Button>
                                </div>
                            </div>
                            <Calendar
                                mode="range"
                                date={customDateRange}
                                onDateSelect={setCustomDateRange}
                            />
                            {customDateRange?.from && customDateRange?.to && (
                                <div className="p-3 border-t space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Group By</label>
                                        <Select
                                            value={customGroupDate || 'auto'}
                                            onValueChange={(value) => {
                                                setCustomGroupDate(value === 'auto' ? null : value);
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select grouping" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="auto">Auto (Based on range)</SelectItem>
                                                <SelectItem value="day">Day</SelectItem>
                                                <SelectItem value="week">Week</SelectItem>
                                                <SelectItem value="month">Month</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            setCustomDateRange(null);
                                            setCustomGroupDate(null);
                                            setSelectedPeriod('30d');
                                        }}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                    <Button
                        className="flex items-center gap-2"
                        onClick={handleExportReport}
                        disabled={exportLoading}
                    >
                        {exportLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export Report
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Filters
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
            </Card> */}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
                <Card className="p-4 lg:col-span-3">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {revenueLoading ? '...' : `${totalRevenue.toLocaleString()} VND`}
                            </p>
                            {/* <div className="flex items-center mt-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 ml-1">+12.5%</span>
                            </div> */}
                        </div>
                    </div>
                </Card>

                <Card className="p-6 lg:col-span-3">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Battery className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Swaps</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stationPerformanceLoading ? '...' : totalSwaps.toLocaleString()}
                            </p>
                            {/* <div className="flex items-center mt-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 ml-1">+8.3%</span>
                            </div> */}
                        </div>
                    </div>
                </Card>

                <Card className="p-6 lg:col-span-3">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {activeUsersLoading ? '...' : activeUsersCount.toLocaleString()}
                            </p>
                            {/* <div className="flex items-center mt-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 ml-1">+5.2%</span>
                            </div> */}
                        </div>
                    </div>
                </Card>

                <Card className="p-6 lg:col-span-3">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <Battery className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Avg Battery SOH</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {batterySohLoading ? '...' : `${avgBatterySoh.toFixed(1)}%`}
                            </p>
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
                    <LineChart
                        data={totalRevenueChartData}
                        height={250}
                        color="#10B981"
                        name="Revenue"
                    />
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
                            <LineChart
                                data={peakHoursChartData}
                                height={250}
                                color="#3B82F6"
                                name="Swaps"
                            />
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
                        <LineChart
                            data={subscriptionRevenueChartData}
                            height={200}
                            color="#10B981"
                            name="Plan Fee"
                        />
                        <div className="mt-2 text-center">
                            <span className="text-sm text-gray-600">Plan Fee (Green)</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">Swap Fee Trend</h4>
                        <LineChart
                            data={swapFeeChartData}
                            height={200}
                            color="#3B82F6"
                            name="Swap Fee"
                        />
                        <div className="mt-2 text-center">
                            <span className="text-sm text-gray-600">Swap Fee (Blue)</span>
                        </div>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Total Plan Fee</p>
                        <p className="font-semibold text-green-700 text-lg">
                            {revenueLoading ? '...' : `${totalPlanFee.toLocaleString()} VND`}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 text-sm">Total Swap Fee</p>
                        <p className="font-semibold text-blue-700 text-lg">
                            {revenueLoading ? '...' : `${totalSwapFee.toLocaleString()} VND`}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Station Performance */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Station Performance</h3>
                {stationPerformanceLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading station performance data...</span>
                        </div>
                    </div>
                ) : stationPerformance.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center text-gray-500">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                            <p>No station performance data available</p>
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
                                        Swaps
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Unique Users
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg Swaps/User
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
                                            {station.swaps.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {station.usersServed.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {station.avgSwapsPerUser.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Subscription Plan Analysis */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Subscription Plan Analysis</h3>
                </div>
                {subscriptionPlanLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading subscription plan data...</span>
                        </div>
                    </div>
                ) : subscriptionPlanBarData.length === 0 && subscriptionPlanAreaData.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center text-gray-500">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                            <p>No subscription plan data available for the selected period</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-md font-medium text-gray-700 mb-3">Subscription Metrics</h4>
                                <GroupedBarChart
                                    data={subscriptionPlanBarData}
                                    height={350}
                                />
                            </div>
                            <div>
                                <h4 className="text-md font-medium text-gray-700 mb-3">Revenue Distribution</h4>
                                <RevenueStackedAreaChart
                                    data={subscriptionPlanAreaData}
                                    height={350}
                                />
                            </div>
                        </div>
                    </>
                )}
            </Card>

            {/* AI Insights */}
            {/* <Card className="p-6">
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
            </Card> */}

        </div>
    );
};

export default AnalyticsReports;
