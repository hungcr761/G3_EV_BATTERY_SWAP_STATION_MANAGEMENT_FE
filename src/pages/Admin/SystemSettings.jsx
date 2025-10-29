import React, { useState } from 'react';
import {
    Settings,
    Save,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Bell,
    Shield,
    Database,
    Globe,
    Zap,
    Users,
    Battery,
    MapPin,
    DollarSign,
    Clock
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

const SystemSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        // General Settings
        systemName: 'EV Battery Swap Management System',
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'en',
        currency: 'VND',
        dateFormat: 'DD/MM/YYYY',

        // Notification Settings
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        maintenanceAlerts: true,
        lowBatteryAlerts: true,
        systemAlerts: true,

        // Security Settings
        sessionTimeout: 30,
        passwordPolicy: 'strong',
        twoFactorAuth: true,
        ipWhitelist: '',
        auditLogging: true,

        // Battery Settings
        maxChargeCycles: 1000,
        lowBatteryThreshold: 20,
        maintenanceThreshold: 80,
        temperatureThreshold: 40,
        chargingPower: 7.2,

        // Station Settings
        maxBatteryCapacity: 50,
        swapTimeout: 300,
        maintenanceMode: false,
        autoMaintenance: true,

        // Payment Settings
        paymentGateway: 'stripe',
        currencySymbol: '₫',
        taxRate: 10,
        subscriptionFee: 50000,
        swapFee: 5000,

        // AI Settings
        aiEnabled: true,
        demandForecasting: true,
        maintenancePrediction: true,
        batteryOptimization: true,
        aiConfidenceThreshold: 80
    });

    const [hasChanges, setHasChanges] = useState(false);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        // Here you would typically save to API
        console.log('Saving settings:', settings);
        setHasChanges(false);
        // Show success message
    };

    const tabs = [
        { id: 'general', name: 'General', icon: Settings },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'battery', name: 'Battery', icon: Battery },
        { id: 'station', name: 'Station', icon: MapPin },
        { id: 'payment', name: 'Payment', icon: DollarSign },
        { id: 'ai', name: 'AI Settings', icon: Zap }
    ];

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="systemName">System Name</Label>
                    <Input
                        id="systemName"
                        value={settings.systemName}
                        onChange={(e) => handleSettingChange('systemName', e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                        id="timezone"
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                        <option value="Asia/Hanoi">Asia/Hanoi</option>
                        <option value="UTC">UTC</option>
                    </select>
                </div>
                <div>
                    <Label htmlFor="language">Language</Label>
                    <select
                        id="language"
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="en">English</option>
                        <option value="vi">Tiếng Việt</option>
                    </select>
                </div>
                <div>
                    <Label htmlFor="currency">Currency</Label>
                    <select
                        id="currency"
                        value={settings.currency}
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="VND">Vietnamese Dong (VND)</option>
                        <option value="USD">US Dollar (USD)</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="space-y-6">
            <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Notification Channels</h4>
                <div className="space-y-3">
                    {[
                        { key: 'emailNotifications', label: 'Email Notifications', description: 'Send notifications via email' },
                        { key: 'smsNotifications', label: 'SMS Notifications', description: 'Send notifications via SMS' },
                        { key: 'pushNotifications', label: 'Push Notifications', description: 'Send push notifications to mobile apps' }
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <h5 className="font-medium text-gray-900">{item.label}</h5>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings[item.key]}
                                    onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Alert Types</h4>
                <div className="space-y-3">
                    {[
                        { key: 'maintenanceAlerts', label: 'Maintenance Alerts', description: 'Notify when maintenance is required' },
                        { key: 'lowBatteryAlerts', label: 'Low Battery Alerts', description: 'Notify when battery stock is low' },
                        { key: 'systemAlerts', label: 'System Alerts', description: 'Notify about system issues and errors' }
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <h5 className="font-medium text-gray-900">{item.label}</h5>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings[item.key]}
                                    onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="passwordPolicy">Password Policy</Label>
                    <select
                        id="passwordPolicy"
                        value={settings.passwordPolicy}
                        onChange={(e) => handleSettingChange('passwordPolicy', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="basic">Basic</option>
                        <option value="strong">Strong</option>
                        <option value="very-strong">Very Strong</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                        <h5 className="font-medium text-gray-900">Two-Factor Authentication</h5>
                        <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.twoFactorAuth}
                            onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                        <h5 className="font-medium text-gray-900">Audit Logging</h5>
                        <p className="text-sm text-gray-500">Log all system activities and changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.auditLogging}
                            onChange={(e) => handleSettingChange('auditLogging', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            <div>
                <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                <Textarea
                    id="ipWhitelist"
                    value={settings.ipWhitelist}
                    onChange={(e) => handleSettingChange('ipWhitelist', e.target.value)}
                    placeholder="Enter IP addresses separated by commas"
                    className="mt-1"
                    rows={3}
                />
            </div>
        </div>
    );

    const renderBatterySettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="maxChargeCycles">Max Charge Cycles</Label>
                    <Input
                        id="maxChargeCycles"
                        type="number"
                        value={settings.maxChargeCycles}
                        onChange={(e) => handleSettingChange('maxChargeCycles', parseInt(e.target.value))}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="lowBatteryThreshold">Low Battery Threshold (%)</Label>
                    <Input
                        id="lowBatteryThreshold"
                        type="number"
                        value={settings.lowBatteryThreshold}
                        onChange={(e) => handleSettingChange('lowBatteryThreshold', parseInt(e.target.value))}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="maintenanceThreshold">Maintenance Threshold (%)</Label>
                    <Input
                        id="maintenanceThreshold"
                        type="number"
                        value={settings.maintenanceThreshold}
                        onChange={(e) => handleSettingChange('maintenanceThreshold', parseInt(e.target.value))}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="temperatureThreshold">Temperature Threshold (°C)</Label>
                    <Input
                        id="temperatureThreshold"
                        type="number"
                        value={settings.temperatureThreshold}
                        onChange={(e) => handleSettingChange('temperatureThreshold', parseInt(e.target.value))}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="chargingPower">Charging Power (kW)</Label>
                    <Input
                        id="chargingPower"
                        type="number"
                        step="0.1"
                        value={settings.chargingPower}
                        onChange={(e) => handleSettingChange('chargingPower', parseFloat(e.target.value))}
                        className="mt-1"
                    />
                </div>
            </div>
        </div>
    );

    const renderStationSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="maxBatteryCapacity">Max Battery Capacity per Station</Label>
                    <Input
                        id="maxBatteryCapacity"
                        type="number"
                        value={settings.maxBatteryCapacity}
                        onChange={(e) => handleSettingChange('maxBatteryCapacity', parseInt(e.target.value))}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="swapTimeout">Swap Timeout (seconds)</Label>
                    <Input
                        id="swapTimeout"
                        type="number"
                        value={settings.swapTimeout}
                        onChange={(e) => handleSettingChange('swapTimeout', parseInt(e.target.value))}
                        className="mt-1"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                        <h5 className="font-medium text-gray-900">Maintenance Mode</h5>
                        <p className="text-sm text-gray-500">Put all stations in maintenance mode</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                        <h5 className="font-medium text-gray-900">Auto Maintenance</h5>
                        <p className="text-sm text-gray-500">Automatically schedule maintenance based on usage</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoMaintenance}
                            onChange={(e) => handleSettingChange('autoMaintenance', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </div>
    );

    const renderPaymentSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="paymentGateway">Payment Gateway</Label>
                    <select
                        id="paymentGateway"
                        value={settings.paymentGateway}
                        onChange={(e) => handleSettingChange('paymentGateway', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                        <option value="vnpay">VNPay</option>
                    </select>
                </div>
                <div>
                    <Label htmlFor="currencySymbol">Currency Symbol</Label>
                    <Input
                        id="currencySymbol"
                        value={settings.currencySymbol}
                        onChange={(e) => handleSettingChange('currencySymbol', e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                        id="taxRate"
                        type="number"
                        step="0.1"
                        value={settings.taxRate}
                        onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="subscriptionFee">Subscription Fee (VND)</Label>
                    <Input
                        id="subscriptionFee"
                        type="number"
                        value={settings.subscriptionFee}
                        onChange={(e) => handleSettingChange('subscriptionFee', parseInt(e.target.value))}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="swapFee">Swap Fee (VND)</Label>
                    <Input
                        id="swapFee"
                        type="number"
                        value={settings.swapFee}
                        onChange={(e) => handleSettingChange('swapFee', parseInt(e.target.value))}
                        className="mt-1"
                    />
                </div>
            </div>
        </div>
    );

    const renderAISettings = () => (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                        <h5 className="font-medium text-gray-900">Enable AI Features</h5>
                        <p className="text-sm text-gray-500">Enable all AI-powered features and recommendations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.aiEnabled}
                            onChange={(e) => handleSettingChange('aiEnabled', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="space-y-3">
                    {[
                        { key: 'demandForecasting', label: 'Demand Forecasting', description: 'Predict battery swap demand patterns' },
                        { key: 'maintenancePrediction', label: 'Maintenance Prediction', description: 'Predict when maintenance is needed' },
                        { key: 'batteryOptimization', label: 'Battery Optimization', description: 'Optimize battery usage and charging' }
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <h5 className="font-medium text-gray-900">{item.label}</h5>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings[item.key]}
                                    onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <Label htmlFor="aiConfidenceThreshold">AI Confidence Threshold (%)</Label>
                <Input
                    id="aiConfidenceThreshold"
                    type="number"
                    value={settings.aiConfidenceThreshold}
                    onChange={(e) => handleSettingChange('aiConfidenceThreshold', parseInt(e.target.value))}
                    className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Only show AI recommendations above this confidence level</p>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general': return renderGeneralSettings();
            case 'notifications': return renderNotificationSettings();
            case 'security': return renderSecuritySettings();
            case 'battery': return renderBatterySettings();
            case 'station': return renderStationSettings();
            case 'payment': return renderPaymentSettings();
            case 'ai': return renderAISettings();
            default: return renderGeneralSettings();
        }
    };

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
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="p-4">
                        <nav className="space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </Card>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <Card className="p-6">
                        {renderTabContent()}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;

