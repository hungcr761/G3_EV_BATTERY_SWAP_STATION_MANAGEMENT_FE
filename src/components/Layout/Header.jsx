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
    ChevronDown,
    CalendarPlus,
    Motorbike,
    CreditCard,
    LifeBuoy,
    BadgePercent
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
        { label: 'Dashboard' , href: '/Dashboard'},
        { label: 'Booking', href: '/booking' },
        { label: 'Services', href: '/services' },
        { label: 'Support', href: '/support' }
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
                                                        {user?.role === 'driver' ? 'EV Driver' : user?.role}
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
                                            {/* Quick Actions inside user menu (driver) */}
                                            {user?.role === 'driver' && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link to="/vehiclesManagement" className="cursor-pointer">
                                                            <Motorbike className="mr-2 h-4 w-4" />
                                                            <span>Vehicles Management</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to="/subscriptionManagement" className="cursor-pointer">
                                                            <BadgePercent className="mr-2 h-4 w-4" />
                                                            <span>Subscriptions Management</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to="/paymentHistory" className="cursor-pointer">
                                                            <CreditCard className="mr-2 h-4 w-4" />
                                                            <span>Payments History</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to="/swapHistory" className="cursor-pointer">
                                                            <LifeBuoy className="mr-2 h-4 w-4" />
                                                            <span>Swap History</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuItem asChild>
                                                <Link to="/profile" className="cursor-pointer">
                                                    <User className="mr-2 h-4 w-4" />
                                                    <span>Profile</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/settings" className="cursor-pointer">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    <span>Settings</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Log Out</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" asChild>
                                    <Link to="/login">Log In</Link>
                                </Button>
                                <Button asChild>
                                    <Link to="/register">Sign Up</Link>
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
                                    {user?.role === 'driver' && (
                                        <>
                                            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase">Quick Actions</p>
                                            <div className="grid grid-cols-2 gap-2 px-1">
                                                <Link to="/booking" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent" onClick={() => setIsMobileMenuOpen(false)}>
                                                    <CalendarPlus className="h-4 w-4 mr-2" /> Booking
                                                </Link>
                                                <Link to="/vehiclesManagement" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent" onClick={() => setIsMobileMenuOpen(false)}>
                                                    <Motorbike className="h-4 w-4 mr-2" /> Vehicles
                                                </Link>
                                                <Link to="/subscriptionManagement" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent" onClick={() => setIsMobileMenuOpen(false)}>
                                                    <BadgePercent className="h-4 w-4 mr-2" /> Subscriptions
                                                </Link>
                                                <Link to="/paymentHistory" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent" onClick={() => setIsMobileMenuOpen(false)}>
                                                    <CreditCard className="h-4 w-4 mr-2" /> Payments
                                                </Link>
                                                <Link to="/support" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent" onClick={() => setIsMobileMenuOpen(false)}>
                                                    <LifeBuoy className="h-4 w-4 mr-2" /> Support
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                    <Link
                                        to="/profile"
                                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Profile
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-accent text-left text-red-600"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Log Out
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4 border-t space-y-2">
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign Up
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
