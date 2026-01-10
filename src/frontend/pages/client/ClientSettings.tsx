
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button } from '../../components/UI';
import { User, Building, Mail, Save, FileText, MapPin, Phone, Hash, Upload, CheckCircle, Users, Bell, ToggleLeft, Trash2, Plus } from 'lucide-react';

const ClientSettings = () => {
    const { user, updateClient } = useAppContext();
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'KYC' | 'TEAM' | 'NOTIFICATIONS'>('PROFILE');

    // Real data from user context only
    const [formData, setFormData] = useState({
        // Basic Profile
        name: user?.name || '',
        email: user?.email || '',
        phone: (user as any).mobileNumber || '',
        position: '',

        // Company Details
        company: (user as any).companyName || '',
        industry: (user as any).industry || '',
        website: '',
        foundedYear: '',

        // KYC / Legal
        crNumber: '',
        vatNumber: '',
        nationalAddress: '',
        legalStructure: 'LLC',
    });

    const [teamMembers, setTeamMembers] = useState<any[]>([]);

    // File Upload State
    const [uploads, setUploads] = useState<{ cr?: File, vat?: File }>({});

    const [notifications, setNotifications] = useState({
        emailOrders: true,
        emailMarketing: false,
        smsAlerts: true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cr' | 'vat') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // 5MB Validation
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit.');
                return;
            }
            setUploads(prev => ({ ...prev, [type]: file }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, we would upload files to storage here
        // and update the user profile with URLs.
        // For now, we simulate success and update text fields.

        let updates: any = {
            name: formData.name,
            // email: formData.email, // Usually immutable or separate flow
        };

        if (user && user.role === 'CLIENT') {
            updates.companyName = formData.company;
            updates.industry = formData.industry;
            // Persist other fields if backend supported them
        }

        updateClient(user!.id, updates);
        alert('Settings updated successfully.');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
                <p className="text-gray-500">Manage your company profile, compliance documents, and team access.</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
                {[
                    { id: 'PROFILE', label: 'Company Profile', icon: Building },
                    { id: 'KYC', label: 'Legal & KYC', icon: FileText },
                    { id: 'TEAM', label: 'Team Members', icon: Users },
                    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
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
                                    <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                                </div>
                                <div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* CR Upload */}
                                <div className={`border-2 border-dashed ${uploads.cr ? 'border-green-300 bg-green-50' : 'border-gray-200'} rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group relative`}>
                                    <input type="file" onChange={(e) => handleFileChange(e, 'cr')} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.jpg,.jpeg,.png" />
                                    <FileText size={32} className={`mx-auto mb-2 ${uploads.cr ? 'text-green-500' : 'text-gray-400 group-hover:text-primary-500'}`} />
                                    <p className="font-medium text-gray-700">{uploads.cr ? uploads.cr.name : 'Commercial Registration (CR)'}</p>
                                    <p className="text-xs text-gray-400 mb-3">{uploads.cr ? `${(uploads.cr.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, JPG up to 5MB'}</p>
                                    {!uploads.cr ? <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">Upload</span> : <span className="text-xs font-bold text-green-600">Selected</span>}
                                </div>

                                {/* VAT Input */}
                                <div className={`border-2 border-dashed ${uploads.vat ? 'border-green-300 bg-green-50' : 'border-gray-200'} rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group relative`}>
                                    <input type="file" onChange={(e) => handleFileChange(e, 'vat')} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.jpg,.jpeg,.png" />
                                    <FileText size={32} className={`mx-auto mb-2 ${uploads.vat ? 'text-green-500' : 'text-gray-400 group-hover:text-primary-500'}`} />
                                    <p className="font-medium text-gray-700">{uploads.vat ? uploads.vat.name : 'VAT Registration Certificate'}</p>
                                    <p className="text-xs text-gray-400 mb-3">{uploads.vat ? `${(uploads.vat.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, JPG up to 5MB'}</p>
                                    {!uploads.vat ? <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">Upload</span> : <span className="text-xs font-bold text-green-600">Selected</span>}
                                </div>
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
