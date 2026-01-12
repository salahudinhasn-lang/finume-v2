
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { Search, Edit, X, UserPlus, Save, Filter, Briefcase, DollarSign, Ban, LayoutGrid, List, MoreHorizontal, ArrowRight, FolderCog, Check, Clock, AlertCircle } from 'lucide-react';
import { Request, FileBatch } from '../../types';
import { FileBatchManager } from '../../components/FileBatchManager';

const AdminRequests = () => {
    const { requests, experts, updateRequest, settings } = useAppContext();
    const [viewMode, setViewMode] = useState<'LIST' | 'BOARD'>('LIST');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Modal State
    const [editingRequest, setEditingRequest] = useState<Request | null>(null);
    const [formData, setFormData] = useState<Partial<Request>>({});

    const filteredRequests = requests.filter(r => {
        const matchesSearch =
            r.id.toLowerCase().includes(search.toLowerCase()) ||
            r.clientName.toLowerCase().includes(search.toLowerCase()) ||
            (r.serviceName || '').toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const activeExperts = experts.filter(e => e.status === 'ACTIVE');

    // Logic to recommend experts
    const recommendedExperts = formData.serviceName
        ? activeExperts.filter(e => e.specializations?.some(s => s?.toLowerCase().includes((formData.serviceName || '').toLowerCase()) || (formData.serviceName || '').toLowerCase().includes(s?.toLowerCase())))
        : [];

    const recommendedIds = new Set(recommendedExperts.map(e => e.id));
    const otherExperts = activeExperts.filter(e => !recommendedIds.has(e.id));

    // Handlers
    const handleEdit = (req: Request) => {
        setEditingRequest(req);
        setFormData({ ...req });
    };

    const handleClose = () => {
        setEditingRequest(null);
        setFormData({});
    };

    const handleChange = (field: keyof Request, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleExpertChange = (expertId: string) => {
        if (!expertId) return;
        const expert = activeExperts.find(e => e.id === expertId);
        if (expert) {
            setFormData(prev => ({
                ...prev,
                assignedExpertId: expert.id,
                expertName: expert.name,
                status: prev.status === 'NEW' ? 'MATCHED' : prev.status
            }));
        }
    };

    const handleSave = () => {
        if (editingRequest && editingRequest.id) {
            updateRequest(editingRequest.id, formData);
            handleClose();
        }
    };

    const handleUpdateBatches = (newBatches: FileBatch[]) => {
        setFormData(prev => ({ ...prev, batches: newBatches }));
    };

    // Kanban Columns
    const columns = [
        { id: 'PENDING_PAYMENT', title: 'Pending Payment', color: 'bg-gray-100 text-gray-800' },
        { id: 'NEW', title: 'New', color: 'bg-blue-100 text-blue-800' },
        { id: 'MATCHED', title: 'Matched', color: 'bg-indigo-100 text-indigo-800' },
        { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'REVIEW_CLIENT', title: 'Review', color: 'bg-purple-100 text-purple-800' },
        { id: 'COMPLETED', title: 'Completed', color: 'bg-green-100 text-green-800' }
    ];

    // Helper for Stepper
    const getStepIndex = (status?: string) => {
        switch (status) {
            case 'PENDING_PAYMENT': return 0;
            case 'NEW': return 1;
            case 'MATCHED': return 2;
            case 'IN_PROGRESS': return 3;
            case 'REVIEW_CLIENT':
            case 'REVIEW_ADMIN': return 4;
            case 'COMPLETED': return 5;
            case 'CANCELLED': return -1;
            default: return 0;
        }
    };

    const steps = [
        { label: 'Pending', value: 'PENDING_PAYMENT' },
        { label: 'New', value: 'NEW' },
        { label: 'Matched', value: 'MATCHED' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Review', value: 'REVIEW_ADMIN' },
        { label: 'Completed', value: 'COMPLETED' }
    ];

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-gray-800">Request Pipeline</h1>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('BOARD')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'BOARD' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {viewMode === 'LIST' && (
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 h-full text-sm"
                            >
                                <option value="ALL">All Status</option>
                                {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    )}

                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* VIEW: LIST */}
            {viewMode === 'LIST' && (
                <Card className="p-0 overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Service</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Expert</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status & Progress</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRequests.map(req => {
                                    const progress = Math.min(100, Math.max(5, (getStepIndex(req.status) + 1) * 20));
                                    return (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-gray-500 text-xs">{req.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{req.serviceName}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                        {(req.clientName || '?').charAt(0)}
                                                    </div>
                                                    {req.clientName || 'Unknown Client'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {req.assignedExpertId ? (
                                                    <span className="flex items-center gap-2 text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md w-fit">
                                                        <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                                        {req.expertName}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono">{req.amount.toLocaleString()} SAR</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <Badge status={req.status} />
                                                    {req.status !== 'CANCELLED' && (
                                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${req.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary-500'}`}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {req.status === 'NEW' ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(req); }}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1 h-8 text-xs"
                                                        >
                                                            <UserPlus size={14} /> Assign
                                                        </Button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(req); }}
                                                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-500">No requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* VIEW: BOARD (KANBAN) */}
            {viewMode === 'BOARD' && (
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-[1200px] h-full">
                        {columns.map(col => {
                            const colRequests = filteredRequests.filter(r =>
                                col.id === 'REVIEW_CLIENT' ? ['REVIEW_CLIENT', 'REVIEW_ADMIN'].includes(r.status) : r.status === col.id
                            );

                            return (
                                <div key={col.id} className="flex-1 flex flex-col min-w-[280px] bg-gray-50/50 rounded-xl border border-gray-200 h-full max-h-[calc(100vh-200px)]">
                                    <div className={`p-3 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl sticky top-0 z-10`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${col.color.split(' ')[0].replace('100', '500')}`}></span>
                                            <h3 className="font-bold text-gray-700 text-sm">{col.title}</h3>
                                        </div>
                                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{colRequests.length}</span>
                                    </div>
                                    <div className="p-2 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                                        {colRequests.map(req => (
                                            <div
                                                key={req.id}
                                                onClick={() => handleEdit(req)}
                                                className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all group relative"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{req.id}</span>
                                                    <span className="font-bold text-gray-900 text-xs">{req.amount.toLocaleString()} SAR</span>
                                                </div>
                                                <h4 className="font-bold text-gray-800 text-sm mb-1 leading-tight">{req.serviceName || 'Unnamed Service'}</h4>
                                                <p className="text-xs text-gray-500 mb-3 truncate">{req.clientName || 'Unknown Client'}</p>

                                                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                                    {req.assignedExpertId ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold">
                                                                {req.expertName?.charAt(0)}
                                                            </div>
                                                            <span className="text-xs text-gray-600 truncate max-w-[80px]">{req.expertName}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-orange-500 italic flex items-center gap-1"><Briefcase size={10} /> Unassigned</span>
                                                    )}

                                                    {/* Simple move forward action */}
                                                    {col.id !== 'COMPLETED' && (
                                                        <button
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-primary-600 transition-all"
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(req); }}
                                                        >
                                                            <ArrowRight size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Edit / Manage Modal */}
            {editingRequest && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-lg">Manage Request</h3>
                                <p className="text-gray-400 text-sm font-mono flex items-center gap-2">
                                    {editingRequest.id}
                                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                    {editingRequest.serviceName}
                                </p>
                            </div>
                            <button onClick={handleClose} className="hover:bg-gray-700 p-1 rounded"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-8">

                            {/* Status Stepper - Visual Enhancement */}
                            <div className="mb-2">
                                <div className="flex items-center justify-between relative mb-6">
                                    {/* Connector Line */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 z-0 rounded-full"></div>

                                    {/* Active Progress Line */}
                                    <div
                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 z-0 transition-all duration-500 rounded-full"
                                        style={{ width: `${(getStepIndex(formData.status) / (steps.length - 1)) * 100}%` }}
                                    ></div>

                                    {steps.map((step, idx) => {
                                        const currentIndex = getStepIndex(formData.status);
                                        const isCompleted = idx <= currentIndex;
                                        const isCurrent = idx === currentIndex;

                                        return (
                                            <button
                                                key={step.value}
                                                onClick={() => handleChange('status', step.value)}
                                                className={`relative z-10 flex flex-col items-center group focus:outline-none transition-all duration-300 ${isCurrent ? 'scale-110' : ''}`}
                                                disabled={formData.status === 'CANCELLED'}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all ${isCurrent ? 'bg-primary-600 border-white shadow-lg text-white' :
                                                    isCompleted ? 'bg-green-500 border-white shadow-sm text-white' :
                                                        'bg-white border-gray-200 text-gray-300 group-hover:border-primary-200'
                                                    }`}>
                                                    {isCompleted ? <Check size={16} strokeWidth={3} /> : <span className="text-sm font-bold">{idx + 1}</span>}
                                                </div>
                                                <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider transition-colors ${isCurrent ? 'text-primary-700' :
                                                    isCompleted ? 'text-green-600' : 'text-gray-400'
                                                    }`}>{step.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>

                                {formData.status === 'CANCELLED' && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
                                        <Ban size={20} />
                                        <span className="font-bold">This request is Cancelled.</span>
                                        <button onClick={() => handleChange('status', 'NEW')} className="text-sm underline ml-auto">Reactivate</button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Status Control Details */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Order Status Detail</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 bg-white"
                                    >
                                        <option value="PENDING_PAYMENT">PENDING PAYMENT</option>
                                        <option value="NEW">NEW</option>
                                        <option value="MATCHED">MATCHED</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="REVIEW_CLIENT">REVIEW (Client Pending)</option>
                                        <option value="REVIEW_ADMIN">REVIEW (Admin Pending)</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.status === 'REVIEW_CLIENT' && "Waiting for client approval."}
                                        {formData.status === 'REVIEW_ADMIN' && "Waiting for your final approval."}
                                    </p>
                                </div>

                                {/* Assignment & Visibility Control */}
                                <div className={`p-4 rounded-xl border-2 ${!formData.assignedExpertId && formData.visibility !== 'OPEN' ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-4">
                                        <Briefcase size={18} className="text-gray-500" />
                                        Distribution Mode
                                    </label>

                                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 mb-4 shadow-sm">
                                        <button
                                            onClick={() => handleChange('visibility', 'ASSIGNED')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${formData.visibility === 'ASSIGNED' || (!formData.visibility && formData.assignedExpertId) ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Direct Assignment
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleChange('visibility', 'OPEN');
                                                handleChange('assignedExpertId', null); // Clear assignment if opening
                                                if (formData.status === 'NEW') handleChange('status', 'MATCHED');
                                            }}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${formData.visibility === 'OPEN' ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Open Pool
                                        </button>
                                    </div>

                                    {formData.visibility === 'OPEN' ? (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <label className="block text-xs font-bold text-gray-600 mb-2">Required Skills (Filter Experts)</label>
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                                {settings?.expertSkills ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {JSON.parse(settings.expertSkills).map((skill: string) => {
                                                            const isSelected = (formData.requiredSkills || []).includes(skill);
                                                            return (
                                                                <button
                                                                    key={skill}
                                                                    onClick={() => {
                                                                        const current = formData.requiredSkills || [];
                                                                        const updated = isSelected ? current.filter(s => s !== skill) : [...current, skill];
                                                                        handleChange('requiredSkills', updated);
                                                                    }}
                                                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${isSelected ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                                                >
                                                                    {skill}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic">No skills configured in Expert Settings.</p>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Only experts with these skills will see this request.</p>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            {formData.assignedExpertId ? (
                                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                            {formData.expertName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-900">{formData.expertName}</p>
                                                            <p className="text-xs text-green-600 flex items-center gap-1">Assigned</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="danger" onClick={() => handleChange('assignedExpertId', undefined)} className="text-xs h-7 px-2">
                                                        Change
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <select
                                                        className="w-full px-4 py-2 border border-blue-200 rounded-lg text-sm bg-blue-50/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        onChange={(e) => {
                                                            handleExpertChange(e.target.value);
                                                            handleChange('visibility', 'ASSIGNED'); // Ensure visibility is set
                                                        }}
                                                        value=""
                                                    >
                                                        <option value="" disabled>Select an Expert...</option>
                                                        {recommendedExperts.length > 0 && (
                                                            <optgroup label="Recommended">
                                                                {recommendedExperts.map(ex => (
                                                                    <option key={ex.id} value={ex.id}>{ex.name} — {ex.rating}★</option>
                                                                ))}
                                                            </optgroup>
                                                        )}
                                                        <optgroup label="All Experts">
                                                            {otherExperts.map(ex => (
                                                                <option key={ex.id} value={ex.id}>{ex.name}</option>
                                                            ))}
                                                        </optgroup>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* File Batch Management (Admin View) */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FolderCog size={20} className="text-gray-600" />
                                        <div>
                                            <h3 className="font-bold text-gray-800">Task Files & Batches</h3>
                                            <p className="text-xs text-gray-500">Manage daily deliverables and assign sub-tasks.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                    <FileBatchManager
                                        batches={formData.batches || []}
                                        onUpdateBatches={handleUpdateBatches}
                                        userRole="ADMIN"
                                        requestId={editingRequest.id}
                                        experts={activeExperts}
                                        mainExpertId={formData.assignedExpertId}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
                            <Button variant="secondary" onClick={handleClose}>Close</Button>
                            <Button onClick={handleSave} className="bg-primary-600 hover:bg-primary-700 px-6 shadow-lg">
                                <Save size={18} /> Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminRequests;
