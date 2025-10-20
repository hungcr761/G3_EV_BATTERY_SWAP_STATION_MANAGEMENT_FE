import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Car, AlertCircle } from 'lucide-react';

const NoVehicleSelected = ({ onSelectVehicle }) => {
    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
                Chưa chọn xe
            </h3>
            <p className="text-muted-foreground mb-6">
                Vui lòng chọn xe trước để xem số lượng pin có sẵn tại các trạm
            </p>
            <Button onClick={onSelectVehicle} size="lg">
                <Car className="mr-2 h-4 w-4" />
                Chọn xe
            </Button>
        </div>
    );
};

export default NoVehicleSelected;
