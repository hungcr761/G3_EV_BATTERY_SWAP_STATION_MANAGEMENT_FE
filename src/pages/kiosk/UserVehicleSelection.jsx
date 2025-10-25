import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Motorbike, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { vehicleAPI, modelAPI, batteryTypeAPI } from '../../lib/apiServices';

const UserVehicleSelection = () => {
    const { stationId, userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                // Fetch vehicle models and battery types first
                const [modelsResponse, batteryResponse] = await Promise.all([
                    modelAPI.getAll(),
                    batteryTypeAPI.getAll()
                ]);

                const models = modelsResponse.data?.payload?.vehicleModels || [];
                const batteryTypesData = batteryResponse.data?.payload?.batteryTypes || [];

                // Then fetch vehicles
                const response = await vehicleAPI.getAll();
                const vehiclesData = response.data?.vehicles || [];

                // Map vehicles with battery type information
                const mappedVehicles = vehiclesData.map(vehicle => {
                    const modelName = vehicle.model?.name || 'Unknown Model';
                    const vehicleModel = models.find(vm => vm.model_id === vehicle.model_id);

                    let batteryName = 'Unknown Battery';
                    let batteryTypeCode = 'type2'; // default
                    if (vehicleModel?.battery_type_id) {
                        const batteryType = batteryTypesData.find(bt => bt.battery_type_id === vehicleModel.battery_type_id);
                        batteryName = batteryType?.battery_type_code || 'Unknown Battery';
                        batteryTypeCode = batteryType?.battery_type_code || 'type2';
                    }

                    return {
                        ...vehicle,
                        modelName,
                        batteryName,
                        batteryType: batteryName,
                        batteryTypeCode
                    };
                });

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

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
    };

    const handleContinue = () => {
        if (!selectedVehicle) return;
        navigate(`/kiosk/${stationId}/user/${userId}/battery`, {
            state: { selectedVehicle }
        });
    };

    const handleBack = () => {
        navigate(`/kiosk/${stationId}/user/${userId}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-8 py-12">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto mb-6"></div>
                        <p className="text-2xl text-muted-foreground">Đang tải danh sách xe...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-8 py-12">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-red-300 bg-red-50">
                        <CardContent className="p-8">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-red-800 mb-2">Lỗi</h3>
                                <p className="text-xl text-red-600">{error}</p>
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="mt-4"
                                >
                                    Quay lại
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-8 py-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-primary">Chọn xe</h1>
                    <p className="text-2xl text-muted-foreground">
                        Chọn xe bạn muốn đổi pin
                    </p>
                </div>

                {/* Vehicle List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vehicles.map((vehicle) => (
                        <Card
                            key={vehicle.vehicle_id}
                            className={`cursor-pointer transition-all ${selectedVehicle?.vehicle_id === vehicle.vehicle_id
                                    ? 'border-4 border-primary shadow-xl scale-105'
                                    : 'border-2 border-gray-200 hover:border-primary hover:shadow-lg'
                                }`}
                            onClick={() => handleVehicleSelect(vehicle)}
                        >
                            <CardContent className="p-8">
                                <div className="flex items-center space-x-6">
                                    <div className="flex-shrink-0">
                                        <Motorbike className="h-16 w-16 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold mb-2">
                                            {vehicle.modelName}
                                        </h3>
                                        <p className="text-xl text-muted-foreground mb-2">
                                            {vehicle.license_plate}
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="text-lg px-3 py-1">
                                                {vehicle.batteryType}
                                            </Badge>
                                            {selectedVehicle?.vehicle_id === vehicle.vehicle_id && (
                                                <Badge variant="default" className="text-lg px-3 py-1">
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                    Đã chọn
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleBack}
                        className="text-2xl px-12 py-8 h-auto"
                    >
                        <ArrowLeft className="mr-3 h-6 w-6" />
                        Quay lại
                    </Button>

                    <Button
                        size="lg"
                        onClick={handleContinue}
                        disabled={!selectedVehicle}
                        className="text-2xl px-12 py-8 h-auto"
                    >
                        Tiếp tục
                        <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                </div>

                {/* Selection Info */}
                {selectedVehicle && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-blue-800 mb-2">
                                    Xe đã chọn
                                </h3>
                                <p className="text-xl text-blue-600">
                                    {selectedVehicle.modelName} - {selectedVehicle.license_plate}
                                </p>
                                <p className="text-lg text-blue-500">
                                    Pin: {selectedVehicle.batteryType}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default UserVehicleSelection;
