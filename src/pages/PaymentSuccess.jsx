import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
    CreditCard,
    Package,
    Motorbike,
    DollarSign,
    Calendar,
    ExternalLink
} from 'lucide-react';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const extractPaymentData = () => {
            try {
                // Extract parameters from URL
                const partnerCode = searchParams.get('partnerCode');
                const orderId = searchParams.get('orderId');
                const amount = searchParams.get('amount');
                const resultCode = searchParams.get('resultCode');
                const message = searchParams.get('message');
                const extraData = searchParams.get('extraData');

                // Parse extraData JSON
                let extraDataParsed = {};
                if (extraData) {
                    try {
                        extraDataParsed = JSON.parse(decodeURIComponent(extraData));
                    } catch (e) {
                        console.warn('Could not parse extraData:', e);
                    }
                }

                const data = {
                    partnerCode,
                    orderId,
                    amount: amount ? parseInt(amount) : 0,
                    resultCode: resultCode ? parseInt(resultCode) : -1,
                    message,
                    invoiceId: extraDataParsed.invoice_id,
                    planId: extraDataParsed.plan_id,
                    vehicleId: extraDataParsed.vehicle_id,
                    isSuccess: resultCode === '0'
                };

                setPaymentData(data);
                setError(null);
            } catch (err) {
                console.error('Error parsing payment data:', err);
                setError('Không thể xử lý thông tin thanh toán');
            } finally {
                setLoading(false);
            }
        };

        extractPaymentData();
    }, [searchParams]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleContinue = () => {
        navigate('/dashboard');
    };

    const handleBackToServices = () => {
        navigate('/services');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Đang xử lý kết quả thanh toán...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
                <div className="max-w-md mx-auto text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-red-800 mb-2">Lỗi xử lý</h1>
                    <p className="text-red-600 mb-6">{error}</p>
                    <Button onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Về trang chủ
                    </Button>
                </div>
            </div>
        );
    }

    const isSuccess = paymentData?.isSuccess;
    const isFailure = !isSuccess;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    {isSuccess ? (
                        <>
                            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                            <h1 className="text-4xl font-bold text-green-800 mb-2">
                                Thanh toán thành công!
                            </h1>
                            <p className="text-xl text-green-600">
                                Gói dịch vụ đã được kích hoạt cho xe của bạn
                            </p>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
                            <h1 className="text-4xl font-bold text-red-800 mb-2">
                                Thanh toán thất bại
                            </h1>
                            <p className="text-xl text-red-600">
                                {paymentData?.message || 'Có lỗi xảy ra trong quá trình thanh toán'}
                            </p>
                        </>
                    )}
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Payment Info */}
                    <Card className="border-2 border-primary/20 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                            <CardTitle className="flex items-center text-xl">
                                <CreditCard className="mr-3 h-5 w-5 text-primary" />
                                Thông tin thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mã đơn hàng:</span>
                                <span className="font-mono text-sm">{paymentData?.orderId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Số tiền:</span>
                                <span className="font-semibold text-lg">
                                    {formatPrice(paymentData?.amount || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Trạng thái:</span>
                                <Badge className={isSuccess ? 'bg-green-500' : 'bg-red-500'}>
                                    {isSuccess ? 'Thành công' : 'Thất bại'}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Thời gian:</span>
                                <span className="text-sm">
                                    {new Date().toLocaleString('vi-VN')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Info */}
                    <Card className="border-2 border-blue-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
                            <CardTitle className="flex items-center text-xl">
                                <Package className="mr-3 h-5 w-5 text-blue-600" />
                                Thông tin dịch vụ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mã hóa đơn:</span>
                                <span className="font-mono text-sm">{paymentData?.invoiceId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mã gói:</span>
                                <span className="font-mono text-sm">{paymentData?.planId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mã xe:</span>
                                <span className="font-mono text-sm">{paymentData?.vehicleId || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Success Message */}
                {isSuccess && (
                    <Card className="border-2 border-green-200 bg-green-50/50 mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-green-800 mb-2">
                                        Gói dịch vụ đã được kích hoạt
                                    </h3>
                                    <ul className="space-y-1 text-sm text-green-700">
                                        <li>• Gói dịch vụ đổi pin đã được kích hoạt cho xe của bạn</li>
                                        <li>• Bạn có thể bắt đầu sử dụng dịch vụ ngay lập tức</li>
                                        <li>• Hóa đơn điện tử sẽ được gửi qua email</li>
                                        <li>• Thông tin chi tiết có thể xem tại Dashboard</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Failure Message */}
                {isFailure && (
                    <Card className="border-2 border-red-200 bg-red-50/50 mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-red-800 mb-2">
                                        Thanh toán không thành công
                                    </h3>
                                    <ul className="space-y-1 text-sm text-red-700">
                                        <li>• Giao dịch đã bị hủy hoặc thất bại</li>
                                        <li>• Số tiền chưa được trừ khỏi tài khoản</li>
                                        <li>• Bạn có thể thử thanh toán lại</li>
                                        <li>• Liên hệ hỗ trợ nếu vấn đề tiếp tục</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {isSuccess ? (
                        <>
                            <Button
                                onClick={handleContinue}
                                size="lg"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Về Dashboard
                            </Button>
                            <Button
                                onClick={handleBackToServices}
                                variant="outline"
                                size="lg"
                            >
                                <Package className="mr-2 h-5 w-5" />
                                Xem thêm gói dịch vụ
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleBackToServices}
                                size="lg"
                                className="bg-primary hover:bg-primary/90"
                            >
                                <ArrowLeft className="mr-2 h-5 w-5" />
                                Thử lại thanh toán
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="outline"
                                size="lg"
                            >
                                <Motorbike className="mr-2 h-5 w-5" />
                                Về Dashboard
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
