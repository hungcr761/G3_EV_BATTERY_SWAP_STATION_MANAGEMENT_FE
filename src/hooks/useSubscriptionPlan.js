import { subscriptionPlanAPI } from '@/lib/apiServices';
import React, { useEffect, useState } from 'react'


/**
 * Custom hook để fetch danh sách subscription plans từ API
 * @returns {Object} { plans, loading, error, refetch }
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
            console.log('📦 Full Response:', response);
            
            // API trả về: {success: true, payload: {subscriptionPlans: [...]}}
            const dataArray = response.data?.payload?.subscriptionPlans || [];
            
            
            const activePlans = dataArray.filter(plan => plan.is_active === true);

            setPlans(activePlans);
        } catch (err) {
            console.error('❌ Error:', err);
            setError(err.message || err.response?.data?.message || 'Không thể tải danh sách gói dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);
    
    return {
        plans,
        loading,
        error,
        refetch: fetchPlans
    };
};
