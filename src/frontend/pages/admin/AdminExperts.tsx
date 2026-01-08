
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { Star, ChevronRight, Users, UserCheck, ShieldCheck, Briefcase, Search, Edit, LifeBuoy, X, Save, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Expert } from '../../types';

const AdminExperts = () => {
  const { experts, updateExpertStatus, updateExpert } = useAppContext();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const location = useLocation();

  // Deep link filtering
  useEffect(() => {
    if (location.state && (location.state as any).filter) {
      setFilter((location.state as any).filter);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Editing State
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [expertFormData, setExpertFormData] = useState<Partial<Expert>>({});

  // Logic for the Funnel
  const totalRegistered = experts.length;
  const profileCompleted = experts.length;
  const inVetting = experts.filter(e => e.status === 'VETTING').length;
  const activeExperts = experts.filter(e => e.status === 'ACTIVE').length;

  // Filter Logic
  const filteredExperts = experts.filter(e => {
    if (filter !== 'ALL' && e.status !== filter) return false;
    const s = search.toLowerCase();
    const matchesSearch =
      (e.name || '').toLowerCase().includes(s) ||
      (e.email || '').toLowerCase().includes(s) ||
      (e.specializations || []).some(spec => spec.toLowerCase().includes(s));
    return matchesSearch;
  });

  const handleEdit = (expert: Expert) => {
    setEditingExpert(expert);
    setExpertFormData({ ...expert });
  };

  const handleSupport = (expert: Expert) => {
    window.location.href = `mailto:${expert.email}?subject=Support Request for Expert ${expert.name}`;
  };

  const handleSave = () => {
    if (editingExpert && editingExpert.id) {
      updateExpert(editingExpert.id, expertFormData);
      setEditingExpert(null);
    }
  };

  const FunnelStep = ({ label, count, icon: Icon, isActive, onClick, color }: any) => (
    <div
      onClick={onClick}
      className={`flex-1 relative p-4 rounded-xl border transition-all cursor-pointer group ${isActive ? `bg-${color}-50 border-${color}-500 shadow-md` : 'bg-white border-gray-200 hover:border-gray-300'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${isActive ? `bg-${color}-100 text-${color}-600` : 'bg-gray-100 text-gray-500'}`}>
          <Icon size={20} />
        </div>
        <span className={`text-2xl font-bold ${isActive ? `text-${color}-700` : 'text-gray-700'}`}>{count}</span>
      </div>
      <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? `text-${color}-600` : 'text-gray-500'}`}>{label}</p>

      {/* Visual Connector Line (Except for last item) */}
      <div className="hidden md:block absolute top-1/2 -right-3 z-10 text-gray-300">
        {label !== 'Active Experts' && <ArrowRight size={20} />}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* --- Expert Journey Funnel Visual --- */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expert Management</h1>
            <p className="text-gray-500 mt-1">Lifecycle management from vetting to activation.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <FunnelStep
            label="Registered"
            count={totalRegistered}
            icon={Users}
            isActive={filter === 'ALL'}
            onClick={() => setFilter('ALL')}
            color="blue"
          />
          <FunnelStep
            label="Profile Ready"
            count={profileCompleted}
            icon={UserCheck}
            isActive={false}
            onClick={() => { }}
            color="indigo"
          />
          <FunnelStep
            label="In Vetting"
            count={inVetting}
            icon={ShieldCheck}
            isActive={filter === 'VETTING'}
            onClick={() => setFilter('VETTING')}
            color="orange"
          />
          <FunnelStep
            label="Active Experts"
            count={activeExperts}
            icon={Briefcase}
            isActive={filter === 'ACTIVE'}
            onClick={() => setFilter('ACTIVE')}
            color="green"
          />
        </div>
      </div>

      {/* --- Controls --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto p-1">
          {['ALL', 'ACTIVE', 'VETTING', 'SUSPENDED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === status ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {status === 'ALL' ? 'View All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Expert Profile</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExperts.map(expert => (
                <tr key={expert.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleEdit(expert)}>
                      <div className="relative">
                        <img src={expert.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-gray-200 object-cover ring-2 ring-white shadow-sm" />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${expert.status === 'ACTIVE' ? 'bg-green-500' : expert.status === 'VETTING' ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{expert.name}</p>
                        <p className="text-xs text-gray-500">{expert.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {expert.specializations.slice(0, 2).map((s, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md border border-gray-200">{s}</span>
                      ))}
                      {expert.specializations.length > 2 && <span className="text-xs text-gray-400 px-1">+{expert.specializations.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 font-medium text-gray-700">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span>{expert.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600 font-medium">{expert.totalEarned.toLocaleString()} SAR</td>
                  <td className="px-6 py-4"><Badge status={expert.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEdit(expert); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit Profile"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSupport(expert); }}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Contact Support"
                      >
                        <LifeBuoy size={18} />
                      </button>
                      {expert.status === 'VETTING' && (
                        <div className="flex gap-1 ml-2">
                          <Button size="sm" variant="outline" onClick={() => updateExpertStatus(expert.id, 'SUSPENDED')} className="text-xs h-8 px-2 text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                          <Button size="sm" onClick={() => updateExpertStatus(expert.id, 'ACTIVE')} className="text-xs h-8 px-2 bg-green-600 hover:bg-green-700 shadow-sm">Approve</Button>
                        </div>
                      )}
                      {expert.status === 'ACTIVE' && (
                        <Button size="sm" variant="danger" onClick={() => updateExpertStatus(expert.id, 'SUSPENDED')} className="text-xs h-8 px-2">Suspend</Button>
                      )}
                      {expert.status === 'SUSPENDED' && (
                        <Button size="sm" variant="secondary" onClick={() => updateExpertStatus(expert.id, 'ACTIVE')} className="text-xs h-8 px-2">Reactivate</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExperts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium">No experts found</p>
                      <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Expert Modal */}
      {editingExpert && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Edit Expert Profile</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">{editingExpert.id}</p>
              </div>
              <button onClick={() => setEditingExpert(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="flex justify-center mb-4">
                <img src={expertFormData.avatarUrl} alt="" className="w-24 h-24 rounded-full bg-gray-100 object-cover ring-4 ring-gray-50 shadow-md" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  value={expertFormData.name || ''}
                  onChange={e => setExpertFormData({ ...expertFormData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Hourly Rate (SAR)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  value={expertFormData.hourlyRate || 0}
                  onChange={e => setExpertFormData({ ...expertFormData, hourlyRate: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  value={expertFormData.status}
                  onChange={(e: any) => setExpertFormData({ ...expertFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="VETTING">Vetting</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditingExpert(null)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200">
                <Save size={18} /> Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminExperts;
