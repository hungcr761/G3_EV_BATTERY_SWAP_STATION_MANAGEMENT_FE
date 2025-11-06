import { shiftAPI } from '@/lib/apiServices';
import React, { useCallback, useEffect, useState } from 'react'

export default function useShift() {

    const [shift, setShift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCurrentShift = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await shiftAPI.getCurrentShift();
            const currShift = res?.data?.payload?.shift?.data?.[0] || null;
            setShift(currShift);
        } catch (e) {
            setError(e?.message || 'Failed to load current shift');
            setShift(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Ensure we actually invoke the fetch on mount
    useEffect(() => { fetchCurrentShift(); }, [fetchCurrentShift]);

    return {
        shift,
        loading,
        error,
        refetch: fetchCurrentShift
    };
}
