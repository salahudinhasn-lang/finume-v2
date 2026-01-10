
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button } from '../../components/UI';
import { User, Mail, DollarSign, Briefcase, Save, Eye, CheckCircle, Shield, FileText, Upload } from 'lucide-react';

const ExpertProfile = () => {
    const { user, updateExpert } = useAppContext();
    const [isPublic, setIsPublic] = useState(true);

    const [formData, setFormData] = React.useState(() => {
        const specs = (user as any)?.specializations;
        const safeSpecs = Array.isArray(specs) ? specs.join(', ') : (typeof specs === 'string' ? specs : '');

        return {
            name: user?.name || '',
            email: user?.email || '',
            bio: (user as any)?.bio || '',
            hourlyRate: (user as any)?.hourlyRate || 0,
            specializations: safeSpecs,
        };
    });

    // Update form data if user context changes (e.g. initial load from null/storage)
    React.useEffect(() => {
        if (user) {
            setFormData(prev => {
                // Only update if email changed to avoid wiping user edits
                if (prev.email !== user.email) {
                    const specs = (user as any)?.specializations;
                    const safeSpecs = Array.isArray(specs) ? specs.join(', ') : (typeof specs === 'string' ? specs : '');
                    return {
                        name: user.name || '',
                        email: user.email || '',
                        bio: (user as any).bio || '',
                        hourlyRate: (user as any).hourlyRate || 0,
                        specializations: safeSpecs,
                    };
                }
                return prev;
            });
            setAvatarPreview(user.avatarUrl);
        }
    }, [user]);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                // In a real app, you would upload the file here
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            updateExpert(user.id, {
                name: formData.name,
                // @ts-ignore
                bio: formData.bio,
                // @ts-ignore
                hourlyRate: parseFloat(formData.hourlyRate as any),
                specializations: formData.specializations.split(',').map((s: string) => s.trim()).filter(Boolean)
            });
            alert('Profile updated successfully.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Profile & Settings</h1>
                    <p className="text-gray-500">Manage how you appear to clients in the marketplace.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 font-medium">Public Visibility</span>
                    <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${isPublic ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}
                    >
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                                <div className="relative group cursor-pointer">
                                    <img src={avatarPreview} alt="Profile" className="w-24 h-24 rounded-full bg-gray-200 object-cover ring-4 ring-gray-50 bg-white" />
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Upload className="text-white" size={24} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{formData.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                            <Shield size={10} /> Verified Expert
                                        </span>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                            {((user as any).rating || 0).toFixed(1)} ★
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Display Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Hourly Rate (SAR)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="number"
                                            name="hourlyRate"
                                            value={formData.hourlyRate}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Specializations (Skills)</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="specializations"
                                            value={formData.specializations}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            placeholder="e.g. VAT Filing, Zakat, Audit"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Separate skills with commas.</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Bio / Experience Summary</label>
                                    <textarea
                                        name="bio"
                                        rows={4}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        placeholder="Describe your professional background..."
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <Button type="submit" className="shadow-lg">
                                    <Save size={18} /> Save Changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Sidebar: Documents & Verification */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="font-bold text-gray-800 mb-4">Verification Status</h3>
                        <div className="space-y-4">
                            {/* Only show if actually approved/verified */}
                            {user?.status === 'APPROVED' ? (
                                <>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                                        <div className="flex items-center gap-3">
                                            <Shield size={18} className="text-green-600" />
                                            <div className="text-sm">
                                                <p className="font-bold text-gray-800">Account Approved</p>
                                                <p className="text-xs text-gray-500">Ready to accept requests</p>
                                            </div>
                                        </div>
                                        <CheckCircle size={18} className="text-green-600" />
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                    <div className="flex items-center gap-3">
                                        <Shield size={18} className="text-yellow-600" />
                                        <div className="text-sm">
                                            <p className="font-bold text-gray-800">Under Review</p>
                                            <p className="text-xs text-gray-500">We are verifying your profile</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-60">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-gray-500" />
                                    <div className="text-sm">
                                        <p className="font-bold text-gray-800">Professional License</p>
                                        <p className="text-xs text-gray-500">Not Uploaded</p>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-blue-600 hover:underline">Upload</button>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-gray-800 mb-4">Profile Preview</h3>
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 text-white text-center">
                            <img src={avatarPreview || user?.avatarUrl} className="w-16 h-16 rounded-full mx-auto border-2 border-white mb-2 object-cover" />
                            <p className="font-bold">{formData.name}</p>
                            <p className="text-xs text-gray-400 mb-3 line-clamp-1">{formData.bio}</p>
                            <Button size="sm" variant="secondary" className="w-full text-xs h-8">
                                <Eye size={14} /> View Public Profile
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ExpertProfile;
