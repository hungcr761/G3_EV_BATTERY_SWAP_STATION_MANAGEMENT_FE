import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
    LayoutDashboard,
    MapPin,
    Users,
    Battery,
    BarChart3,
    Settings,
    Menu,
    X,
    Bell,
    User,
    LogOut,
    ChevronDown,
    Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Station Management', href: '/admin/stations', icon: MapPin },
        { name: 'Shift Scheduling', href: '/admin/shifts', icon: Clock },
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Battery Management', href: '/admin/batteries', icon: Battery },
        { name: 'Analytics & Reports', href: '/admin/analytics', icon: BarChart3 },
        { name: 'System Settings', href: '/admin/settings', icon: Settings },
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
                </div>
            )}

            <div className="flex">
                {/* Sidebar */}
                <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Battery className="w-5 h-5 text-white" />
                            </div>
                            <span className="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="mt-6 px-3">
                        <div className="space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                                            }`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top navigation */}
                    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                            <div className="flex flex-1"></div>
                            <div className="flex items-center gap-x-4 lg:gap-x-6">
                                {/* Notifications */}
                                <button
                                    type="button"
                                    className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                                >
                                    <Bell className="h-6 w-6" />
                                </button>

                                {/* Profile dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-x-2 text-sm font-semibold leading-6 text-gray-900"
                                    >
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <span className="hidden lg:block">Admin User</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Page content */}
                    <main className="flex-1 py-6">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
