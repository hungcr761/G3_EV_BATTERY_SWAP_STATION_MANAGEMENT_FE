import { useState, useEffect, useCallback } from 'react';
import { invoiceAPI } from '@/lib/apiServices';

export function usePaymentHistory() {
    const [paymentsHistory, setPaymentsHistory] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        dateRange: 'all', 
        searchQuery: '',
    });

    // Fetch payment history
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
            
            if (response.data?.success) {
                const payments = response.data || [];
                setPaymentsHistory(payments);
            } else {
                throw new Error('Failed to fetch payment history');
            }
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
        let filtered = [...paymentsHistory];

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
        const total = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const count = filteredPayments.length;
        
        return { total, count };
    }, [filteredPayments]);

    // Initial fetch
    useEffect(() => {
        fetchPaymentHistory();
    }, [fetchPaymentHistory]);

    return {
        payments: filteredPayments,
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
