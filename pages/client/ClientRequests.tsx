
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle, Star, ThumbsUp, X, FileText, Download, Clock, Check } from 'lucide-react';
import { Request, Review, FileBatch } from '../../types';
import { FileBatchManager } from '../../components/FileBatchManager';

const ClientRequests = () => {
    const { user, requests, updateRequestStatus, submitReview, updateRequest } = useAppContext();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    // Detail Modal State
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

    // Review Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewRequest, setReviewRequest] = useState<Request | null>(null);
    const [reviewData, setReviewData] = useState<{ rating: number, expertFeedback: string, nps: number, adminFeedback: string }>({
        rating: 0, expertFeedback: '', nps: -1, adminFeedback: ''
    });

    const myRequests = requests.filter(r => r.clientId === user?.id);

    const filteredRequests = myRequests.filter(req => {
        const matchesFilter = filter === 'All' ? true : req.status === filter;
        const matchesSearch = req.serviceName.toLowerCase().includes(search.toLowerCase()) ||
            req.id.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleApproveClick = (req: Request) => {
        openReviewModal(req);
    };

    const openReviewModal = (req: Request) => {
        setReviewRequest(req);
        setReviewData({ rating: 0, expertFeedback: '', nps: -1, adminFeedback: '' });
        setReviewModalOpen(true);
    };

    const handleSubmitReview = () => {
        if (reviewRequest) {
            const review: Review = {
                requestId: reviewRequest.id,
                expertRating: reviewData.rating,
                expertComment: reviewData.expertFeedback,
                adminNps: reviewData.nps,
                adminComment: reviewData.adminFeedback,
                date: new Date().toISOString().split('T')[0]
            };
            submitReview(reviewRequest.id, review);

            if (reviewRequest.status === 'REVIEW_CLIENT') {
                updateRequestStatus(reviewRequest.id, 'REVIEW_ADMIN');
            }

            setReviewModalOpen(false);
            setReviewRequest(null);
            setSelectedRequest(null);
        }
    };

    const handleUpdateBatches = (newBatches: FileBatch[]) => {
        if (selectedRequest) {
            updateRequest(selectedRequest.id, { batches: newBatches });
            setSelectedRequest(prev => prev ? { ...prev, batches: newBatches } : null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>
                    <p className="text-gray-500">Track the status of your services and deliverables.</p>
                </div>

                <div className="flex flex-1 max-w-md gap-2 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID or Service..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer text-sm font-medium"
                        >
                            <option value="All">All Status</option>
                            <option value="NEW">New</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW_CLIENT">Needs Approval</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                </div>
            </div>

            <Card className="p-0 overflow-hidden shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Expert</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRequests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-gray-500">{req.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{req.serviceName}</p>
                                        <p className="text-xs text-gray-500">{req.dateCreated}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {req.expertName ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs text-primary-700 font-bold">{req.expertName.charAt(0)}</div>
                                                {req.expertName}
                                            </span>
                                        ) : <span className="text-gray-400 italic">Unassigned</span>}
                                    </td>
                                    <td className="px-6 py-4 font-medium">{req.amount.toLocaleString()} SAR</td>
                                    <td className="px-6 py-4"><Badge status={req.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => setSelectedRequest(req)} className="h-10 w-10 p-0"><Eye size={20} /></Button>
                                            {req.status === 'PENDING_PAYMENT' && (
                                                <Button size="sm" onClick={() => navigate('/client/checkout', { state: { pendingRequest: req } })} className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs text-white shadow-md">
                                                    Pay Now
                                                </Button>
                                            )}
                                            {req.status === 'REVIEW_CLIENT' && (
                                                <Button size="sm" onClick={() => handleApproveClick(req)} className="bg-purple-600 hover:bg-purple-700 h-8 text-xs">
                                                    Approve
                                                </Button>
                                            )}
                                            {req.status === 'COMPLETED' && !req.review && (
                                                <Button size="sm" variant="outline" onClick={() => openReviewModal(req)} className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 h-8 text-xs">
                                                    Review
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>No requests found matching your criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Detail Modal with Timeline */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedRequest.serviceName}</h3>
                                <p className="text-gray-500 text-sm font-mono">{selectedRequest.id}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Timeline Stepper */}
                            <div className="relative">
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                                {['NEW', 'MATCHED', 'IN_PROGRESS', 'REVIEW_CLIENT', 'COMPLETED'].map((step, idx) => {
                                    const statusMap: any = { NEW: 0, MATCHED: 1, IN_PROGRESS: 2, REVIEW_CLIENT: 3, REVIEW_ADMIN: 4, COMPLETED: 5 };
                                    const currentStep = statusMap[selectedRequest.status] || 0;
                                    const stepIndex = idx;
                                    // Combine review statuses visually if needed, but here simple mapping
                                    const isCompleted = stepIndex < currentStep;
                                    const isCurrent = stepIndex === currentStep;

                                    let label = step.replace('_', ' ');
                                    if (step === 'REVIEW_CLIENT') label = 'Review & Approval';

                                    return (
                                        <div key={step} className="flex items-start gap-4 mb-6 relative z-10 last:mb-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors shrink-0 ${isCompleted ? 'bg-green-100 border-green-500 text-green-600' :
                                                isCurrent ? 'bg-blue-100 border-blue-500 text-blue-600 animate-pulse' :
                                                    'bg-white border-gray-200 text-gray-300'
                                                }`}>
                                                {isCompleted ? <Check size={20} /> : (stepIndex + 1)}
                                            </div>
                                            <div className="pt-1">
                                                <h4 className={`font-bold text-sm ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>{label}</h4>
                                                {isCurrent && <p className="text-xs text-blue-600 font-medium mt-1">Current Status</p>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* File Batch Manager Integration */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <FileBatchManager
                                    batches={selectedRequest.batches || []}
                                    onUpdateBatches={handleUpdateBatches}
                                    userRole="CLIENT"
                                    requestId={selectedRequest.id}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                            {selectedRequest.status === 'REVIEW_CLIENT' && (
                                <Button onClick={() => handleApproveClick(selectedRequest)} className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                                    <CheckCircle size={18} /> Approve & Close
                                </Button>
                            )}
                            <Button variant="secondary" onClick={() => setSelectedRequest(null)}>Close Details</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewModalOpen && reviewRequest && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold">
                                    {reviewRequest.status === 'REVIEW_CLIENT' ? 'Approve & Rate Work' : 'Rate & Review'}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">{reviewRequest.serviceName}</p>
                            </div>
                            <button onClick={() => setReviewModalOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                            {reviewRequest.status === 'REVIEW_CLIENT' && (
                                <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-100 flex items-start gap-3">
                                    <CheckCircle size={20} className="mt-0.5 shrink-0" />
                                    <div>
                                        <strong>Approval Confirmation</strong>
                                        <p className="mt-1">By submitting this review, you confirm the work has been completed to your satisfaction and authorize the platform to process the final closure.</p>
                                    </div>
                                </div>
                            )}

                            {/* Expert Review */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                        {reviewRequest.expertName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Expert: {reviewRequest.expertName}</h4>
                                        <p className="text-xs text-gray-500">How was the service provided?</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-center mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                                            className={`p-1 transition-transform hover:scale-110 ${reviewData.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                                        >
                                            <Star size={32} fill="currentColor" />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    placeholder="Describe your experience with the expert..."
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    rows={3}
                                    value={reviewData.expertFeedback}
                                    onChange={(e) => setReviewData(prev => ({ ...prev, expertFeedback: e.target.value }))}
                                />
                            </div>

                            <div className="border-t border-gray-100"></div>

                            {/* Admin/Platform Review (NPS) */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                        <ThumbsUp size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Finume Platform</h4>
                                        <p className="text-xs text-gray-500">How likely are you to recommend us?</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1 justify-center mb-4">
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                                        let colorClass = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
                                        if (reviewData.nps === score) {
                                            if (score <= 6) colorClass = 'bg-red-500 text-white';
                                            else if (score <= 8) colorClass = 'bg-yellow-500 text-white';
                                            else colorClass = 'bg-green-500 text-white';
                                        }
                                        return (
                                            <button
                                                key={score}
                                                onClick={() => setReviewData(prev => ({ ...prev, nps: score }))}
                                                className={`w-8 h-8 rounded text-sm font-bold transition-all ${colorClass}`}
                                            >
                                                {score}
                                            </button>
                                        );
                                    })}
                                </div>
                                <textarea
                                    placeholder="Any feedback for the admin team or platform?"
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    rows={2}
                                    value={reviewData.adminFeedback}
                                    onChange={(e) => setReviewData(prev => ({ ...prev, adminFeedback: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleSubmitReview}
                                disabled={reviewData.rating === 0}
                                className="bg-primary-600 hover:bg-primary-700"
                            >
                                {reviewRequest.status === 'REVIEW_CLIENT' ? 'Confirm Approval' : 'Submit Review'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientRequests;
