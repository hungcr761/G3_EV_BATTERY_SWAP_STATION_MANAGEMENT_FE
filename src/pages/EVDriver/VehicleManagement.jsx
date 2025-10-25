import { CardContent, Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import VehicleCard from '@/components/Vehicles/VehicleCard';
import VehicleForm from '@/components/Vehicles/VehicleForm';
import useVehicle from '@/hooks/useVehicle';
import { AlertCircle, ArrowLeft, CheckCircle, Motorbike, Plus, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';

export default function VehicleManagement() {
    const [showDialog, setShowDialog] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const navigate = useNavigate();
    const {
        vehicles,
        vehicleModels,
        loading,
        message,
        apiError,
        isSubmitting,
        confirmDelete,
        handleSubmit,
        handleDelete,
        executeDelete,
        setApiError,
        setConfirmDelete
    } = useVehicle();

    const handleEdit = (v) => {
        setEditingVehicle(v);
        setApiError(''); 
        setShowDialog(true);
    };

    const handleAddNew = () => {
        setEditingVehicle(null);
        setApiError('');
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        setEditingVehicle(null);
        setApiError('');
    };

    const handleFormSubmit = (data) => {
        handleSubmit(data, editingVehicle, handleCloseDialog);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-4 max-w-7xl py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button 
                        variant='ghost' 
                        onClick={() => navigate('/dashboard')}
                        className='mb-6 hover:bg-white/60 transition-all duration-200'
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back To Dashboard
                    </Button>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                    <Motorbike className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                        Vehicle Management
                                    </h1>
                                    <p className="text-slate-600 mt-1 text-lg">
                                        Manage and track your EV fleet
                                    </p>
                                </div>
                            </div>
                            <Button 
                                onClick={handleAddNew}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 px-6 py-6 text-base"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Add New Vehicle
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Alert Message */}
                {message.text && (
                    <div
                        className={`mb-8 p-5 rounded-xl flex items-start space-x-4 backdrop-blur-sm border shadow-md transition-all duration-300 animate-in slide-in-from-top ${
                            message.type === 'success'
                                ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200 shadow-emerald-100'
                                : 'bg-red-50/90 text-red-900 border-red-200 shadow-red-100'
                        }`}
                    >
                        <div className={`p-2 rounded-lg ${
                            message.type === 'success' 
                                ? 'bg-emerald-100' 
                                : 'bg-red-100'
                        }`}>
                            {message.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            )}
                        </div>
                        <p className="font-medium">{message.text}</p>
                    </div>
                )}

                {/* Vehicle List */}
                <div>
                    {loading ? (
                        <div className="col-span-full text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
                            </div>
                            <p className="mt-6 text-slate-600 font-medium text-lg">Loading your vehicles...</p>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="col-span-full">
                            <Card className="border-slate-200/60 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                                <CardContent className="py-16 text-center">
                                    <div className="inline-flex p-5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-6">
                                        <Motorbike className="h-20 w-20 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                        No Vehicles Found
                                    </h3>
                                    <p className="text-slate-600 mb-8 text-lg max-w-md mx-auto">
                                        Start building your EV fleet by adding your first vehicle.
                                    </p>
                                    <Button 
                                        onClick={handleAddNew}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 px-8 py-6 text-base"
                                    >
                                        <Plus className="mr-2 h-5 w-5" />
                                        Add Your First Vehicle
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-800">
                                    Your Vehicles <span className="text-slate-500 font-normal">({vehicles.length})</span>
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {vehicles.map(vehicle => (
                                    <VehicleCard
                                        key={vehicle.vehicle_id}
                                        vehicle={vehicle}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        isDeleting={confirmDelete?.vehicle_id === vehicle.vehicle_id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add/Edit Vehicle */}
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader className="space-y-3">
                            <DialogTitle className="text-2xl font-bold text-slate-800">
                                {editingVehicle ? 'Update Vehicle Information' : 'Add New Vehicle'}
                            </DialogTitle>
                            <DialogDescription className="text-base text-slate-600">
                                {editingVehicle 
                                    ? 'Edit your vehicle information below. VIN cannot be changed.' 
                                    : 'Fill in your new vehicle information to add it to your fleet.'}
                            </DialogDescription>
                        </DialogHeader>
                        <VehicleForm
                            onSubmit={handleFormSubmit}
                            onCancel={() => {
                                setShowDialog(false);
                                setEditingVehicle(null);
                                setApiError(''); // Clear API error on cancel
                            }}
                            editingVehicle={editingVehicle}
                            vehicleModels={vehicleModels}
                            apiError={apiError}
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={confirmDelete?.show}
                    onOpenChange={(open) => {
                        if (!open) {
                            setConfirmDelete(null);
                        }
                    }}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <DialogTitle className="text-center text-2xl font-bold text-slate-800">
                                Confirm Delete
                            </DialogTitle>
                            <DialogDescription className="text-center text-base text-slate-600">
                                Are you sure you want to delete vehicle <strong className="text-slate-900">{confirmDelete?.vehicle?.modelName}</strong> ({confirmDelete?.vehicle?.license_plate})? 
                                <br />
                                <span className="text-red-600 font-medium">This action cannot be undone.</span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex space-x-3 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1 border-slate-300 hover:bg-slate-50"
                                onClick={() => setConfirmDelete(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                                onClick={executeDelete}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Vehicle'
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
