
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Card, Button, Badge } from '../../components/UI';
import { CheckCircle, XCircle, ArrowRight, FileText, Calendar } from 'lucide-react';
import { Request } from '../../types';

const RequestReceived = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { requests, updateRequest, t, user, fetchRequests } = useAppContext();
    const [request, setRequest] = useState<Request | null>(null);
    const [loading, setLoading] = useState(true);

    // Memoize the found request so we don't need complex effect logic for it
    const foundRequest = requests.find(r => r.id === id);

    useEffect(() => {
        if (foundRequest) {
            setRequest(foundRequest);
            setLoading(false);
        } else if (user?.id) {
            // Not found in current context list, and user is logged in.
            // Attempt fetch only if we haven't exhausted attempts (optional, but for now just fetch once per mount/id)
            const doFetch = async () => {
                try {
                    await fetchRequests(user.id);
                } catch (e) {
                    console.error("Error fetching request:", e);
                } finally {
                    // Turn off loading after fetch attempt, whether found or not
                    setLoading(false);
                }
            };
            doFetch();
        } else {
            // No user or no request, stop loading eventually
            const timer = setTimeout(() => setLoading(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [id, user?.id, foundRequest, fetchRequests]); // Dependency on foundRequest is key

    // Sync state if foundRequest changes (e.g. after fetch)
    useEffect(() => {
        if (foundRequest) {
            setRequest(foundRequest);
        }
    }, [foundRequest]);

    const handleCancel = async () => {
        if (request) {
            await updateRequest(request.id, { status: 'CANCELLED' });
            // The effect will re-run and show the cancelled state content
        }
    };

    const handleContinue = () => {
        if (request) {
            navigate('/client/checkout', { state: { pendingRequest: request } });
        }
    };

    if (loading && !request) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-gray-700">Request not found</h2>
                <Button onClick={() => navigate('/client')} className="mt-4">Back to Dashboard</Button>
            </div>
        );
    }

    // Cancelled State UI (Red/Cancel)
    if (request.status === 'CANCELLED') {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in font-sans">
                {/* Stepper */}
                <Stepper currentStep={3} isCancelled={true} />

                <div className="bg-red-50 rounded-[2rem] p-8 md:p-12 shadow-sm text-center border border-red-100 mt-8">
                    <h1 className="text-3xl font-black text-red-600 mb-4">Request Cancelled</h1>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        This request has been cancelled as per your action.
                    </p>

                    {/* Details Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm text-left mb-8 max-w-4xl mx-auto border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 text-xl">Order Details</h3>
                            <div className="bg-gray-50 px-3 py-1 rounded-full border text-xs text-gray-400 font-mono">#{request.displayId || request.id}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Service</p>
                                <p className="font-bold text-gray-900">{request.serviceName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Date</p>
                                <p className="font-bold text-gray-900">{new Date(request.dateCreated || request.createdAt!).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={() => navigate('/')} className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800">
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    // Received State UI (Green) - LTR English
    return (
        <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-8 font-sans">
            {/* Stepper */}
            <Stepper currentStep={3} />

            <div className="bg-[#EAFDF5] rounded-[2rem] p-8 md:p-12 shadow-sm text-center relative overflow-hidden border border-emerald-100 mt-8">

                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Request Received</h1>
                <p className="text-gray-500 mb-12 max-w-xl mx-auto text-lg font-medium">
                    Request received. You can now enter unit details to know and approve the cost.
                </p>

                {/* Details Card - White */}
                <div className="bg-white rounded-3xl p-8 shadow-sm text-left mb-12 max-w-4xl mx-auto">
                    <h3 className="font-bold text-gray-900 text-2xl mb-8">Order Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                        {/* Service Type */}
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Package Type</p>
                            <div className="flex items-center gap-3">
                                <FileText className="text-gray-400" size={20} />
                                <span className="font-bold text-gray-900 text-lg">{request.serviceName}</span>
                            </div>
                        </div>



                        {/* Customer Name */}
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Customer Name</p>
                            <div className="flex items-center gap-3">
                                <div className="text-gray-400">👤</div>
                                <span className="font-bold text-gray-900 text-lg">{user?.name || 'Client'}</span>
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="col-span-1 md:col-span-2">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Mobile Number</p>
                            <div className="flex items-center gap-3">
                                <div className="text-gray-400">📞</div>
                                <span className="font-bold text-gray-900 text-lg tracking-widest">
                                    {user?.mobileNumber || user?.email || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={handleCancel}
                        className="w-full sm:w-auto px-12 py-3.5 rounded-xl bg-red-100 text-red-500 font-bold hover:bg-red-200 transition-colors"
                    >
                        Cancel Order
                    </button>
                    <button
                        onClick={handleContinue}
                        className="w-full sm:w-auto px-12 py-3.5 rounded-xl bg-[#FCD34D] text-gray-900 font-bold hover:bg-[#FBBF24] shadow-lg shadow-yellow-100 transition-all transform hover:-translate-y-1"
                    >
                        Continue to Completion
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reusable Stepper Component - LTR English
const Stepper = ({ currentStep, isCancelled = false }: { currentStep: number, isCancelled?: boolean }) => {
    const steps = ['Service Selection', 'Confirm Order', 'Unit Details', 'Payment'];

    return (
        <div className="flex items-center justify-between max-w-4xl mx-auto relative px-4 text-sm font-bold text-gray-400">
            {/* Connector Line */}
            <div className="absolute left-0 top-4 right-0 h-1 bg-gray-200 -z-10 rounded-full"></div>
            {/* Active Line Overlay */}
            <div
                className={`absolute left-0 top-4 h-1 -z-10 rounded-full transition-all duration-500 ${isCancelled ? 'bg-red-400' : 'bg-[#65a30d]'}`}
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((step, i) => {
                const stepNum = i + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum <= currentStep;

                let bgClass = 'bg-white border-gray-300 text-gray-400';
                if (isCancelled && isActive) {
                    bgClass = 'bg-red-500 border-red-500 text-white';
                } else if (isCompleted) {
                    bgClass = 'bg-[#65a30d] border-[#65a30d] text-white'; // Green-600 like
                }

                return (
                    <div key={i} className="flex flex-col items-center gap-2 px-2 box-decoration-clone bg-white/50 backdrop-blur-sm rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-colors ${bgClass}`}>
                            {stepNum}
                        </div>
                        <span className={`hidden sm:block ${isCompleted ? 'text-gray-800' : ''}`}>{step}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default RequestReceived;
