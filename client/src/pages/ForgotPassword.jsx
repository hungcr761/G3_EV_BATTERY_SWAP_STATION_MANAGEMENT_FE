import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { forgotPasswordSchema } from '../lib/validations';
import { authAPI } from '../lib/apiServices';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import SimpleHeader from '../components/Layout/SimpleHeader';

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await authAPI.forgotPassword(data);

            // Backend trả về code 200 với message "Reset email sent if email exists"
            if (response.status === 200 || response.data) {
                setSuccess(true);
                setSubmittedEmail(data.email);
            }
        } catch (err) {
            // Backend trả về code 404 nếu email không tồn tại
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
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold">
                                {success ? 'Kiểm tra email của bạn' : 'Quên mật khẩu?'}
                            </CardTitle>
                            <CardDescription>
                                {success
                                    ? 'Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn'
                                    : 'Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu'
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
                                                Email đã được gửi!
                                            </p>
                                            <p className="text-sm text-green-600 mt-1">
                                                Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{submittedEmail}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <p>Vui lòng kiểm tra email của bạn và click vào link để đặt lại mật khẩu.</p>
                                        <p>Nếu bạn không nhận được email trong vài phút, vui lòng:</p>
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                            <li>Kiểm tra thư mục spam/junk</li>
                                            <li>Đảm bảo email chính xác</li>
                                            <li>Thử gửi lại sau vài phút</li>
                                        </ul>
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setSuccess(false);
                                                setSubmittedEmail('');
                                            }}
                                        >
                                            Gửi lại email
                                        </Button>

                                        <Link to="/login" className="block">
                                            <Button type="button" variant="ghost" className="w-full">
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Quay lại đăng nhập
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {error && (
                                        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-700">{error}</span>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Nhập email của bạn"
                                            {...register('email')}
                                            className={errors.email ? 'border-red-500' : ''}
                                            disabled={isLoading}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-600">{errors.email.message}</p>
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
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Gửi link đặt lại mật khẩu
                                            </>
                                        )}
                                    </Button>

                                    <div className="text-center pt-4">
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
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

export default ForgotPassword;

