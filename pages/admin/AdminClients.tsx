import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { Search, FileText, Edit, X, UserMinus, UserPlus, CheckCircle, Save, AlertCircle, Filter, LifeBuoy, Ban, Unlock, Building2, Mail, Phone, User } from 'lucide-react';
import { Client, Request } from '../../types';

const AdminClients = () => {
  const { clients, requests, experts, updateRequest, updateClient } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // State for viewing a specific client's orders
  const [selectedClientOrders, setSelectedClientOrders] = useState<Client | null>(null);

  // State for editing a specific client profile
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientFormData, setClientFormData] = useState<Partial<Client>>({});

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.companyName.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = statusFilter === 'ALL' || c.zatcaStatus === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const clientRequests = selectedClientOrders ? requests.filter(r => r.clientId === selectedClientOrders.id) : [];

  // --- Handlers ---
  const handleSupport = (client: Client) => {
      // Simulate opening a support ticket via email
      window.location.href = `mailto:${client.email}?subject=Support Request for ${client.companyName}&body=Dear ${client.name},%0D%0A%0D%0AWe are reaching out regarding...`;
  };

  const handleEditProfile = (client: Client) => {
      setEditingClient(client);
      setClientFormData({ ...client });
  };

  const handleSuspend = (client: Client) => {
      const isSuspended = client.zatcaStatus === 'RED';
      const action = isSuspended ? 'REACTIVATE' : 'SUSPEND';
      const newStatus = isSuspended ? 'GREEN' : 'RED';
      
      if (window.confirm(`Are you sure you want to ${action} access for ${client.companyName}?`)) {
          updateClient(client.id, { zatcaStatus: newStatus });
      }
  };

  const handleSaveProfile = () => {
      if (editingClient && editingClient.id) {
          updateClient(editingClient.id, clientFormData);
          setEditingClient(null);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-500">View customer database, compliance status, and history.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
             <div className="relative h-full">
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 h-full text-sm font-medium text-gray-700"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="GREEN">Compliant (Green)</option>
                    <option value="YELLOW">Review (Yellow)</option>
                    <option value="RED">Suspended (Red)</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search company or contact..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
            </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Company Profile</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">ZATCA Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                            {client.companyName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{client.companyName}</p>
                            <p className="text-xs text-gray-500">{client.industry}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                          <img src={client.avatarUrl} alt="" className="w-6 h-6 rounded-full bg-gray-200" />
                          <span className="text-gray-700 font-medium">{client.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-8">{client.email}</p>
                  </td>
                  <td className="px-6 py-4">
                      <span className="font-mono font-medium text-gray-900">{client.totalSpent.toLocaleString()} SAR</span>
                  </td>
                  <td className="px-6 py-4"><Badge status={client.zatcaStatus} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                         <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedClientOrders(client); }} 
                            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-primary-600 rounded-lg transition-colors" 
                            title="View Orders"
                         >
                            <FileText size={18} />
                         </button>
                         <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleEditProfile(client); }} 
                            className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" 
                            title="Edit Profile"
                         >
                            <Edit size={18} />
                         </button>
                         <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSupport(client); }} 
                            className="p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors" 
                            title="Contact Support"
                         >
                            <LifeBuoy size={18} />
                         </button>
                         <div className="w-px h-6 bg-gray-200 mx-1 self-center"></div>
                         <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSuspend(client); }} 
                            className={`p-2 rounded-lg transition-colors ${client.zatcaStatus === 'RED' ? 'text-amber-600 hover:bg-amber-50' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`} 
                            title={client.zatcaStatus === 'RED' ? "Reactivate Client" : "Suspend Client"}
                         >
                            {client.zatcaStatus === 'RED' ? <Unlock size={18} /> : <Ban size={18} />}
                         </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <Search size={40} className="mb-2 opacity-20" />
                            <p>No clients found.</p>
                        </div>
                    </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- Client Orders Modal --- */}
      {selectedClientOrders && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
           <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <div className="flex items-center gap-4">
                       <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                           <Building2 size={24} className="text-gray-700" />
                       </div>
                       <div>
                           <h3 className="text-xl font-bold text-gray-900">{selectedClientOrders.companyName}</h3>
                           <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><User size={14}/> {selectedClientOrders.name}</span>
                                <span>•</span>
                                <span>{clientRequests.length} Orders</span>
                           </div>
                       </div>
                   </div>
                   <button onClick={() => setSelectedClientOrders(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} className="text-gray-500" /></button>
               </div>
               
               <div className="overflow-y-auto flex-1 p-0">
                   {clientRequests.length > 0 ? (
                       <table className="w-full text-sm text-left">
                           <thead className="bg-white text-gray-500 font-medium sticky top-0 shadow-sm z-10">
                               <tr>
                                   <th className="px-6 py-4 bg-gray-50/50">ID</th>
                                   <th className="px-6 py-4 bg-gray-50/50">Service</th>
                                   <th className="px-6 py-4 bg-gray-50/50">Expert</th>
                                   <th className="px-6 py-4 bg-gray-50/50">Status</th>
                                   <th className="px-6 py-4 bg-gray-50/50 text-right">Amount</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                               {clientRequests.map(req => (
                                   <tr key={req.id} className="hover:bg-gray-50">
                                       <td className="px-6 py-4 font-mono text-gray-500">{req.id}</td>
                                       <td className="px-6 py-4 font-bold text-gray-800">{req.serviceName}</td>
                                       <td className="px-6 py-4">
                                            {req.assignedExpertId ? (
                                                <span className="text-primary-700 font-medium flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs">{req.expertName?.charAt(0)}</div>
                                                    {req.expertName}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Unassigned</span>
                                            )}
                                       </td>
                                       <td className="px-6 py-4"><Badge status={req.status} /></td>
                                       <td className="px-6 py-4 text-right font-mono">{req.amount.toLocaleString()} SAR</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   ) : (
                       <div className="text-center py-20 text-gray-500">
                           <p>No orders history found for this client.</p>
                       </div>
                   )}
               </div>
               <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                   <Button variant="secondary" onClick={() => setSelectedClientOrders(null)}>Close</Button>
               </div>
           </div>
        </div>
      )}

      {/* --- Edit Client Profile Modal --- */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
                <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">Edit Client Profile</h3>
                    <button onClick={() => setEditingClient(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>
                
                <div className="p-8 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={clientFormData.companyName || ''}
                                onChange={e => setClientFormData({...clientFormData, companyName: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Contact Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            value={clientFormData.name || ''}
                            onChange={e => setClientFormData({...clientFormData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Industry</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            value={clientFormData.industry || ''}
                            onChange={e => setClientFormData({...clientFormData, industry: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Compliance Status (ZATCA)</label>
                        <select 
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                             value={clientFormData.zatcaStatus}
                             onChange={(e: any) => setClientFormData({...clientFormData, zatcaStatus: e.target.value})}
                        >
                            <option value="GREEN">Green (Compliant)</option>
                            <option value="YELLOW">Yellow (Review Needed)</option>
                            <option value="RED">Red (Non-Compliant/Suspended)</option>
                        </select>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setEditingClient(null)}>Cancel</Button>
                    <Button onClick={handleSaveProfile} className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200">
                        <Save size={18} /> Save Changes
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
export default AdminClients;