import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
} from '../ui/navigation-menu';
import { useAuth } from '../../hooks/useAuth';
import {
    User,
    LogOut,
    Settings,
    Battery,
    LayoutDashboard,
    Menu,
    X,
    ChevronDown
} from 'lucide-react';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navigationItems = [
        { label: 'Đặt lịch', href: '/stations' },
        { label: 'Dịch vụ', href: '/services' },
        { label: 'Hỗ trợ', href: '/support' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Battery className="h-8 w-8 text-primary" />
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold">EVSwap</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList>
                            {navigationItems.map((item) => (
                                <NavigationMenuItem key={item.href}>
                                    <Link
                                        to={item.href}
                                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                                    >
                                        {item.label}
                                    </Link>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* User Menu Dropdown - Desktop */}
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
                                                    <span className="text-sm font-medium">{user?.fullname}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {user?.role === 'driver' ? 'Tài xế' : user?.role}
                                                    </span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">{user?.fullname}</p>
                                                    <p className="text-xs leading-none text-muted-foreground">
                                                        {user?.email}
                                                    </p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link to="/dashboard" className="cursor-pointer">
                                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                                    <span>Dashboard</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/profile" className="cursor-pointer">
                                                    <User className="mr-2 h-4 w-4" />
                                                    <span>Thông tin cá nhân</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/settings" className="cursor-pointer">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    <span>Cài đặt</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Đăng xuất</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" asChild>
                                    <Link to="/login">Đăng nhập</Link>
                                </Button>
                                <Button asChild>
                                    <Link to="/register">Đăng ký</Link>
                                </Button>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t bg-background">
                        <div className="px-4 py-4 space-y-2">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            {isAuthenticated ? (
                                <div className="pt-4 border-t space-y-2">
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium">{user?.fullname}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="h-4 w-4 mr-2" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Thông tin cá nhân
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Cài đặt
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-accent text-left text-red-600"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Đăng xuất
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4 border-t space-y-2">
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
