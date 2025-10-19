import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Car, Trash2 } from 'lucide-react';

const VehicleDeleteDialog = ({ open, vehicle, onConfirm, onCancel }) => {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">
                        Xác nhận xóa xe
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Bạn có chắc chắn muốn xóa xe này không? Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>

                {vehicle && (
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Car className="h-5 w-5 text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Mẫu xe</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        VinFast {vehicle.modelName}
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-gray-200" />

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Biển số</p>
                                    <p className="text-sm font-mono font-semibold text-gray-900">
                                        {vehicle.license_plate}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">VIN</p>
                                    <p className="text-xs font-mono text-gray-700 break-all">
                                        {vehicle.vin}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="flex-1"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                onClick={onConfirm}
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
    );
};

export default VehicleDeleteDialog;
