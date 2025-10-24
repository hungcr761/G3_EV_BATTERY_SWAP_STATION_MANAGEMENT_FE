import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { modelAPI, vehicleAPI, batteryTypeAPI } from '../../lib/apiServices';
import { vehicleSchema } from '../../lib/validations';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import {
    ArrowLeft,
    Plus,
    Motorbike,
    Edit,
    Trash2,
    AlertCircle,
    CheckCircle,
    Save,
    Loader2,
    Car
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';


const VehicleManagement = ({ onBack }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showDialog, setShowDialog] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [vehicleModels, setVehicleModels] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, vehicle: null });
    const [batteryTypes, setBatteryTypes] = useState([]);

    const {
        register,
        handleSubmit: handleFormSubmit,
        formState: { errors },
        reset,
        setValue,
        control
    } = useForm({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            vin: '',
            model: '',
            license_plate: ''
        }
    });

    {/* Fetch vehicle models and battery types for the select dropdown */ }
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch vehicle models
                const modelsResponse = await modelAPI.getAll();
                const models = modelsResponse.data?.payload?.vehicleModels || [];
                setVehicleModels(models);

                // Fetch battery types
                const batteryResponse = await batteryTypeAPI.getAll();
                const batteryTypesData = batteryResponse.data?.payload?.batteryTypes || [];
                setBatteryTypes(batteryTypesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Fetch vehicles function
    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await vehicleAPI.getAll();

            const vehiclesData = response.data?.vehicles || [];
            const mappedVehicles = vehiclesData.map(vehicle => {
                // Get model name from vehicle.model
                const modelName = vehicle.model?.name || 'Unknown Model';

                // Find the corresponding model in vehicleModels to get battery_type_id and battery_slot
                const vehicleModel = vehicleModels.find(vm => vm.model_id === vehicle.model_id);

                // Get battery type name using battery_type_id from vehicle model
                let batteryName = 'Unknown Battery';
                let batterySlot = 0;
                if (vehicleModel?.battery_type_id) {
                    const batteryType = batteryTypes.find(bt => bt.battery_type_id === vehicleModel.battery_type_id);
                    batteryName = batteryType?.battery_type_code || 'Unknown Battery';
                }

                // Get battery_slot from vehicle model
                if (vehicleModel?.battery_slot) {
                    batterySlot = vehicleModel.battery_slot;
                }

                return {
                    ...vehicle,
                    modelName,
                    batteryName,
                    batterySlot
                };
            });

            setVehicles(mappedVehicles);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    }, [batteryTypes, vehicleModels]);

    // Load vehicles when component mounts
    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setApiError('');

        try {
            // Tìm model_id từ model name
            const selectedModel = vehicleModels.find(m => m.name === data.model);

            if (!selectedModel) {
                setApiError('Vui lòng chọn mẫu xe hợp lệ');
                setIsSubmitting(false);
                return;
            }

            // Tạo payload với model_id thay vì model
            const payload = {
                vin: data.vin,
                model_id: selectedModel.model_id,
                license_plate: data.license_plate
            };

            let response;
            if (editingVehicle) {
                response = await vehicleAPI.update(editingVehicle.vehicle_id, payload);
            } else {
                response = await vehicleAPI.create(payload);
            }

            // Kiểm tra response thành công
            const isSuccess = response.data?.success === true ||
                response.status === 200 ||
                response.status === 201;

            if (isSuccess) {
                // Đóng dialog trước
                handleCloseDialog();

                // Hiển thị thông báo
                setMessage({
                    type: 'success',
                    text: editingVehicle ? 'Cập nhật xe thành công!' : 'Thêm xe thành công!'
                });

                // Refresh danh sách xe
                await fetchVehicles();

                // Tự động ẩn thông báo sau 3 giây
                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            }
        } catch (error) {
            setApiError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setValue('vin', vehicle.vin || '');
        // Lấy model name từ nested object hoặc modelName đã map
        setValue('model', vehicle.modelName || vehicle.model?.name || '');
        setValue('license_plate', vehicle.license_plate || '');
        setApiError('');
        setShowDialog(true);
    };

    const handleDelete = async (vehicleId) => {
        const vehicleToDelete = vehicles.find(v => v.vehicle_id === vehicleId);
        setConfirmDelete({ show: true, vehicle: vehicleToDelete });
    };

    const executeDelete = async () => {
        const vehicleToDelete = confirmDelete.vehicle;
        const vehicleId = vehicleToDelete.vehicle_id;

        setConfirmDelete({ show: false, vehicle: null });

        try {
            const response = await vehicleAPI.delete(vehicleId);

            const isSuccess = response.data?.success === true ||
                response.status === 200 ||
                response.status === 204;
            if (isSuccess) {
                setMessage({
                    type: 'success',
                    text: `Đã xóa xe ${vehicleToDelete.modelName} (${vehicleToDelete.license_plate}) thành công!`
                });

                await fetchVehicles();

                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Không thể xóa xe. Vui lòng thử lại!'
            });

            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 5000);
        }
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        setEditingVehicle(null);
        reset();
        setApiError('');
    };

    const handleAddNew = () => {
        setEditingVehicle(null);
        reset();
        setApiError('');
        setShowDialog(true);
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại Dashboard
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Quản lý xe của tôi
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Quản lý danh sách xe điện của bạn
                            </p>
                        </div>
                        <Button onClick={handleAddNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm xe mới
                        </Button>
                    </div>
                </div>

                {/* Alert Message */}
                {message.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        )}
                        <p>{message.text}</p>
                    </div>
                )}

                {/* Vehicle List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-12">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                            <p className="mt-4 text-muted-foreground">Đang tải...</p>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="col-span-full">
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Motorbike className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        Chưa có xe nào
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Thêm xe điện của bạn để bắt đầu sử dụng dịch vụ
                                    </p>
                                    <Button onClick={handleAddNew}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm xe đầu tiên
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        vehicles.map((vehicle) => (
                            <Card key={vehicle.vehicle_id || vehicle.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Motorbike className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    VinFast {vehicle.modelName}
                                                </CardTitle>
                                                <Badge variant="secondary" className="mt-1">
                                                    {vehicle.license_plate}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">VIN</p>
                                            <p className="font-mono text-sm">{vehicle.vin}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Loại pin</p>
                                            <p className="text-sm font-medium">{vehicle.batteryName}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Số khe pin</p>
                                            <p className="text-sm font-medium">{vehicle.batterySlot} khe</p>
                                        </div>

                                        {/* {vehicle.battery_soh && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Tình trạng pin</p>
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-500 h-2 rounded-full"
                                                            style={{ width: `${vehicle.battery_soh}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{vehicle.battery_soh}%</span>
                                                </div>
                                            </div>
                                        )} */}

                                        <div className="flex space-x-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleEdit(vehicle)}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Sửa
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(vehicle.vehicle_id || vehicle.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Add/Edit Vehicle Dialog */}
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent
                        className="sm:max-w-[500px]"
                        onClose={handleCloseDialog}
                    >
                        <DialogHeader>
                            <DialogTitle>
                                {editingVehicle ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingVehicle
                                    ? 'Cập nhật thông tin xe của bạn'
                                    : 'Nhập thông tin xe điện của bạn'
                                }
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4 p-6 pt-2">
                            {/* API Error Message */}
                            {apiError && (
                                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                    <span className="text-sm text-red-700">{apiError}</span>
                                </div>
                            )}
                            {/* VIN */}
                            <div className="space-y-2">
                                <Label htmlFor="vin">
                                    Số VIN <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="vin"
                                    type="text"
                                    placeholder="Nhập số VIN (17 ký tự)"
                                    maxLength={17}
                                    disabled={!!editingVehicle}
                                    readOnly={!!editingVehicle}
                                    className={`uppercase ${errors.vin ? 'border-red-500' : ''} ${editingVehicle ? 'bg-muted cursor-not-allowed' : ''}`}
                                    {...register('vin', {
                                        setValueAs: v => v.toUpperCase()
                                    })}
                                />
                                {errors.vin && (
                                    <p className="text-sm text-red-600">{errors.vin.message}</p>
                                )}
                                {!errors.vin && !editingVehicle && (
                                    <p className="text-xs text-gray-500">
                                        Vehicle Identification Number (Số khung xe, 17 ký tự)
                                    </p>
                                )}
                                {/* {editingVehicle && (
                                    <p className="text-xs text-amber-600">
                                        VIN không thể chỉnh sửa
                                    </p>
                                )} */}
                            </div>

                            {/* Model */}
                            <div className="space-y-2">
                                <Label htmlFor="model">
                                    Mẫu xe <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="model"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className={errors.model ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Chọn mẫu xe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vehicleModels.map(model => (
                                                    <SelectItem key={model.model_id} value={model.name}>
                                                        VinFast {model.name} {model.battery_slot ? `(${model.battery_slot} khe pin)` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.model && (
                                    <p className="text-sm text-red-600">{errors.model.message}</p>
                                )}
                            </div>

                            {/* License Plate */}
                            <div className="space-y-2">
                                <Label htmlFor="license_plate">
                                    Biển số xe <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="license_plate"
                                    type="text"
                                    placeholder="VD: 29A-12345, 30B-123.45"
                                    maxLength={15}
                                    className={`uppercase ${errors.license_plate ? 'border-red-500' : ''}`}
                                    {...register('license_plate', {
                                        setValueAs: v => v.toUpperCase()
                                    })}
                                />
                                {errors.license_plate && (
                                    <p className="text-sm text-red-600">{errors.license_plate.message}</p>
                                )}
                                {!errors.license_plate && (
                                    <p className="text-xs text-gray-500">
                                        Định dạng: [Mã tỉnh][Chữ]-[Số] (VD: 29A-12345)
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-6">
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {editingVehicle ? 'Đang cập nhật...' : 'Đang thêm...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {editingVehicle ? 'Cập nhật' : 'Thêm xe'}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseDialog}
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={confirmDelete.show} onOpenChange={(open) => !open && setConfirmDelete({ show: false, vehicle: null })}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader className="space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-center text-xl">Xác nhận xóa xe</DialogTitle>
                            <DialogDescription className="text-center">
                                Bạn có chắc chắn muốn xóa xe này không? Hành động này không thể hoàn tác.
                            </DialogDescription>
                        </DialogHeader>

                        {confirmDelete.vehicle && (
                            <div className="space-y-4 py-4">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Motorbike className="h-5 w-5 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Mẫu xe</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                VinFast {confirmDelete.vehicle.modelName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-200" />

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Biển số</p>
                                            <p className="text-sm font-mono font-semibold text-gray-900">
                                                {confirmDelete.vehicle.license_plate}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">VIN</p>
                                            <p className="text-xs font-mono text-gray-700 break-all">
                                                {confirmDelete.vehicle.vin}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setConfirmDelete({ show: false, vehicle: null })}
                                        className="flex-1"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={executeDelete}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Xóa xe
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default VehicleManagement;

