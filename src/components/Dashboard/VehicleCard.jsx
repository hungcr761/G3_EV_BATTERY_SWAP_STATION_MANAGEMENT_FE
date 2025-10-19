import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Car, Edit, Trash2 } from 'lucide-react';

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Car className="h-6 w-6 text-primary" />
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

                    <div className="flex space-x-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => onEdit(vehicle)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Sửa
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onDelete(vehicle.vehicle_id || vehicle.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default VehicleCard;
