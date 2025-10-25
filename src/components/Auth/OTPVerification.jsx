import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { authAPI } from '../../lib/apiServices';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const OTPVerification = ({ email, userData, onBack, onSuccess }) => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Mã OTP phải có 6 chữ số');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Verify OTP
            const verifyResponse = await authAPI.verifyEmail({ email, code: otp });

            if (verifyResponse.data.verified === true) {
                // If OTP verification successful, proceed with registration
                const registerResponse = await authAPI.register(userData);

                if (registerResponse.data.success) {
                    setSuccess(true);
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);
                }
            } else {
                setError(verifyResponse.data.message || 'Mã OTP không đúng');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        setError('');

        try {
            await authAPI.requestVerification({ email });
            setCountdown(60);
            setCanResend(false);
            setOtp('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
        } finally {
            setIsResending(false);
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 6) {
            setOtp(value);
            setError('');
        }
    };

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
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full"
                                >
                                    Đi đến trang đăng nhập
                                </Button>
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
                        <CardTitle className="text-2xl font-bold">Xác thực Email</CardTitle>
                        <CardDescription>
                            Chúng tôi đã gửi mã xác thực 6 chữ số đến email của bạn
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-2">
                            Email: <span className="font-medium">{email}</span>
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            {error && (
                                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-red-700">{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="otp">Mã xác thực (OTP) *</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="Nhập mã 6 chữ số"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    maxLength={6}
                                    className="text-center text-lg tracking-widest"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Nhập mã 6 chữ số đã được gửi đến email của bạn
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xác thực...
                                    </>
                                ) : (
                                    'Xác thực'
                                )}
                            </Button>

                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Không nhận được mã?
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleResendOTP}
                                    disabled={!canResend || isResending}
                                    className="w-full"
                                >
                                    {isResending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang gửi lại...
                                        </>
                                    ) : canResend ? (
                                        'Gửi lại mã'
                                    ) : (
                                        `Gửi lại sau ${countdown}s`
                                    )}
                                </Button>
                            </div>

                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onBack}
                                    className="text-sm"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Quay lại đăng ký
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OTPVerification;