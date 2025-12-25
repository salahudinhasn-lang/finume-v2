import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button } from '../../components/UI';
import { Eye, EyeOff, Shield, ShieldAlert, CheckCircle, Globe } from 'lucide-react';

const AdminSettingsPage = () => {
    const { settings, updateSettings, t } = useAppContext();
    const [successMsg, setSuccessMsg] = useState('');

    const handleToggle = (key: keyof typeof settings) => {
        updateSettings({ [key]: !settings[key] });
        setSuccessMsg('Settings updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
            </div>

            {successMsg && (
                <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
                    <CheckCircle className="mr-2" size={20} />
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                <Card className="p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <Globe size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Public Portal Visibility</h3>
                            <p className="text-slate-500 mb-6 text-sm">Control which sections of the platform are visible to non-logged-in visitors.</p>

                            <div className="space-y-6">
                                {/* Expert Directory Toggle */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${settings.showExpertsPage ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                            {settings.showExpertsPage ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700">Expert Directory</div>
                                            <div className="text-xs text-slate-400">/experts</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.showExpertsPage}
                                            onChange={() => handleToggle('showExpertsPage')}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* Services Catalog Toggle */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${settings.showServicesPage ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                            {settings.showServicesPage ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700">Services Catalog</div>
                                            <div className="text-xs text-slate-400">/services</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.showServicesPage}
                                            onChange={() => handleToggle('showServicesPage')}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border border-slate-200 shadow-sm opacity-60">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-600">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Emergency Controls</h3>
                            <p className="text-slate-500 mb-4 text-sm">System-wide locks. Use with caution.</p>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled>
                                Enable Maintenance Mode
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
