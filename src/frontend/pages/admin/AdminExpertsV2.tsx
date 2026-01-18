
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { Users, ShieldCheck, Briefcase } from 'lucide-react';
import { Expert } from '../../types';

export default function AdminExpertsV2() {
    const { experts, updateExpertStatus } = useAppContext();
    const [filter, setFilter] = useState('ALL');

    // Stats
    const totalRegistered = experts ? experts.length : 0;
    const inVetting = experts ? experts.filter(e => (e.status || '').toUpperCase() === 'VETTING').length : 0;
    const activeExperts = experts ? experts.filter(e => (e.status || '').toUpperCase() === 'ACTIVE').length : 0;

    // Filter
    const filteredExperts = (experts || []).filter(e => {
        if (filter === 'ALL') return true;
        return (e.status || '').toUpperCase() === filter;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
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
                            {filteredExperts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        No experts found.
                                    </td>
                                </tr>
                            )}
                            {filteredExperts.map((expert) => (
                                <tr key={expert.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {expert.avatarUrl ? <img src={expert.avatarUrl} alt="" className="w-full h-full object-cover" /> : <Users size={18} className="text-gray-400" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{expert.name || 'Unknown Expert'}</p>
                                                <p className="text-xs text-gray-500">{expert.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(expert.specializations) && expert.specializations.map((s, i) => (
                                                <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md border border-gray-200">{String(s)}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${expert.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                expert.status === 'VETTING' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {expert.status || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {(expert.status || '').toUpperCase() === 'VETTING' && (
                                                <>
                                                    <Button size="sm" variant="outline" onClick={() => updateExpertStatus(expert.id, 'SUSPENDED')} className="text-xs h-8 px-2 text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                                                    <Button size="sm" onClick={() => updateExpertStatus(expert.id, 'ACTIVE')} className="text-xs h-8 px-2 bg-green-600 hover:bg-green-700 shadow-sm">Approve</Button>
                                                </>
                                            )}
                                            {(expert.status || '').toUpperCase() === 'ACTIVE' && (
                                                <Button size="sm" variant="danger" onClick={() => updateExpertStatus(expert.id, 'SUSPENDED')} className="text-xs h-8 px-2">Suspend</Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
