import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Monitor, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

const Settings = () => {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    const themes = [
        {
            value: 'light',
                                            label: 'Light',
                                            icon: Sun,
                                            description: 'Light theme'
                                        },
                                        {
                                            value: 'dark',
                                            label: 'Dark',
                                            icon: Moon,
                                            description: 'Dark theme'
                                        },
                                        {
                                            value: 'system',
                                            label: 'System',
                                            icon: Monitor,
                                            description: 'Follow system'
        }
    ];

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold text-foreground">
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your account and application settings
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Theme Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Choose the display theme for your application
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Label className="text-base">Display Mode</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {themes.map((themeOption) => {
                                        const Icon = themeOption.icon;
                                        const isSelected = theme === themeOption.value;

                                        return (
                                            <button
                                                key={themeOption.value}
                                                onClick={() => setTheme(themeOption.value)}
                                                className={`
                                                    relative flex flex-col items-center space-y-3 p-6 rounded-lg border-2 transition-all
                                                    ${isSelected
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-border/80'
                                                    }
                                                `}
                                            >
                                                <div className={`
                                                    p-3 rounded-full
                                                    ${isSelected
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-secondary text-muted-foreground'
                                                    }
                                                `}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div className="text-center">
                                                    <p className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                        {themeOption.label}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {themeOption.description}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2">
                                                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {theme === 'system'
                                        ? 'Theme will automatically change based on your system settings'
                                        : theme === 'dark'
                                            ? 'Dark theme helps reduce eye strain in low-light conditions'
                                            : 'Light theme is optimal for well-lit environments'
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Other Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>
                                Manage how you receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Email Notifications
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Receive email notifications about transactions and activities
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Configure
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Push Notifications
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Receive push notifications on your device
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Configure
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                Manage your account and security
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Change Password
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Update your password
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Change
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Two-Factor Authentication
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Enhance your account security
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Enable
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Settings;

