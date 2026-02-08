
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button } from '../../components/UI';
import { User, Mail, DollarSign, Briefcase, Save, Eye, CheckCircle, Shield, FileText, Upload, Lock, Phone, Linkedin } from 'lucide-react';

const ExpertProfile = () => {
    const { user, updateExpert, isLoading, isRestoringSession } = useAppContext();
    const [isPublic, setIsPublic] = useState(true);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl);

    const [formData, setFormData] = React.useState<{
        name: string;
        email: string;
        bio: string;
        mobileNumber: string;
        linkedinUrl: string;
        hourlyRate: number;
        specializations: string[];
        password: '';
        confirmPassword: '';
        documents: { id: string; label: string; url: string; uploadedAt: string }[];
    }>(() => {
        const specs = (user as any)?.specializations;
        // Ensure we always start with an array
        const safeSpecs = Array.isArray(specs) ? specs : (typeof specs === 'string' ? specs.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

        // Parse documents safely
        let docs = [];
        try {
            const rawDocs = (user as any)?.documents;
            if (Array.isArray(rawDocs)) {
                docs = rawDocs;
            } else if (typeof rawDocs === 'string') {
                docs = JSON.parse(rawDocs);
            }
        } catch (e) {
            console.error("Failed to parse documents", e);
        }

        return {
            name: user?.name || '',
            email: user?.email || '',
            bio: (user as any)?.bio || '',
            mobileNumber: (user as any)?.mobileNumber || '',
            linkedinUrl: (user as any)?.linkedinUrl || '',
            hourlyRate: (user as any)?.hourlyRate || 0,
            specializations: safeSpecs,
            password: '',
            confirmPassword: '',
            documents: docs
        };
    });

    const [specializationInput, setSpecializationInput] = useState('');
    const [selectedServiceKey, setSelectedServiceKey] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

    // ... existing helpers ...

    const handleAddDocumentRow = () => {
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, { id: Date.now().toString(), label: '', url: '', uploadedAt: '' }]
        }));
    };

    const handleRemoveDocumentRow = (id: string) => {
        setFormData(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }));
    };

    const handleDocumentLabelChange = (id: string, label: string) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.map(d => d.id === id ? { ...d, label } : d)
        }));
    };

    const uploadDocument = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('finume_token')}` },
            body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        return data.url;
    };

    const handleDocumentUpload = async (id: string, file: File) => {
        setUploadingDocId(id);
        try {
            const url = await uploadDocument(file);
            setFormData(prev => ({
                ...prev,
                documents: prev.documents.map(d => d.id === id ? {
                    ...d,
                    url,
                    uploadedAt: new Date().toISOString()
                } : d)
            }));
        } catch (err: any) {
            alert("Upload failed: " + err.message);
        } finally {
            setUploadingDocId(null);
        }
    };

    const specificServices = [
        'bookkeeping',
        'vatFilling',
        'financialAudit',
        'zakatAdvisory',
        'cfoAdvisory'
    ];

    const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'other') {
            setIsOtherSelected(true);
            setSelectedServiceKey('other');
        } else {
            setIsOtherSelected(false);
            setSelectedServiceKey(value);

            if (value) {
                // Format camelCase to readable title case for display/storage
                // e.g. "vatFilling" -> "Vat Filling"
                const displayValue = value.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

                if (!formData.specializations.includes(displayValue)) {
                    setFormData((prev: any) => ({
                        ...prev,
                        specializations: [...prev.specializations, displayValue]
                    }));
                }
            }
        }
    };

    const handleAddSpecialization = () => {
        if (specializationInput.trim()) {
            setFormData((prev: any) => ({
                ...prev,
                specializations: [...prev.specializations, specializationInput.trim()]
            }));
            setSpecializationInput('');
        }
    };

    // Update form data if user context changes
    React.useEffect(() => {
        if (user) {
            setFormData(prev => {
                if (prev.email !== user.email) {
                    const specs = (user as any)?.specializations;
                    const safeSpecs = Array.isArray(specs) ? specs : (typeof specs === 'string' ? specs.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

                    let docs = [];
                    try {
                        const rawDocs = (user as any)?.documents;
                        if (Array.isArray(rawDocs)) docs = rawDocs;
                        else if (typeof rawDocs === 'string') docs = JSON.parse(rawDocs);
                    } catch (e) {
                        console.error("Failed to parse documents in effect", e);
                    }

                    return {
                        name: user.name || '',
                        email: user.email || '',
                        bio: (user as any).bio || '',
                        mobileNumber: (user as any).mobileNumber || '',
                        linkedinUrl: (user as any).linkedinUrl || '',
                        hourlyRate: (user as any).hourlyRate || 0,
                        specializations: safeSpecs,
                        password: '',
                        confirmPassword: '',
                        documents: docs
                    };
                }
                return prev;
            });
            setAvatarPreview(user.avatarUrl);
        }
    }, [user]);


    if (isLoading || isRestoringSession) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-center text-gray-500">User profile not found. Please log in again.</div>;
    }


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
            if (formData.password && formData.password !== formData.confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            const payload: any = {
                name: formData.name,
                // @ts-ignore
                bio: formData.bio,
                // @ts-ignore
                mobileNumber: formData.mobileNumber,
                // @ts-ignore
                linkedinUrl: formData.linkedinUrl,
                // @ts-ignore
                hourlyRate: parseFloat(formData.hourlyRate as any),
                // @ts-ignore
                hourlyRate: parseFloat(formData.hourlyRate as any),
                specializations: formData.specializations,
                documents: formData.documents
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            updateExpert(user.id, payload);
            alert('Profile updated successfully.');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Clear password fields
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
                                            {Number((user as any)?.rating || 0).toFixed(1)} ★
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
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="mobileNumber"
                                            value={formData.mobileNumber}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            placeholder="+966..."
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

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">LinkedIn URL</label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Specializations (Skills)</label>
                                    <div className="flex flex-col gap-3 mb-2">
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                value={selectedServiceKey}
                                                onChange={handleServiceSelect}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer bg-white"
                                            >
                                                <option value="">Select Specialization</option>
                                                {specificServices.map(key => (
                                                    <option key={key} value={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</option>
                                                ))}
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        {isOtherSelected && (
                                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                                                <input
                                                    type="text"
                                                    value={specializationInput}
                                                    onChange={(e) => setSpecializationInput(e.target.value)}
                                                    className="flex-1 px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                                                    placeholder="Type custom skill..."
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                                                    autoFocus
                                                />
                                                <Button type="button" onClick={handleAddSpecialization} variant="secondary" size="sm" className="px-4 font-bold">Add</Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                                        {formData.specializations.map((spec: string, idx: number) => (
                                            <span key={idx} className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm animate-in zoom-in-50 duration-200">
                                                {spec}
                                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, specializations: prev.specializations.filter((_: string, i: number) => i !== idx) }))} className="hover:text-red-300 transition-colors">
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
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

                                {/* Password Management */}
                                <div className="md:col-span-2 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                            <Lock size={18} className="text-gray-500" /> Password
                                        </h4>
                                        {!showPasswordFields && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setShowPasswordFields(true)}
                                            >
                                                Change Password
                                            </Button>
                                        )}
                                    </div>

                                    {showPasswordFields && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                            <div className="md:col-span-2 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowPasswordFields(false);
                                                        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                                                    }}
                                                    className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Documents Section */}
                                <div className="md:col-span-2 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                            <FileText size={18} className="text-gray-500" /> My Documents
                                        </h4>
                                        <Button type="button" size="sm" variant="secondary" onClick={handleAddDocumentRow}>
                                            + Add More
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.documents.map((doc, idx) => (
                                            <div key={doc.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                <div className="flex-1 w-full relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Document Name (Required)"
                                                        value={doc.label}
                                                        onChange={(e) => handleDocumentLabelChange(doc.id, e.target.value)}
                                                        disabled={!!doc.url || uploadingDocId === doc.id}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-primary-500 ${!!doc.url ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300'}`}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    {doc.url ? (
                                                        <>
                                                            <a href={doc.url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors">
                                                                View
                                                            </a>
                                                            <div className="relative">
                                                                <input
                                                                    type="file"
                                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                                    onChange={(e) => e.target.files?.[0] && handleDocumentUpload(doc.id, e.target.files[0])}
                                                                />
                                                                <button type="button" disabled={uploadingDocId === doc.id} className="px-3 py-2 bg-primary-50 text-primary-700 border border-primary-100 text-sm font-bold rounded-lg hover:bg-primary-100 transition-colors">
                                                                    {uploadingDocId === doc.id ? '...' : 'Update'}
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="relative w-full sm:w-auto">
                                                            <input
                                                                type="file"
                                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                                disabled={!doc.label.trim()}
                                                                onChange={(e) => e.target.files?.[0] && handleDocumentUpload(doc.id, e.target.files[0])}
                                                            />
                                                            <button
                                                                type="button"
                                                                disabled={uploadingDocId === doc.id || !doc.label.trim()}
                                                                className={`w-full sm:w-auto px-4 py-2 text-white text-sm font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors ${!doc.label.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'}`}
                                                            >
                                                                <Upload size={14} />
                                                                {uploadingDocId === doc.id ? 'Uploading...' : 'Upload'}
                                                            </button>
                                                        </div>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDocumentRow(doc.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Remove"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.documents.length === 0 && (
                                            <p className="text-sm text-gray-500 italic text-center py-2">No documents added yet.</p>
                                        )}
                                    </div>
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
                            {user?.status === 'APPROVED' || (user as any)?.status === 'ACTIVE' ? (
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
                                {/* Removed Professional License Section */}
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-gray-800 mb-4">Profile Preview</h3>
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 text-white text-center">
                            <img src={avatarPreview || user?.avatarUrl} className="w-16 h-16 rounded-full mx-auto border-2 border-white mb-2 object-cover" />
                            <p className="font-bold">{formData.name}</p>
                            <p className="text-xs text-gray-400 mb-3 line-clamp-1">{formData.bio || "No bio set"}</p>
                            <Button size="sm" variant="secondary" className="w-full text-xs h-8" onClick={() => setShowPreview(true)}>
                                <Eye size={14} /> View Public Profile
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Public Profile Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        {/* Header / Cover */}
                        <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 relative">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Profile Content */}
                        <div className="px-6 pb-6 -mt-12 relative">
                            <div className="flex justify-between items-end mb-4">
                                <img
                                    src={avatarPreview || user?.avatarUrl}
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                                />
                                <div className="mb-1 flex flex-col items-end">
                                    <span className="text-2xl font-bold text-slate-900">{formData.hourlyRate} <span className="text-sm font-normal text-slate-500">SAR/hr</span></span>
                                    <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                                        <span>★</span> {Number((user as any)?.rating || 0).toFixed(1)}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    {formData.name}
                                    <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">{formData.bio || "No professional bio available."}</p>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Specializations</h4>
                                <div className="flex flex-wrap gap-2">
                                    {formData.specializations.length > 0 ? (
                                        formData.specializations.map((spec, i) => (
                                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
                                                {spec}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 text-xs italic">No specializations listed</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <span className="block text-lg font-bold text-slate-900">{user?.role === 'EXPERT' ? (user as any).totalEarned || '0' : '0'}</span>
                                    <span className="text-xs text-slate-500">Jobs Completed</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <span className="block text-lg font-bold text-slate-900">{user?.role === 'EXPERT' ? (user as any).yearsExperience || '1' : '1'}+</span>
                                    <span className="text-xs text-slate-500">Years Exp.</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-900/10 pointer-events-none opacity-50">
                                    Hire Expert
                                </Button>
                                <p className="text-center text-xs text-slate-400 mt-2">Preview Mode</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpertProfile;
