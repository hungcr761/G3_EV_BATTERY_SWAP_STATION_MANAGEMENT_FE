import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Battery,
    Bell,
    ChevronDown,
    LogOut,
    User,
    Menu,
    X,
    Calendar as CalendarIcon,
    ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function StaffLayout({ children }) {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navigation = [
        { name: 'Battery Management', href: '/staff', icon: Battery },
        { name: 'Shift Calendar', href: '/staff/shift-calendar', icon: CalendarIcon },
        { name: 'Transfer Management', href: '/staff/transfer-management', icon: ArrowLeftRight },
    ];

    // Fix: avoid root '/staff' matching every sub-route
    const isActive = (path) => {
        if (path === '/staff') return location.pathname === '/staff';
        return location.pathname === path || location.pathname.startsWith(path + '/');
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

            <div className="flex min-h-screen">
                {/* Sidebar */}
                <div
                    className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-400 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} flex flex-col h-full lg:h-screen min-h-0`}
                    onMouseEnter={() => {
                        if (window.innerWidth >= 1024) setSidebarCollapsed(false);
                    }}
                    onMouseLeave={() => {
                        if (window.innerWidth >= 1024) setSidebarCollapsed(true);
                    }}
                >
                    <div className={`flex items-center justify-between h-16 border-b border-gray-200 transition-all duration-300 flex-shrink-0 ${sidebarCollapsed ? 'px-4' : 'px-6'}`}>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Battery className="w-5 h-5 text-white" />
                            </div>
                            <span className={`ml-2 text-xl font-bold text-gray-900 transition-all duration-400 whitespace-nowrap ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'}`}>Staff Panel</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <nav className={`mt-6 transition-all duration-300 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
                            <div className="space-y-1">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`group flex items-center py-2 text-sm font-medium rounded-lg transition-all duration-300 ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} ${isActive(item.href)
                                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                            title={sidebarCollapsed ? item.name : ''}
                                        >
                                            <Icon className={`h-5 w-5 flex-shrink-0 ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'} ${sidebarCollapsed ? '' : 'mr-3'}`} />
                                            <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'}`}>
                                                {item.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>
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
                                {/* <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                                    <Bell className="h-6 w-6" />
                                </button> */}

                                {/* Profile dropdown (aligned with Header.jsx) */}
                                <div className="hidden md:block">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="flex items-center space-x-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user?.avatar} alt={user?.fullname} />
                                                    <AvatarFallback>
                                                        {user?.fullname?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col items-start">
                                                    <span className="text-sm font-medium">{user?.fullname || user?.name}</span>
                                                    <span className="text-xs text-muted-foreground">Staff</span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">{user?.fullname || user?.name}</p>
                                                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Log Out</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
}


