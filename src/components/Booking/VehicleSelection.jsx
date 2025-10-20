import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { vehicleAPI } from '../../lib/apiServices';
import { Motorbike, Battery, CheckCircle } from 'lucide-react';

const VehicleSelection = ({ onVehicleSelect, selectedVehicle, onNext }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true);
                const response = await vehicleAPI.getAll();
                const vehiclesData = response.data?.payload?.vehicles || response.data?.vehicles || [];

                // Map vehicles with battery type information
                const mappedVehicles = vehiclesData.map(vehicle => ({
                    ...vehicle,
                    modelName: typeof vehicle.model === 'string' ? vehicle.model : (vehicle.model?.name || 'Unknown Model'),
                    // Determine battery type based on model (this would come from backend in real implementation)
                    batteryType: getBatteryTypeFromModel(vehicle.modelName),
                    batteryTypeCode: getBatteryTypeCodeFromModel(vehicle.modelName)
                }));

                setVehicles(mappedVehicles);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
                setError('Không thể tải danh sách xe');
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    // Helper function to determine battery type from model
    const getBatteryTypeFromModel = (modelName) => {
        // This is a simplified mapping - in real implementation, this would come from backend
        const type1Models = ['VinFast Theon', 'VinFast Evo200'];
        return type1Models.includes(modelName) ? 'Type 1' : 'Type 2';
    };

    const getBatteryTypeCodeFromModel = (modelName) => {
        const type1Models = ['VinFast Theon', 'VinFast Evo200'];
        return type1Models.includes(modelName) ? 'type1' : 'type2';
    };

    const handleVehicleSelect = (vehicle) => {
        onVehicleSelect(vehicle);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải danh sách xe...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-2">Lỗi tải dữ liệu</p>
                <p className="text-sm text-muted-foreground">{error}</p>
            </div>
        );
    }

    if (vehicles.length === 0) {
        return (
            <div className="text-center py-8">
                <Motorbike className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Bạn chưa có xe nào được đăng ký</p>
                <Button variant="outline">Thêm xe mới</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Chọn xe để đặt lịch
                </h2>
                <p className="text-muted-foreground">
                    Vui lòng chọn xe mà bạn muốn đặt lịch đổi pin
                </p>
            </div>

            <div className="grid gap-4">
                {vehicles.map((vehicle) => (
                    <Card
                        key={vehicle.vehicle_id}
                        className={`cursor-pointer transition-all hover:shadow-md ${selectedVehicle?.vehicle_id === vehicle.vehicle_id
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:border-primary/50'
                            }`}
                        onClick={() => handleVehicleSelect(vehicle)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Motorbike className="h-5 w-5 text-primary" />
                                        <h3 className="font-semibold text-lg">{vehicle.modelName}</h3>
                                        {selectedVehicle?.vehicle_id === vehicle.vehicle_id && (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        )}
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center space-x-4">
                                            <span>VIN: {vehicle.vin}</span>
                                            <span>Biển số: {vehicle.license_plate}</span>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-1">
                                                <Battery className="h-4 w-4" />
                                                <span>SoH: {vehicle.battery_soh}%</span>
                                            </div>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                {vehicle.batteryType}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedVehicle && (
                <div className="flex justify-end pt-4">
                    <Button onClick={onNext} size="lg">
                        Tiếp tục
                    </Button>
                </div>
            )}
        </div>
    );
};

export default VehicleSelection;
