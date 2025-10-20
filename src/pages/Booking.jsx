import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import BookingFlow from '../components/Booking/BookingFlow';
import { Calendar, Clock, MapPin, Battery, Plus } from 'lucide-react';

const Booking = () => {
    const [showBookingFlow, setShowBookingFlow] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);

    // Mock station data for demo
    const mockStation = {
        id: 'demo-station-1',
        name: 'Trạm đổi pin Demo',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        latitude: 10.7769,
        longitude: 106.7009,
        status: 'available'
    };

    const handleStartBooking = () => {
        setSelectedStation(mockStation);
        setShowBookingFlow(true);
    };

    const handleBookingSuccess = (bookingData) => {
        console.log('Booking created successfully:', bookingData);
        setShowBookingFlow(false);
        // You can add success notification here
    };

    const handleCloseBooking = () => {
        setShowBookingFlow(false);
        setSelectedStation(null);
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Đặt lịch đổi pin
                        </h1>
                        <p className="text-muted-foreground">
                            Đặt lịch trước để đảm bảo có pin đầy khi cần
                        </p>
                    </div>

                    <Card>
                        <CardContent className="p-8">
                            <div className="text-center space-y-6">
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                    <Calendar className="h-12 w-12 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">
                                        Bắt đầu đặt lịch
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Chọn xe và thời gian để đặt lịch đổi pin tại trạm gần nhất
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button size="lg" onClick={handleStartBooking}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Đặt lịch mới
                                    </Button>
                                    <Button size="lg" variant="outline">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        Tìm trạm gần nhất
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Booking Flow Modal */}
            {showBookingFlow && selectedStation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <BookingFlow
                            selectedStation={selectedStation}
                            onBookingSuccess={handleBookingSuccess}
                            onClose={handleCloseBooking}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Booking;
