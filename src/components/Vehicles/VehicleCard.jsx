import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, Motorbike, Trash2 } from 'lucide-react';

export default function VehicleCard({ vehicle, onEdit, onDelete, isDeleting = false }) {
  if (!vehicle) return null;

  const modelName = vehicle.modelName || vehicle.model?.name || 'Unknown Model';
  const batteryType = vehicle.batteryName || vehicle.model?.batteryType?.battery_type_code || 'Unknown Battery';
  const licensePlate = vehicle.license_plate || 'N/A';
  const vin = vehicle.vin || 'N/A';
  const batterySlot = vehicle.batterySlot || vehicle.model?.battery_slot || 0;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200/60 bg-white/80 backdrop-blur-sm hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Motorbike className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">
                VinFast {modelName}
              </CardTitle>
              <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700 border-blue-200 font-medium px-3 py-1">
                {licensePlate}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">VIN Number</p>
            <p className="font-mono text-sm font-semibold text-slate-800">{vin}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100">
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-1">Battery Type</p>
              <p className="text-sm font-bold text-emerald-900">{batteryType}</p>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-3 border border-violet-100">
              <p className="text-xs font-medium text-violet-700 uppercase tracking-wider mb-1">Battery Slots</p>
              <p className="text-sm font-bold text-violet-900">{batterySlot} slots</p>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200"
              onClick={() => onEdit(vehicle)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Update
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-300 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
              onClick={() => onDelete(vehicle)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
