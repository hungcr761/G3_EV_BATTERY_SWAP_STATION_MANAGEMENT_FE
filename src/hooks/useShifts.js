import { useState, useEffect, useCallback } from 'react';
import { shiftAPI } from '../lib/apiServices';

export const useShifts = (options = {}) => {
    const {
        staff_id = null,
        station_id = null,
        page = null,
        pageSize = null,
        autoFetch = true
    } = options;
    // Current shift for the logged-in staff
    const [shift , setShift] = useState(null);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1
    });

    // Fetch shifts with optional filters and pagination
    const fetchShifts = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);

            // Build query params
            const queryParams = {};
            if (staff_id !== null && staff_id !== undefined && staff_id !== 'all') {
                queryParams.staff_id = staff_id;
            }
            if (station_id !== null && station_id !== undefined && station_id !== 'all') {
                queryParams.station_id = station_id;
            }
            if (page !== null && page !== undefined) {
                queryParams.page = page;
            }
            if (pageSize !== null && pageSize !== undefined) {
                queryParams.pageSize = pageSize;
            }

            // Merge with additional params
            const finalParams = { ...queryParams, ...params };

            const response = await shiftAPI.getAll(finalParams);
            // Handle the API response structure: { success: true, payload: { shifts: { data: [...], total, page, pageSize, totalPages } } }
            const shiftsResponse = response.data?.payload?.shifts || {};
            const shiftsData = shiftsResponse.data || shiftsResponse || [];
            // Convert pagination values to numbers (API may return strings)
            const paginationData = {
                total: Number(shiftsResponse.total) || 0,
                page: Number(shiftsResponse.page) || 1,
                pageSize: Number(shiftsResponse.pageSize) || 10,
                totalPages: Number(shiftsResponse.totalPages) || 1
            };

            setShifts(shiftsData);
            setPagination(paginationData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch shifts');
            setShifts([]);
            console.error('Error fetching shifts:', err);
        } finally {
            setLoading(false);
        }
    }, [staff_id, station_id, page, pageSize]);

    // Fetch shifts on mount or when dependencies change
    useEffect(() => {
        if (autoFetch) {
            fetchShifts();
        }
    }, [fetchShifts, autoFetch]);

    // Get current shift of the logged-in staff
    const fetchCurrentShift = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Get user info
            const userInfor = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            if (!userInfor) {
                throw new Error('User not authenticated');
            }

            const user = JSON.parse(userInfor);

            const res = await shiftAPI.getCurrentShift({ staff_id: user.account_id });
            const raw = res?.data?.payload?.shift?.data || res?.data?.payload?.shift || null;
            const normalized = Array.isArray(raw) ? (raw[0] || null) : raw;
            setShift(normalized);
            return normalized;
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to fetch current shift');
            setShift(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurrentShift();
    },[fetchCurrentShift]);


    return {
        shifts,
        shift,
        loading,
        error,
        pagination,
        fetchShifts,
        fetchCurrentShift,
        refetch: fetchShifts
    };
};

