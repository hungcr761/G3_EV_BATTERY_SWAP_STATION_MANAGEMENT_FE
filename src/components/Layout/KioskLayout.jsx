import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { Battery, Home, MapPin } from 'lucide-react';
import { stationAPI } from '../../lib/apiServices';

const KioskLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { stationId } = useParams();
    const [idleTime, setIdleTime] = useState(0);
    const [stationInfo, setStationInfo] = useState(null);
    const [loadingStation, setLoadingStation] = useState(true);
    const IDLE_TIMEOUT = 120000; // 2 minutes in milliseconds

    // Fetch station information
    useEffect(() => {
        const fetchStation = async () => {
            if (!stationId) return;

            setLoadingStation(true);
            try {
                const response = await stationAPI.getById(stationId);
                if (response.data && response.data.success) {
                    const station = response.data.payload.station;
                    setStationInfo({
                        id: station.station_id,
                        name: station.station_name,
                        address: station.address,
                        status: station.status
                    });
                }
            } catch (error) {
                console.error('Error fetching station:', error);
                setStationInfo({
                    id: stationId,
                    name: `Trạm #${stationId}`,
                    address: 'Đang tải...',
                    status: 'operational'
                });
            } finally {
                setLoadingStation(false);
            }
        };

        fetchStation();
    }, [stationId]);

    // Auto-idle timeout - reset to home if inactive
    useEffect(() => {
        let idleTimer;
        let idleCounter = 0;

        const resetIdleTimer = () => {
            idleCounter = 0;
            setIdleTime(0);
        };

        const checkIdle = () => {
            idleCounter += 1000;
            setIdleTime(idleCounter);

            if (idleCounter >= IDLE_TIMEOUT && stationId) {
                // Only auto-reset if not on home page and not actively swapping
                const isHomePage = location.pathname === `/kiosk/${stationId}`;
                const isSwapping = location.pathname.includes('/swap/');

                if (!isHomePage && !isSwapping) {
                    navigate(`/kiosk/${stationId}`);
                }
            }
        };

        // Set up idle checker
        idleTimer = setInterval(checkIdle, 1000);

        // Reset idle on user interaction
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetIdleTimer, true);
        });

        return () => {
            clearInterval(idleTimer);
            events.forEach(event => {
                document.removeEventListener(event, resetIdleTimer, true);
            });
        };
    }, [navigate, location]);

    const handleHomeClick = () => {
        if (stationId) {
            navigate(`/kiosk/${stationId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col overflow-hidden">
            {/* Kiosk Header - Fixed */}
            <header className="bg-white shadow-md border-b-4 border-primary">
                <div className="container mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Battery className="h-12 w-12 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold text-primary">
                                    {loadingStation ? 'Đang tải...' : stationInfo?.name || 'G3 Battery Swap Station'}
                                </h1>
                                <div className="flex items-center space-x-2">
                                    {stationInfo?.address && (
                                        <>
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-lg text-muted-foreground">
                                                {stationInfo.address}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {stationId && location.pathname !== `/kiosk/${stationId}` && (
                            <button
                                onClick={handleHomeClick}
                                className="flex items-center space-x-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                <Home className="h-6 w-6" />
                                <span className="text-xl font-medium">Trang chủ</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content - Fullscreen */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

            {/* Footer - Fixed */}
            <footer className="bg-white border-t py-4">
                <div className="container mx-auto px-8">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>© 2025 G3 Battery Swap Station. All rights reserved.</p>
                        <p>Cần trợ giúp? Gọi: 1900-XXXX</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default KioskLayout;

