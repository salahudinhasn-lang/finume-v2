
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button } from '../../components/UI';
import { Users, ShieldCheck, Briefcase, AlertCircle, Eye, X } from 'lucide-react';
import { Expert } from '../../types';

export default function AdminExpertsV2() {
    const { experts, refreshData, updateExpertStatus, apiError, isLoading } = useAppContext();
    const [filter, setFilter] = useState('ALL');
    const [viewingExpert, setViewingExpert] = useState<Expert | null>(null);

    // Stats
    const totalRegistered = experts ? experts.length : 0;
    const inVetting = experts ? experts.filter(e => (e.status || '').toUpperCase() === 'VETTING').length : 0;
    const activeExperts = experts ? experts.filter(e => (e.status || '').toUpperCase() === 'ACTIVE').length : 0;

    // Filter - Use Safe Getters
    const filteredExperts = (experts || []).filter(e => {
        if (filter === 'ALL') return true;
        const status = getExpertField(e, 'status') || '';
        return status.toUpperCase() === filter;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Error Alert */}
            {apiError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex justify-between items-center animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span className="font-medium">{apiError}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="text-red-700 hover:bg-red-100 h-8">Retry</Button>
                </div>
            )}

            {/* ... header ... */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expert Management</h1>
                    <p className="text-gray-500 mt-1">Lifecycle management from vetting to activation.</p>
                </div>
            </div>

            {/* Cards */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div
                    onClick={() => setFilter('ALL')}
                    className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${filter === 'ALL' ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${filter === 'ALL' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Users size={20} />
                        </div>
                        <span className={`text-2xl font-bold ${filter === 'ALL' ? 'text-blue-700' : 'text-gray-700'}`}>{totalRegistered}</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Registered</p>
                </div>

                <div
                    onClick={() => setFilter('VETTING')}
                    className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${filter === 'VETTING' ? 'bg-orange-50 border-orange-500 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${filter === 'VETTING' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                            <ShieldCheck size={20} />
                        </div>
                        <span className={`text-2xl font-bold ${filter === 'VETTING' ? 'text-orange-700' : 'text-gray-700'}`}>{inVetting}</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">In Vetting</p>
                </div>

                <div
                    onClick={() => setFilter('ACTIVE')}
                    className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${filter === 'ACTIVE' ? 'bg-green-50 border-green-500 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${filter === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Briefcase size={20} />
                        </div>
                        <span className={`text-2xl font-bold ${filter === 'ACTIVE' ? 'text-green-700' : 'text-gray-700'}`}>{activeExperts}</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Experts</p>
                </div>
            </div>

            {/* Table */}
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
                            {isLoading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        <div className="flex justify-center items-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                        <p>Loading experts...</p>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredExperts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        No experts found.
                                    </td>
                                </tr>
                            )}
                            {filteredExperts.map((expert) => {
                                const status = getExpertField(expert, 'status') || 'UNKNOWN';
                                const specializations = getExpertField(expert, 'specializations') || [];
                                const bio = getExpertField(expert, 'bio') || ''; // Example usage

                                return (
                                    <tr key={expert.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setViewingExpert(expert)}>
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    {expert.avatarUrl ? <img src={expert.avatarUrl} alt="" className="w-full h-full object-cover" /> : <Users size={18} className="text-gray-400" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 hover:text-primary-600 transition-colors">{expert.name || 'Unknown Expert'}</p>
                                                    <p className="text-xs text-gray-500">{expert.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(specializations) && specializations.map((s: any, i: number) => (
                                                    <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md border border-gray-200">{String(s)}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                status === 'VETTING' ? 'bg-orange-100 text-orange-700' :
                                                    status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                {/* View Profile Button */}
                                                <button
                                                    onClick={() => setViewingExpert(expert)}
                                                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="View Profile"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {(status || '').toUpperCase() === 'VETTING' && (
                                                    <>
                                                        <Button size="sm" variant="outline" onClick={() => updateExpertStatus(expert.id, 'SUSPENDED')} className="text-xs h-8 px-2 text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                                                        <Button size="sm" onClick={() => updateExpertStatus(expert.id, 'ACTIVE')} className="text-xs h-8 px-2 bg-green-600 hover:bg-green-700 shadow-sm">Approve</Button>
                                                    </>
                                                )}
                                                {(status || '').toUpperCase() === 'ACTIVE' && (
                                                    <Button size="sm" variant="danger" onClick={() => updateExpertStatus(expert.id, 'SUSPENDED')} className="text-xs h-8 px-2">Suspend</Button>
                                                )}
                                                {(status || '').toUpperCase() === 'SUSPENDED' && (
                                                    <Button size="sm" variant="secondary" onClick={() => updateExpertStatus(expert.id, 'ACTIVE')} className="text-xs h-8 px-2 bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Reactivate</Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* View Expert Details Modal */}
            {viewingExpert && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200" onClick={() => setViewingExpert(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-bold text-xl">Expert Profile</h3>
                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{viewingExpert.id}</p>
                            </div>
                            <button onClick={() => setViewingExpert(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={24} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left Column: Avatar & Quick Info */}
                                <div className="flex flex-col items-center gap-4 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6 shrink-0">
                                    <img src={viewingExpert.avatarUrl || ''} className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-lg" />
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-gray-900">{viewingExpert.name}</h2>
                                        <div className="mt-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewingExpert.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                viewingExpert.status === 'VETTING' ? 'bg-orange-100 text-orange-700' :
                                                    viewingExpert.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {viewingExpert.status}
                                            </span>
                                        </div>
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

        </div>
    );
}

// Helper to safely extract data even if structure is nested (Legacy/Cached API support)
function getExpertField(expert: any, field: string) {
    if (expert[field]) return expert[field];
    if (expert.expertProfile && expert.expertProfile[field]) return expert.expertProfile[field];
    return null;
}
