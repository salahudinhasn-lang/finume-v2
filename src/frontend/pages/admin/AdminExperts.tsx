
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { Star, ChevronRight, Users, UserCheck, ShieldCheck, Briefcase, Search, Edit, LifeBuoy, X, Save, ArrowRight, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Expert } from '../../types';

const AdminExperts = () => {
  const { experts, requests, updateExpertStatus, updateExpert, settings, updateSettings } = useAppContext();
  // Force redeploy detection
  // console.log('Experts in AdminExperts:', experts); // Removed debug log
  const [filter, setFilter] = useState('VETTING'); // Default to VETTING view
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'EXPERTS' | 'SKILLS'>('EXPERTS');
  const [newSkill, setNewSkill] = useState('');
  const location = useLocation();

  // Modal State
  const [activeModalTab, setActiveModalTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'REQUESTS'>('OVERVIEW');

  const availableSkills: string[] = React.useMemo(() => {
    try {
      return settings?.expertSkills ? JSON.parse(settings.expertSkills) : [];
    } catch (e) {
      console.error("Failed to parse expertSkills", e);
      return [];
    }
  }, [settings?.expertSkills]);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const updated = [...availableSkills, newSkill.trim()];
    updateSettings({ ...settings, expertSkills: JSON.stringify(updated) });
    setNewSkill('');
  };

  const handleDeleteSkill = (skill: string) => {
    const updated = availableSkills.filter(s => s !== skill);
    updateSettings({ ...settings, expertSkills: JSON.stringify(updated) });
  };

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

  // Viewing State
  const [viewingExpert, setViewingExpert] = useState<Expert | null>(null);

  // Logic for the Funnel
  const safeExperts = experts || [];
  const totalRegistered = safeExperts.length;
  const profileCompleted = safeExperts.length;
  const inVetting = safeExperts.filter(e => (e.status || '').toUpperCase() === 'VETTING').length;
  const activeExperts = safeExperts.filter(e => (e.status || '').toUpperCase() === 'ACTIVE').length;

  // Filter Logic
  const filteredExperts = safeExperts.filter(e => {
    const status = (e.status || '').toUpperCase();
    if (filter !== 'ALL' && status !== filter) return false;
    const s = (search || '').toLowerCase();
    const matchesSearch =
      (e.name || '').toLowerCase().includes(s) ||
      (e.email || '').toLowerCase().includes(s) ||
      (Array.isArray(e.specializations) && e.specializations.some((spec: any) => typeof spec === 'string' && spec.toLowerCase().includes(s)));
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

      {/* --- Tab Navigation --- */}
      <div className="flex gap-4 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('EXPERTS')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'EXPERTS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Experts Directory
        </button>
        <button
          onClick={() => setActiveTab('SKILLS')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'SKILLS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Skills Configuration
        </button>
      </div>

      {activeTab === 'EXPERTS' ? (
        <>
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
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredExperts.map(expert => (
                    <tr key={expert.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setViewingExpert(expert)}>
                          <div className="relative">
                            <img src={expert.avatarUrl || ''} alt="" className="w-10 h-10 rounded-full bg-gray-200 object-cover ring-2 ring-white shadow-sm" />
                            <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${expert.status === 'ACTIVE' ? 'bg-green-500' : expert.status === 'VETTING' ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{expert.name || 'Unknown Helper'}</p>
                            <p className="text-xs text-gray-500">{expert.email || 'No Email'}</p>
                            {expert.mobileNumber && <p className="text-xs text-gray-400 mt-0.5">{expert.mobileNumber}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(expert.specializations) ? expert.specializations.slice(0, 2) : []).map((s, i) => (
                            <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md border border-gray-200">{String(s)}</span>
                          ))}
                          {Array.isArray(expert.specializations) && expert.specializations.length > 2 && <span className="text-xs text-gray-400 px-1">+{expert.specializations.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4"><Badge status={expert.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">

                          {/* Preview Button */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setViewingExpert(expert); }}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Search size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleEdit(expert); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit Profile"
                          >
                            <Edit size={18} />
                          </button>

                          {(expert.status || '').toUpperCase() === 'VETTING' && (
                            <div className="flex gap-1 ml-2">
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); updateExpertStatus(expert.id, 'SUSPENDED'); }} className="text-xs h-8 px-2 text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                              <Button size="sm" onClick={(e) => { e.stopPropagation(); updateExpertStatus(expert.id, 'ACTIVE'); }} className="text-xs h-8 px-2 bg-green-600 hover:bg-green-700 shadow-sm">Approve</Button>
                            </div>
                          )}
                          {(expert.status || '').toUpperCase() === 'ACTIVE' && (
                            <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); updateExpertStatus(expert.id, 'SUSPENDED'); }} className="text-xs h-8 px-2">Suspend</Button>
                          )}
                          {(expert.status || '').toUpperCase() === 'SUSPENDED' && (
                            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); updateExpertStatus(expert.id, 'ACTIVE'); }} className="text-xs h-8 px-2 bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Reactivate</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        /* --- SKILLS CONFIGURATION --- */
        <div className="max-w-2xl">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Available Skills</h3>
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Enter new skill name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <Button onClick={handleAddSkill}>Add Skill</Button>
              </div>

              <div className="space-y-2">
                {availableSkills.length === 0 && <p className="text-gray-400 text-center py-4">No skills configured yet.</p>}
                {availableSkills.map((skill, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-blue-200 transition-colors">
                    <span className="font-medium text-gray-700">{skill}</span>
                    <button
                      onClick={() => handleDeleteSkill(skill)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* View Expert Details Modal */}
      {viewingExpert && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gray-900 p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-xl">Expert Profile</h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{viewingExpert.id}</p>
              </div>
              <button onClick={() => setViewingExpert(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={24} /></button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-4 gap-6">
              {['OVERVIEW', 'DOCUMENTS', 'REQUESTS'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveModalTab(tab as any)}
                  className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeModalTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab === 'REQUESTS' ? `Tasks (${(requests || []).filter((r: any) => r.assignedExpertId === viewingExpert.id).length})` : tab}
                  {tab === 'DOCUMENTS' && viewingExpert.documents && Array.isArray(viewingExpert.documents) && ` (${viewingExpert.documents.length})`}
                </button>
              ))}
            </div>

            <div className="p-8 overflow-y-auto min-h-[400px]">
              {activeModalTab === 'OVERVIEW' && (
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Column: Avatar & Quick Info */}
                  <div className="flex flex-col items-center gap-4 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6 shrink-0">
                    <img src={viewingExpert.avatarUrl || ''} className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-lg" />
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-gray-900">{viewingExpert.name}</h2>
                      <Badge status={viewingExpert.status} className="mt-2" />
                    </div>

                    <div className="w-full space-y-3 mt-4">
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Hourly Rate</p>
                        <p className="text-lg font-bold text-gray-900">{viewingExpert.hourlyRate} SAR</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Experience</p>
                        <p className="text-lg font-bold text-gray-900">{viewingExpert.yearsExperience} Years</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Detailed Info */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><span className="text-xs">@</span></div>
                          <span className="font-medium">{viewingExpert.email}</span>
                        </div>
                        {viewingExpert.mobileNumber && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">PH</div>
                            <span className="font-medium">{viewingExpert.mobileNumber}</span>
                          </div>
                        )}
                        {viewingExpert.linkedinUrl && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">IN</div>
                            <a href={viewingExpert.linkedinUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline break-all">
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Professional Bio</h4>
                      <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {viewingExpert.bio || 'No bio provided.'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {(viewingExpert.specializations || []).map((s, i) => (
                          <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-700 border border-gray-200">
                            {String(s)}
                          </span>
                        ))}
                        {(!viewingExpert.specializations || viewingExpert.specializations.length === 0) && <span className="text-sm text-gray-400 italic">None listed</span>}
                      </div>
                    </div>

                    {viewingExpert.cvUrl && (
                      <div className="pt-4 border-t border-gray-100">
                        <a href={viewingExpert.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-bold hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all">
                          View Attached CV / Resume
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeModalTab === 'DOCUMENTS' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800">Uploaded Documents</h4>
                  {(() => {
                    let docs: any[] = [];
                    try {
                      if (Array.isArray(viewingExpert.documents)) docs = viewingExpert.documents;
                      else if (typeof viewingExpert.documents === 'string') docs = JSON.parse(viewingExpert.documents);
                    } catch (e) { }

                    if (docs.length === 0) return <p className="text-gray-500 italic">No documents uploaded.</p>;

                    return docs.map((doc: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={18} /></div>
                          <div>
                            <p className="font-bold text-gray-800">{doc.label || 'Untitled Document'}</p>
                            <p className="text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                          Open <ChevronRight size={14} />
                        </a>
                      </div>
                    ));
                  })()}
                </div>
              )}

              {activeModalTab === 'REQUESTS' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800">Assigned Tasks</h4>
                  {(() => {
                    // @ts-ignore
                    const expertTasks = (requests || []).filter(r => r.assignedExpertId === viewingExpert.id);
                    if (expertTasks.length === 0) return <p className="text-gray-500 italic">No tasks assigned.</p>;

                    return (
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500 font-bold">
                            <tr>
                              <th className="px-4 py-2">ID</th>
                              <th className="px-4 py-2">Service</th>
                              <th className="px-4 py-2">Status</th>
                              <th className="px-4 py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {expertTasks.map((t: any) => (
                              <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 font-mono text-gray-500">{t.displayId || t.id}</td>
                                <td className="px-4 py-2 font-medium">{t.pricingPlan?.name || t.service?.nameEn || t.serviceName}</td>
                                <td className="px-4 py-2"><Badge status={t.status} /></td>
                                <td className="px-4 py-2 text-right">{t.amount} SAR</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <Button variant="secondary" onClick={() => setViewingExpert(null)}>Close</Button>
              {viewingExpert.status === 'SUSPENDED' && (
                <Button onClick={() => { updateExpertStatus(viewingExpert.id, 'ACTIVE'); setViewingExpert(null); }} className="bg-green-600 hover:bg-green-700">
                  Re-Activate Expert
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

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
                <label className="block text-sm font-bold text-gray-700 mb-1">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-100 max-h-40 overflow-y-auto">
                  {availableSkills.map((skill) => {
                    const isSelected = (expertFormData.specializations || []).includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => {
                          const current = expertFormData.specializations || [];
                          const updated = isSelected
                            ? current.filter(s => s !== skill)
                            : [...current, skill];
                          setExpertFormData({ ...expertFormData, specializations: updated });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                      >
                        {skill}
                      </button>
                    )
                  })}
                </div>
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
