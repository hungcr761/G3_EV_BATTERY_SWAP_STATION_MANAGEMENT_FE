import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Motorbike, Check, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router';

/**
 * Dialog để chọn xe cho gói dịch vụ
 */
export default function VehicleSelectionDialog({
    open,
    onOpenChange,
    selectedPlan,
    vehicles,
    loading,
    selectedVehicle,
    onSelectVehicle,
    onConfirm,
    onCancel
}) {


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                            <Motorbike className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Select Vehicle</h3>
                            <p className="text-white/90 text-sm">Choose a vehicle for {selectedPlan?.plan_name} plan</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pt-6 pb-2 space-y-6">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            Available Vehicles
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            Only vehicles without active subscriptions are shown
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {/* Loading State */}
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 
                                        rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 
                                        shadow-lg mb-4">
                                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                                    </div>
                                    <p className="text-slate-600 font-medium">Loading vehicles...</p>
                                </div>
                            </div>
                        ) : vehicles.length === 0 ? (
                            /* Empty State */
                            <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="inline-flex p-4 bg-gradient-to-br from-slate-100 
                                    to-slate-200 rounded-2xl mb-4">
                                    <Motorbike className="h-16 w-16 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">
                                    No Available Vehicles
                                </h3>
                                <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                                    All your vehicles already have an active subscription or you haven't registered any vehicles yet.
                                </p>
                                <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
                                    <Link to="/vehiclesManagement">Add New Vehicle</Link>
                                </Button>
                            </div>
                        ) : (
                            /* Vehicle List */
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {vehicles.map((vehicle) => (
                                    <Card
                                        key={vehicle.vehicle_id}
                                        className={`cursor-pointer transition-all duration-200 
                                            border-slate-200 hover:shadow-lg ${selectedVehicle?.vehicle_id === vehicle.vehicle_id
                                                ? 'ring-2 ring-blue-500 bg-blue-50/50 border-blue-300 shadow-md'
                                                : 'hover:border-blue-300 bg-white'
                                            }`}
                                        onClick={() => onSelectVehicle(vehicle)}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-start space-x-3 mb-3">
                                                        <div className={`p-2 rounded-lg flex-shrink-0 ${selectedVehicle?.vehicle_id === vehicle.vehicle_id
                                                            ? 'bg-blue-100'
                                                            : 'bg-slate-100'
                                                            }`}>
                                                            <Motorbike className={`h-5 w-5 ${selectedVehicle?.vehicle_id === vehicle.vehicle_id
                                                                ? 'text-blue-600'
                                                                : 'text-slate-600'
                                                                }`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-3">
                                                                <h3 className="font-bold text-lg text-slate-800">
                                                                    {vehicle.model.name}
                                                                </h3>
                                                                {console.log(vehicle.model_name)}
                                                                {selectedVehicle?.vehicle_id === vehicle.vehicle_id && (
                                                                    <div className="p-1 bg-emerald-100 rounded-full">
                                                                        <Check className="h-5 w-5 text-emerald-600" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 text-sm text-slate-600 ml-12">
                                                        <div className="flex items-center space-x-6">
                                                            <span className="font-mono">VIN: {vehicle.vin}</span>
                                                            <span className="font-semibold">
                                                                License Plate: {vehicle.license_plate}
                                                            </span>
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
                </div>

                {/* Action Buttons */}
                {selectedVehicle && (
                    <div className="px-6 pb-6 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="border-slate-300 hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 
                                hover:from-blue-700 hover:to-indigo-700 shadow-md 
                                hover:shadow-lg transition-all duration-200"
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            Continue to Payment
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}