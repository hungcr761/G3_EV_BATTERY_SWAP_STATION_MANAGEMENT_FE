import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CreditCard,
    Motorbike,
    Zap,
    Check,
    ArrowLeft,
    Loader2,
    Package,
    DollarSign,
    Shield,
    Calendar
} from 'lucide-react';
import { invoiceAPI, paymentAPI } from '@/lib/apiServices';

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan, vehicle } = location.state || {};
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('momo');

    // Debug logging
    console.log('Payment page received plan:', plan);
    console.log('Payment page received vehicle:', vehicle);
    console.log('Plan keys:', plan ? Object.keys(plan) : 'No plan');
    console.log('Vehicle keys:', vehicle ? Object.keys(vehicle) : 'No vehicle');
    console.log('Plan plan_id:', plan?.plan_id);
    console.log('Plan plan_name:', plan?.plan_name);
    console.log('Vehicle vehicle_id:', vehicle?.vehicle_id);
    console.log('Vehicle model_name:', vehicle?.model_name);

    // Nếu không có data, redirect về services
    useEffect(() => {
        if (!plan || !vehicle) {
            navigate('/services', { replace: true });
        }
    }, [plan, vehicle, navigate]);

    // Show loading while redirecting
    if (!plan || !vehicle) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Calculate total amount
    const totalAmount = (parseFloat(plan.plan_fee) || 0) + (parseFloat(plan.deposit_fee) || 0);

    const displayModelName = vehicle.model?.name || 'N/A';

    const handlePayment = async () => {
        if (!plan?.plan_id || !vehicle?.vehicle_id) {
            alert('Missing subscription plan or vehicle information. Please go back and select again.');
            return;
        }

        setProcessing(true);
        try {
            // 1) Tạo hóa đơn từ subscription
            const invoiceRes = await invoiceAPI.createFromSubscription({
                vehicle_id: vehicle.vehicle_id,
                plan_id: plan.plan_id
            });

            const invoicePayload = invoiceRes?.data || invoiceRes; // hỗ trợ cả mock
            const createdInvoice = invoicePayload?.data?.invoice || invoicePayload?.payload?.invoice;
            const invoiceId = createdInvoice?.invoice_id || invoicePayload?.invoice_id;

            if (!invoiceId) {
                throw new Error('Did not receive invoice ID from server');
            }

            // 2) Create payment to get MoMo payUrl
            const paymentRes = await paymentAPI.create({
                invoice_id: invoiceId,
                vehicle_id: vehicle.vehicle_id,
                plan_id: plan.plan_id
            });

            const paymentData = paymentRes?.data?.data || paymentRes?.data || {};
            const payUrl = paymentData?.payUrl;

            if (!payUrl) {
                throw new Error('Unable to retrieve payment link');
            }

            // 3) Redirect to MoMo payment gateway
            window.location.assign(payUrl);
        } catch (error) {
            console.error('Payment error:', error);
            const message = error?.response?.data?.message || error?.message || 'An error occurred during payment.';
            alert(message);
        } finally {
            setProcessing(false);
        }
    };

    const paymentMethods = [
        { id: 'momo', name: 'MoMo', logo: '📱' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate('/services')}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                        Confirm Payment
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Complete payment to activate your subscription plan
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Plan Details */}
                        <Card className="border-2 border-primary/20 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                                <CardTitle className="flex items-center text-2xl">
                                    <Package className="mr-3 h-6 w-6 text-primary" />
                                    Subscription Plan Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <Badge className="mb-3 bg-primary">
                                            {plan.plan_name || 'Subscription Plan'}
                                        </Badge>
                                        <p className="text-muted-foreground mb-4">
                                            {plan.description || 'No description'}
                                        </p>

                                        {/* Features */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Check className="h-5 w-5 text-green-500" />
                                                <span className="text-sm">
                                                    Max Batteries: <strong>{plan.battery_cap || 0}</strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Check className="h-5 w-5 text-green-500" />
                                                <span className="text-sm">
                                                    SoH Cap: <strong>{plan.soh_cap ? (parseFloat(plan.soh_cap) * 100).toFixed(0) : 0}%</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Details */}
                        <Card className="border-2 border-blue-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
                                <CardTitle className="flex items-center text-2xl">
                                    <Motorbike className="mr-3 h-6 w-6 text-blue-600" />
                                    Registered Vehicle Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Vehicle Name</p>
                                        <p className="font-semibold text-lg">{displayModelName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">License Plate</p>
                                        <p className="font-semibold text-lg">{vehicle.license_plate || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground mb-1">VIN Number</p>
                                        <p className="font-mono text-sm bg-muted p-2 rounded">{vehicle.vin || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method removed from left column — MoMo will be shown in Price Summary on the right */}
                    </div>

                    {/* Right Column - Price Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <Card className="border-2 border-primary shadow-xl">
                                <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
                                    <CardTitle className="flex items-center text-2xl">
                                        <DollarSign className="mr-3 h-6 w-6" />
                                        Payment Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {/* Plan Fee */}
                                    <div className="flex justify-between items-center py-3 border-b">
                                        <div>
                                            <p className="font-medium">Monthly Plan Fee</p>
                                            <p className="text-sm text-muted-foreground">Recurring payment</p>
                                        </div>
                                        <p className="font-semibold text-lg">
                                            {formatPrice(plan.plan_fee || 0)}
                                        </p>
                                    </div>

                                    {/* Penalty Fee Info */}
                                    <div className="flex justify-between items-center py-3 border-b">
                                        <div>
                                            <p className="font-medium">Penalty Fee/%</p>
                                            <p className="text-sm text-muted-foreground">If violating rules</p>
                                        </div>
                                        <p className="font-semibold text-lg text-orange-600">
                                            {formatPrice(plan.penalty_fee || 0)}/%
                                        </p>
                                    </div>

                                    {/* Total */}
                                    <div className="bg-primary/10 rounded-lg p-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    First Payment Total
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Includes first month + deposit
                                                </p>
                                            </div>
                                            <p className="text-3xl font-bold text-primary">
                                                {formatPrice(totalAmount)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Button */}
                                    <Button
                                        onClick={handlePayment}
                                        disabled={processing}
                                        size="lg"
                                        className="w-full mt-6 h-14 text-lg"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="mr-2 h-5 w-5" />
                                                Pay Now
                                            </>
                                        )}
                                    </Button>

                                    {/* MoMo-only payment info */}
                                    <div className="mt-4 p-4 border rounded-lg bg-white">
                                        <h4 className="font-semibold mb-2 flex items-center">
                                            <span className="text-2xl mr-2">📱</span>
                                            Pay with MoMo
                                        </h4>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Open the MoMo app, select "Scan QR" or "Transfer" to continue payment.
                                        </p>
                                        <div className="text-sm text-muted-foreground">
                                            <p>Selected Method: <strong className="text-foreground">{paymentMethods[0].name}</strong></p>
                                            <p className="mt-2">Tip: Use QR code for fast payment.</p>
                                        </div>
                                    </div>

                                    {/* Security Note */}
                                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-start space-x-2">
                                            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-green-800">
                                                    Secure Payment
                                                </p>
                                                <p className="text-xs text-green-600 mt-1">
                                                    Transaction encrypted with 256-bit SSL
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Info Card */}
                            <Card className="border-blue-200 bg-blue-50/50">
                                <CardContent className="pt-6">
                                    <h4 className="font-semibold mb-3 text-blue-900">Important Notes</h4>
                                    <ul className="space-y-2 text-sm text-blue-800">
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                                            <span>Plan will be activated immediately after payment</span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                                            <span>Electronic invoice will be sent via email</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
