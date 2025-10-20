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

            // Hỗ trợ nhiều format payload khác nhau từ backend/mock
            const payload = response?.data?.payload ?? response?.data ?? {};
            const dataArray =
                payload.subscriptionPlans ||
                payload.plans ||
                payload.data ||
                [];

            // Chuẩn hóa lọc theo trạng thái hoạt động: is_active | isActive | status === 'active'
            const activePlans = (Array.isArray(dataArray) ? dataArray : []).filter((plan) => {
                if (typeof plan?.is_active === 'boolean') return plan.is_active;
                if (typeof plan?.isActive === 'boolean') return plan.isActive;
                if (typeof plan?.status === 'string') return plan.status.toLowerCase() === 'active';
                // Nếu không có cờ trạng thái, mặc định hiển thị
                return true;
            });

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
