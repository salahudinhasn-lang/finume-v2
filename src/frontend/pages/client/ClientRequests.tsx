
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle, Star, ThumbsUp, X, FileText, Download, Clock, Check, Plus, RefreshCw } from 'lucide-react';
import { Request, Review, FileBatch, DocumentCategory, UploadedFile } from '../../types';
import { DocumentBatchList } from '../../components/DocumentBatchList';
import { SmartUploadWidget } from '../../components/SmartUploadWidget';
import { RequestDetailModal } from '../../components/RequestDetailModal';

const ClientRequests = () => {
    const { user, requests, updateRequestStatus, submitReview, updateRequest, updateClient, clients, refreshData, fetchRequests } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    // Auto-refresh requests every 5 seconds to keep status in sync (e.g. after payment)
    React.useEffect(() => {
        const interval = setInterval(() => {
            if (user?.id) {
                fetchRequests(user.id);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [fetchRequests, user?.id]);

    // Detail Modal State
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

    // Review Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewRequest, setReviewRequest] = useState<Request | null>(null);
    const [reviewData, setReviewData] = useState<{ rating: number, expertFeedback: string, nps: number, adminFeedback: string }>({
        rating: 0, expertFeedback: '', nps: -1, adminFeedback: ''
    });

    const myRequests = requests.filter(r => r.clientId === user?.id);

    // Handle incoming navigation state for auto-opening review
    // Handle incoming navigation state for auto-opening review
    React.useEffect(() => {
        const state = location.state as any;
        if (state?.openReviewFor) {
            const targetReq = requests.find(r => r.id === state.openReviewFor);
            if (targetReq) openReviewModal(targetReq);
            // Clear state
            window.history.replaceState({}, document.title);
        }
    }, [location.state, requests]);

    // DEBUG LOG
    console.log('DEBUG: ClientRequests Render', {
        userId: user?.id,
        totalRequests: requests.length,
        myRequestsCount: myRequests.length,
        firstRequest: requests[0],
        matchExample: requests.find(r => r.clientId === user?.id)
    });
    // Get full client object to access gamification
    const currentClient = clients.find(c => c.id === user?.id);
    const clientGamification = currentClient?.gamification;

    const filteredRequests = myRequests.filter(req => {
        const matchesFilter = filter === 'All' ? true : req.status === filter;
        const matchesSearch = (req.serviceName?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (req.displayId?.toLowerCase() || req.id?.toLowerCase() || '').includes(search.toLowerCase());
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
                expertId: reviewRequest.assignedExpertId || '',
                expertRating: reviewData.rating,
                comment: reviewData.expertFeedback, // Main comment field
                expertComment: reviewData.expertFeedback, // Keep legacy populated
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

    const handleComplianceAction = (action: 'nothing_today' | 'upload_clicked') => {
        if (!currentClient || !clientGamification) return;

        // Logic for "Nothing for Today"
        if (action === 'nothing_today') {
            const newPoints = clientGamification.totalPoints + 3;
            const newStreak = clientGamification.currentStreak + 1; // Simplification (check dates in real app)

            updateClient(currentClient.id, {
                gamification: {
                    ...clientGamification,
                    totalPoints: newPoints,
                    currentStreak: newStreak
                }
            });
            // Toast notification can be added here if toast is available
            // alert(`Checked off! +3 Points. Streak: ${newStreak} Days`); 
        }
    };

    const handleSmartUpload = async (files: File[], requestId: string) => {
        // The widget now handles the actual upload. We just need to refresh the data to show the new files.
        // Gamification Update (Local Optimistic or wait for refresh?) 
        // Let's do optimistic gamification update but rely on refresh for files.

        if (currentClient && clientGamification) {
            const pointsEarned = 10 + (files.length > 10 ? 5 : 0);
            const newPoints = clientGamification.totalPoints + pointsEarned;
            const newStars = clientGamification.totalStars + 1;
            const newStreak = clientGamification.currentStreak + 1;

            updateClient(currentClient.id, {
                gamification: {
                    ...clientGamification,
                    totalPoints: newPoints,
                    totalStars: newStars,
                    currentStreak: newStreak,
                    level: newPoints > 1500 ? 'Platinum' : newPoints > 700 ? 'Gold' : newPoints > 300 ? 'Silver' : 'Bronze'
                }
            });
        }

        // Refresh data to get new files from DB
        await refreshData();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>
                    <p className="text-gray-500">Track the status of your services and deliverables.</p>
                </div>

                <div className="flex flex-1 max-w-md gap-2 w-full">
                    <div className="relative flex-1 flex gap-2">
                        <Button onClick={() => navigate('/', { state: { scrollTo: 'calculator' } })} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/30">
                            <Plus size={20} className="mr-2" /> Add Request
                        </Button>
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
                                <tr key={req.id}
                                    onClick={() => setSelectedRequest(req)}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4 font-mono font-medium text-gray-500">{req.displayId || req.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{req.serviceName || (req as any).service?.nameEn || 'Unknown Service'}</p>
                                        <p className="text-xs text-gray-500">{new Date(req.createdAt || req.dateCreated).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {req.expertName ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs text-primary-700 font-bold">{req.expertName.charAt(0)}</div>
                                                {req.expertName}
                                            </span>
                                        ) : <span className="text-gray-400 italic">Unassigned</span>}
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {(Number(req.amount) * 1.15).toLocaleString()} SAR
                                        <span className="text-[10px] text-gray-400 block">Inc. VAT</span>
                                    </td>
                                    <td className="px-6 py-4"><Badge status={req.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }} className="h-10 w-10 p-0"><Eye size={20} /></Button>
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
                <RequestDetailModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onApprove={handleApproveClick}
                    onUpdateBatches={handleUpdateBatches}
                    onSmartUpload={handleSmartUpload}
                    clientGamification={clientGamification}
                    onComplianceAction={handleComplianceAction}
                />
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
