import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Keyboard, Camera, AlertCircle, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';

const QRScanner = ({ onScan, onManualEntry }) => {
    const [manualMode, setManualMode] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const [scanning, setScanning] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);

    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    // Get available cameras on mount
    useEffect(() => {
        Html5Qrcode.getCameras()
            .then(devices => {
                if (devices && devices.length) {
                    setCameras(devices);
                    // Prefer back camera for kiosk (usually has better quality)
                    const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
                    setSelectedCamera(backCamera.id);
                }
            })
            .catch(err => {
                console.error('Error getting cameras:', err);
                setCameraError('Không tìm thấy camera. Vui lòng kiểm tra kết nối camera.');
            });
    }, []);

    // Start camera scanning
    const handleStartScan = async () => {
        if (!selectedCamera) {
            setCameraError('Không tìm thấy camera khả dụng.');
            return;
        }

        setScanning(true);
        setCameraError(null);

        // Wait for DOM to update before initializing scanner
        setTimeout(async () => {
            try {
                // Check if element exists
                const element = document.getElementById("qr-reader");
                if (!element) {
                    throw new Error('QR reader element not found');
                }

                html5QrCodeRef.current = new Html5Qrcode("qr-reader");

                await html5QrCodeRef.current.start(
                    selectedCamera,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        // Successfully scanned QR code
                        console.log('QR Code detected:', decodedText);
                        handleStopScan();
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // Scanning error (this fires frequently, so we don't show it)
                        // Only log in development
                        // console.log('Scanning...', errorMessage);
                    }
                );
            } catch (err) {
                console.error('Error starting scanner:', err);
                setCameraError(`Không thể khởi động camera: ${err.message || 'Vui lòng cho phép truy cập camera.'}`);
                setScanning(false);
            }
        }, 100); // Small delay to ensure DOM is ready
    };

    // Stop camera scanning
    const handleStopScan = () => {
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop()
                .then(() => {
                    try {
                        html5QrCodeRef.current.clear();
                    } catch (err) {
                        console.log('Error clearing scanner:', err);
                    }
                    html5QrCodeRef.current = null;
                    setScanning(false);
                })
                .catch(err => {
                    console.error('Error stopping scanner:', err);
                    html5QrCodeRef.current = null;
                    setScanning(false);
                });
        } else {
            setScanning(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(err => console.error(err));
            }
        };
    }, []);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (bookingId.trim()) {
            onManualEntry(bookingId.trim());
        }
    };

    return (
        <div className="space-y-8">
            {!manualMode ? (
                // QR Scanner Mode
                <Card className="border-4 border-dashed border-primary">
                    <CardContent className="p-12">
                        <div className="flex flex-col items-center space-y-8">
                            {/* Camera Error */}
                            {cameraError && (
                                <div className="w-full p-6 bg-red-50 border-2 border-red-300 rounded-xl">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-xl font-semibold text-red-800">Lỗi Camera</p>
                                            <p className="text-lg text-red-600">{cameraError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Camera View */}
                            <div className="relative w-full max-w-md">
                                <div className="relative">
                                    {/* Camera feed container - Always render for scanner to attach to */}
                                    <div
                                        id="qr-reader"
                                        ref={scannerRef}
                                        className={`w-full rounded-2xl overflow-hidden ${scanning
                                            ? 'border-4 border-primary min-h-[400px]'
                                            : 'border-4 border-gray-300 aspect-square flex items-center justify-center bg-gray-50'
                                            }`}
                                    >
                                        {!scanning && (
                                            <div className="text-center">
                                                <Camera className="h-32 w-32 text-gray-400 mx-auto mb-4" />
                                                <p className="text-xl text-gray-500">Camera chưa được kích hoạt</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stop button overlay */}
                                    {scanning && (
                                        <Button
                                            variant="destructive"
                                            size="lg"
                                            onClick={handleStopScan}
                                            className="absolute top-4 right-4 text-lg px-6 py-3 z-10"
                                        >
                                            <X className="mr-2 h-5 w-5" />
                                            Dừng
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="text-center space-y-4">
                                <h3 className="text-3xl font-bold">
                                    {scanning ? 'Đang quét mã QR...' : 'Quét mã QR code'}
                                </h3>
                                <p className="text-xl text-muted-foreground max-w-md">
                                    {scanning
                                        ? 'Đưa mã QR vào khung hình để quét'
                                        : 'Nhấn nút bên dưới để bật camera'
                                    }
                                </p>
                            </div>

                            {/* Start/Stop Button */}
                            {!scanning && (
                                <Button
                                    size="lg"
                                    onClick={handleStartScan}
                                    disabled={!selectedCamera || scanning}
                                    className="text-xl px-12 py-8 h-auto"
                                >
                                    <Camera className="mr-3 h-6 w-6" />
                                    Bật Camera
                                </Button>
                            )}

                            {/* Camera Selection (if multiple cameras) */}
                            {cameras.length > 1 && !scanning && (
                                <div className="w-full max-w-md">
                                    <label className="block text-lg font-medium mb-2">Chọn Camera:</label>
                                    <select
                                        value={selectedCamera || ''}
                                        onChange={(e) => setSelectedCamera(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg"
                                    >
                                        {cameras.map((camera) => (
                                            <option key={camera.id} value={camera.id}>
                                                {camera.label || `Camera ${camera.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Manual Entry Option */}
                            <div className="pt-8 border-t w-full">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => {
                                        if (scanning) handleStopScan();
                                        setManualMode(true);
                                    }}
                                    className="w-full text-xl px-8 py-6 h-auto"
                                >
                                    <Keyboard className="mr-3 h-6 w-6" />
                                    Nhập mã thủ công
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                // Manual Entry Mode
                <Card>
                    <CardContent className="p-12">
                        <div className="space-y-8">
                            <div className="text-center">
                                <Keyboard className="h-24 w-24 text-primary mx-auto mb-4" />
                                <h3 className="text-3xl font-bold mb-2">Nhập mã code</h3>
                                <p className="text-xl text-muted-foreground">
                                    Nhập mã từ app của bạn
                                </p>
                            </div>

                            <form onSubmit={handleManualSubmit} className="space-y-6">
                                <div>
                                    <Input
                                        type="text"
                                        placeholder="VD: BK123456789"
                                        value={bookingId}
                                        onChange={(e) => setBookingId(e.target.value.toUpperCase())}
                                        className="text-3xl text-center py-8 h-auto tracking-wider"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        onClick={() => {
                                            setManualMode(false);
                                            setBookingId('');
                                        }}
                                        className="flex-1 text-xl px-8 py-6 h-auto"
                                    >
                                        Quay lại
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={!bookingId.trim()}
                                        className="flex-1 text-xl px-8 py-6 h-auto"
                                    >
                                        Xác nhận
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default QRScanner;

