
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button } from '../../components/UI';
import { User, Building, Mail, Save, FileText, MapPin, Phone, Hash, Upload, CheckCircle, Users, Bell, ToggleLeft, Trash2, Plus } from 'lucide-react';

const ClientSettings = () => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'KYC' | 'TEAM' | 'NOTIFICATIONS'>('PROFILE');
  
  // Mock detailed data seeded from user context
  const [formData, setFormData] = useState({
    // Basic Profile
    name: user?.name || '',
    email: user?.email || '',
    phone: '+966 50 000 0000',
    position: 'General Manager',
    
    // Company Details
    company: (user as any).companyName || '',
    industry: (user as any).industry || '',
    website: 'www.example.com',
    foundedYear: '2015',
    
    // KYC / Legal
    crNumber: '1010123456', // Commercial Registration
    vatNumber: '310123456700003', // VAT Number
    nationalAddress: 'Building 1234, King Fahd Rd, Olaya Dist, Riyadh 12211',
    legalStructure: 'LLC',
  });

  const [teamMembers, setTeamMembers] = useState([
      { id: 1, name: 'Sarah Al-Ahmad', email: 'sarah@example.com', role: 'Finance Manager' },
      { id: 2, name: 'Mohammed Ali', email: 'm.ali@example.com', role: 'Accountant' }
  ]);

  const [notifications, setNotifications] = useState({
      emailOrders: true,
      emailMarketing: false,
      smsAlerts: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
                    className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                        activeTab === tab.id 
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
                            <input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
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
                            <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                            <input type="number" name="foundedYear" value={formData.foundedYear} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
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
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle size={14} /> KYC Verified
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Registration (CR)</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" name="crNumber" value={formData.crNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 font-mono" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number (Group VAT ID)</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" name="vatNumber" value={formData.vatNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 font-mono" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">National Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input type="text" name="nationalAddress" value={formData.nationalAddress} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
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
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                             <FileText size={32} className="mx-auto text-gray-400 mb-2 group-hover:text-primary-500" />
                             <p className="font-medium text-gray-700">Commercial Registration (CR)</p>
                             <p className="text-xs text-gray-400 mb-3">PDF, JPG up to 5MB</p>
                             <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Uploaded</span>
                        </div>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                             <FileText size={32} className="mx-auto text-gray-400 mb-2 group-hover:text-primary-500" />
                             <p className="font-medium text-gray-700">VAT Registration Certificate</p>
                             <p className="text-xs text-gray-400 mb-3">PDF, JPG up to 5MB</p>
                             <Button size="sm" variant="outline" className="mx-auto h-8 text-xs"><Upload size={14} /> Upload</Button>
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
                      {teamMembers.map(member => (
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
                      ))}
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
                            onClick={() => setNotifications({...notifications, emailOrders: !notifications.emailOrders})}
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
                            onClick={() => setNotifications({...notifications, smsAlerts: !notifications.smsAlerts})}
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
