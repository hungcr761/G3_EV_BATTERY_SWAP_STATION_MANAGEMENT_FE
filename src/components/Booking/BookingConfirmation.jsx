import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    Motorbike,
    MapPin,
    Clock,
    Battery,
    CheckCircle,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { configAPI } from '../../lib/apiServices';

const BookingConfirmation = ({
    selectedVehicle,
    selectedTime,
    selectedStation,
    selectedBatteries = [],
    onConfirm,
    onBack,
    isSubmitting = false
}) => {
    const [bookingStartTime] = useState(new Date());
    const [bookingInterval, setBookingInterval] = useState(30); // Default to 30 minutes
    const [isLoadingInterval, setIsLoadingInterval] = useState(true);
    const [bookingEndTime, setBookingEndTime] = useState(() => {
        const now = new Date();
        return new Date(now.getTime() + 30 * 60 * 1000); // Default to 30 minutes from now
    });

    // Fetch booking interval from API
    useEffect(() => {
        const fetchBookingInterval = async () => {
            try {
                setIsLoadingInterval(true);
                const response = await configAPI.getBookingInterval();
                // Assuming the API returns { interval: number } or { booking_interval: number } or just a number
                const interval = response.data?.data || response.data || 30;
                setBookingInterval(interval);

                // Update booking end time with the fetched interval
                const now = new Date();
                setBookingEndTime(new Date(now.getTime() + interval * 60 * 1000));
            } catch (error) {
                console.error('Error fetching booking interval:', error);
                // Keep default 30 minutes if API fails
                setBookingInterval(30);
            } finally {
                setIsLoadingInterval(false);
            }
        };

        fetchBookingInterval();
    }, []);

    const formatTime = (time) => {
        if (!time) return '';
        return time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getActiveTimeRange = () => {
        return {
            start: formatTime(bookingStartTime),
            end: formatTime(bookingEndTime)
        };
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Confirm Booking
                </h2>
                <p className="text-muted-foreground">
                    Please review the information before confirming
                </p>
            </div>

            {/* Active Time Range */}
            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-bold text-lg text-blue-700">
                        {getActiveTimeRange().start} - {getActiveTimeRange().end}
                    </span>
                </div>
                <p className="text-center text-sm mt-1 text-blue-600">
                    Booking command active time
                </p>
            </div>

            {/* Vehicle Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Motorbike className="h-5 w-5" />
                        <span>Vehicle Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Model:</span>
                            <span className="font-medium">{selectedVehicle?.modelName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">VIN:</span>
                            <span className="font-medium">{selectedVehicle?.vin}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">License Plate:</span>
                            <span className="font-medium">{selectedVehicle?.license_plate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Battery Type:</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {selectedVehicle?.batteryType}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Number of Batteries:</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {selectedBatteries.length} {selectedBatteries.length === 1 ? 'battery' : 'batteries'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Station Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Station Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Station Name:</span>
                            <span className="font-medium">{selectedStation?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Address:</span>
                            <span className="font-medium text-right max-w-xs">{selectedStation?.address}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={selectedStation?.status === 'available' ? 'default' : 'secondary'}>
                                {selectedStation?.status === 'available' ? 'Available' : 'Limited'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Time Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Booking Time</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium">{formatDate(bookingStartTime)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Active Time:</span>
                            <span className="font-medium">
                                {getActiveTimeRange().start || 'Loading...'} {getActiveTimeRange().end ? `- ${getActiveTimeRange().end}` : ''}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
                    Back
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    size="lg"
                    className="min-w-[140px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Booking
                        </>
                    )}
                </Button>
            </div>

        </div>
    );
};

export default BookingConfirmation;
