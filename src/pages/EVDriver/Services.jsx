
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Battery, Check, Star, Zap, Loader2, AlertCircle, Motorbike, CreditCard } from 'lucide-react';
import useSubscriptionPlan from '@/hooks/useSubscriptionPlan';
import useServiceSubscription from '@/hooks/useServiceSubscription';
import VehicleSelectionDialog from '@/components/Services/VehicleSelectionDialog';
import PlanCard from '@/components/Services/PlanCard';

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
                                        <PlanCard
                                            key={plan.plan_id}
                                            plan={plan}
                                            onSelect={handleSelectSubscription}
                                            formatPrice={formatPrice}
                                            formatPercent={formatPercent}
                                        />
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
                                        <PlanCard
                                            key={plan.plan_id}
                                            plan={plan}
                                            onSelect={handleSelectSubscription}
                                            formatPrice={formatPrice}
                                            formatPercent={formatPercent}
                                        />
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

                {/* Vehicle Selection Dialog */}
                <VehicleSelectionDialog
                    open={showVehicleDialog}
                    onOpenChange={setShowVehicleDialog}
                    selectedPlan={selectedPlan}
                    vehicles={vehiclesWithoutPlan}
                    loading={loadingVehicles}
                    selectedVehicle={selectedVehicle}
                    onSelectVehicle={setSelectedVehicle}
                    onConfirm={handleSubscribe}
                    onCancel={handleCancelDialog}
                />
            </div>
        </div>
    )
}
