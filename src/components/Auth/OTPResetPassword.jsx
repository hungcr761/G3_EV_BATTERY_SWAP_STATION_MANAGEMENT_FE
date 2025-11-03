import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { authAPI } from '../../lib/apiServices';
import { resetPasswordSchema } from '../../lib/validations';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react';

const OTPResetPassword = ({ email, onBack, onSuccess }) => {
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });

    const newPassword = watch('newPassword');

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleResetPassword = async (data) => {
        if (otp.length !== 6) {
            setError('OTP code must be 6 digits');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Reset password with OTP and new password
            const response = await authAPI.resetPassword({
                email,
                code: otp,
                newPassword: data.newPassword
            });

            if (response.data.success || response.status === 200) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        setError('');

        try {
            await authAPI.forgotPassword({ email });
            setCountdown(60);
            setCanResend(false);
            setOtp('');
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to resend OTP code. Please try again.');
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
                                    Password Reset Successful!
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Your password has been reset successfully.
                                    You can now log in with your new password.
                                </p>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full"
                                >
                                    Login Now
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
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <KeyRound className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Reset Password
                        </CardTitle>
                        <CardDescription>
                            Enter the OTP code and new password to reset your password
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-2">
                            Email: <span className="font-medium">{email}</span>
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-6">
                            {error && (
                                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-red-700">{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="otp">Verification Code (OTP) *</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    maxLength={6}
                                    className="text-center text-lg tracking-widest"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the 6-digit code sent to your email
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter new password (minimum 8 characters)"
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
                                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Re-enter new password"
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
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="mr-2 h-4 w-4" />
                                        Reset Password
                                    </>
                                )}
                            </Button>

                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Didn't receive the code?
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
                                            Resending...
                                        </>
                                    ) : canResend ? (
                                        'Resend Code'
                                    ) : (
                                        `Resend in ${countdown}s`
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
                                    Back
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OTPResetPassword;