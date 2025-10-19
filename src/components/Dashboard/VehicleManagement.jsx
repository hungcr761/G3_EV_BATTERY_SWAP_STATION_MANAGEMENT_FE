// DEMO: VehicleManagement.jsx sau khi refactor
// So sánh với file hiện tại để thấy cải tiến

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Plus, Car, AlertCircle, CheckCircle } from 'lucide-react';
import { modelAPI, vehicleAPI } from '../../lib/apiServices';
import VehicleCard from './VehicleCard';
import VehicleDeleteDialog from './VehicleDeleteDialog';
import { VEHICLE_MESSAGES, MESSAGE_TIMEOUT } from '../../lib/constants';

// TODO: Tách VehicleFormDialog.jsx riêng
// TODO: Tạo custom hook useVehicles.js

const VehicleManagement = ({ onBack }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showDialog, setShowDialog] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [vehicleModels, setVehicleModels] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, vehicle: null });

    // Fetch vehicles function
    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await vehicleAPI.getAll();
            // Mock API trả về response.data.payload.vehicles
            const vehiclesData = response.data?.payload?.vehicles || response.data?.vehicles || [];
            const mappedVehicles = vehiclesData.map(vehicle => ({
                ...vehicle,
                // Mock vehicles có trường 'model' (string), còn API thật có 'model.name'
                modelName: typeof vehicle.model === 'string' ? vehicle.model : (vehicle.model?.name || 'Unknown Model')
            }));
            setVehicles(mappedVehicles);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setMessage({
                type: 'error',
                text: VEHICLE_MESSAGES.FETCH_ERROR
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch vehicle models
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await modelAPI.getAll();
                const models = response.data?.payload?.vehicleModels || [];
                setVehicleModels(models);
            } catch (error) {
                console.error('Error fetching vehicle models:', error);
            }
        };
        fetchModels();
    }, []);

    // Load vehicles on mount
    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    // Handle edit
    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setShowDialog(true);
    };

    // Handle delete click
    const handleDeleteClick = (vehicleId) => {
        const vehicleToDelete = vehicles.find(v => v.vehicle_id === vehicleId);
        setConfirmDelete({ show: true, vehicle: vehicleToDelete });
    };

    // Execute delete
    const executeDelete = async () => {
        const { vehicle } = confirmDelete;
        if (!vehicle) return;

        setConfirmDelete({ show: false, vehicle: null });

        try {
            const response = await vehicleAPI.delete(vehicle.vehicle_id);
            const isSuccess = response.data?.success === true || 
                             response.status === 200 || 
                             response.status === 204;

            if (isSuccess) {
                setMessage({
                    type: 'success',
                    text: VEHICLE_MESSAGES.DELETE_SUCCESS(vehicle.modelName, vehicle.license_plate)
                });
                await fetchVehicles();
                setTimeout(() => setMessage({ type: '', text: '' }), MESSAGE_TIMEOUT.SUCCESS);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || VEHICLE_MESSAGES.DELETE_ERROR
            });
            setTimeout(() => setMessage({ type: '', text: '' }), MESSAGE_TIMEOUT.ERROR);
        }
    };

    // Cancel delete
    const handleCancelDelete = () => {
        setConfirmDelete({ show: false, vehicle: null });
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" onClick={onBack} className="mb-4">
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
                        <Button onClick={() => setShowDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm xe mới
                        </Button>
                    </div>
                </div>

                {/* Alert Message */}
                {message.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                            message.type === 'success'
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
                            <p className="mt-4 text-muted-foreground">{VEHICLE_MESSAGES.LOADING}</p>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="col-span-full">
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {VEHICLE_MESSAGES.NO_VEHICLES}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {VEHICLE_MESSAGES.NO_VEHICLES_DESC}
                                    </p>
                                    <Button onClick={() => setShowDialog(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm xe đầu tiên
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        vehicles.map((vehicle) => (
                            <VehicleCard
                                key={vehicle.vehicle_id || vehicle.id}
                                vehicle={vehicle}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                            />
                        ))
                    )}
                </div>

                {/* TODO: Add VehicleFormDialog component here */}
                {/* <VehicleFormDialog
                    open={showDialog}
                    editingVehicle={editingVehicle}
                    vehicleModels={vehicleModels}
                    onClose={() => setShowDialog(false)}
                    onSuccess={fetchVehicles}
                /> */}

                {/* Delete Confirmation Dialog */}
                <VehicleDeleteDialog
                    open={confirmDelete.show}
                    vehicle={confirmDelete.vehicle}
                    onConfirm={executeDelete}
                    onCancel={handleCancelDelete}
                />
            </div>
        </div>
    );
};

export default VehicleManagement;
