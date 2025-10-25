import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Battery, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { bookingAPI, stationAPI } from '../../lib/apiServices';

const UserAvailabilityCheck = () => {
    const { stationId, userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedVehicle] = useState(location.state?.selectedVehicle);
    const [selectedBatteries] = useState(location.state?.selectedBatteries);
    const [availabilityData, setAvailabilityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAvailability = async () => {
            try {
                if (!selectedVehicle || !selectedBatteries) {
                    setError('Thiếu thông tin xe hoặc pin');
                    setLoading(false);
                    return;
                }

                // Check availability for the selected vehicle and battery count
                const response = await bookingAPI.checkAvailability(
                    stationId,
                    selectedVehicle.vehicle_id
                );

                setAvailabilityData(response.data);

                if (!response.data.available) {
                    setError('Trạm không có pin loại này hoặc đã hết chỗ');
                }
            } catch (error) {
                console.error('Error checking availability:', error);
                setError('Không thể kiểm tra tình trạng pin tại trạm');
            } finally {
                setLoading(false);
            }
        };

        checkAvailability();
    }, [stationId, selectedVehicle, selectedBatteries]);

    const handleStartSwap = () => {
        if (!selectedVehicle || !selectedBatteries) return;

        // Navigate to swap process with user data
        navigate(`/kiosk/${stationId}/user/${userId}/swap`, {
            state: {
                selectedVehicle,
                selectedBatteries,
                availabilityData
            }
        });
    };

    const handleBack = () => {
        navigate(`/kiosk/${stationId}/user/${userId}/battery`, {
            state: { selectedVehicle }
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-8 py-12">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto mb-6"></div>
                        <p className="text-2xl text-muted-foreground">Đang kiểm tra tình trạng pin...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-8 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Card className="border-red-300 bg-red-50">
                        <CardContent className="p-8">
                            <div className="flex items-start space-x-4">
                                <AlertCircle className="h-12 w-12 text-red-600 flex-shrink-0" />
                                <div>
                                    <h3 className="text-2xl font-bold text-red-800 mb-2">Không thể đổi pin</h3>
                                    <p className="text-xl text-red-600 mb-4">{error}</p>
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        className="text-xl px-8 py-4"
                                    >
                                        Thử lại
                                    </Button>
                                </div>
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
                    <h1 className="text-5xl font-bold text-primary">Tình trạng pin</h1>
                    <p className="text-2xl text-muted-foreground">
                        Kiểm tra tình trạng pin tại trạm
                    </p>
                </div>

                {/* Availability Status */}
                <Card className={`border-4 shadow-2xl ${availabilityData?.available
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                    }`}>
                    <CardHeader className={`text-center ${availabilityData?.available
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                        <CardTitle className="text-4xl">
                            {availabilityData?.available ? 'Có sẵn pin' : 'Không có pin'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="text-center space-y-6">
                            <div className="text-6xl">
                                {availabilityData?.available ? (
                                    <CheckCircle2 className="h-24 w-24 text-green-600 mx-auto" />
                                ) : (
                                    <AlertCircle className="h-24 w-24 text-red-600 mx-auto" />
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-3xl font-bold">
                                    {availabilityData?.available
                                        ? 'Có thể đổi pin ngay'
                                        : 'Không thể đổi pin'
                                    }
                                </h3>

                                {availabilityData?.available && (
                                    <div className="space-y-2">
                                        <p className="text-2xl text-green-700">
                                            Có {availabilityData.availability_details?.available_batteries_count || 0} pin {selectedVehicle.batteryType} khả dụng
                                        </p>
                                        <p className="text-xl text-green-600">
                                            Tổng slot: {availabilityData.availability_details?.total_slots || 0}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Summary */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-6">
                            <Battery className="h-16 w-16 text-primary" />
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-2">Thông tin đổi pin</h3>
                                <div className="grid grid-cols-2 gap-4 text-xl">
                                    <div>
                                        <p className="text-muted-foreground">Xe:</p>
                                        <p className="font-semibold">{selectedVehicle.modelName}</p>
                                        <p className="text-lg text-muted-foreground">{selectedVehicle.license_plate}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Pin:</p>
                                        <p className="font-semibold">{selectedBatteries.length} pin {selectedVehicle.batteryType}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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

                    {availabilityData?.available && (
                        <Button
                            size="lg"
                            onClick={handleStartSwap}
                            className="text-2xl px-12 py-8 h-auto"
                        >
                            Bắt đầu đổi pin
                            <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                    )}
                </div>

                {/* Help Text */}
                {!availabilityData?.available && (
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                                <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-yellow-800 mb-2">
                                        Không thể đổi pin
                                    </h3>
                                    <p className="text-lg text-yellow-700">
                                        Trạm hiện tại không có pin loại {selectedVehicle.batteryType} hoặc đã hết chỗ.
                                        Vui lòng thử trạm khác hoặc quay lại sau.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default UserAvailabilityCheck;
