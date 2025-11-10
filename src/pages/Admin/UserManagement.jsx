import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Battery,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertTriangle,
    EyeOff
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { useUser } from '../../hooks/useUser';
import { createStaffSchema } from '../../lib/validations';

const UserManagement = () => {
    const [searchEmail, setSearchEmail] = useState('');
    const [searchFullname, setSearchFullname] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Use the useUser hook with initial pagination
    const {
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
        refetch
    } = useUser({
        page: 1,
        pageSize: 10,
        role: 'all',
        email: '',
        fullname: ''
    });

    // Form setup for creating staff
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(createStaffSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            fullname: '',
            phone_number: '',
        },
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Update search params when search term changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateParams({
                email: searchEmail,
                fullname: searchFullname,
                role: filterType === 'all' ? 'all' : filterType,
                page: 1 // Reset to first page when search changes
            });
        }, 500); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchEmail, searchFullname, filterType, updateParams]);

    // Handle pagination
    const handlePageChange = (newPage) => {
        updateParams({ page: newPage });
    };

    // Handle status update
    const handleStatusUpdate = async (accountId, newStatus) => {
        try {
            await updateStatus(accountId, newStatus);
            // Optionally show success message
        } catch (err) {
            console.error('Failed to update status:', err);
            // Optionally show error message
        }
    };

    // Handle delete user
    const handleDeleteUser = async (accountId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(accountId);
                // Optionally show success message
            } catch (err) {
                console.error('Failed to delete user:', err);
                // Optionally show error message
            }
        }
    };

    // Handle create staff form submission
    const onSubmitStaff = async (data) => {
        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess(false);

        try {
            // Prepare data - remove confirmPassword and only include phone_number if it's not empty
            const { confirmPassword, ...restData } = data;
            const staffData = {
                email: restData.email,
                password: restData.password,
                fullname: restData.fullname,
                ...(restData.phone_number && restData.phone_number.trim() !== '' && { phone_number: restData.phone_number }),
            };

            await createStaff(staffData);
            setSubmitSuccess(true);
            reset();

            // Close dialog after a short delay
            setTimeout(() => {
                setIsDialogOpen(false);
                setSubmitSuccess(false);
            }, 1500);
        } catch (err) {
            console.error('Failed to create staff:', err);
            setSubmitError(err.response?.data?.message || err.message || 'Failed to create staff account. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle dialog close
    const handleDialogClose = () => {
        if (!isSubmitting) {
            setIsDialogOpen(false);
            reset();
            setSubmitError('');
            setSubmitSuccess(false);
        }
    };

    // Filter users by status (client-side filter since API might not support it)
    const filteredUsers = users.filter(user => {
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (role) => {
        switch (role) {
            case 'driver': return 'bg-blue-100 text-blue-800';
            case 'staff': return 'bg-purple-100 text-purple-800';
            case 'admin': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (role) => {
        switch (role) {
            case 'driver': return <Battery className="h-4 w-4" />;
            case 'staff': return <Users className="h-4 w-4" />;
            case 'admin': return <UserCheck className="h-4 w-4" />;
            default: return <Users className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="mt-2 text-gray-600">Manage drivers, staff, and admin accounts</p>
                </div>
                <Button
                    className="flex items-center gap-2"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Add New Staff
                </Button>
            </div>

            {/* Filters and Search */}
            <Card className="p-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by fullname..."
                                    value={searchFullname}
                                    onChange={(e) => setSearchFullname(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by email..."
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="all">All Roles</option>
                            <option value="driver">Drivers</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admins</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select
                            value={params.pageSize}
                            onChange={(e) => updateParams({ pageSize: parseInt(e.target.value), page: 1 })}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="10">10 per page</option>
                            <option value="25">25 per page</option>
                            <option value="50">50 per page</option>
                            <option value="100">100 per page</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Users Table */}
            <Card className="overflow-hidden">
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400 mb-4">
                        <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading users...</span>
                        </div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="text-center text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No users found</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Additional Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.account_id || user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-gray-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.fullname || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                                                        {user.citizen_id && (
                                                            <div className="text-xs text-gray-400">ID: {user.citizen_id}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge className={getTypeColor(user.role)}>
                                                    <div className="flex items-center gap-1">
                                                        {getTypeIcon(user.role)}
                                                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                                                    </div>
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge className={getStatusColor(user.status)}>
                                                    {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {user.phone_number ? (
                                                        <div className="flex items-center">
                                                            <Phone className="h-4 w-4 text-gray-400 mr-1" />
                                                            {user.phone_number}
                                                        </div>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.driving_license && (
                                                    <div className="text-xs">License: {user.driving_license}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate(
                                                            user.account_id,
                                                            user.status === 'active' ? 'inactive' : 'active'
                                                        )}
                                                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {user.status === 'active' ? (
                                                            <UserX className="h-4 w-4 text-red-600" />
                                                        ) : (
                                                            <UserCheck className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </Button>
                                                    <Button variant="ghost" size="sm" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDeleteUser(user.account_id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                                        </span> of{' '}
                                        <span className="font-medium">{pagination.total}</span> results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <div className="text-sm text-gray-700">
                                            Page <span className="font-medium">{pagination.page}</span> of{' '}
                                            <span className="font-medium">{pagination.totalPages}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {pagination.total}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {users.filter(u => u.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Battery className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Drivers</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {users.filter(u => u.role === 'driver').length}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <Users className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Staff Members</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {users.filter(u => u.role === 'staff').length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Add New Staff Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Staff</DialogTitle>
                        <DialogDescription>
                            Create a new staff account. Fill in the required information below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitStaff)}>
                        <div className="space-y-4 py-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="staff@example.com"
                                    {...register('email')}
                                    disabled={isSubmitting}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="At least 8 characters"
                                        {...register('password')}
                                        disabled={isSubmitting}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        disabled={isSubmitting}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm your password"
                                        {...register('confirmPassword')}
                                        disabled={isSubmitting}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        disabled={isSubmitting}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            {/* Fullname */}
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Full Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="fullname"
                                    type="text"
                                    placeholder="John Doe"
                                    {...register('fullname')}
                                    disabled={isSubmitting}
                                />
                                {errors.fullname && (
                                    <p className="text-sm text-red-600">{errors.fullname.message}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <Label htmlFor="phone_number">Phone Number (Optional)</Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    placeholder="0912345678"
                                    {...register('phone_number')}
                                    disabled={isSubmitting}
                                />
                                {errors.phone_number && (
                                    <p className="text-sm text-red-600">{errors.phone_number.message}</p>
                                )}
                            </div>

                            {/* Error Message */}
                            {submitError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <div className="flex items-center">
                                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                                        <p className="text-sm text-red-700">{submitError}</p>
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {submitSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                    <div className="flex items-center">
                                        <UserCheck className="h-4 w-4 text-green-600 mr-2" />
                                        <p className="text-sm text-green-700">Staff account created successfully!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDialogClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Staff'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;

