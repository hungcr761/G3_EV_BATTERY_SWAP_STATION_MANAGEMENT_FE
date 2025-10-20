
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Battery, Check, Star, Zap, Loader2, AlertCircle, Motorbike } from 'lucide-react';
import useSubscriptionPlan from '@/hooks/useSubscriptionPlan';
import { vehicleAPI } from '@/lib/apiServices';

export default function Services() {
    const { plans, loading, error, refetch } = useSubscriptionPlan();
    const navigate = useNavigate();

    const [showVehicleDialog, setShowVehicleDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [vehiclesWithoutPlan, setVehiclesWithoutPlan] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Format Price Number
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Fetch vehicles without subscription plan
    const fetchVehiclesWithoutPlan = async () => {
        setLoadingVehicles(true);
        try {
            // Gọi API lấy xe chưa đăng ký gói (đã mock)
            const response = await vehicleAPI.getWithoutSubscription();
            const vehiclesWithout = response.data?.payload?.vehicles || [];

            setVehiclesWithoutPlan(vehiclesWithout);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            alert(err.response?.data?.message || 'Không thể tải danh sách xe');
        } finally {
            setLoadingVehicles(false);
        }
    };

    const handleSelectSubscription = async (plan) => {
        console.log('Selected plan: ', plan);
        setSelectedPlan(plan);
        setShowVehicleDialog(true);
        await fetchVehiclesWithoutPlan();
    };

    const handleSubscribe = () => {
        if (!selectedVehicle || !selectedPlan) return;

        // Navigate sang trang Payment với plan và vehicle info
        navigate('/payment', {
            state: {
                plan: selectedPlan,
                vehicle: selectedVehicle
            }
        });
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        Gói dịch vụ đổi pin
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Chọn gói dịch vụ phù hợp với nhu cầu sử dụng của bạn.

                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Đang tải danh sách gói dịch vụ...
                        </p>
                    </div>
                )}


                {/* Error State */}
                {error && !loading && (
                    <div className="max-w-2xl mx-auto">
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="py-12 text-center">
                                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-red-800 mb-2">
                                    Không thể tải dữ liệu
                                </h3>
                                <p className="text-red-600 mb-4">
                                    {error}
                                </p>
                                <Button onClick={refetch} variant="outline" className="border-red-300">
                                    Thử lại
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Empty Space */}
                {!loading && !error && plans.length === 0 && (
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Battery className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Chua có gói dịch vụ nào được cung cấp
                                </h3>
                                <p className="text-muted-foreground">
                                    Hien tai chưa có gói dịch vụ nào. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Plain grid */}
                {!loading && !error && plans.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan) => {
                            return (
                                <Card key={plan.plan_id}>
                                    <CardHeader className="text-center pb-4">
                                        <CardTitle className="text-2xl font-bold">
                                            {plan.plan_name}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-muted-foreground mt-2">
                                            {plan.description}
                                        </CardDescription>
                                        <div className="text-3xl font-bold text-primary mt-4">
                                            {formatPrice(plan.plan_fee)}/tháng
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        {/* Battery Capacity */}
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-foreground mb-2">
                                                {plan.battery_cap} pin
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Số lượng pin tối đa
                                            </div>
                                        </div>

                                        {/* Features List */}
                                        <ul className="space-y-3">
                                            <li className="flex items-center space-x-3">
                                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    Phí đặt cọc: {formatPrice(plan.deposit_fee)}
                                                </span>
                                            </li>
                                            <li className="flex items-center space-x-3">
                                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    SoH cap: {parseFloat(plan.soh_cap) * 100}%
                                                </span>
                                            </li>
                                            <li className="flex items-center space-x-3">
                                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    Phí phạt: {formatPrice(plan.penalty_fee)}/lượt
                                                </span>
                                            </li>
                                        </ul>

                                        <Button
                                            size="lg"
                                            onClick={() => handleSelectSubscription(plan)}
                                        >
                                            <Zap className="mr-2 h-4 w-4" />
                                            Chọn gói này
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                <div className="mt-16 text-center">
                    <Card className="max-w-4xl mx-auto">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-foreground">
                                    Cách tính phí
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-foreground">Phí gói hàng tháng</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Thanh toán trước mỗi tháng theo gói đã chọn
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-foreground">Phí vượt quá</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Tính theo delta SoH, trừ free allowance
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-foreground">Bảo hiểm</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Tất cả gói đều bao gồm bảo hiểm pin toàn diện
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dialog chọn xe */}
                <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">
                                Chọn xe để đăng ký gói {selectedPlan?.plan_name}
                            </DialogTitle>
                            <DialogDescription>
                                Chỉ hiển thị các xe chưa đăng ký gói dịch vụ nào
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            {loadingVehicles ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Đang tải danh sách xe...</p>
                                </div>
                            ) : vehiclesWithoutPlan.length === 0 ? (
                                <div className="text-center py-8">
                                    <Motorbike className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Không có xe khả dụng</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Tất cả xe của bạn đã có gói dịch vụ hoặc bạn chưa đăng ký xe nào.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3 max-h-96 overflow-y-auto">
                                    {vehiclesWithoutPlan.map((vehicle) => (
                                        <Card
                                            key={vehicle.vehicle_id}
                                            className={`cursor-pointer transition-all ${selectedVehicle?.vehicle_id === vehicle.vehicle_id
                                                ? 'border-primary bg-primary/5'
                                                : 'hover:border-primary/50'
                                                }`}
                                            onClick={() => setSelectedVehicle(vehicle)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="bg-primary/10 p-3 rounded-full">
                                                            <Motorbike className="h-6 w-6 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-foreground">
                                                                {vehicle.model_name}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Biển số: {vehicle.license_plate}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                VIN: {vehicle.vin}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {selectedVehicle?.vehicle_id === vehicle.vehicle_id && (
                                                        <Check className="h-6 w-6 text-primary" />
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowVehicleDialog(false);
                                    setSelectedVehicle(null);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubscribe}
                                disabled={!selectedVehicle}
                            >
                                <Zap className="mr-2 h-4 w-4" />
                                Tiếp tục thanh toán
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
