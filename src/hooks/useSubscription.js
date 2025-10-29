import { subscriptionAPI, subscriptionPlanAPI, vehicleAPI } from '@/lib/apiServices';
import { useCallback, useEffect, useState } from 'react';

export default function useSubscription() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Get user info
            const userInfo = localStorage.getItem('currentUser') ||
                sessionStorage.getItem('currentUser');
            if (!userInfo) {
                throw new Error('User not authenticated');
            }

            const user = JSON.parse(userInfo);

            // Fetch subscriptions by driver_id
            const res = await subscriptionAPI.getByDriverId(user.account_id);
            const subscriptionsData = res.data?.payload?.subscription || [];

            const enrichedSubscriptions = await Promise.all(
                subscriptionsData.map(async (sub) => {
                    try {
                        // Fetch vehicle info
                        const vehicleRes = await vehicleAPI.getById(sub.vehicle_id);
                        const vehicle = vehicleRes.data?.payload?.vehicle || vehicleRes.data?.vehicle;

                        // Fetch plan info
                        const planRes = await subscriptionPlanAPI.getById(sub.plan_id);
                        const plan = planRes.data?.payload?.subscriptionPlan || planRes.data?.subscriptionPlan;

                        return {
                            ...sub,
                            vehicle: vehicle || { model_name: 'Unknown Vehicle', license_plate: 'N/A' },
                            plan: plan || { plan_name: 'Unknown Plan', plan_fee: '0' }
                        };
                    } catch (error) {
                        console.error('Error enriching subscription:', error);
                        return {
                            ...sub,
                            vehicle: { model_name: 'Unknown Vehicle', license_plate: 'N/A' },
                            plan: { plan_name: 'Unknown Plan', plan_fee: '0' }
                        };
                    }
                })
            );

            console.log('Enriched subscriptions:', enrichedSubscriptions);
            setSubscriptions(enrichedSubscriptions);
        } catch (error) {
            console.error('Error fetching subscription:', error);
            setError(error.response?.data?.message || 'Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    // Cancel subscription
    const handleDelete = async (subscriptionId) => {
        setIsSubmitting(true);
        try {
            const response = await subscriptionAPI.cancel(subscriptionId);

            if (response.status === 200 || response.data?.success) {
                setMessage({
                    type: 'success',
                    text: 'Subscription cancelled successfully!'
                });

                // Refresh subscriptions list
                await fetchSubscriptions();

                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 6000);
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to cancel subscription'
            });

            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 6000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renew subscription
    const handleRenewal = async (subscriptionId, planId) => {
        setIsSubmitting(true);
        try {
            const response = await subscriptionAPI.renew(subscriptionId, { plan_id: planId });

            if (response.status === 200 || response.data?.success) {
                setMessage({
                    type: 'success',
                    text: 'Subscription renewed successfully!'
                });

                // Refresh subscriptions list
                await fetchSubscriptions();

                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 6000);

                return true;
            }
        } catch (error) {
            console.error('Error renewing subscription:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to renew subscription'
            });

            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 6000);

            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate days remaining
    const getDaysRemaining = (endDate) => {
        const end = new Date(endDate);
        const today = new Date();
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'emerald';
            case 'expired':
                return 'red';
            case 'cancelled':
                return 'gray';
            default:
                return 'blue';
        }
    };

    return {
        // State
        subscriptions,
        loading,
        error,
        message,
        isSubmitting,

        // Methods
        fetchSubscriptions,
        handleDelete,
        handleRenewal,
        getDaysRemaining,
        getStatusColor
    };
}
