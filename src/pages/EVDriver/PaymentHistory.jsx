import React from 'react'

import { useState } from 'react';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    CreditCard,
    Package,
    Search,
    Calendar,
    Receipt,
    CheckCircle2,
    FileText,
    Car,
    Clock,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router';

export default function PaymentHistory() {
    const {
        filteredPayments,
        loading,
        error,
        filters,
        updateFilters,
        formatPrice,
        formatDate,
        getTotals,
    } = usePaymentHistory();

    const navigate = useNavigate();
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);

    const { total, count } = getTotals();

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailDialog(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-slate-600">Loading payment history...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="pt-6">
                            <p className="text-red-600 text-center">{error}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <Button
                    variant='ghost'
                    onClick={() => navigate('/dashboard')}
                    className='mb-6 hover:bg-white/60 transition-all duration-200'
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back To Dashboard
                </Button>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                        <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Payment History
                        </h1>
                        <p className="text-slate-600">View all your payment transactions</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Total Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {count}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Successful payments</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Total Amount Spent
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                {formatPrice(total)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">All time</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                {/* <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="search" className="flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Search
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Invoice number, transaction ID, plan name..."
                                    value={filters.searchQuery}
                                    onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateRange" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Date Range
                                </Label>
                                <Select
                                    value={filters.dateRange}
                                    onValueChange={(value) => updateFilters({ dateRange: value })}
                                >
                                    <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Time</SelectItem>
                                        <SelectItem value="month">Last Month</SelectItem>
                                        <SelectItem value="3months">Last 3 Months</SelectItem>
                                        <SelectItem value="6months">Last 6 Months</SelectItem>
                                        <SelectItem value="year">Last Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card> */}

                {/* Payment List */}
                {filteredPayments.length === 0 ? (
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md">
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Receipt className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No payments found</h3>
                                <p className="text-slate-500">
                                    {filters.searchQuery || filters.dateRange !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'You haven\'t made any payments yet'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredPayments.map((payment) => (
                            <Card
                                key={payment.payment_id}
                                className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">
                                                        {payment.invoice?.subscription?.plan_name || 'Payment'}
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-2 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(payment.payment_date)}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                                {formatPrice(payment.amount)}
                                            </p>
                                            <Badge className="mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                                                {payment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-600">Invoice:</span>
                                            <span className="font-mono font-semibold text-slate-700">
                                                {payment.invoice?.invoice_number}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CreditCard className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-600">Method:</span>
                                            <span className="font-semibold text-slate-700">
                                                {payment.payment_method}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Car className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-600">Vehicle:</span>
                                            <span className="font-semibold text-slate-700">
                                                {payment.invoice?.subscription?.vehicle?.license_plate}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(payment)}
                                            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                                        >
                                            <Receipt className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Detail Dialog */}
                <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto ">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Receipt className="w-5 h-5" />
                                Payment Details
                            </DialogTitle>
                            <DialogDescription>
                                Complete transaction and invoice information
                            </DialogDescription>
                        </DialogHeader>
                        {selectedPayment && (
                            <div className="space-y-6 p-4">
                                {/* Payment Info */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-lg border-b pb-2">Payment Information</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-slate-500">Payment ID</p>
                                            <p className="font-mono font-semibold">{selectedPayment.payment_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Transaction ID</p>
                                            <p className="font-mono font-semibold">{selectedPayment.transaction_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Payment Date</p>
                                            <p className="font-semibold">{formatDate(selectedPayment.payment_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Payment Method</p>
                                            <p className="font-semibold">{selectedPayment.payment_method}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Status</p>
                                            <Badge className="bg-emerald-100 text-emerald-700">
                                                {selectedPayment.status}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Amount</p>
                                            <p className="font-bold text-lg text-emerald-600">
                                                {formatPrice(selectedPayment.amount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Invoice Info */}
                                {selectedPayment.invoice && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg border-b pb-2">Invoice Details</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-slate-500">Invoice Number</p>
                                                <p className="font-mono font-semibold">
                                                    {selectedPayment.invoice.invoice_number}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Payment Status</p>
                                                <Badge className="bg-emerald-100 text-emerald-700">
                                                    {selectedPayment.invoice.payment_status}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Fee Breakdown */}
                                        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                                            <h4 className="font-semibold text-sm">Fee Breakdown</h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Plan Fee</span>
                                                    <span className="font-semibold">
                                                        {formatPrice(selectedPayment.invoice.plan_fee)}
                                                    </span>
                                                </div>
                                                {selectedPayment.invoice.total_swap_fee > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Total Swap Fee</span>
                                                        <span className="font-semibold">
                                                            {formatPrice(selectedPayment.invoice.total_swap_fee)}
                                                        </span>
                                                    </div>
                                                )}
                                                {selectedPayment.invoice.total_penalty_fee > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Penalty Fee</span>
                                                        <span className="font-semibold text-red-600">
                                                            {formatPrice(selectedPayment.invoice.total_penalty_fee)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="border-t pt-2 flex justify-between font-bold">
                                                    <span>Total</span>
                                                    <span className="text-emerald-600">
                                                        {formatPrice(selectedPayment.amount)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Subscription Info */}
                                {selectedPayment.invoice?.subscription && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg border-b pb-2">Subscription Details</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-slate-500">Plan Name</p>
                                                <p className="font-semibold">
                                                    {selectedPayment.invoice.subscription.plan_name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Vehicle</p>
                                                <p className="font-semibold">
                                                    {selectedPayment.invoice.subscription.vehicle?.license_plate}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
