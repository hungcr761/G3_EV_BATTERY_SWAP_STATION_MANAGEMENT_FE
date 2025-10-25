import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { authAPI, userAPI } from '../../lib/apiServices';
import { registerSchema } from '../../lib/validations';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import OTPVerification from './OTPVerification';

const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [userData, setUserData] = useState(null);
    const [email, setEmail] = useState('');

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const password = watch('password');

    const onSubmit = async (data) => {
        console.log('RegisterForm: onSubmit called with data:', data);
        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Remove confirmPassword from data before sending
            const { confirmPassword, ...userData } = data;
            console.log('RegisterForm: userData after removing confirmPassword:', userData);

            // Call request verification API to send OTP
            console.log('RegisterForm: Calling authAPI.requestVerification with email:', userData.email);
            const response = await authAPI.requestVerification({ email: userData.email });
            console.log('RegisterForm: requestVerification response:', response);

            // Store user data and email for OTP verification step
            setUserData(userData);
            setEmail(userData.email);
            setShowOTP(true);
        } catch (err) {
            console.error('RegisterForm: Error in onSubmit:', err);
            setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPSuccess = () => {
        setSuccess(true);
        setTimeout(() => {
            navigate('/login');
        }, 2000);
    };

    const handleBackToForm = () => {
        setShowOTP(false);
        setUserData(null);
        setEmail('');
        setError('');
    };

    // Show OTP verification component
    if (showOTP) {
        return (
            <OTPVerification
                email={email}
                userData={userData}
                onBack={handleBackToForm}
                onSuccess={handleOTPSuccess}
            />
        );
    }

    if (success) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    Đăng ký thành công!
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Tài khoản của bạn đã được tạo thành công.
                                    Bạn sẽ được chuyển đến trang đăng nhập.
                                </p>
                                <Link to="/login">
                                    <Button className="w-full">
                                        Đi đến trang đăng nhập
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Đăng ký tài khoản</CardTitle>
                        <CardDescription>
                            Tạo tài khoản EVSwap mới để bắt đầu sử dụng dịch vụ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-red-700">{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="fullname">Họ và tên *</Label>
                                <Input
                                    id="fullname"
                                    type="text"
                                    placeholder="Nhập họ tên"
                                    {...register('fullname')}
                                    className={errors.fullname ? 'border-red-500' : ''}
                                />
                                {errors.fullname && (
                                    <p className="text-sm text-red-600">{errors.fullname.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    {...register('email')}
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone_number">Số điện thoại *</Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    placeholder="0123456789"
                                    {...register('phone_number')}
                                    className={errors.phone_number ? 'border-red-500' : ''}
                                />
                                {errors.phone_number && (
                                    <p className="text-sm text-red-600">{errors.phone_number.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Mật khẩu *</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mật khẩu"
                                        {...register('password')}
                                        className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Nhập lại mật khẩu"
                                        {...register('confirmPassword')}
                                        className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                    Tôi đồng ý với{' '}
                                    <Link to="/terms" className="text-primary hover:text-primary/80">
                                        Điều khoản sử dụng
                                    </Link>{' '}
                                    và{' '}
                                    <Link to="/privacy" className="text-primary hover:text-primary/80">
                                        Chính sách bảo mật
                                    </Link>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang tạo tài khoản...
                                    </>
                                ) : (
                                    'Tạo tài khoản'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Đã có tài khoản?{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-primary hover:text-primary/80"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RegisterForm;
