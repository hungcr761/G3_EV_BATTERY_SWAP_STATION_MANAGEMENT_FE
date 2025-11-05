import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Analytics & Reports', href: '/admin', icon: BarChart3 },
        { name: 'Station Management', href: '/admin/stations', icon: MapPin },
        { name: 'Shift Scheduling', href: '/admin/shifts', icon: Clock },
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Battery Management', href: '/admin/batteries', icon: Battery },
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
                <div
                    className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-400 ease-in-out lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
                        }`}
                    onMouseEnter={(e) => {
                        if (window.innerWidth >= 1024) {
                            setSidebarCollapsed(false);
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (window.innerWidth >= 1024) {
                            setSidebarCollapsed(true);
                        }
                    }}
                >
                    {/* Fixed Header */}
                    <div className={`flex items-center justify-between h-16 border-b border-gray-200 transition-all duration-300 flex-shrink-0 ${sidebarCollapsed ? 'px-4' : 'px-6'
                        }`}>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Battery className="w-5 h-5 text-white" />
                            </div>
                            <span className={`ml-2 text-xl font-bold text-gray-900 transition-all duration-400 whitespace-nowrap ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'
                                }`}>Admin Panel</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Scrollable Navigation */}
                    <nav className={`flex-1 overflow-y-auto mt-6 transition-all duration-300 ${sidebarCollapsed ? 'px-2' : 'px-3'
                        }`}>
                        <div className="space-y-1 pb-6">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`group flex items-center py-2 text-sm font-medium rounded-lg transition-all duration-300 ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'
                                            } ${isActive(item.href)
                                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        title={sidebarCollapsed ? item.name : ''}
                                    >
                                        <Icon className={`h-5 w-5 flex-shrink-0 ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'} ${sidebarCollapsed ? '' : 'mr-3'
                                            }`} />
                                        <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'
                                            }`}>
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </div>

                {/* Main content */}
                <div className={`flex-1 flex flex-col min-w-0 transition-all duration-400 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center space-x-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user?.avatar} alt={user?.fullname} />
                                                <AvatarFallback>
                                                    {user?.fullname?.charAt(0) || user?.username?.charAt(0) || 'A'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-medium">{user?.fullname || 'Admin User'}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {user?.role === 'admin' ? 'Admin' : user?.role || 'Admin'}
                                                </span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{user?.fullname || 'Admin User'}</p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {user?.email || 'admin@example.com'}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link to="/settings" className="cursor-pointer">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Settings</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Sign out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
