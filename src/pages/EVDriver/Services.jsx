
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Battery, Check, Star, Zap, Loader2, AlertCircle, Motorbike, CreditCard } from 'lucide-react';
import useSubscriptionPlan from '@/hooks/useSubscriptionPlan';
import useServiceSubscription from '@/hooks/useServiceSubscription';

export default function Services() {
    const { plans, loading, error, refetch } = useSubscriptionPlan();

    const {
        showVehicleDialog,
        selectedPlan,
        vehiclesWithoutPlan,
        loadingVehicles,
        selectedVehicle,
        setShowVehicleDialog,
        setSelectedVehicle,
        formatPrice,
        formatPercent,
        handleSelectSubscription,
        handleSubscribe,
        handleCancelDialog
    } = useServiceSubscription();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                                <Battery className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Subscription Plans
                                </h1>
                                <p className="text-slate-600 mt-1 text-lg">
                                    Choose the perfect plan for your battery swapping needs
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
                            <Loader2 className="h-10 w-10 text-white animate-spin" />
                        </div>
                        <p className="text-slate-600 font-medium text-lg">
                            Loading subscription plans...
                        </p>
                    </div>
                )}


                {/* Error State */}
                {error && !loading && (
                    <Card className="max-w-2xl mx-auto border-red-200/60 bg-red-50/80 backdrop-blur-sm shadow-md">
                        <CardContent className="py-16 text-center">
                            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-red-800 mb-3">
                                Failed to load plans
                            </h3>
                            <p className="text-red-600 mb-6">{error}</p>
                            <Button onClick={refetch} variant="outline" className="border-red-300 hover:bg-red-100">
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!loading && !error && plans.length === 0 && (
                    <Card className="max-w-2xl mx-auto border-slate-200/60 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardContent className="py-16 text-center">
                            <Battery className="h-20 w-20 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                No Plans Available
                            </h3>
                            <p className="text-slate-600 text-lg">
                                There are no subscription plans available at the moment. Please contact support for more information.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Plan grid - Phân tách 2 loại gói */}
                {!loading && !error && plans.length > 0 && (
                    <div className="space-y-12">
                        {/* Gói KHÔNG THEO LƯỢT (swap_fee = 0) */}
                        {plans.filter(plan => parseFloat(plan.swap_fee) === 0).length > 0 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <Badge className="mb-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-1.5 text-sm shadow-md">
                                        UNLIMITED SWAPS
                                    </Badge>
                                    <h2 className="text-3xl font-bold text-slate-800">
                                        Unlimited Plans
                                    </h2>
                                    <p className="text-slate-600 mt-2 text-lg">
                                        Unlimited battery swaps per month - perfect for frequent users
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {plans.filter(plan => parseFloat(plan.swap_fee) === 0).map((plan) => (
                                        <Card key={plan.plan_id} className="flex flex-col border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1 group">
                                            <CardHeader className="text-center pb-4 flex-shrink-0">
                                                <div className="mx-auto mb-3 w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300">
                                                    <Star className="h-7 w-7 text-white" />
                                                </div>
                                                <CardTitle className="text-2xl font-bold text-slate-800">
                                                    {plan.plan_name}
                                                </CardTitle>
                                                <CardDescription className="text-sm text-slate-600 mt-2 min-h-[40px]">
                                                    {plan.description}
                                                </CardDescription>
                                                <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mt-4">
                                                    {formatPrice(plan.plan_fee)}/month
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-6 flex-grow flex flex-col">
                                                <ul className="space-y-3 flex-grow">
                                                    <li className="flex items-center space-x-3">
                                                        <div className="p-1 bg-emerald-100 rounded-lg">
                                                            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                                        </div>
                                                        <span className="text-sm text-slate-700">
                                                            SoH cap: <strong>{formatPercent(plan.soh_cap)}%</strong>
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-3">
                                                        <div className="p-1 bg-emerald-100 rounded-lg">
                                                            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                                        </div>
                                                        <span className="text-sm text-slate-700">
                                                            Penalty fee: <strong>{formatPrice(plan.penalty_fee)}/%</strong>
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-3">
                                                        <div className="p-1 bg-emerald-100 rounded-lg">
                                                            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                                        </div>
                                                        <span className="text-sm text-slate-700">
                                                            Duration: <strong>{plan.duration_days} days</strong>
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-3">
                                                        <div className="p-1 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                                                            <Star className="h-5 w-5 text-white flex-shrink-0" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-emerald-700">
                                                            Unlimited battery swaps
                                                        </span>
                                                    </li>
                                                </ul>

                                                <div className="flex justify-center pt-4">
                                                    <Button
                                                        size="lg"
                                                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-200"
                                                        onClick={() => handleSelectSubscription(plan)}
                                                    >
                                                        <Zap className="mr-2 h-4 w-4" />
                                                        Choose This Plan
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gói THEO LƯỢT (swap_fee > 0) */}
                        {plans.filter(plan => parseFloat(plan.swap_fee) > 0).length > 0 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <Badge className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 text-sm shadow-md">
                                        PAY PER SWAP
                                    </Badge>
                                    <h2 className="text-3xl font-bold text-slate-800">
                                        Pay-Per-Swap Plans
                                    </h2>
                                    <p className="text-slate-600 mt-2 text-lg">
                                        Pay per battery swap, billed monthly
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {plans.filter(plan => parseFloat(plan.swap_fee) > 0).map((plan) => (
                                        <Card key={plan.plan_id} className="flex flex-col border-blue-200/60 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1 group">
                                            <CardHeader className="text-center pb-4 flex-shrink-0">
                                                <div className="mx-auto mb-3 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300">
                                                    <Battery className="h-7 w-7 text-white" />
                                                </div>
                                                <CardTitle className="text-2xl font-bold text-slate-800">
                                                    {plan.plan_name}
                                                </CardTitle>
                                                <CardDescription className="text-sm text-slate-600 mt-2 min-h-[40px]">
                                                    {plan.description}
                                                </CardDescription>
                                                <div className="mt-4 space-y-1">
                                                    <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                                        {formatPrice(plan.plan_fee)}/month
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-6 flex-grow flex flex-col">
                                                <ul className="space-y-3 flex-grow">
                                                    <li className="flex items-center space-x-3">
                                                        <div className="p-1 bg-blue-100 rounded-lg">
                                                            <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                                        </div>
                                                        <span className="text-sm text-slate-700">
                                                            SoH cap: <strong>{formatPercent(plan.soh_cap)}%</strong>
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-3">
                                                        <div className="p-1 bg-blue-100 rounded-lg">
                                                            <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                                        </div>
                                                        <span className="text-sm text-slate-700">
                                                            Penalty fee: <strong>{formatPrice(plan.penalty_fee)}/%</strong>
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-3">
                                                        <div className="p-1 bg-blue-100 rounded-lg">
                                                            <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                                        </div>
                                                        <span className="text-sm text-slate-700">
                                                            Duration: <strong>{plan.duration_days} days</strong>
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center space-x-3">
                                                        <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                                            <Battery className="h-5 w-5 text-white flex-shrink-0" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-blue-700">
                                                            {formatPrice(plan.swap_fee)}/swap
                                                        </span>
                                                    </li>
                                                </ul>

                                                <div className="flex justify-center pt-4">
                                                    <Button
                                                        size="lg"
                                                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                                                        onClick={() => handleSelectSubscription(plan)}
                                                    >
                                                        <Zap className="mr-2 h-4 w-4" />
                                                        Choose This Plan
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

                {/* Pricing Details Section */}
                <div className="mt-16">
                    <Card className="max-w-4xl mx-auto border-slate-200/60 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-slate-800 mb-2">
                                        Pricing Details
                                    </h3>
                                    <p className="text-slate-600">
                                        Understanding your subscription costs
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-blue-500 rounded-lg mt-1">
                                                <CreditCard className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg text-slate-800 mb-2">Monthly Plan Fee</h4>
                                                <p className="text-sm text-slate-600">
                                                    Fixed monthly payment based on your selected plan (Unlimited or Pay-per-swap).
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-amber-500 rounded-lg mt-1">
                                                <Battery className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg text-slate-800 mb-2">Battery Degradation Fee</h4>
                                                <p className="text-sm text-slate-600">
                                                    Applied when SoH exceeds the 1% free threshold. Each additional 1% costs 100,000 VNĐ. 
                                                    For values under 1%, fees are calculated proportionally.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dialog chọn xe */}
                <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                    <Motorbike className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold text-slate-800">
                                        Select Vehicle for {selectedPlan?.plan_name}
                                    </DialogTitle>
                                    <DialogDescription className="text-base text-slate-600 mt-1">
                                        Only vehicles without an active subscription are shown
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="py-4">
                            {loadingVehicles ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
                                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                                        </div>
                                        <p className="text-slate-600 font-medium">Loading vehicles...</p>
                                    </div>
                                </div>
                            ) : vehiclesWithoutPlan.length === 0 ? (
                                <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                                    <Motorbike className="h-20 w-20 text-slate-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Available Vehicles</h3>
                                    <p className="text-sm text-slate-600 mb-6">
                                        All your vehicles already have subscriptions or you haven't registered any vehicles yet.
                                    </p>
                                    <Button variant="outline" className="border-slate-300 hover:bg-blue-50">
                                        Add New Vehicle
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {vehiclesWithoutPlan.map((vehicle) => (
                                        <Card
                                            key={vehicle.vehicle_id}
                                            className={`cursor-pointer transition-all hover:shadow-md border-slate-200/60 ${selectedVehicle?.vehicle_id === vehicle.vehicle_id
                                                ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg'
                                                : 'hover:border-purple-300 bg-white/80 backdrop-blur-sm'
                                                }`}
                                            onClick={() => setSelectedVehicle(vehicle)}
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <div className={`p-2 rounded-lg ${selectedVehicle?.vehicle_id === vehicle.vehicle_id
                                                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                                                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                                }`}>
                                                                <Motorbike className="h-5 w-5 text-white" />
                                                            </div>
                                                            <h3 className="font-bold text-lg text-slate-800">{vehicle.model_name}</h3>
                                                            {selectedVehicle?.vehicle_id === vehicle.vehicle_id && (
                                                                <div className="p-1 bg-emerald-100 rounded-lg">
                                                                    <Check className="h-5 w-5 text-emerald-600" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2 text-sm text-slate-600">
                                                            <div className="flex items-center space-x-6">
                                                                <span className="flex items-center">
                                                                    <span className="font-medium text-slate-700 mr-1">VIN:</span>
                                                                    {vehicle.vin}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <span className="font-medium text-slate-700 mr-1">License:</span>
                                                                    {vehicle.license_plate}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center space-x-3">
                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                    {vehicle.battery_type || 'Unknown type'}
                                                                </Badge>
                                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                                    Ready to subscribe
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
                            <div className="flex justify-end pt-4 border-t border-slate-200">
                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelDialog}
                                        className="border-slate-300 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubscribe}
                                        className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        <Zap className="mr-2 h-4 w-4" />
                                        Continue to Payment
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
