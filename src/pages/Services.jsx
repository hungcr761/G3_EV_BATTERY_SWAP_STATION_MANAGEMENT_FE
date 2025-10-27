
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

    // Format percent values (avoid JS floating point artifacts)
    const formatPercent = (value) => {
        const num = Number(value) || 0;
        const percent = num * 100;
        const maximumFractionDigits = Number.isInteger(percent) ? 0 : 2;
        return new Intl.NumberFormat('vi-VN', { maximumFractionDigits }).format(percent);
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

        // Store plan and vehicle data in localStorage for potential retry scenarios
        localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
        localStorage.setItem('selectedVehicle', JSON.stringify(selectedVehicle));

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

                {/* Plan grid - Phân tách 2 loại gói */}
                {!loading && !error && plans.length > 0 && (
                    <div className="space-y-12 max-w-7xl mx-auto">
                        {/* Gói KHÔNG THEO LƯỢT (fee_slot = 0) */}
                        {plans.filter(plan => parseFloat(plan.swap_fee) === 0).length > 0 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <Badge className="mb-3 bg-green-500 text-white px-4 py-1.5 text-sm">
                                        KHÔNG GIỚI HẠN LƯỢT ĐỔI
                                    </Badge>
                                    <h2 className="text-2xl font-bold text-foreground">
                                        Gói Không Theo Lượt
                                    </h2>
                                    <p className="text-muted-foreground mt-2">
                                        Đổi pin không giới hạn trong tháng - phù hợp người dùng thường xuyên
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                    {plans.filter(plan => parseFloat(plan.swap_fee) === 0).map((plan) => (
                                        <Card key={plan.plan_id} className="flex flex-col hover:shadow-xl transition-all duration-300">
                                            <CardHeader className="text-center pb-4 flex-shrink-0">
                                                <CardTitle className="text-xl lg:text-2xl font-bold">
                                                    {plan.plan_name}
                                                </CardTitle>
                                                <CardDescription className="text-xs lg:text-sm text-muted-foreground mt-2 min-h-[40px]">
                                                    {plan.description}
                                                </CardDescription>
                                                <div className="text-2xl lg:text-3xl font-bold text-primary mt-4">
                                                    {formatPrice(plan.plan_fee)}/tháng
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4 lg:space-y-6 flex-grow flex flex-col">
                                                <div className="text-center py-3 bg-primary/5 rounded-lg">
                                                    <div className="text-xl lg:text-2xl font-bold text-foreground mb-1">
                                                        {plan.battery_cap} pin
                                                    </div>
                                                    <div className="text-xs lg:text-sm text-muted-foreground">
                                                        Số lượng pin tối đa
                                                    </div>
                                                </div>

                                                <ul className="space-y-2 lg:space-y-3 flex-grow">
                                                    <li className="flex items-center space-x-2 lg:space-x-3">
                                                        <Check className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 flex-shrink-0" />
                                                        <span className="text-xs lg:text-sm text-muted-foreground">
                                                            SoH cap: {formatPercent(plan.soh_cap)}%
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-2 lg:space-x-3">
                                                        <Check className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 flex-shrink-0" />
                                                        <span className="text-xs lg:text-sm text-muted-foreground">
                                                            Phí phạt: {formatPrice(plan.penalty_fee)}/%
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-2 lg:space-x-3">
                                                        <Check className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 flex-shrink-0" />
                                                        <span className="text-xs lg:text-sm text-muted-foreground">
                                                            Thời hạn: {plan.duration_days} ngày
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-2 lg:space-x-3">
                                                        <Star className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500 flex-shrink-0" />
                                                        <span className="text-xs lg:text-sm font-semibold text-green-600">
                                                            Đổi pin không giới hạn
                                                        </span>
                                                    </li>
                                                </ul>

                                                <div className="flex justify-center pt-4">
                                                    <Button
                                                        size="lg"
                                                        className="w-full lg:w-auto"
                                                        onClick={() => handleSelectSubscription(plan)}
                                                    >
                                                        <Zap className="mr-2 h-4 w-4" />
                                                        Chọn gói này
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gói THEO LƯỢT (fee_slot > 0) */}
                        {plans.filter(plan => parseFloat(plan.swap_fee) > 0).length > 0 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        Gói Theo Lượt Đổi Pin
                                    </h2>
                                    <p className="text-muted-foreground mt-2">
                                        Trả phí theo lượt đổi pin, thanh toán tổng hợp cuối tháng.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                    {plans.filter(plan => parseFloat(plan.swap_fee) > 0).map((plan) => (
                                        <Card key={plan.plan_id} className="flex flex-col hover:shadow-xl transition-all duration-300 border-blue-200">
                                            <CardHeader className="text-center pb-4 flex-shrink-0">
                                                <CardTitle className="text-xl lg:text-2xl font-bold">
                                                    {plan.plan_name}
                                                </CardTitle>
                                                <CardDescription className="text-xs lg:text-sm text-muted-foreground mt-2 min-h-[40px]">
                                                    {plan.description}
                                                </CardDescription>
                                                <div className="mt-4 space-y-1">
                                                    <div className="text-2xl lg:text-3xl font-bold text-primary">
                                                        {formatPrice(plan.plan_fee)}/tháng
                                                    </div>
                                                    <div className="text-sm lg:text-base text-blue-600 font-semibold">
                                                        + {formatPrice(plan.swap_fee)}/lượt
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4 lg:space-y-6 flex-grow flex flex-col">
                                                <div className="text-center py-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="text-xl lg:text-2xl font-bold text-foreground mb-1">
                                                        {plan.battery_cap} pin
                                                    </div>
                                                    <div className="text-xs lg:text-sm text-muted-foreground">
                                                        Số lượng pin tối đa
                                                    </div>
                                                </div>

                                                <ul className="space-y-2 lg:space-y-3 flex-grow">
                                                    <li className="flex items-center space-x-2 lg:space-x-3">
                                                        <Check className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 flex-shrink-0" />
                                                        <span className="text-xs lg:text-sm text-muted-foreground">
                                                            SoH cap: {formatPercent(plan.soh_cap)}%
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-2 lg:space-x-3">
                                                        <Check className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 flex-shrink-0" />
                                                        <span className="text-xs lg:text-sm text-muted-foreground">
                                                            Phí phạt: {formatPrice(plan.penalty_fee)}/%
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-2 lg:space-x-3">
                                                        <Check className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 flex-shrink-0" />
                                                        <span className="text-xs lg:text-sm text-muted-foreground">
                                                            Thời hạn: {plan.duration_days} ngày
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-2 lg:space-x-3">
                                                        <Battery className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500 flex-shrink-0" />
                                                        <span className="text-xs lg:text-sm font-semibold text-blue-600">
                                                            Phí {formatPrice(plan.swap_fee)}/lần đổi
                                                        </span>
                                                    </li>
                                                </ul>

                                                <div className="flex justify-center pt-4">
                                                    <Button
                                                        size="lg"
                                                        className="w-full lg:w-auto"
                                                        onClick={() => handleSelectSubscription(plan)}
                                                    >
                                                        <Zap className="mr-2 h-4 w-4" />
                                                        Chọn gói này
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-16 text-center">
                    <Card className="max-w-4xl mx-auto">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-foreground">
                                    Cách tính phí
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-foreground">Phí gói hàng tháng</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Thanh toán cố định mỗi tháng theo gói dịch vụ đã chọn
                                            (Không giới hạn hoặc Theo lượt).
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-foreground">Phí hao mòn pin</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Áp dụng khi SoH pin vượt ngưỡng 1% miễn phí. Mỗi 1% vượt thêm
                                            tương đương 100.000&nbsp;VNĐ. Nếu nhỏ hơn 1%, tính theo tỷ lệ
                                            phần trăm thực tế.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* Dialog chọn xe */}
                <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-foreground mb-2">
                                Chọn xe để đăng ký gói {selectedPlan?.plan_name}
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Chỉ hiển thị các xe chưa đăng ký gói dịch vụ nào
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            {loadingVehicles ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                        <p className="text-muted-foreground">Đang tải danh sách xe...</p>
                                    </div>
                                </div>
                            ) : vehiclesWithoutPlan.length === 0 ? (
                                <div className="text-center py-12">
                                    <Motorbike className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Không có xe khả dụng</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Tất cả xe của bạn đã có gói dịch vụ hoặc bạn chưa đăng ký xe nào.
                                    </p>
                                    <Button variant="outline">Thêm xe mới</Button>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {vehiclesWithoutPlan.map((vehicle) => (
                                        <Card
                                            key={vehicle.vehicle_id}
                                            className={`cursor-pointer transition-all hover:shadow-md ${selectedVehicle?.vehicle_id === vehicle.vehicle_id
                                                ? 'ring-2 ring-primary bg-primary/5'
                                                : 'hover:border-primary/50'
                                                }`}
                                            onClick={() => setSelectedVehicle(vehicle)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Motorbike className="h-5 w-5 text-primary" />
                                                            <h3 className="font-semibold text-lg">{vehicle.model_name}</h3>
                                                            {selectedVehicle?.vehicle_id === vehicle.vehicle_id && (
                                                                <Check className="h-5 w-5 text-green-500" />
                                                            )}
                                                        </div>

                                                        <div className="space-y-2 text-sm text-muted-foreground">
                                                            <div className="flex items-center space-x-4">
                                                                <span>VIN: {vehicle.vin}</span>
                                                                <span>Biển số: {vehicle.license_plate}</span>
                                                            </div>

                                                            <div className="flex items-center space-x-4">
                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                    {vehicle.battery_type || 'Chưa xác định'}
                                                                </Badge>
                                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                    Sẵn sàng đăng ký
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedVehicle && (
                            <div className="flex justify-end pt-4 border-t">
                                <div className="flex space-x-3">
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
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        <Zap className="mr-2 h-4 w-4" />
                                        Tiếp tục thanh toán
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
