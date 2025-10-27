import { useState } from 'react';
import { useNavigate } from 'react-router';
import { vehicleAPI } from '@/lib/apiServices';

/**
 * Custom hook để quản lý logic subscription
 * Tách riêng business logic ra khỏi UI component
 */
export default function useServiceSubscription() {
    const navigate = useNavigate();
    const [showVehicleDialog, setShowVehicleDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [vehiclesWithoutPlan, setVehiclesWithoutPlan] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Format Price Number
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Format percent values
    const formatPercent = (value) => {
        const num = Number(value) || 0;
        const percent = num * 100;
        const maximumFractionDigits = Number.isInteger(percent) ? 0 : 2;
        return new Intl.NumberFormat('vi-VN', { maximumFractionDigits }).format(percent);
    };

    // Fetch vehicles without subscription plan
    const fetchVehiclesWithoutPlan = async () => {
        setLoadingVehicles(true);
        try {
            const response = await vehicleAPI.getWithoutSubscription();
            const vehiclesWithout = response.data?.payload?.vehicles || [];
            setVehiclesWithoutPlan(vehiclesWithout);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            alert(err.response?.data?.message || 'Failed to load vehicle list');
        } finally {
            setLoadingVehicles(false);
        }
    };

    // Handle select subscription plan
    const handleSelectSubscription = async (plan) => {
        console.log('Selected plan: ', plan);
        setSelectedPlan(plan);
        setShowVehicleDialog(true);
        await fetchVehiclesWithoutPlan();
    };

    // Handle subscribe - navigate to payment
    const handleSubscribe = () => {
        if (!selectedVehicle || !selectedPlan) return;

        // Store in localStorage for retry scenarios
        localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
        localStorage.setItem('selectedVehicle', JSON.stringify(selectedVehicle));

        // Navigate to payment page
        navigate('/payment', {
            state: {
                plan: selectedPlan,
                vehicle: selectedVehicle
            }
        });
    };

    // Handle cancel dialog
    const handleCancelDialog = () => {
        setShowVehicleDialog(false);
        setSelectedVehicle(null);
    };

    return {
        // State
        showVehicleDialog,
        selectedPlan,
        vehiclesWithoutPlan,
        loadingVehicles,
        selectedVehicle,
        
        // Setters
        setShowVehicleDialog,
        setSelectedVehicle,
        
        // Methods
        formatPrice,
        formatPercent,
        handleSelectSubscription,
        handleSubscribe,
        handleCancelDialog
    };
}
