import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../lib/apiServices';

export const useUser = (initialParams = {}) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    });
    const [params, setParams] = useState({
        page: initialParams.page || 1,
        pageSize: initialParams.pageSize || 10,
        role: initialParams.role || 'all',
        email: initialParams.email || '',
        fullname: initialParams.fullname || ''
    });

    // Fetch users with pagination and filters
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Build params object, only including non-empty values
            const apiParams = {
                page: params.page,
                pageSize: params.pageSize,
                ...(params.role !== 'all' && { role: params.role }),
                ...(params.email && { email: params.email }),
                ...(params.fullname && { fullname: params.fullname })
            };

            const response = await userAPI.getAll(apiParams);

            if (response.data?.success && response.data?.payload) {
                const usersData = response.data.payload.data || [];
                const total = response.data.payload.total || 0;
                const pageSize = response.data.payload.pageSize || params.pageSize;
                const totalPages = Math.ceil(total / pageSize);

                setUsers(usersData);
                setPagination({
                    page: params.page,
                    pageSize: pageSize,
                    total: total,
                    totalPages: totalPages
                });
            } else {
                setUsers([]);
                setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [params]);

    // Update params and refetch
    const updateParams = useCallback((newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    }, []);

    // Update status (active/inactive)
    const updateStatus = useCallback(async (accountId, status) => {
        try {
            const response = await userAPI.updateStatus(accountId, status);
            if (response.data?.success) {
                // Update local state
                setUsers(prev => prev.map(user =>
                    user.account_id === accountId || user.id === accountId
                        ? { ...user, status }
                        : user
                ));
                // Refetch to ensure data consistency
                await fetchUsers();
                return response.data;
            }
            throw new Error('Failed to update status');
        } catch (err) {
            throw err;
        }
    }, [fetchUsers]);

    // Update profile
    const updateProfile = useCallback(async (accountId, profileData) => {
        try {
            const response = await userAPI.updateProfileByAccountId(accountId, profileData);
            if (response.data?.success) {
                // Refetch users to get updated data
                await fetchUsers();
                return response.data;
            }
            throw new Error('Failed to update profile');
        } catch (err) {
            throw err;
        }
    }, [fetchUsers]);

    // Create staff account
    const createStaff = useCallback(async (staffData) => {
        try {
            const response = await userAPI.createStaff(staffData);
            if (response.data?.success) {
                // Refetch users to include new staff
                await fetchUsers();
                return response.data;
            }
            throw new Error('Failed to create staff account');
        } catch (err) {
            throw err;
        }
    }, [fetchUsers]);

    // Delete user
    const deleteUser = useCallback(async (userId) => {
        try {
            const response = await userAPI.delete(userId);
            if (response.data?.success) {
                // Refetch users to reflect deletion
                await fetchUsers();
                return response.data;
            }
            throw new Error('Failed to delete user');
        } catch (err) {
            throw err;
        }
    }, [fetchUsers]);

    // Fetch users when params change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        loading,
        error,
        pagination,
        params,
        updateParams,
        updateStatus,
        updateProfile,
        createStaff,
        deleteUser,
        refetch: fetchUsers
    };
};

