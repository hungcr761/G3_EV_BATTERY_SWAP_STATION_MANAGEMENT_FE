import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
    CreditCard,
    Package,
    Motorbike,
    DollarSign,
    Calendar,
    ExternalLink
} from 'lucide-react';
import { subscriptionPlanAPI, vehicleAPI, batteryAPI } from '@/lib/apiServices';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);
    const [retryLoading, setRetryLoading] = useState(false);
    const [batteryCreationStatus, setBatteryCreationStatus] = useState(null);

    useEffect(() => {
        const extractPaymentData = () => {
            try {
                // Extract parameters from URL
                const partnerCode = searchParams.get('partnerCode');
                const orderId = searchParams.get('orderId');
                const amount = searchParams.get('amount');
                const resultCode = searchParams.get('resultCode');
                const message = searchParams.get('message');
                const extraData = searchParams.get('extraData');

                // Parse extraData JSON
                let extraDataParsed = {};
                if (extraData) {
                    try {
                        extraDataParsed = JSON.parse(decodeURIComponent(extraData));
                    } catch (e) {
                        console.warn('Could not parse extraData:', e);
                    }
                }

                const data = {
                    partnerCode,
                    orderId,
                    amount: amount ? parseInt(amount) : 0,
                    resultCode: resultCode ? parseInt(resultCode) : -1,
                    message,
                    invoiceId: extraDataParsed.invoice_id,
                    planId: extraDataParsed.plan_id,
                    vehicleId: extraDataParsed.vehicle_id,
                    isSuccess: resultCode === '0'
                };

                setPaymentData(data);
                setError(null);
            } catch (err) {
                console.error('Error parsing payment data:', err);
                setError('Unable to process payment information');
            } finally {
                setLoading(false);
            }
        };

        extractPaymentData();
    }, [searchParams]);

    // Create batteries for vehicle when payment is successful
    useEffect(() => {
        const createBatteriesForVehicle = async () => {
            // Only proceed if payment is successful and vehicleId is available
            if (paymentData?.isSuccess && paymentData?.vehicleId) {
                try {
                    console.log('Creating batteries for vehicle:', paymentData.vehicleId);
                    setBatteryCreationStatus('creating');
                    const response = await batteryAPI.createForVehicle(paymentData.vehicleId);
                    console.log('Batteries created successfully:', response.data);
                    setBatteryCreationStatus('success');
                } catch (err) {
                    console.error('Error creating batteries for vehicle:', err);
                    setBatteryCreationStatus('error');
                    // Don't show error to user as payment was successful
                    // Just log it for debugging
                }
            }
        };

        // Only run when paymentData is set and loading is complete
        if (!loading && paymentData) {
            createBatteriesForVehicle();
        }
    }, [paymentData, loading]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleContinue = () => {
        navigate('/dashboard');
    };

    const handleBackToServices = () => {
        navigate('/services');
    };

    const handleRetryPayment = async () => {
        setRetryLoading(true);

        try {
            // Navigate back to payment page with preserved plan and vehicle data
            if (paymentData?.planId && paymentData?.vehicleId) {
                try {
                    // Try to fetch full plan and vehicle data
                    console.log('Attempting to fetch plan and vehicle data...');
                    const [planResponse, vehicleResponse] = await Promise.all([
                        subscriptionPlanAPI.getById(paymentData.planId),
                        vehicleAPI.getById(paymentData.vehicleId)
                    ]);

                    console.log('Plan Response:', planResponse);
                    console.log('Plan Response data:', planResponse?.data);
                    console.log('Plan Response data.subscriptionPlan:', planResponse?.data?.subscriptionPlan);
                    console.log('Vehicle Response:', vehicleResponse);
                    console.log('Vehicle Response data:', vehicleResponse?.data);
                    console.log('Vehicle Response data.vehicle:', vehicleResponse?.data?.vehicle);

                    // Handle different API response formats
                    let plan = null;
                    let vehicle = null;

                    // Extract plan data from various possible response formats
                    if (planResponse?.data?.payload?.subscriptionPlan) {
                        plan = planResponse.data.payload.subscriptionPlan;
                    } else if (planResponse?.data?.subscriptionPlan) {
                        plan = planResponse.data.subscriptionPlan;
                    } else if (planResponse?.data?.payload) {
                        plan = planResponse.data.payload;
                    } else if (planResponse?.data?.data) {
                        plan = planResponse.data.data;
                    } else if (planResponse?.data) {
                        plan = planResponse.data;
                    } else {
                        plan = { plan_id: paymentData.planId };
                    }

                    // Extract vehicle data from various possible response formats
                    if (vehicleResponse?.data?.vehicle) {
                        vehicle = vehicleResponse.data.vehicle;
                    } else if (vehicleResponse?.data?.payload) {
                        vehicle = vehicleResponse.data.payload;
                    } else if (vehicleResponse?.data?.data) {
                        vehicle = vehicleResponse.data.data;
                    } else if (vehicleResponse?.data) {
                        vehicle = vehicleResponse.data;
                    } else {
                        vehicle = { vehicle_id: paymentData.vehicleId };
                    }

                    console.log('Final Plan Data:', plan);
                    console.log('Final Plan Data keys:', plan ? Object.keys(plan) : 'No plan');
                    console.log('Final Vehicle Data:', vehicle);
                    console.log('Final Vehicle Data keys:', vehicle ? Object.keys(vehicle) : 'No vehicle');

                    navigate('/payment', {
                        state: { plan, vehicle }
                    });
                } catch (error) {
                    console.error('Error fetching plan/vehicle data:', error);
                    console.log('API endpoints may not exist, using fallback approach...');

                    // Alternative approach: Try to get data from localStorage or use minimal data
                    // Check if we can get data from localStorage (if user was previously on services page)
                    const storedPlan = localStorage.getItem('selectedPlan');
                    const storedVehicle = localStorage.getItem('selectedVehicle');

                    let plan, vehicle;

                    if (storedPlan && storedVehicle) {
                        try {
                            plan = JSON.parse(storedPlan);
                            vehicle = JSON.parse(storedVehicle);
                            console.log('Using stored plan and vehicle data:', plan, vehicle);
                        } catch (e) {
                            console.error('Error parsing stored data:', e);
                            plan = { plan_id: paymentData.planId };
                            vehicle = { vehicle_id: paymentData.vehicleId };
                        }
                    } else {
                        // Fallback: navigate with minimal data
                        plan = { plan_id: paymentData.planId };
                        vehicle = { vehicle_id: paymentData.vehicleId };
                        console.log('Using minimal fallback data:', plan, vehicle);
                    }

                    navigate('/payment', {
                        state: { plan, vehicle }
                    });
                }
            } else {
                // Fallback to services page if we don't have the required data
                navigate('/services');
            }
        } finally {
            setRetryLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Processing payment result...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
                <div className="max-w-md mx-auto text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-red-800 mb-2">Processing Error</h1>
                    <p className="text-red-600 mb-6">{error}</p>
                    <Button onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    const isSuccess = paymentData?.isSuccess;
    const isFailure = !isSuccess;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    {isSuccess ? (
                        <>
                            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                            <h1 className="text-4xl font-bold text-green-800 mb-2">
                                Payment Successful!
                            </h1>
                            <p className="text-xl text-green-600">
                                Subscription plan has been activated for your vehicle
                            </p>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
                            <h1 className="text-4xl font-bold text-red-800 mb-2">
                                Payment Failed
                            </h1>
                            <p className="text-xl text-red-600">
                                {paymentData?.message || 'An error occurred during payment'}
                            </p>
                        </>
                    )}
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Payment Info */}
                    <Card className="border-2 border-primary/20 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                            <CardTitle className="flex items-center text-xl">
                                <CreditCard className="mr-3 h-5 w-5 text-primary" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Order ID:</span>
                                <span className="font-mono text-sm">{paymentData?.orderId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-semibold text-lg">
                                    {formatPrice(paymentData?.amount || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge className={isSuccess ? 'bg-green-500' : 'bg-red-500'}>
                                    {isSuccess ? 'Success' : 'Failed'}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Time:</span>
                                <span className="text-sm">
                                    {new Date().toLocaleString('en-US')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Info */}
                    <Card className="border-2 border-blue-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
                            <CardTitle className="flex items-center text-xl">
                                <Package className="mr-3 h-5 w-5 text-blue-600" />
                                Service Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Invoice ID:</span>
                                <span className="font-mono text-sm">{paymentData?.invoiceId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Plan ID:</span>
                                <span className="font-mono text-sm">{paymentData?.planId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Vehicle ID:</span>
                                <span className="font-mono text-sm">{paymentData?.vehicleId || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Success Message */}
                {isSuccess && (
                    <Card className="border-2 border-green-200 bg-green-50/50 mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-green-800 mb-2">
                                        Subscription Plan Activated
                                    </h3>
                                    <ul className="space-y-1 text-sm text-green-700">
                                        <li>• Battery swap service has been activated for your vehicle</li>
                                        <li>• You can start using the service immediately</li>
                                        <li>• Electronic invoice will be sent via email</li>
                                        <li>• Detailed information can be viewed in Dashboard</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Failure Message */}
                {isFailure && (
                    <Card className="border-2 border-red-200 bg-red-50/50 mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-red-800 mb-2">
                                        Payment Unsuccessful
                                    </h3>
                                    <ul className="space-y-1 text-sm text-red-700">
                                        <li>• Transaction was cancelled or failed</li>
                                        <li>• Amount was not deducted from your account</li>
                                        <li>• You can try to pay again</li>
                                        <li>• Contact support if the issue persists</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {isSuccess ? (
                        <>
                            <Button
                                onClick={handleContinue}
                                size="lg"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Go to Dashboard
                            </Button>
                            <Button
                                onClick={handleBackToServices}
                                variant="outline"
                                size="lg"
                            >
                                <Package className="mr-2 h-5 w-5" />
                                View More Plans
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleRetryPayment}
                                disabled={retryLoading}
                                size="lg"
                                className="bg-primary hover:bg-primary/90"
                            >
                                {retryLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <ArrowLeft className="mr-2 h-5 w-5" />
                                        Retry Payment
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="outline"
                                size="lg"
                            >
                                <Motorbike className="mr-2 h-5 w-5" />
                                Go to Dashboard
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
