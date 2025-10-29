import React, { useState } from 'react';
import {
    Users,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Battery,
    DollarSign
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Mock data - will be replaced with real API calls
    const users = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+84 123 456 789',
            type: 'driver',
            status: 'active',
            joinDate: '2024-01-15',
            lastActive: '2024-01-20',
            location: 'Ho Chi Minh City',
            vehicleCount: 1,
            subscriptionPlan: 'Premium',
            totalSwaps: 45,
            totalSpent: 1250.50,
            station: 'Station A1'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '+84 987 654 321',
            type: 'staff',
            status: 'active',
            joinDate: '2024-01-10',
            lastActive: '2024-01-20',
            location: 'Station A1',
            vehicleCount: 0,
            subscriptionPlan: 'N/A',
            totalSwaps: 0,
            totalSpent: 0,
            station: 'Station A1'
        },
        {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike.j@email.com',
            phone: '+84 555 123 456',
            type: 'driver',
            status: 'inactive',
            joinDate: '2023-12-01',
            lastActive: '2024-01-05',
            location: 'Hanoi',
            vehicleCount: 2,
            subscriptionPlan: 'Basic',
            totalSwaps: 23,
            totalSpent: 650.25,
            station: 'Station B1'
        },
        {
            id: 4,
            name: 'Sarah Wilson',
            email: 'sarah.w@email.com',
            phone: '+84 444 777 888',
            type: 'staff',
            status: 'active',
            joinDate: '2024-01-05',
            lastActive: '2024-01-20',
            location: 'Station B2',
            vehicleCount: 0,
            subscriptionPlan: 'N/A',
            totalSwaps: 0,
            totalSpent: 0,
            station: 'Station B2'
        },
        {
            id: 5,
            name: 'David Brown',
            email: 'david.brown@email.com',
            phone: '+84 333 999 111',
            type: 'driver',
            status: 'active',
            joinDate: '2024-01-12',
            lastActive: '2024-01-19',
            location: 'Da Nang',
            vehicleCount: 1,
            subscriptionPlan: 'Premium',
            totalSwaps: 67,
            totalSpent: 1890.75,
            station: 'Station C1'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'driver': return 'bg-blue-100 text-blue-800';
            case 'staff': return 'bg-purple-100 text-purple-800';
            case 'admin': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'driver': return <Battery className="h-4 w-4" />;
            case 'staff': return <Users className="h-4 w-4" />;
            case 'admin': return <UserCheck className="h-4 w-4" />;
            default: return <Users className="h-4 w-4" />;
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm);
        const matchesType = filterType === 'all' || user.type === filterType;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="mt-2 text-gray-600">Manage drivers, staff, and admin accounts</p>
                </div>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New User
                </Button>
            </div>

            {/* Filters and Search */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="all">All Types</option>
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
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            More Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Users Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Activity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-gray-600" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                <div className="text-sm text-gray-500">{user.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge className={getTypeColor(user.type)}>
                                            <div className="flex items-center gap-1">
                                                {getTypeIcon(user.type)}
                                                {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                                            </div>
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge className={getStatusColor(user.status)}>
                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                                            {user.location}
                                        </div>
                                        {user.station && (
                                            <div className="text-sm text-gray-500">Station: {user.station}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.type === 'driver' ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center">
                                                    <Battery className="h-4 w-4 text-orange-500 mr-1" />
                                                    {user.totalSwaps} swaps
                                                </div>
                                                <div className="flex items-center">
                                                    <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                                                    ${user.totalSpent.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Last active: {user.lastActive}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                Joined: {user.joinDate}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                            <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
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
                                {users.filter(u => u.type === 'driver').length}
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
                                {users.filter(u => u.type === 'staff').length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default UserManagement;

