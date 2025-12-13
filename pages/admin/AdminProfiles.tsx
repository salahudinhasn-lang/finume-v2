import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button, Badge } from '../../components/UI';
import { UserPlus, Shield, Edit, Trash2, X, Check, Mail, User, Clock, Lock, Smartphone, Search, Filter, Activity, FileText, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { Admin, AdminRole } from '../../types';

const AdminProfiles = () => {
  const { admins, addAdmin, updateAdmin, deleteAdmin, user } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const initialFormState = {
    name: '',
    email: '',
    adminRole: 'ADMIN' as AdminRole,
  };
  const [formData, setFormData] = useState(initialFormState);

  // Mock Audit Log Data
  const auditLog = [
    { id: 1, admin: 'Sarah Finance', action: 'Processed Payout', target: 'Batch #402', time: '10 mins ago', type: 'financial' },
    { id: 2, admin: 'Super Admin', action: 'Updated Settings', target: 'Global Tax Rate', time: '2 hours ago', type: 'system' },
    { id: 3, admin: 'Lisa Relations', action: 'Approved Expert', target: 'Ahmed Al-Saud', time: '5 hours ago', type: 'user' },
    { id: 4, admin: 'John Support', action: 'Resolved Ticket', target: '#REQ-1092', time: '1 day ago', type: 'support' },
    { id: 5, admin: 'Mike Sales', action: 'Exported Leads', target: 'Q3 Report', time: '2 days ago', type: 'data' },
  ];

  const roles: { value: AdminRole; label: string; desc: string; color: string; perms: string[] }[] = [
    { 
        value: 'SUPER_ADMIN', 
        label: 'Super Admin', 
        desc: 'Full access to system & config.', 
        color: 'bg-red-100 text-red-800 border-red-200',
        perms: ['Manage Users', 'Financials', 'System Config', 'Delete Data']
    },
    { 
        value: 'ADMIN', 
        label: 'Admin', 
        desc: 'Standard operational access.', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        perms: ['Manage Users', 'View Requests', 'Edit Services']
    },
    { 
        value: 'FINANCE', 
        label: 'Finance', 
        desc: 'Financial reports & payouts.', 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        perms: ['View Financials', 'Process Payouts', 'Export Reports']
    },
    { 
        value: 'SUPPORT', 
        label: 'Support', 
        desc: 'Ticket management only.', 
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        perms: ['View Requests', 'User Read-Only', 'Ticket Management']
    },
    { 
        value: 'EXPERT_RELATIONS', 
        label: 'Expert Relations', 
        desc: 'Vetting & onboarding.', 
        color: 'bg-pink-100 text-pink-800 border-pink-200',
        perms: ['Manage Experts', 'Approve Docs', 'Interview']
    },
    { 
        value: 'SALES', 
        label: 'Sales', 
        desc: 'Lead view access.', 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        perms: ['View Clients', 'View Requests']
    }
  ];

  const handleEdit = (admin: Admin) => {
    setEditingId(admin.id);
    setFormData({
      name: admin.name,
      email: admin.email,
      adminRole: admin.adminRole,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this admin? This action cannot be undone.')) {
      deleteAdmin(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateAdmin(editingId, formData);
    } else {
      const newAdmin: Admin = {
        id: `ADMIN-${Date.now()}`,
        role: 'ADMIN',
        ...formData,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
      };
      addAdmin(newAdmin);
    }
    setShowModal(false);
  };

  const currentUser = user as Admin;
  const canEdit = currentUser?.adminRole === 'SUPER_ADMIN';

  const filteredAdmins = admins.filter(admin => {
      const matchesSearch = admin.name.toLowerCase().includes(search.toLowerCase()) || admin.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || admin.adminRole === roleFilter;
      return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Team</h1>
          <p className="text-gray-500">Manage team roles, system access, and security settings.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            {canEdit && (
                <Button onClick={handleAdd} className="shadow-lg bg-gray-900 hover:bg-gray-800 shrink-0">
                    <UserPlus size={18} /> Invite Member
                </Button>
            )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main List */}
          <div className="flex-1 space-y-6">
              {/* Filters */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                          type="text" 
                          placeholder="Search members..." 
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                  </div>
                  <div className="relative min-w-[180px]">
                      <select 
                          value={roleFilter} 
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none cursor-pointer"
                      >
                          <option value="ALL">All Roles</option>
                          {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                      <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAdmins.map((admin) => {
                  const roleInfo = roles.find(r => r.value === admin.adminRole);
                  const isMe = admin.id === user?.id;
                  
                  return (
                    <Card key={admin.id} className={`relative group hover:shadow-lg transition-all border-l-4 ${roleInfo?.color.replace('bg-', 'border-').split(' ')[0]} overflow-hidden`}>
                       <div className="absolute top-0 right-0 p-3">
                           {isMe && <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full border border-gray-200">YOU</span>}
                       </div>

                       <div className="flex items-start gap-4 mb-4">
                            <div className="relative">
                                <img src={admin.avatarUrl} alt={admin.name} className="w-14 h-14 rounded-full bg-gray-100 object-cover ring-4 ring-white shadow-sm" />
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm" title="2FA Enabled">
                                    <div className="bg-green-100 text-green-600 rounded-full p-0.5">
                                        <Smartphone size={10} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <h3 className="font-bold text-gray-900 truncate">{admin.name}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                    <Mail size={12} /> <span className="truncate">{admin.email}</span>
                                </div>
                            </div>
                       </div>
                       
                       <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border ${roleInfo?.color}`}>
                               <Shield size={12} /> {roleInfo?.label}
                            </span>
                       </div>

                       <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Clock size={10} /> Last login: 2 hours ago
                          </div>
                          
                          {canEdit && !isMe && (
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(admin)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="Edit Access"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(admin.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Revoke Access"><Trash2 size={16} /></button>
                             </div>
                          )}
                       </div>
                    </Card>
                  );
                })}
              </div>
          </div>

          {/* Sidebar: Audit Log */}
          <div className="w-full lg:w-80 space-y-6">
              <Card className="bg-slate-900 text-white border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                      <Activity size={18} className="text-blue-400" />
                      <h3 className="font-bold text-sm uppercase tracking-wider">Recent Activity</h3>
                  </div>
                  <div className="space-y-4 relative">
                      {/* Timeline Line */}
                      <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-800 rounded-full"></div>
                      
                      {auditLog.map((log) => (
                          <div key={log.id} className="relative pl-6">
                              <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                                  log.type === 'financial' ? 'bg-emerald-500' :
                                  log.type === 'system' ? 'bg-red-500' :
                                  log.type === 'support' ? 'bg-amber-500' : 'bg-blue-500'
                              }`}></div>
                              <p className="text-xs text-slate-400 mb-0.5">{log.time}</p>
                              <p className="text-sm font-medium text-slate-200">{log.action}</p>
                              <p className="text-xs text-slate-500">by <span className="text-slate-300">{log.admin}</span> • {log.target}</p>
                          </div>
                      ))}
                  </div>
                  <button className="w-full mt-6 py-2 text-xs font-bold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
                      View Full Audit Log
                  </button>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                  <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                          <AlertTriangle size={20} />
                      </div>
                      <div>
                          <h4 className="font-bold text-amber-900 text-sm">Security Alert</h4>
                          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                              2 admins have not enabled Two-Factor Authentication (2FA). Please enforce this in settings.
                          </p>
                          <button className="mt-3 text-xs font-bold text-amber-800 underline hover:text-amber-950">
                              Review Security Policies
                          </button>
                      </div>
                  </div>
              </Card>
          </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in duration-200">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                  <Shield size={20} className="text-blue-400" />
                  {editingId ? 'Edit Access' : 'Invite New Admin'}
              </h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-gray-700 p-1 rounded"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Left: Form */}
              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 transition-shadow focus:shadow-sm"
                        placeholder="e.g. Sarah Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 transition-shadow focus:shadow-sm"
                        placeholder="admin@finume.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Select Role</label>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                      {roles.map((role) => (
                        <label key={role.value} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${formData.adminRole === role.value ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input 
                            type="radio" 
                            name="role"
                            value={role.value}
                            checked={formData.adminRole === role.value}
                            onChange={() => setFormData({...formData, adminRole: role.value})}
                            className="text-primary-600 focus:ring-primary-500 mt-1"
                          />
                          <div>
                            <span className="block text-sm font-bold text-gray-900">{role.label}</span>
                            <span className="block text-xs text-gray-500 mt-0.5">{role.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
              </div>

              {/* Right: Permissions Preview */}
              <div className="bg-gray-50 p-6 w-full md:w-64 border-l border-gray-200 flex flex-col">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Access Rights</h4>
                  
                  <div className="space-y-3 flex-1">
                      {roles.find(r => r.value === formData.adminRole)?.perms.map((perm, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 shadow-sm">
                              <CheckCircle size={14} className="text-green-600" />
                              {perm}
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                      <Button className="w-full shadow-lg bg-primary-600 hover:bg-primary-700" type="submit">
                          {editingId ? 'Update Access' : 'Send Invite'}
                      </Button>
                  </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfiles;