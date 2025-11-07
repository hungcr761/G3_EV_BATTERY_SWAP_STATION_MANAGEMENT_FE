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
import OTPResetPassword from '../components/Auth/OTPResetPassword';

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [showOTP, setShowOTP] = useState(false);

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
            // Call forgot password API to send OTP
            const response = await authAPI.forgotPassword(data);

            if (response.data.success || response.status === 200) {
                setSubmittedEmail(data.email);
                setShowOTP(true);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || 'An error occurred. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPSuccess = () => {
        setSuccess(true);
        setShowOTP(false);
    };

    const handleBackToForm = () => {
        setShowOTP(false);
        setSubmittedEmail('');
        setError('');
    };

    // Show OTP reset password component
    if (showOTP) {
        return (
            <>
                <SimpleHeader />
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                    <OTPResetPassword
                        email={submittedEmail}
                        onBack={handleBackToForm}
                        onSuccess={handleOTPSuccess}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <SimpleHeader />
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold">
                                {success ? 'Check Your Email' : 'Forgot Password?'}
                            </CardTitle>
                            <CardDescription>
                                {success
                                    ? 'Your password has been reset successfully'
                                    : 'Enter your email and we will send an OTP code to reset your password'
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
                                                Email Sent!
                                            </p>
                                            <p className="text-sm text-green-600 mt-1">
                                                Your password has been reset successfully!
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <p>You can now log in with your new password.</p>
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <Link to="/login" className="block">
                                            <Button type="button" className="w-full">
                                                Login Now
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
                                            placeholder="Enter your email"
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
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Send OTP Code
                                            </>
                                        )}
                                    </Button>

                                    <div className="text-center pt-4">
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to Login
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;

