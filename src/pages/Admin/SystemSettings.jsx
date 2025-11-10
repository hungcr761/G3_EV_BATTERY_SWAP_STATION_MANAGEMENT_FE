import React, { useState, useEffect } from 'react';
import {
    Save,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    RotateCcw
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { configAPI } from '../../lib/apiServices';

// List of numeric fields that should always be numbers
const numericFields = [
    'booking_expired_interval',
    'soc_available_threshole',
    'soh_maintenance_threshole',
    'allowed_empty_slot',
    'soh_available_threshole'
];

// Normalize settings data to ensure numeric fields are numbers
const normalizeSettings = (data) => {
    if (!data || typeof data !== 'object') return data;

    const normalized = { ...data };
    numericFields.forEach(field => {
        if (normalized[field] !== undefined && normalized[field] !== null) {
            const numValue = Number(normalized[field]);
            if (!isNaN(numValue)) {
                normalized[field] = numValue;
            }
        }
    });
    return normalized;
};

const SystemSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [settings, setSettings] = useState({
        booking_expired_interval: 30,
        soc_available_threshole: 20,
        soh_maintenance_threshole: 70,
        allowed_empty_slot: 5,
        soh_available_threshole: 90
    });

    const [hasChanges, setHasChanges] = useState(false);

    // Fetch settings from API on mount
    const fetchSettings = async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError(null);
            const response = await configAPI.get();
            if (response.data && typeof response.data === 'object') {
                // Normalize the response data - handle both response.data and response.data.data
                const apiData = response.data.data || response.data;
                const normalizedSettings = normalizeSettings(apiData);
                setSettings(normalizedSettings);
                setHasChanges(false);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            // Don't show error if it's a 404 (endpoint might not exist yet)
            if (err.response?.status !== 404) {
                setError(err.response?.data?.message || 'Failed to load settings. Using default values.');
            }
            // Continue with default values if API fails
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSettingChange = (key, value) => {
        setSettings(prev => {
            const updated = {
                ...prev,
                [key]: value
            };
            // Ensure all numeric fields remain numbers after update
            return normalizeSettings(updated);
        });
        setHasChanges(true);
    };

    const handleNumberChange = (key, value, parseFn = parseInt) => {
        // Handle empty string - set to 0 for system settings
        if (value === '' || value === null || value === undefined) {
            handleSettingChange(key, 0);
            return;
        }
        const numValue = parseFn(value);
        if (!isNaN(numValue)) {
            handleSettingChange(key, numValue);
        }
        // If NaN, don't update (invalid input) - keep current value
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);
            // Ensure settings are normalized before saving
            const normalizedSettings = normalizeSettings(settings);
            await configAPI.update(normalizedSettings);
            setHasChanges(false);
            setSuccessMessage('Settings saved successfully!');
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
            return;
        }

        try {
            setResetting(true);
            setError(null);
            setSuccessMessage(null);
            await configAPI.reset();
            // After reset, fetch the new settings (don't show loading spinner)
            await fetchSettings(false);
            setSuccessMessage('Settings reset to default values successfully!');
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error resetting settings:', err);
            setError(err.response?.data?.message || 'Failed to reset settings');
        } finally {
            setResetting(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2 text-gray-600">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Loading settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                    <p className="mt-2 text-gray-600">Configure system-wide settings and preferences</p>
                </div>
                <div className="flex gap-2">
                    {hasChanges && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Unsaved Changes
                        </Badge>
                    )}
                    {successMessage && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3" />
                            {successMessage}
                        </Badge>
                    )}
                    <Button
                        onClick={handleReset}
                        disabled={resetting || saving}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {resetting ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            <>
                                <RotateCcw className="h-4 w-4" />
                                Reset to Default
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || saving || resetting}
                        className="flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Settings Form */}
            <Card className="p-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Booking Expired Interval */}
                        <div>
                            <Label htmlFor="booking_expired_interval">Booking Expired Interval (minutes)</Label>
                            <Input
                                id="booking_expired_interval"
                                type="number"
                                value={settings.booking_expired_interval ?? ''}
                                onChange={(e) => handleNumberChange('booking_expired_interval', e.target.value, parseInt)}
                                className="mt-1"
                            />
                            <p className="text-sm text-gray-500 mt-1">Total active booking time from created to expired</p>
                        </div>

                        {/* Allowed Empty Slots */}
                        <div>
                            <Label htmlFor="allowed_empty_slot">Allowed Empty Slots</Label>
                            <Input
                                id="allowed_empty_slot"
                                type="number"
                                value={settings.allowed_empty_slot ?? ''}
                                onChange={(e) => handleNumberChange('allowed_empty_slot', e.target.value, parseInt)}
                                className="mt-1"
                            />
                            <p className="text-sm text-gray-500 mt-1">Minimum empty slots a station must have</p>
                        </div>

                        {/* SOC Available threshole */}
                        <div>
                            <Label htmlFor="soc_available_threshole">SOC Available threshole (%)</Label>
                            <Input
                                id="soc_available_threshole"
                                type="number"
                                value={settings.soc_available_threshole ?? ''}
                                onChange={(e) => handleNumberChange('soc_available_threshole', e.target.value, parseInt)}
                                className="mt-1"
                            />
                            <p className="text-sm text-gray-500 mt-1">Minimum SOC % for battery to be eligible for swap and booking</p>
                        </div>

                        {/* SOH Maintenance threshole */}
                        <div>
                            <Label htmlFor="soh_maintenance_threshole">SOH Maintenance threshole (%)</Label>
                            <Input
                                id="soh_maintenance_threshole"
                                type="number"
                                value={settings.soh_maintenance_threshole ?? ''}
                                onChange={(e) => handleNumberChange('soh_maintenance_threshole', e.target.value, parseInt)}
                                className="mt-1"
                            />
                            <p className="text-sm text-gray-500 mt-1">SOH % threshole that changes battery status to maintenance</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SystemSettings;

