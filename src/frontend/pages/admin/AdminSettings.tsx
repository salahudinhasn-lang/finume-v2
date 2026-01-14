
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button } from '../../components/UI';
import { Settings, Save, Lock, User, CheckCircle, AlertCircle } from 'lucide-react';

const AdminSettings = () => {
    const { user, updateAdmin, t } = useAppContext();
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('SAVING');
        setErrorMsg('');

        if (password && password !== confirmPassword) {
            setErrorMsg(t('auth.passwordsDoNotMatch') || 'Passwords do not match');
            setStatus('ERROR');
            return;
        }

        if (password && password.length < 6) {
            setErrorMsg('Password must be at least 6 characters');
            setStatus('ERROR');
            return;
        }

        try {
            if (user?.id) {
                const updates: any = { name };
                if (password) {
                    updates.password = password;
                }

                await updateAdmin(user.id, updates);
                setStatus('SUCCESS');
                setPassword('');
                setConfirmPassword('');

                // Reset success message after 3 seconds
                setTimeout(() => setStatus('IDLE'), 3000);
            }
        } catch (e) {
            console.error(e);
            setStatus('ERROR');
            setErrorMsg('Failed to update settings');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                    <Settings size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your account preferences and security.</p>
                </div>
            </div>

            <Card className="border border-gray-100 shadow-xl bg-white/80 backdrop-blur-xl relative overflow-hidden max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <User size={16} className="text-blue-500" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <hr className="border-gray-100" />

                    {/* Password Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock size={20} className="text-orange-500" />
                            Change Password
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                                    placeholder="Leave empty to keep current"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    {status === 'ERROR' && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-bold animate-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            {errorMsg || 'An error occurred. Please try again.'}
                        </div>
                    )}

                    {status === 'SUCCESS' && (
                        <div className="p-4 bg-green-50 text-green-600 rounded-xl flex items-center gap-2 text-sm font-bold animate-in slide-in-from-top-2">
                            <CheckCircle size={18} />
                            Settings updated successfully!
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={status === 'SAVING'}
                            className="w-full py-4 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 rounded-xl"
                        >
                            {status === 'SAVING' ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save size={20} />
                                    Save Changes
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AdminSettings;
