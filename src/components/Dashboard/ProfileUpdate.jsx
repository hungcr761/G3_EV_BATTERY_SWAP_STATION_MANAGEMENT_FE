import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../hooks/useAuth';
import { userAPI } from '../../lib/apiServices';
import { profileUpdateSchema } from '../../lib/validations';
import { ArrowLeft, Save, User, Mail, Phone, Camera, AlertCircle, CheckCircle, CreditCard, Motorbike, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

const ProfileUpdate = ({ onBack }) => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [errors, setErrors] = useState({});
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [formData, setFormData] = useState({
        fullname: user?.fullname || '',
        email: user?.email || '',
        phone: user?.phone_number || user?.phone || '',
        citizen_id: user?.citizen_id || '',
        driving_license: user?.driving_license || ''
    });

    // Generate QR code for account_id
    useEffect(() => {
        const generateQR = async () => {
            if (user?.account_id) {
                try {
                    const qrData = await QRCode.toDataURL(user.account_id, {
                        errorCorrectionLevel: 'H',
                        type: 'image/png',
                        quality: 0.92,
                        margin: 1,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        },
                        width: 300
                    });
                    setQrCodeDataUrl(qrData);
                } catch (err) {
                    console.error('Error generating QR code:', err);
                }
            }
        };
        generateQR();
    }, [user?.account_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear message and errors when user starts typing
        if (message.text) {
            setMessage({ type: '', text: '' });
        }
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setErrors({});

        try {
            // Check if user has account_id
            if (!user?.account_id) {
                setMessage({
                    type: 'error',
                    text: 'Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.'
                });
                return;
            }

            // Validate form data
            const validatedData = profileUpdateSchema.parse(formData);

            const response = await userAPI.updateProfile(user.account_id, validatedData);

            if (response.data.success || response.data.account) {
                // Update user in AuthContext - response format: account hoặc payload.account
                const updatedAccount = response.data.account || response.data.payload?.account;
                if (updateUser && updatedAccount) {
                    updateUser(updatedAccount);
                }

                setMessage({
                    type: 'success',
                    text: 'Cập nhật thông tin thành công!'
                });

                // Auto close message after 3 seconds
                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            }
        } catch (error) {
            if (error.name === 'ZodError') {
                // Handle validation errors
                const fieldErrors = {};
                error.errors.forEach((err) => {
                    fieldErrors[err.path[0]] = err.message;
                });
                setErrors(fieldErrors);
                setMessage({
                    type: 'error',
                    text: 'Vui lòng kiểm tra lại thông tin nhập vào'
                });
            } else {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // In real app, you would upload to server
            // For now, just use a placeholder
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    avatar: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="mb-6 hover:bg-white/60 transition-all duration-200"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại Dashboard
                    </Button>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Cập nhật thông tin cá nhân
                                </h1>
                                <p className="text-slate-600 mt-1 text-lg">
                                    Quản lý thông tin tài khoản của bạn
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Message */}
                {message.text && (
                    <div
                        className={`mb-8 p-5 rounded-xl flex items-start space-x-4 backdrop-blur-sm border shadow-md transition-all duration-300 animate-in slide-in-from-top ${
                            message.type === 'success'
                                ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200 shadow-emerald-100'
                                : 'bg-red-50/90 text-red-900 border-red-200 shadow-red-100'
                        }`}
                    >
                        <div className={`p-2 rounded-lg ${
                            message.type === 'success' 
                                ? 'bg-emerald-100' 
                                : 'bg-red-100'
                        }`}>
                            {message.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            )}
                        </div>
                        <p className="font-medium">{message.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Profile Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-slate-200/60 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-slate-800">Thông tin cá nhân</CardTitle>
                                <CardDescription className="text-slate-600">
                                    Cập nhật thông tin cá nhân của bạn
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="fullname">
                                            Họ và tên <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="fullname"
                                                name="fullname"
                                                type="text"
                                                value={formData.fullname}
                                                onChange={handleChange}
                                                placeholder="Nhập họ và tên"
                                                className={`pl-10 ${errors.fullname ? 'border-red-500' : ''}`}
                                                required
                                            />
                                        </div>
                                        {errors.fullname && (
                                            <p className="text-sm text-red-600">{errors.fullname}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="email@example.com"
                                                className="pl-10"
                                                required
                                                disabled
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Email không thể thay đổi
                                        </p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            Số điện thoại
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="0123456789"
                                                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>

                                    {/* Citizen ID */}
                                    <div className="space-y-2">
                                        <Label htmlFor="citizen_id">
                                            Căn cước công dân <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="citizen_id"
                                                name="citizen_id"
                                                type="text"
                                                value={formData.citizen_id}
                                                onChange={handleChange}
                                                placeholder="123456789012"
                                                maxLength={12}
                                                className={`pl-10 ${errors.citizen_id ? 'border-red-500' : ''}`}
                                                required
                                            />
                                        </div>
                                        {errors.citizen_id && (
                                            <p className="text-sm text-red-600">{errors.citizen_id}</p>
                                        )}
                                    </div>

                                    {/* Driving License */}
                                    <div className="space-y-2">
                                        <Label htmlFor="driving_license">
                                            Bằng lái xe <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Motorbike className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="driving_license"
                                                name="driving_license"
                                                type="text"
                                                value={formData.driving_license}
                                                onChange={handleChange}
                                                placeholder="123456789012"
                                                maxLength={12}
                                                className={`pl-10 ${errors.driving_license ? 'border-red-500' : ''}`}
                                                required
                                            />
                                        </div>
                                        {errors.driving_license && (
                                            <p className="text-sm text-red-600">{errors.driving_license}</p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-4 pt-6 border-t border-slate-200">
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Lưu thay đổi
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={onBack}
                                            className="border-slate-300 hover:bg-slate-50"
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* QR Code Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-8 border-slate-200/60 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                        <QrCode className="h-5 w-5 text-white" />
                                    </div>
                                    Mã QR cá nhân
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Quét mã tại trạm để đổi pin
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center space-y-6">
                                {qrCodeDataUrl ? (
                                    <>
                                        <div className="p-5 bg-white rounded-xl border-2 border-slate-300 shadow-lg">
                                            <img
                                                src={qrCodeDataUrl}
                                                alt="Account QR Code"
                                                className="w-full h-auto"
                                            />
                                        </div>
                                        <div className="text-center space-y-2 w-full">
                                            <p className="text-sm font-semibold text-slate-700">
                                                Mã tài khoản:
                                            </p>
                                            <p className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 break-all">
                                                {user?.account_id}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg mb-4">
                                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                                            </div>
                                            <p className="text-sm text-slate-600">Đang tải mã QR...</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileUpdate;

