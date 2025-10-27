import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertCircle, Battery, Calendar, Motorbike, RefreshCcw, XCircle, TrendingUp } from 'lucide-react';

export default function SubscriptionCard({
    subscription,
    onDelete,
    onRenew,
    getDaysRemaining,
    getStatusColor,
    isSubmitting
}) {
    const daysLeft = getDaysRemaining(subscription.end_date);
    const isActive = subscription.status === 'active';
    const isExpiring = daysLeft <= 7 && daysLeft > 0;
    const isExpired = daysLeft <= 0;

    return (
        <Card className="group border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                            <Battery className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800">
                                {subscription.plan?.plan_name || 'Unknown Plan'}
                            </CardTitle>
                            <p className="text-xs text-slate-500 mt-1 font-mono">
                                ID:{subscription.subscription_id?.slice(-8).toUpperCase() || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <Badge
                        className={`bg-${getStatusColor(subscription.status)}-100 text-${getStatusColor(subscription.status)}-700 border-${getStatusColor(subscription.status)}-200`}
                    >
                        {subscription.status.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Vehicle info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                        <Motorbike className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                            <p className="text-sm text-slate-600">Vehicle</p>
                            <p className="font-semibold text-slate-800">
                                {subscription.vehicle?.model?.name || subscription.vehicle?.model_name || 'N/A'}
                            </p>
                            <p className="text-sm text-slate-600">
                                {subscription.vehicle?.license_plate || 'N/A'}
                            </p>
                            <p className="text-sm text-slate-600">
                                VIN: {subscription.vehicle?.vin || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Duration info */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="h-4 w-4 text-slate-600" />
                            <p className="text-xs text-slate-600">Start Date</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                            {new Date(subscription.start_date).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="h-4 w-4 text-slate-600" />
                            <p className="text-xs text-slate-600">End Date</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                            {new Date(subscription.end_date).toLocaleDateString()}
                        </p>   
                    </div>
                </div>

                {/* Price info */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            <p className="text-sm text-slate-600">Subscription Fee</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                {subscription.plan?.fee?.toLocaleString() || '0'}₫
                            </p>
                            <p className="text-xs text-slate-500">
                                /{subscription.plan?.duration_months || 1} month{subscription.plan?.duration_months > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Days Remaining */}
                {isActive && (
                    <div className={`p-3 rounded-lg flex items-center space-x-2 ${isExpired
                        ? 'bg-red-50 border border-red-200'
                        : isExpiring
                            ? 'bg-amber-50 border border-amber-200'
                            : 'bg-emerald-50 border border-emerald-200'
                        }`}>
                        <AlertCircle className={`h-4 w-4 ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-emerald-600'
                            }`} />
                        <p className={`text-sm font-medium ${isExpired ? 'text-red-700' : isExpiring ? 'text-amber-700' : 'text-emerald-700'
                            }`}>
                            {isExpired
                                ? 'Expired'
                                : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
                            }
                        </p>
                    </div>
                )}


                {/* Usage Stats */}


                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                    {isActive && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                                onClick={() => onRenew(subscription)}
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />Renewal
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                                onClick={() => onDelete(subscription.subscription_id)}
                                disabled={isSubmitting}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card >
    )
}
