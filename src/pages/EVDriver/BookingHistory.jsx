import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { bookingAPI } from '@/lib/apiServices';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    MapPin,
    Bike,
    Battery,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';

export default function BookingHistory() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookingHistory = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch completed and cancelled bookings separately
                const [completedResponse, cancelledResponse] = await Promise.all([
                    bookingAPI.getByStatus('completed'),
                    bookingAPI.getByStatus('cancelled')
                ]);

                // Extract bookings from both responses
                const completedData = completedResponse?.data;
                const cancelledData = cancelledResponse?.data;

                const completedBookings = completedData?.bookings || completedData?.payload?.bookings || [];
                const cancelledBookings = cancelledData?.bookings || cancelledData?.payload?.bookings || [];

                // Combine both arrays
                const allBookings = [
                    ...(Array.isArray(completedBookings) ? completedBookings : []),
                    ...(Array.isArray(cancelledBookings) ? cancelledBookings : [])
                ];

                setBookings(allBookings);
            } catch (err) {
                console.error('Failed to fetch booking history', err);
                setError(err.response?.data?.message || err.message || 'Failed to load booking history');
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingHistory();
    }, []);

    // Format date and time
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(dateString));
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return {
                    className: 'bg-emerald-100 text-emerald-700',
                    icon: <CheckCircle2 className="w-3 h-3" />,
                    text: 'Completed'
                };
            case 'cancelled':
                return {
                    className: 'bg-red-100 text-red-700',
                    icon: <XCircle className="w-3 h-3" />,
                    text: 'Cancelled'
                };
            default:
                return {
                    className: 'bg-slate-100 text-slate-700',
                    icon: <Clock className="w-3 h-3" />,
                    text: status || 'Unknown'
                };
        }
    };

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        const total = bookings.length;
        const completed = bookings.filter(b => b.status?.toLowerCase() === 'completed').length;
        const cancelled = bookings.filter(b => b.status?.toLowerCase() === 'cancelled' || b.status?.toLowerCase() === 'cancelled').length;
        return { total, completed, cancelled };
    }, [bookings]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-slate-600">Loading booking history...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="pt-6">
                            <p className="text-red-600 text-center">{error}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <Button
                    variant='ghost'
                    onClick={() => navigate('/dashboard')}
                    className='mb-6 hover:bg-white/60 transition-all duration-200'
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back To Dashboard
                </Button>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Booking History
                        </h1>
                        <p className="text-slate-600">View all your completed and cancelled bookings</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Total Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {summaryStats.total}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                {summaryStats.completed}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                cancelled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                                {summaryStats.cancelled}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Empty state */}
                {bookings.length === 0 ? (
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md">
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No booking history</h3>
                                <p className="text-slate-500">
                                    You don't have any completed or cancelled bookings yet.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const statusBadge = getStatusBadge(booking.status);
                            return (
                                <Card
                                    key={booking.booking_id}
                                    className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-blue-600"></div>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1 flex-1">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <span className="p-1.5 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                                                        <Calendar className="w-4 h-4" />
                                                    </span>
                                                    <span className="font-semibold">
                                                        {booking.station?.station_name || 'Unknown Station'}
                                                    </span>
                                                    <Badge className={statusBadge.className}>
                                                        <span className="flex items-center gap-1">
                                                            {statusBadge.icon}
                                                            {statusBadge.text}
                                                        </span>
                                                    </Badge>
                                                </CardTitle>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(booking.create_time)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTime(booking.create_time)} - {formatTime(booking.expired_time)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-4">
                                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex gap-2 items-start">
                                                <div className="p-2 rounded-md bg-slate-100 text-slate-700">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">
                                                        {booking.station?.station_name || 'Unknown Station'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {booking.station?.address || 'No address'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 items-start">
                                                <div className="p-2 rounded-md bg-slate-100 text-slate-700">
                                                    <Bike className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">
                                                        {booking.vehicle?.license_plate || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {booking.vehicle?.model?.brand} {booking.vehicle?.model?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 items-start">
                                                <div className="p-2 rounded-md bg-slate-100 text-slate-700">
                                                    <Battery className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">
                                                        {booking.batteries?.length || 0} Battery
                                                    </p>
                                                    {booking.batteries && booking.batteries.length > 0 && (
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {booking.batteries.map((battery, idx) => (
                                                                <span key={idx} className="font-mono">
                                                                    {battery.battery_serial || battery.battery_id}
                                                                    {idx < booking.batteries.length - 1 && ', '}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200">
                                            <div>
                                                <span className="font-semibold">Booking ID:</span>
                                                <span className="ml-2 font-mono break-all">{booking.booking_id || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold">Created:</span>
                                                <span className="ml-2">{formatDateTime(booking.create_time)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

