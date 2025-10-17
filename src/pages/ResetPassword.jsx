import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { resetPasswordSchema } from '../lib/validations';
import { authAPI } from '../lib/apiServices';
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import SimpleHeader from '../components/Layout/SimpleHeader';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        // Kiểm tra token có tồn tại không
        if (!token) {
            setError('Link không hợp lệ. Vui lòng yêu cầu link đặt lại mật khẩu mới.');
        }
    }, [token]);

    const onSubmit = async (data) => {
        if (!token) {
            setError('Token không hợp lệ');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await authAPI.resetPassword({
                token: token,
                newPassword: data.newPassword
            });

            // Backend trả về code 200 khi thành công
            if (response.status === 200 || response.data) {
                setSuccess(true);
                // Chuyển về trang login sau 3 giây
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            // Backend trả về lỗi nếu token không hợp lệ hoặc đã hết hạn
            const errorMessage = err?.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <SimpleHeader />
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <KeyRound className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold">
                                {success ? 'Thành công!' : 'Đặt lại mật khẩu'}
                            </CardTitle>
                            <CardDescription>
                                {success
                                    ? 'Mật khẩu của bạn đã được đặt lại thành công'
                                    : 'Nhập mật khẩu mới cho tài khoản của bạn'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {success ? (
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-md">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm text-green-700 font-medium">
                                                Mật khẩu đã được đặt lại thành công!
                                            </p>
                                            <p className="text-sm text-green-600 mt-1">
                                                Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-center text-sm text-muted-foreground">
                                        <p>Đang chuyển đến trang đăng nhập...</p>
                                    </div>

                                    <Link to="/login" className="block">
                                        <Button type="button" className="w-full">
                                            Đăng nhập ngay
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {error && (
                                        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-700">{error}</span>
                                        </div>
                                    )}

                                    {!token && (
                                        <div className="text-center space-y-3">
                                            <p className="text-sm text-muted-foreground">
                                                Link của bạn không hợp lệ hoặc đã hết hạn.
                                            </p>
                                            <Link to="/forgot-password" className="block">
                                                <Button type="button" variant="outline" className="w-full">
                                                    Yêu cầu link mới
                                                </Button>
                                            </Link>
                                        </div>
                                    )}

                                    {token && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="newPassword"
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                                                        {...register('newPassword')}
                                                        className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                                                        disabled={isLoading}
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
                                                {errors.newPassword && (
                                                    <p className="text-sm text-red-600">{errors.newPassword.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        placeholder="Nhập lại mật khẩu mới"
                                                        {...register('confirmPassword')}
                                                        className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                                                        disabled={isLoading}
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

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <KeyRound className="mr-2 h-4 w-4" />
                                                        Đặt lại mật khẩu
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    )}

                                    <div className="text-center pt-2">
                                        <Link
                                            to="/login"
                                            className="text-sm font-medium text-primary hover:text-primary/80"
                                        >
                                            Quay lại đăng nhập
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;


