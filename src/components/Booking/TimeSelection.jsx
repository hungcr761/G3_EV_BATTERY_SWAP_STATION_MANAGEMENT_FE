import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, Calendar, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const TimeSelection = ({ onTimeSelect, selectedTime, onNext, onBack }) => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(selectedTime);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'range'
    const [customTime, setCustomTime] = useState('');

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

    const handleCustomTimeSelect = () => {
        if (customTime) {
            const [hours, minutes] = customTime.split(':').map(Number);
            const today = new Date();
            const selectedTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0);

            const slot = {
                time: selectedTime,
                displayTime: customTime,
                isAvailable: true,
                slotId: `custom-${customTime}`
            };

            setSelectedSlot(slot);
            onTimeSelect(slot);
        }
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Thông tin đặt lịch:</p>
                        <p>Lệnh đặt lịch sẽ active ngay từ khi bạn xác nhận và kéo dài đến thời gian bạn chọn.
                            Ví dụ: nếu bây giờ là 10:00 và bạn chọn 12:00, lệnh đặt sẽ active từ 10:00 - 12:00.</p>
                    </div>
                </div>
            </div>

            {/* Enhanced Time Picker */}
            <div className="space-y-4">
                {/* Time Picker Header */}
                <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Chọn thời gian đến trạm</h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {availableSlots.length} khung giờ có sẵn
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    Lưới
                                </Button>
                                <Button
                                    variant={viewMode === 'range' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('range')}
                                >
                                    Tùy chỉnh
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Time Selection Content */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {availableSlots.map((slot) => {
                                const status = getTimeSlotStatus(slot);
                                const isSelected = selectedSlot?.slotId === slot.slotId;

                                return (
                                    <button
                                        key={slot.slotId}
                                        className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${isSelected
                                            ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105'
                                            : slot.isAvailable
                                                ? 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm'
                                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                            }`}
                                        onClick={() => slot.isAvailable && handleSlotSelect(slot)}
                                        disabled={!slot.isAvailable}
                                    >
                                        <div className="text-center">
                                            <div className="font-medium text-sm">{slot.displayTime}</div>
                                            {!isSelected && slot.isAvailable && (
                                                <div className={`text-xs mt-1 ${status.status === 'soon' ? 'text-orange-600' :
                                                    status.status === 'near' ? 'text-yellow-600' :
                                                        'text-green-600'
                                                    }`}>
                                                    {status.text}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selection indicator */}
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chọn thời gian tùy chỉnh
                                    </label>
                                    <input
                                        type="time"
                                        value={customTime}
                                        onChange={(e) => setCustomTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        min={new Date().toTimeString().slice(0, 5)}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={handleCustomTimeSelect}
                                        disabled={!customTime}
                                        className="h-10"
                                    >
                                        Chọn
                                    </Button>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p>Hoặc chọn từ các khung giờ có sẵn:</p>
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                                {availableSlots.slice(0, 12).map((slot) => {
                                    const isSelected = selectedSlot?.slotId === slot.slotId;
                                    return (
                                        <button
                                            key={slot.slotId}
                                            className={`p-2 rounded border transition-all ${isSelected
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-gray-200 hover:border-primary/50'
                                                }`}
                                            onClick={() => handleSlotSelect(slot)}
                                        >
                                            <div className="text-xs font-medium">{slot.displayTime}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Selected Time Summary */}
                {selectedSlot && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold text-primary">
                                        Thời gian đã chọn: {selectedSlot.displayTime}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Lệnh đặt sẽ active từ bây giờ đến {selectedSlot.displayTime}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSlot(null)}
                            >
                                Thay đổi
                            </Button>
                        </div>
                    </div>
                )}
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
