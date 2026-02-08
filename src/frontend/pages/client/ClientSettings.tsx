
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Client } from '../../types';
import { Card, Button } from '../../components/UI';
import { User, Building, Mail, Save, FileText, MapPin, Phone, Hash, Upload, CheckCircle, Users, Bell, ToggleLeft, Trash2, Plus, Lock } from 'lucide-react';

const ClientSettings = () => {
    const { user, updateClient, t } = useAppContext();
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'KYC' | 'TEAM' | 'SECURITY' | 'NOTIFICATIONS'>('PROFILE');

    // Tab Configuration
    const tabs: { id: typeof activeTab; label: string; icon: React.ElementType }[] = [
        { id: 'PROFILE', label: 'Company Profile', icon: Building },
        { id: 'KYC', label: 'Legal & KYC', icon: FileText },
        { id: 'TEAM', label: 'Team Members', icon: Users },
        { id: 'SECURITY', label: 'Security', icon: Lock },
        { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
    ];

    // Real data from user context only
    const [formData, setFormData] = useState({
        // Basic Profile
        name: user?.name || '',
        email: user?.email || '',
        phone: (user as Client).mobileNumber || '',
        position: (user as Client).jobTitle || '',

        // Company Details
        company: (user as Client).companyName || '',
        industry: (user as Client).industry || '',
        website: (user as Client).website || '',
        foundedYear: (user as Client).foundedYear || '',

        // KYC / Legal
        crNumber: (user as Client).crNumber || '',
        vatNumber: (user as Client).vatNumber || '',
        nationalAddress: (user as Client).nationalAddress || '',
        legalStructure: (user as Client).legalStructure || 'LLC',

        // Security
        password: '',
        confirmPassword: ''
    });

    const [teamMembers, setTeamMembers] = useState<any[]>([]);

    // File Upload State
    // File Upload State
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    const [notifications, setNotifications] = useState({
        emailOrders: true,
        emailMarketing: false,
        smsAlerts: true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const uploadDocument = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'legal'); // IMPORTANT: Triggers the new folder logic

        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('finume_token')}` },
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Upload failed');
        }

        return data.url;
    };

    const getProxyUrl = (originalUrl: string) => {
        if (!originalUrl) return '#';
        if (originalUrl.includes('/api/files/')) return originalUrl;

        // Extract Drive ID to pass to proxy
        let driveId = '';
        if (originalUrl.includes('/file/d/')) {
            const match = originalUrl.match(/\/file\/d\/([^\/]+)/);
            if (match) driveId = match[1];
        } else if (originalUrl.includes('id=')) {
            const match = originalUrl.match(/id=([^&]+)/);
            if (match) driveId = match[1];
        }

        if (driveId) {
            return `/api/files/${driveId}`;
        }

        return originalUrl;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, stateField: string, dbField: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // 4MB Validation (Vercel Serverless has 4.5MB limit, keep safe margin)
            if (file.size > 4 * 1024 * 1024) {
                alert('File size exceeds 4MB limit.');
                return;
            }

            setUploadingDoc(stateField);

            try {
                const url = await uploadDocument(file);
                // Immediate Update to DB
                let updatePayload: any = {};
                if (stateField === 'other') {
                    updatePayload[dbField] = { url, name: file.name, date: new Date().toISOString() };
                } else {
                    updatePayload[dbField] = url;
                }

                await updateClient(user!.id, updatePayload);
                alert('Document uploaded successfully!');

            } catch (error: any) {
                console.error("Upload error", error);
                alert(error.message || "An error occurred during upload.");
            } finally {
                setUploadingDoc(null);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        console.log('Submitting Client Settings Form...');

        let updates: any = {
            name: formData.name,
            mobileNumber: formData.phone,
            // email: formData.email, // Immutable
        };

        if (formData.password) {
            updates.password = formData.password;
        }

        if (user && user.role === 'CLIENT') {
            updates.companyName = formData.company;
            updates.industry = formData.industry;
            updates.jobTitle = formData.position;
            updates.website = formData.website;
            updates.foundedYear = formData.foundedYear;

            // Legal / KYC
            updates.crNumber = formData.crNumber;
            updates.vatNumber = formData.vatNumber;
            updates.nationalAddress = formData.nationalAddress;
            updates.legalStructure = formData.legalStructure;
        }

        updateClient(user!.id, updates);
        if (formData.password) {
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        }
        alert('Profile details updated successfully.');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
                <p className="text-gray-500">Manage your company profile, compliance documents, and team access.</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit}>
                {activeTab === 'PROFILE' && (
                    <div className="space-y-6">
                        <Card>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="text-primary-600" size={20} /> Representative Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                    <input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" placeholder="e.g. CEO" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} readOnly className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 bg-gray-50 text-gray-500 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" placeholder="+966 ..." />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Building className="text-primary-600" size={20} /> Company Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                                    />
                                </div>        <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry / Sector</label>
                                    <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" placeholder="https://" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                                    <input type="number" name="foundedYear" value={formData.foundedYear} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" placeholder="YYYY" />
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'KYC' && (
                    <div className="space-y-6">
                        <Card>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <FileText className="text-primary-600" size={20} /> Legal Entity Details
                                    </h3>
                                    <p className="text-sm text-gray-500">Required for ZATCA compliance and invoicing.</p>
                                </div>
                                {/* Removed fake "KYC Verified" badge */}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Registration (CR)</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="crNumber" value={formData.crNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 font-mono" placeholder="1010..." />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number (Group VAT ID)</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="vatNumber" value={formData.vatNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 font-mono" placeholder="3..." />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">National Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input type="text" name="nationalAddress" value={formData.nationalAddress} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" placeholder="Building, Street, District, City, Zip" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Legal Structure</label>
                                    <select name="legalStructure" value={formData.legalStructure} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500">
                                        <option>LLC</option>
                                        <option>Sole Proprietorship</option>
                                        <option>Joint Stock Company</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Document Uploads</h3>
                            <div className="space-y-4">
                                {/* Helper to render a document row */}
                                {['commercialRegistration', 'vatCertificate', 'formationContract', 'nationalAddress', 'other'].map((docType) => {
                                    let label = '';
                                    let dbField = '';
                                    let stateField = '';

                                    switch (docType) {
                                        case 'commercialRegistration': label = 'Commercial Registration (CR)'; dbField = 'crDocumentUrl'; stateField = 'cr'; break;
                                        case 'vatCertificate': label = 'VAT Registration Certificate'; dbField = 'vatDocumentUrl'; stateField = 'vat'; break;
                                        case 'formationContract': label = 'Company Formation Contract'; dbField = 'formationContractUrl'; stateField = 'formation'; break;
                                        case 'nationalAddress': label = 'National Address'; dbField = 'nationalAddressDocumentUrl'; stateField = 'nationalAddressDoc'; break;
                                        case 'other': label = 'Other Legal Documents'; dbField = 'otherDocuments'; stateField = 'other'; break;
                                    }

                                    const currentUrl = (user as Client)?.[dbField as keyof Client];
                                    // Handle "Other" which might be an object
                                    const displayUrl = stateField === 'other' && currentUrl && typeof currentUrl === 'object' ? (currentUrl as any).url : currentUrl as string;

                                    const isUploading = uploadingDoc === stateField;

                                    return (
                                        <div key={docType} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${displayUrl ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{label}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {displayUrl ? 'Document on file' : 'No document uploaded'}
                                                        {isUploading && <span className="text-blue-600 ml-2 font-medium animate-pulse">... Uploading ...</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* View Button */}
                                                {displayUrl && (
                                                    <a href={getProxyUrl(displayUrl)} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                                        View
                                                    </a>
                                                )}

                                                {/* Upload / Update Button */}
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleFileUpload(e, stateField, dbField)}
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full disabled:cursor-not-allowed"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        disabled={isUploading}
                                                    />
                                                    <button type="button" disabled={isUploading} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${displayUrl ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-primary-600 text-white hover:bg-primary-700'} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        {isUploading ? 'Uploading...' : (displayUrl ? 'Update' : 'Upload')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'TEAM' && (
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Team Management</h3>
                            <Button size="sm"><Plus className="mr-1" size={16} /> Invite Member</Button>
                        </div>

                        <div className="space-y-4">
                            {teamMembers.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No other team members connected.</p>
                            ) : (
                                teamMembers.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{member.name}</p>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-600">{member.role}</span>
                                            <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                )}

                {activeTab === 'SECURITY' && (
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Lock className="text-primary-600" size={20} /> Password & Security
                        </h3>
                        <div className="max-w-md space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="password"
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
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Make sure your password is at least 6 characters long.
                            </p>
                        </div>
                    </Card>
                )}

                {activeTab === 'NOTIFICATIONS' && (
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Notification Preferences</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-800">Order Updates</p>
                                    <p className="text-sm text-gray-500">Receive emails about status changes to your requests.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotifications({ ...notifications, emailOrders: !notifications.emailOrders })}
                                    className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${notifications.emailOrders ? 'bg-primary-600 justify-end' : 'bg-gray-200 justify-start'}`}
                                >
                                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-800">SMS Alerts</p>
                                    <p className="text-sm text-gray-500">Get urgent updates via SMS for critical compliance deadlines.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotifications({ ...notifications, smsAlerts: !notifications.smsAlerts })}
                                    className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${notifications.smsAlerts ? 'bg-primary-600 justify-end' : 'bg-gray-200 justify-start'}`}
                                >
                                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                                </button>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-200 mt-6 flex justify-end">
                    <Button type="submit" size="lg" className="shadow-lg">
                        <Save size={18} /> Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ClientSettings;
