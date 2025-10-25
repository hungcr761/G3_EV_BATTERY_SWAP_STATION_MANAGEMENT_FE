import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { User, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { userAPI, vehicleAPI } from '../../lib/apiServices';

const UserVerification = () => {
    const { stationId, userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState(null);
    const [userVehicles, setUserVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get user data from location state or fetch from API
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (location.state?.user) {
                    setUserData(location.state.user);
                } else {
                    const response = await userAPI.getById(userId);
                    if (response.data && response.data.success) {
                        setUserData(response.data.payload.user);
                    } else {
                        setError('Không tìm thấy thông tin người dùng');
                        return;
                    }
                }

                // Fetch user's vehicles
                const vehiclesResponse = await vehicleAPI.getAll();
                if (vehiclesResponse.data && vehiclesResponse.data.vehicles) {
                    setUserVehicles(vehiclesResponse.data.vehicles);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Không thể tải thông tin người dùng');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, location.state]);

    const handleContinue = () => {
        if (userVehicles.length === 0) {
            setError('Bạn chưa có xe nào. Vui lòng thêm xe trong ứng dụng trước khi sử dụng dịch vụ.');
            return;
        }
        navigate(`/kiosk/${stationId}/user/${userId}/vehicle`);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-8 py-12">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto mb-6"></div>
                        <p className="text-2xl text-muted-foreground">Đang tải thông tin...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-8 py-12">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-red-300 bg-red-50">
                        <CardContent className="p-8">
                            <div className="flex items-start space-x-4">
                                <AlertCircle className="h-12 w-12 text-red-600 flex-shrink-0" />
                                <div>
                                    <h3 className="text-2xl font-bold text-red-800 mb-2">Lỗi xác thực</h3>
                                    <p className="text-xl text-red-600">{error}</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(`/kiosk/${stationId}`)}
                                        className="mt-4"
                                    >
                                        Quay lại
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-8 py-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Success Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
                        <CheckCircle2 className="h-16 w-16 text-green-600" />
                    </div>
                    <h1 className="text-5xl font-bold text-green-600">
                        Xác thực thành công!
                    </h1>
                    <p className="text-2xl text-muted-foreground">
                        Chào mừng bạn đến với dịch vụ đổi pin
                    </p>
                </div>

                {/* User Info Card */}
                <Card className="border-4 border-green-500 shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardTitle className="text-3xl">Thông tin tài khoản</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <User className="h-16 w-16 text-primary" />
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold mb-2">
                                    {userData?.fullname || 'Khách hàng'}
                                </h2>
                                <p className="text-xl text-muted-foreground mb-1">
                                    {userData?.email || 'N/A'}
                                </p>
                                <p className="text-lg text-muted-foreground">
                                    {userData?.phone_number || 'N/A'}
                                </p>
                            </div>
                            <Badge variant="secondary" className="text-xl px-6 py-3 bg-green-100 text-green-800">
                                Đã xác thực
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Count Info */}
                <Card>
                    <CardContent className="p-8">
                        <div className="text-center space-y-4">
                            <h3 className="text-3xl font-bold">Xe của bạn</h3>
                            <div className="text-6xl font-bold text-primary">
                                {userVehicles.length}
                            </div>
                            <p className="text-2xl text-muted-foreground">
                                {userVehicles.length === 0
                                    ? 'Chưa có xe nào'
                                    : userVehicles.length === 1
                                        ? 'xe đã đăng ký'
                                        : 'xe đã đăng ký'
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Continue Button */}
                <div className="text-center">
                    <Button
                        size="lg"
                        onClick={handleContinue}
                        disabled={userVehicles.length === 0}
                        className="text-3xl px-16 py-12 h-auto"
                    >
                        <ArrowRight className="mr-4 h-8 w-8" />
                        Tiếp tục chọn xe
                    </Button>
                </div>

                {/* Help Text */}
                {userVehicles.length === 0 && (
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                                <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-yellow-800 mb-2">
                                        Chưa có xe
                                    </h3>
                                    <p className="text-lg text-yellow-700">
                                        Vui lòng thêm xe trong ứng dụng trước khi sử dụng dịch vụ đổi pin.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default UserVerification;
