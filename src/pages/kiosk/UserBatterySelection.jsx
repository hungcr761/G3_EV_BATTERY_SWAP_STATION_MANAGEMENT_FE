import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Battery, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const UserBatterySelection = () => {
    const { stationId, userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedBatteries, setSelectedBatteries] = useState([]);
    const [selectedVehicle] = useState(location.state?.selectedVehicle);

    const maxBatteries = selectedVehicle?.model?.battery_slot || 1;
    const batteryOptions = Array.from({ length: maxBatteries }, (_, i) => i + 1);

    const handleBatterySelect = (batteryCount) => {
        setSelectedBatteries(Array.from({ length: batteryCount }, (_, i) => i + 1));
    };

    const handleContinue = () => {
        if (selectedBatteries.length === 0) return;
        navigate(`/kiosk/${stationId}/user/${userId}/availability`, {
            state: {
                selectedVehicle,
                selectedBatteries
            }
        });
    };

    const handleBack = () => {
        navigate(`/kiosk/${stationId}/user/${userId}/vehicle`);
    };

    if (!selectedVehicle) {
        return (
            <div className="container mx-auto px-8 py-12">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-red-300 bg-red-50">
                        <CardContent className="p-8">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-red-800 mb-2">Lỗi</h3>
                                <p className="text-xl text-red-600">Không tìm thấy thông tin xe</p>
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
                    <h1 className="text-5xl font-bold text-primary">Chọn số lượng pin</h1>
                    <p className="text-2xl text-muted-foreground">
                        Chọn số lượng pin bạn muốn đổi
                    </p>
                </div>

                {/* Vehicle Info */}
                <Card className="border-2 border-primary">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <Battery className="h-12 w-12 text-primary" />
                            <div>
                                <h3 className="text-2xl font-bold">{selectedVehicle.modelName}</h3>
                                <p className="text-xl text-muted-foreground">
                                    {selectedVehicle.license_plate} • {selectedVehicle.batteryType}
                                </p>
                                <p className="text-lg text-muted-foreground">
                                    Tối đa {maxBatteries} pin
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Battery Selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {batteryOptions.map((count) => (
                        <Card
                            key={count}
                            className={`cursor-pointer transition-all ${selectedBatteries.length === count
                                    ? 'border-4 border-primary shadow-xl scale-105'
                                    : 'border-2 border-gray-200 hover:border-primary hover:shadow-lg'
                                }`}
                            onClick={() => handleBatterySelect(count)}
                        >
                            <CardContent className="p-8 text-center">
                                <div className="space-y-4">
                                    <div className="text-6xl font-bold text-primary">
                                        {count}
                                    </div>
                                    <div className="text-2xl font-semibold">
                                        {count === 1 ? 'Pin' : 'Pin'}
                                    </div>
                                    {selectedBatteries.length === count && (
                                        <Badge variant="default" className="text-lg px-3 py-1">
                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                            Đã chọn
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Selection Info */}
                {selectedBatteries.length > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-blue-800 mb-2">
                                    Đã chọn {selectedBatteries.length} pin
                                </h3>
                                <p className="text-xl text-blue-600">
                                    Loại pin: {selectedVehicle.batteryType}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                        disabled={selectedBatteries.length === 0}
                        className="text-2xl px-12 py-8 h-auto"
                    >
                        Kiểm tra tình trạng
                        <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserBatterySelection;
