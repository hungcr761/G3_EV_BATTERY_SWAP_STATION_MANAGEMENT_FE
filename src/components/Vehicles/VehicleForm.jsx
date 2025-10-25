import { vehicleSchema } from '@/lib/validations';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Save } from 'lucide-react';
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'

export default function VehicleForm({ onSubmit, editingVehicle, vehicleModels = [], apiError, isSubmitting = false, onCancel }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        control
    } = useForm({
        resolver: zodResolver(vehicleSchema),
        defaultValues: { vin: '', model: '', license_plate: '' },
    });

    useEffect(() => {
        if (editingVehicle) {
            setValue('vin', editingVehicle.vin || '');
            setValue('model', editingVehicle.modelName || editingVehicle.model?.name || '');
            setValue('license_plate', editingVehicle.license_plate || '');
        } else {
            reset();
        }
    }, [editingVehicle, setValue, reset]);


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">

            {/* Vin */}
            <div className="space-y-2">
                <Label htmlFor="vin">
                    VIN Number <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="vin"
                    type="text"
                    placeholder="Enter VIN (e.g., 1HGBH41JXMN109186)"
                    maxLength={17}
                    disabled={!!editingVehicle}
                    readOnly={!!editingVehicle}
                    className={`uppercase ${errors.vin ? 'border-red-500 focus:border-red-500' : ''} ${editingVehicle ? 'bg-muted cursor-not-allowed' : ''}`}
                    {...register('vin', {
                        setValueAs: v => v.toUpperCase()
                    })}
                />
                {errors.vin && (
                    <div className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-600 font-medium">{errors.vin.message}</p>
                            <p className="text-xs text-red-500 mt-1">
                                ✓ Must be exactly 17 characters<br />
                                ✓ Only uppercase letters (A-Z) and numbers (0-9)<br />
                                ✓ Cannot contain I, O, or Q
                            </p>
                        </div>
                    </div>
                )}
                {editingVehicle && (
                    <p className="text-xs text-amber-600 flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>VIN cannot be modified after registration</span>
                    </p>
                )}
                {/* error message */}
                {apiError && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-md flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm text-red-700">{apiError}</span>
                    </div>
                )}
            </div>

            {/* model */}
            <div className="space-y-2">
                <Label htmlFor="model">
                    Vehicle Model <span className="text-red-500">*</span>
                </Label>
                <Controller
                    name="model"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className={errors.model ? 'border-red-500 focus:border-red-500' : ''}>
                                <SelectValue placeholder="Select vehicle model" />
                            </SelectTrigger>
                            <SelectContent>
                                {(vehicleModels || []).map(m => (
                                    <SelectItem key={m.model_id} value={m.name}>
                                        VinFast {m.name} {m.battery_slot ? `(${m.battery_slot} battery slots)` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.model && (
                    <div className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 font-medium">{errors.model.message}</p>
                    </div>
                )}
                {!errors.model && (
                    <p className="text-xs text-gray-500">
                        Select the VinFast model that matches your vehicle
                    </p>
                )}
            </div>

            {/* License Plate */}
            <div className="space-y-2">
                <Label htmlFor="license_plate">
                    License Plate <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="license_plate"
                    type="text"
                    placeholder="e.g., 29A-12345, 30B-123.45"
                    maxLength={9}
                    className={`uppercase ${errors.license_plate ? 'border-red-500 focus:border-red-500' : ''}`}
                    {...register('license_plate', {
                        setValueAs: v => v.toUpperCase()
                    })}
                />
                {errors.license_plate && (
                    <div className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-600 font-medium">{errors.license_plate.message}</p>
                            <p className="text-xs text-red-500 mt-1">
                                ✓ Province code: 2 digits (11–99, except 42, 44, 45, 46, 87, 91, 96)<br />
                                ✓ Letter: 1 uppercase character (A–Z)<br />
                                ✓ Dash: must include a single "-" after the letter<br />
                                ✓ Digits after dash: 4 or 5 numeric digits (0–9)<br />
                                ✓ No spaces or special characters allowed
                            </p>
                        </div>
                    </div>
                )}
                {/* error message */}
                {apiError && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-md flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm text-red-700">{apiError}</span>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="flex space-x-3 pt-6">
                <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingVehicle ? 'Updating...' : 'Adding...'}
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {editingVehicle ? 'Update' : 'Add Vehicle'}
                        </>
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};
