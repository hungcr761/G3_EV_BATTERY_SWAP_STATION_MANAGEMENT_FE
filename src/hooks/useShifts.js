import { useState, useEffect, useCallback } from 'react';
import { shiftAPI } from '../lib/apiServices';

export const useShifts = () => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all shifts
    const fetchShifts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await shiftAPI.getAll();
            // Handle the API response structure: { success: true, payload: { shifts: [...] } }
            const shiftsData = response.data?.payload?.shifts || response.data?.shifts || [];

            setShifts(shiftsData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch shifts');
            setShifts([]);
            console.error('Error fetching shifts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch shifts on mount
    useEffect(() => {
        fetchShifts();
    }, [fetchShifts]);

    return {
        shifts,
        loading,
        error,
        fetchShifts,
        refetch: fetchShifts
    };
};

