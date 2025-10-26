import { useState, useEffect } from 'react';
import { subscriptionPlanAPI } from '@/lib/apiServices';

/**
 * Hook để fetch danh sách subscription plans
 */
export default function useSubscriptionPlan() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPlans = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await subscriptionPlanAPI.getAll();
            const fetchedPlans = response.data?.payload?.subscriptionPlans || [];
            setPlans(fetchedPlans);
        } catch (err) {
            console.error('Error fetching subscription plans:', err);
            setError(err.response?.data?.message || 'Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const refetch = () => {
        fetchPlans();
    };

    return {
        plans,
        loading,
        error,
        refetch
    };
}
