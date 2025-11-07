import { useState, useEffect, useCallback } from 'react';
import { invoiceAPI } from '@/lib/apiServices';

export function usePaymentHistory() {
    // Raw payments fetched from API
    const [paymentsHistory, setPaymentsHistory] = useState([]);
    // Derived list after applying filters
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        dateRange: 'all',
        searchQuery: '',
    });

    // Fetch payment history and normalize into a flat array usable by the UI
    const fetchPaymentHistory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const userData = localStorage.getItem('currentUser') ||
                sessionStorage.getItem('currentUser');

            if (!userData) {
                throw new Error('User not found');
            }

            const user = JSON.parse(userData);
            const response = await invoiceAPI.getPaymentHistoryByDriverId(user.account_id);
            const rawData = response?.data?.data;

            // Validate expected shape from backend
            const vehicles = Array.isArray(rawData?.vehicles_payment_history)
                ? rawData.vehicles_payment_history
                : [];

            // Flatten: vehicle -> invoice (payment_history) -> payment_record
            const allPayments = vehicles.flatMap((vehicleData) => {
                const vehicleInfo = vehicleData?.vehicle || {};
                const paymentHistory = Array.isArray(vehicleData?.payment_history)
                    ? vehicleData.payment_history
                    : [];
                return paymentHistory.flatMap((invoice) => {
                    const records = Array.isArray(invoice?.payment_records)
                        ? invoice.payment_records
                        : [];
                    return records.map((record) => ({
                        // Top-level fields that UI expects
                        payment_id: record.payment_id,
                        transaction_id: record.transaction_num,
                        payment_date: record.payment_date,
                        payment_method: record.payment_method,
                        amount: record.amount,
                        status: record.payment_status === 'success' ? 'completed' : record.payment_status,
                        // Nested invoice with subscription + vehicle for UI
                        invoice: {
                            invoice_id: invoice.invoice_id,
                            invoice_number: invoice.invoice_number,
                            create_date: invoice.create_date,
                            plan_fee: invoice.plan_fee,
                            total_swap_fee: invoice.total_swap_fee,
                            total_penalty_fee: invoice.total_penalty_fee,
                            payment_status: invoice.payment_status,
                            subscription: {
                                subscription_id: invoice.subscription?.subscription_id,
                                plan_name: invoice.subscription?.plan_name,
                                plan_fee: invoice.subscription?.plan_fee,
                                duration_days: invoice.subscription?.duration_days,
                                start_date: invoice.subscription?.start_date,
                                end_date: invoice.subscription?.end_date,
                                subscription_status: invoice.subscription?.subscription_status,
                                vehicle: {
                                    license_plate: vehicleInfo.license_plate,
                                    model_name: vehicleInfo.model_name,
                                },
                            },
                        },
                    }));
                });
            });

            // Sort newest first
            allPayments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

            setPaymentsHistory(allPayments);
        } catch (err) {
            console.error('Error fetching payment history:', err);
            setError(err.message || 'Failed to load payment history');
            setPaymentsHistory([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Apply filters
    useEffect(() => {
        // Ensure we always work with an array
        let source = Array.isArray(paymentsHistory) ? paymentsHistory : [];
        let filtered = [...source];

        if (filters.dateRange !== 'all') {
            // const now = new Date(); 
            const monthsMap = {
                'month': 1,
                '3months': 3,
                '6months': 6,
                'year': 12
            };
            const months = monthsMap[filters.dateRange];

            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - months);

            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.payment_date);
                const pass = paymentDate >= cutoffDate;
                return pass;
            });
        }

        // Search filter (invoice number, transaction ID, or plan name)
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();

            filtered = filtered.filter(payment => {
                const match =
                    payment.invoice?.invoice_number?.toLowerCase().includes(query) ||
                    payment.transaction_id?.toLowerCase().includes(query) ||
                    payment.invoice?.subscription?.plan_name?.toLowerCase().includes(query) ||
                    payment.invoice?.subscription?.vehicle?.license_plate?.toLowerCase().includes(query);

                if (!match) {
                    console.log('  Filtered out:', payment.payment_id);
                }
                return match;
            });
        }

        setFilteredPayments(filtered);
    }, [paymentsHistory, filters]);

    // Update filters
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Format currency
    const formatPrice = useCallback((price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }, []);

    // Format date
    const formatDate = useCallback((dateString) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    }, []);

    // Calculate totals
    const getTotals = useCallback(() => {
        const total = filteredPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
        const count = filteredPayments.length;

        return { total, count };
    }, [filteredPayments]);

    // Initial fetch
    useEffect(() => {
        fetchPaymentHistory();
    }, [fetchPaymentHistory]);

    return {
        paymentsHistory,
        filteredPayments,
        loading,
        error,
        filters,
        updateFilters,
        formatPrice,
        formatDate,
        getTotals,
        refetch: fetchPaymentHistory,
    };
}
