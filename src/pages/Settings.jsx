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
            label: 'Sáng',
            icon: Sun,
            description: 'Giao diện sáng'
        },
        {
            value: 'dark',
            label: 'Tối',
            icon: Moon,
            description: 'Giao diện tối'
        },
        {
            value: 'system',
            label: 'Hệ thống',
            icon: Monitor,
            description: 'Theo hệ thống'
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
                        Quay lại
                    </Button>
                    <h1 className="text-3xl font-bold text-foreground">
                        Cài đặt
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Quản lý cài đặt tài khoản và ứng dụng của bạn
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Theme Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Giao diện</CardTitle>
                            <CardDescription>
                                Chọn giao diện hiển thị cho ứng dụng
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Label className="text-base">Chế độ hiển thị</Label>
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
                                        ? 'Giao diện sẽ tự động thay đổi theo cài đặt hệ thống của bạn'
                                        : theme === 'dark'
                                            ? 'Giao diện tối giúp giảm căng thẳng mắt trong điều kiện ánh sáng yếu'
                                            : 'Giao diện sáng tối ưu cho môi trường có ánh sáng tốt'
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Other Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông báo</CardTitle>
                            <CardDescription>
                                Quản lý cách bạn nhận thông báo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Email thông báo
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Nhận thông báo qua email về giao dịch và hoạt động
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Cấu hình
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Push notification
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Nhận thông báo đẩy trên thiết bị của bạn
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Cấu hình
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tài khoản</CardTitle>
                            <CardDescription>
                                Quản lý tài khoản và bảo mật
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Đổi mật khẩu
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Cập nhật mật khẩu của bạn
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Thay đổi
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Xác thực hai yếu tố
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Tăng cường bảo mật cho tài khoản
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Bật
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

