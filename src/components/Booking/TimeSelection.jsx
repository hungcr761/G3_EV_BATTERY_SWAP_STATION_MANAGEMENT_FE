import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

const TimeSelection = ({ onTimeSelect, selectedTime, onNext, onBack }) => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(selectedTime);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        generateTimeSlots();
        // Update current time every minute
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const generateTimeSlots = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const slots = [];

        // Generate slots from current time + 1 hour to end of day
        const startHour = Math.max(now.getHours() + 1, 6); // Earliest 6 AM
        const endHour = 22; // Latest 10 PM

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals
                const slotTime = new Date(today);
                slotTime.setHours(hour, minute, 0, 0);

                // Only add slots that are in the future
                if (slotTime > now) {
                    slots.push({
                        time: slotTime,
                        displayTime: slotTime.toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }),
                        isAvailable: true, // In real implementation, this would come from API
                        slotId: `${hour}-${minute}`
                    });
                }
            }
        }

        setAvailableSlots(slots);
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        onTimeSelect(slot);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTimeSlotStatus = (slot) => {
        const now = new Date();
        const timeDiff = slot.time.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff < 1) {
            return { status: 'soon', text: 'Sắp tới', color: 'bg-orange-100 text-orange-700 border-orange-200' };
        } else if (hoursDiff < 2) {
            return { status: 'near', text: 'Gần đây', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        } else {
            return { status: 'available', text: 'Có sẵn', color: 'bg-green-100 text-green-700 border-green-200' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Chọn thời gian đến trạm
                </h2>
                <p className="text-muted-foreground">
                    Chọn thời gian bạn muốn đến trạm đổi pin
                </p>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 text-blue-700">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{formatDate(currentTime)}</span>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                        <p>Lệnh đặt lịch sẽ chỉ có hiệu lực trong 15 phút từ thời điểm bạn chọn.
                            Ví dụ: nếu bạn chọn 9:30, lệnh đặt sẽ active từ 9:30 - 9:45.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableSlots.map((slot) => {
                    const status = getTimeSlotStatus(slot);
                    const isSelected = selectedSlot?.slotId === slot.slotId;

                    return (
                        <Button
                            key={slot.slotId}
                            variant={isSelected ? "default" : "outline"}
                            className={`h-auto p-3 flex flex-col items-center space-y-1 ${isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:border-primary/50'
                                }`}
                            onClick={() => handleSlotSelect(slot)}
                            disabled={!slot.isAvailable}
                        >
                            <Clock className="h-4 w-4" />
                            <span className="font-medium text-sm">{slot.displayTime}</span>
                            {!isSelected && (
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${status.color}`}
                                >
                                    {status.text}
                                </Badge>
                            )}
                        </Button>
                    );
                })}
            </div>

            {availableSlots.length === 0 && (
                <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        Không có khung giờ nào khả dụng cho ngày hôm nay
                    </p>
                </div>
            )}

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>
                    Quay lại
                </Button>
                {selectedSlot && (
                    <Button onClick={onNext} size="lg">
                        Xác nhận thời gian
                    </Button>
                )}
            </div>
        </div>
    );
};

export default TimeSelection;
