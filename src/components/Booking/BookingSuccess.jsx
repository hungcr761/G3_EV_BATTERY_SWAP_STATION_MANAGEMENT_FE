import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, Clock, MapPin, Motorbike, Battery, QrCode } from 'lucide-react';
import QRCodeLib from 'qrcode';

const BookingSuccess = ({ bookingData, onClose }) => {
    const qrCodeRef = useRef(null);
    useEffect(() => {
        if (bookingData?.booking_id && qrCodeRef.current) {
            QRCodeLib.toCanvas(qrCodeRef.current, bookingData.booking_id, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }).catch(() => { });
        }
    }, [bookingData?.booking_id]);

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (timeString) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!bookingData) {
        console.warn('WARNING: bookingData is null/undefined');
        return (
            <div className="space-y-6">
                <div className="text-center p-8">
                    <p className="text-red-600">Error: No booking data available</p>
                    <p className="text-sm text-muted-foreground mt-2">Check console for details</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Booking Successful!
                </h2>
                <p className="text-muted-foreground">
                    Booking has been created and will be active until {bookingData?.expired_time ? formatTime(bookingData.expired_time) : 'N/A'}
                </p>
            </div>

            {/* Booking Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Booking Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Booking ID:</span>
                                    <span className="font-medium font-mono text-sm">
                                        {bookingData?.booking_id || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        Booked
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="font-medium">
                                        {bookingData?.create_time ? formatDate(bookingData.create_time) : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Start Time:</span>
                                    <span className="font-medium">
                                        {bookingData?.create_time ? formatTime(bookingData.create_time) : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">End Time:</span>
                                    <span className="font-medium">
                                        {bookingData?.expired_time ? formatTime(bookingData.expired_time) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-3 -mt-12">
                                <div className="text-center">
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <QrCode className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Booking QR Code</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                                        <canvas ref={qrCodeRef} className="block" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 max-w-[200px] text-center ml-3">
                                        Scan this QR code at the kiosk to confirm booking
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                            <span className="text-muted-foreground">Vehicle Model:</span>
                            <span className="font-medium">{bookingData?.vehicle?.modelName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">VIN:</span>
                            <span className="font-medium font-mono text-sm">{bookingData?.vehicle?.vin || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">License Plate:</span>
                            <span className="font-medium">{bookingData?.vehicle?.license_plate || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Battery Type:</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {bookingData?.vehicle?.batteryType || 'N/A'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Battery Information */}
            {bookingData?.batteries && bookingData.batteries.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Battery className="h-5 w-5" />
                            <span>Allocated Battery Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {bookingData.batteries.map((battery, index) => (
                                <div key={battery.battery_id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Battery #{index + 1}</span>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {battery.current_soc}% SOC
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Serial:</span>
                                            <span className="font-mono ml-1">{battery.battery_serial}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">SOH:</span>
                                            <span className="ml-1">{battery.current_soh}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

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
                            <span className="font-medium">{bookingData?.station?.station_name || bookingData?.station?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Address:</span>
                            <span className="font-medium text-right max-w-xs">{bookingData?.station?.address || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={bookingData?.station?.status === 'operational' ? 'default' : 'secondary'}>
                                {bookingData?.station?.status === 'operational' ? 'Operational' : 'Limited'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Action Button */}
            <div className="flex justify-center pt-4">
                <Button onClick={onClose} size="lg" className="min-w-[200px]">
                    Complete
                </Button>
            </div>
        </div>
    );
};

export default BookingSuccess;
