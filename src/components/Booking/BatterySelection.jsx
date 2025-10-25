import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Battery, CheckCircle, ArrowRight, Plus, Minus } from 'lucide-react';

const BatterySelection = ({
    selectedVehicle,
    onBatterySelection,
    onNext,
    onBack
}) => {
    const [batteryQuantity, setBatteryQuantity] = useState(1);
    const maxBatteries = selectedVehicle?.batterySlot || selectedVehicle.model?.battery_slot || 1;


    const handleQuantityChange = (newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= maxBatteries) {
            setBatteryQuantity(newQuantity);
        }
    };

    const handleNext = () => {
        console.log('BatterySelection handleNext called:', { batteryQuantity });
        if (batteryQuantity > 0) {
            // Create array of battery IDs based on quantity
            const selectedBatteries = Array.from({ length: batteryQuantity }, (_, index) => index + 1);
            console.log('Calling onBatterySelection with:', selectedBatteries);
            onBatterySelection(selectedBatteries);
            // Note: onNext() is no longer called here as useEffect in BookingFlow will handle the step transition
        }
    };

    const isNextDisabled = batteryQuantity <= 0;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Chọn số lượng pin cần đổi
                </h2>
                <p className="text-muted-foreground">
                    Chọn số lượng pin mà bạn muốn đổi cho xe {selectedVehicle?.modelName}
                </p>
            </div>

            {/* Vehicle Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Battery className="h-5 w-5" />
                        <span>Thông tin xe</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Mẫu xe:</span>
                            <span className="font-medium">{selectedVehicle?.modelName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Số khe pin:</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {maxBatteries} khe
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Loại pin:</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {selectedVehicle?.batteryName}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Battery Quantity Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Battery className="h-5 w-5" />
                        <span>Chọn số lượng pin</span>
                    </CardTitle>
                    <CardDescription>
                        Bạn có thể chọn từ 1 đến {maxBatteries} pin để đổi cùng lúc
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Quantity Selector */}
                        <div className="flex items-center justify-center space-x-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(batteryQuantity - 1)}
                                disabled={batteryQuantity <= 1}
                                className="h-12 w-12"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>

                            <div className="text-center">
                                <div className="text-4xl font-bold text-primary mb-2">
                                    {batteryQuantity}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {batteryQuantity === 1 ? 'pin' : 'pin'}
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(batteryQuantity + 1)}
                                disabled={batteryQuantity >= maxBatteries}
                                className="h-12 w-12"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Quantity Options */}
                        <div className="grid grid-cols-2 gap-3">
                            {Array.from({ length: maxBatteries }, (_, index) => index + 1).map((quantity) => (
                                <Button
                                    key={quantity}
                                    variant={batteryQuantity === quantity ? "default" : "outline"}
                                    onClick={() => setBatteryQuantity(quantity)}
                                    className="h-12"
                                >
                                    {quantity} {quantity === 1 ? 'pin' : 'pin'}
                                </Button>
                            ))}
                        </div>

                        {/* Selection Summary */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">
                                    Bạn sẽ đổi {batteryQuantity} {batteryQuantity === 1 ? 'pin' : 'pin'} cho xe {selectedVehicle?.modelName}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>
                    Quay lại
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    size="lg"
                    className="min-w-[140px]"
                >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Tiếp tục
                </Button>
            </div>
        </div>
    );
};

export default BatterySelection;