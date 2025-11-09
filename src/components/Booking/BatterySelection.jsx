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
                    Select the number of batteries to swap
                </h2>
                <p className="text-muted-foreground">
                    Choose how many batteries you want to swap for {selectedVehicle?.modelName || 'your vehicle'}
                </p>
            </div>

            {/* Battery Quantity Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Battery className="h-5 w-5" />
                        <span>Select battery quantity</span>
                    </CardTitle>
                    <CardDescription>
                        You can choose between 1 and {maxBatteries} {maxBatteries === 1 ? 'battery' : 'batteries'} per swap
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
                                    {batteryQuantity === 1 ? 'battery' : 'batteries'}
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
                                    {quantity} {quantity === 1 ? 'battery' : 'batteries'}
                                </Button>
                            ))}
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    size="lg"
                    className="min-w-[140px]"
                >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default BatterySelection;