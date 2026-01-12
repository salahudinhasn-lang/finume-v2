
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { Check, Play, Filter, Search, Send, LayoutGrid, List, Clock, User, Calendar, Paperclip, MoreVertical, FileText, AlertCircle, MessageSquare, X, Layers, Briefcase } from 'lucide-react';
import { Request, FileBatch } from '../../types';
import { FileBatchManager } from '../../components/FileBatchManager';

const ExpertTasks = () => {
    const { user, requests, updateRequestStatus, updateRequest } = useAppContext();
    const [viewMode, setViewMode] = useState<'LIST' | 'BOARD'>('LIST');
    const [search, setSearch] = useState('');

    // Detail Modal State
    const [selectedTask, setSelectedTask] = useState<Request | null>(null);

    // Filter tasks: Assigned directly OR sub-task OR Open and matching skills
    const myRequests = requests.filter(r => {
        const isAssignedToMe = r.assignedExpertId === user?.id;
        const isSubTask = r.batches && r.batches.some(b => b.assignedExpertId === user?.id);

        // Open requests: Must be OPEN AND (no skills required OR user has at least one matching skill)
        // If requiredSkills is empty, we assume it's open to all experts if visibility is OPEN.
        const userSkills = user?.specializations || [];
        const matchesSkills = !r.requiredSkills || r.requiredSkills.length === 0 || r.requiredSkills.some(s => userSkills.includes(s));
        const isOpenForMe = r.visibility === 'OPEN' && matchesSkills && !r.assignedExpertId;

        return isAssignedToMe || isSubTask || isOpenForMe;
    });

    const filteredRequests = myRequests.filter(req => {
        const searchMatch =
            (req.serviceName || '').toLowerCase().includes(search.toLowerCase()) ||
            req.clientName.toLowerCase().includes(search.toLowerCase()) ||
            req.id.toLowerCase().includes(search.toLowerCase());
        return searchMatch;
    });

    const columns = [
        { id: 'MATCHED', label: 'To Do', color: 'bg-gray-100 text-gray-700' },
        { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
        { id: 'REVIEW', label: 'In Review', color: 'bg-purple-100 text-purple-700' }, // Groups REVIEW_CLIENT and REVIEW_ADMIN
        { id: 'COMPLETED', label: 'Done', color: 'bg-green-100 text-green-700' }
    ];

    const getColumnId = (status: string, visibility?: string) => {
        if (visibility === 'OPEN') return 'MATCHED'; // Open requests go to To Do
        if (['REVIEW_CLIENT', 'REVIEW_ADMIN'].includes(status)) return 'REVIEW';
        if (['NEW', 'CANCELLED'].includes(status)) return 'OTHER';
        return status;
    };

    // Timer Component
    const WorkTimer = ({ startTime }: { startTime?: string }) => {
        const [elapsed, setElapsed] = useState(0);

        useEffect(() => {
            if (!startTime) return;
            const start = new Date(startTime).getTime();
            const interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - start) / 1000));
            }, 1000);
            return () => clearInterval(interval);
        }, [startTime]);

        const formatTime = (seconds: number) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            return `${h}h ${m}m ${s}s`;
        };

        return (
            <div className="flex items-center gap-2 text-blue-600 font-mono text-sm bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <Clock size={16} className="animate-pulse" />
                {formatTime(elapsed)}
            </div>
        );
    };

    const handleStart = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        // Persist IN_PROGRESS and workStartedAt
        updateRequest(id, {
            status: 'IN_PROGRESS',
            workStartedAt: new Date().toISOString()
        });
    };

    const handleSubmit = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        // Persist REVIEW_CLIENT
        updateRequest(id, { status: 'REVIEW_CLIENT' });
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Controls Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
                    <p className="text-gray-500 text-sm">Organize and track your project deliverables.</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('BOARD')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'BOARD' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Board View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- LIST VIEW --- */}
            {viewMode === 'LIST' && (
                <div className="grid grid-cols-1 gap-4">
                    {filteredRequests.map(req => {
                        const isSubTaskAssignee = req.batches && req.batches.some(b => b.assignedExpertId === user?.id) && req.assignedExpertId !== user?.id;
                        const isOpen = req.visibility === 'OPEN' && !req.assignedExpertId;

                        return (
                            <Card key={req.id} className={`flex flex-col md:flex-row justify-between gap-6 transition-all hover:shadow-md cursor-pointer group ${isOpen ? 'border-purple-200 bg-purple-50/10' : ''}`} onClick={() => setSelectedTask(req)}>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{req.id}</span>
                                        {isOpen ? <Badge status="NEW" label="Available Request" /> : <Badge status={req.status} />}
                                        {isSubTaskAssignee && (
                                            <span className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-100">
                                                <Layers size={10} /> Sub-task
                                            </span>
                                        )}
                                        {/* Timer in List View */}
                                        {req.status === 'IN_PROGRESS' && req.workStartedAt && (
                                            <WorkTimer startTime={req.workStartedAt} />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{req.serviceName}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><User size={14} /> {req.clientName || 'Unknown'}</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {req.dateCreated}</span>
                                    </div>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm mt-2 line-clamp-2">{req.description}</p>
                                </div>

                                <div className="flex flex-col justify-center items-end gap-3 min-w-[150px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                    {!isSubTaskAssignee && <span className="text-xl font-bold text-gray-900">{req.amount.toLocaleString()} SAR</span>}

                                    {isOpen && (
                                        <Button size="sm" onClick={(e) => handleClaim(e, req)} className="w-full bg-purple-600 hover:bg-purple-700 shadow-md">
                                            <Briefcase size={16} /> Claim Request
                                        </Button>
                                    )}

                                    {!isSubTaskAssignee && !isOpen && req.status === 'MATCHED' && (
                                        <Button size="sm" onClick={(e) => handleStart(e, req.id)} className="w-full bg-blue-600 hover:bg-blue-700">
                                            <Play size={16} /> Start Work
                                        </Button>
                                    )}

                                    {!isSubTaskAssignee && !isOpen && req.status === 'IN_PROGRESS' && (
                                        <Button size="sm" onClick={(e) => handleSubmit(e, req.id)} className="w-full bg-purple-600 hover:bg-purple-700">
                                            <Send size={16} /> Submit
                                        </Button>
                                    )}


                                    {['REVIEW_CLIENT', 'REVIEW_ADMIN'].includes(req.status) && (
                                        <div className="flex items-center gap-2 text-orange-600 text-sm font-medium bg-orange-50 px-3 py-1.5 rounded-lg">
                                            <Clock size={16} /> In Review
                                        </div>
                                    )}

                                    {req.status === 'COMPLETED' && (
                                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-lg">
                                            <Check size={16} /> Completed
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                    {filteredRequests.length === 0 && (
                        <div className="text-center py-12 text-gray-500">No tasks found.</div>
                    )}
                </div>
            )}

            {/* --- BOARD VIEW (KANBAN) --- */}
            {viewMode === 'BOARD' && (
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-6 min-w-[1000px] h-full">
                        {columns.map(col => {
                            const colTasks = filteredRequests.filter(r => getColumnId(r.status, r.visibility) === col.id);

                            return (
                                <div key={col.id} className="flex-1 flex flex-col bg-gray-50 rounded-xl border border-gray-200 h-full max-h-[calc(100vh-200px)]">
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl sticky top-0 z-10">
                                        <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${col.color.split(' ')[0].replace('100', '500')}`}></span>
                                            {col.label}
                                        </h3>
                                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                                    </div>

                                    <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                                        {colTasks.map(req => {
                                            const isSubTaskAssignee = req.batches && req.batches.some(b => b.assignedExpertId === user?.id) && req.assignedExpertId !== user?.id;
                                            const isOpen = req.visibility === 'OPEN' && !req.assignedExpertId;

                                            return (
                                                <div
                                                    key={req.id}
                                                    onClick={() => setSelectedTask(req)}
                                                    className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all group relative ${isOpen ? 'ring-2 ring-purple-100' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{req.id}</span>
                                                        {isOpen && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">OPEN</span>}
                                                        {/* Timer in Board View */}
                                                        {req.status === 'IN_PROGRESS' && req.workStartedAt && (
                                                            <div className="scale-75 origin-top-right absolute right-2 top-2">
                                                                <WorkTimer startTime={req.workStartedAt} />
                                                            </div>
                                                        )}
                                                        {/* Context Menu Mock */}
                                                        {(!req.status || req.status !== 'IN_PROGRESS') && <button className="text-gray-300 hover:text-gray-500"><MoreVertical size={14} /></button>}
                                                    </div>
                                                    <h4 className="font-bold text-gray-800 text-sm mb-1 leading-snug">{req.serviceName}</h4>
                                                    <p className="text-xs text-gray-500 mb-3 truncate">{req.clientName}</p>
                                                    {isSubTaskAssignee && (
                                                        <span className="block mb-2 w-fit text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">Sub-task Assigned</span>
                                                    )}

                                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                        {!isSubTaskAssignee && <span className="font-bold text-gray-900 text-xs">{req.amount.toLocaleString()} SAR</span>}

                                                        {isOpen && (
                                                            <button onClick={(e) => handleClaim(e, req)} className="p-1 px-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs font-bold">
                                                                Claim
                                                            </button>
                                                        )}

                                                        {!isSubTaskAssignee && !isOpen && col.id === 'MATCHED' && (
                                                            <button onClick={(e) => handleStart(e, req.id)} className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors" title="Start">
                                                                <Play size={14} fill="currentColor" />
                                                            </button>
                                                        )}
                                                        {!isSubTaskAssignee && !isOpen && col.id === 'IN_PROGRESS' && (
                                                            <button onClick={(e) => handleSubmit(e, req.id)} className="p-1.5 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors" title="Submit">
                                                                <Send size={14} />
                                                            </button>
                                                        )}
                                                        {col.id === 'COMPLETED' && (
                                                            <span className="p-1.5 text-green-600"><Check size={16} /></span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- Task Detail Modal --- */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-xl font-bold text-gray-900">{selectedTask.serviceName}</h2>
                                    <Badge status={selectedTask.status} />
                                    {/* Timer in Modal */}
                                    {selectedTask.status === 'IN_PROGRESS' && selectedTask.workStartedAt && (
                                        <WorkTimer startTime={selectedTask.workStartedAt} />
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><User size={14} /> {selectedTask.clientName}</span>
                                    <span className="flex items-center gap-1"><Calendar size={14} /> Posted {selectedTask.dateCreated}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Project Brief</h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 text-sm leading-relaxed">
                                    {selectedTask.description}
                                </div>
                            </div>

                            {/* File Batch Manager (The Task Manager) */}
                            <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                                <FileBatchManager
                                    batches={selectedTask.batches || []}
                                    onUpdateBatches={handleUpdateBatches}
                                    userRole="EXPERT"
                                    requestId={selectedTask.id}
                                    currentUserId={user?.id}
                                    mainExpertId={selectedTask.assignedExpertId}
                                />
                            </div>

                            {/* Discussion Mock */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Client Messages</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">CL</div>
                                        <div className="bg-gray-100 p-3 rounded-r-xl rounded-bl-xl text-sm text-gray-700">
                                            Hi, please focus on the VAT return for Q3 specifically. Thanks!
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <div className="bg-blue-50 p-3 rounded-l-xl rounded-br-xl text-sm text-blue-800">
                                            Understood. I will ensure Q3 is prioritized.
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">ME</div>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <input type="text" placeholder="Type a message..." className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                    <Button size="sm" variant="secondary"><Send size={16} /></Button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <div className="text-lg font-bold text-gray-900">
                                {selectedTask.assignedExpertId === user?.id ? (
                                    <>{selectedTask.amount.toLocaleString()} <span className="text-sm font-normal text-gray-500">SAR</span></>
                                ) : (
                                    <span className="text-sm text-gray-500">Contributing Expert</span>
                                )}
                            </div>

                            {/* Actions only for Main Expert or OPEN request */}
                            <div className="flex gap-3">
                                {selectedTask.visibility === 'OPEN' && !selectedTask.assignedExpertId && (
                                    <Button onClick={(e) => { handleClaim(e, selectedTask); setSelectedTask(null); }} className="bg-purple-600 hover:bg-purple-700 shadow-md">
                                        <Briefcase size={16} /> Claim This Request
                                    </Button>
                                )}

                                {selectedTask.assignedExpertId === user?.id && (
                                    <>
                                        {selectedTask.status === 'MATCHED' && (
                                            <Button onClick={(e) => { handleStart(e, selectedTask.id); setSelectedTask(null); }} className="bg-blue-600 hover:bg-blue-700">
                                                Start Project
                                            </Button>
                                        )}
                                        {selectedTask.status === 'IN_PROGRESS' && (
                                            <Button onClick={(e) => { handleSubmit(e, selectedTask.id); setSelectedTask(null); }} className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                                                Submit for Approval
                                            </Button>
                                        )}
                                        {['REVIEW_CLIENT', 'REVIEW_ADMIN'].includes(selectedTask.status) && (
                                            <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                                                <AlertCircle size={18} /> Approval Pending
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpertTasks;
