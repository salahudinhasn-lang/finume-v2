
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Card, Button, Badge } from '../../components/UI';
import { CheckCircle, XCircle, ArrowRight, FileText, Calendar } from 'lucide-react';
import { Request } from '../../types';

const RequestReceived = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { requests, updateRequest, t } = useAppContext();
    const [request, setRequest] = useState<Request | null>(null);

    useEffect(() => {
        const found = requests.find(r => r.id === id);
        if (found) {
            setRequest(found);
        }
    }, [id, requests]);

    const handleCancel = () => {
        if (request) {
            updateRequest(request.id, { status: 'CANCELLED' });
            navigate('/client');
        }
    };

    const handleContinue = () => {
        if (request) {
            navigate('/client/checkout', { state: { pendingRequest: request } });
        }
    };

    if (!request) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-8 font-sans">

            {/* Stepper */}
            <div className="flex items-center justify-between max-w-4xl mx-auto mb-12 relative px-4 text-sm font-bold text-gray-400">
                {/* Connector Line */}
                <div className="absolute left-0 top-4 right-0 h-1 bg-gray-200 -z-10 rounded-full"></div>

                {/* Steps */}
                {['Select Service', 'Confirm Request', 'Received', 'Payment'].map((step, i) => {
                    const stepNum = i + 1;
                    const isActive = stepNum === 3; // Current step
                    const isCompleted = stepNum < 3;

                    return (
                        <div key={i} className="flex flex-col items-center gap-2 bg-gray-50 px-2 box-decoration-clone">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-colors ${isActive ? 'bg-green-500 border-green-500 text-white' :
                                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                        'bg-white border-gray-300 text-gray-400'
                                }`}>
                                {isCompleted ? <CheckCircle size={16} /> : stepNum}
                            </div>
                            <span className={`${isActive || isCompleted ? 'text-gray-800' : ''}`}>{step}</span>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Card - Mint Background */}
            <div className="bg-[#EAFDF5] rounded-[2rem] p-8 md:p-12 shadow-sm text-center relative overflow-hidden border border-green-50">

                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Request Received Successfully</h1>
                <p className="text-gray-600 mb-12 max-w-xl mx-auto text-lg">
                    Your request has been received. You can now proceed to payment to finalize your order.
                </p>

                {/* Details Card - White */}
                <div className="bg-white rounded-3xl p-8 shadow-sm text-left mb-12 max-w-4xl mx-auto">
                    <h3 className="font-bold text-gray-900 text-xl mb-8 flex items-center justify-between">
                        Request Details
                        <span className="text-xs font-normal text-gray-400 bg-gray-50 px-3 py-1 rounded-full border">ID: {request.id}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                        {/* Service Type */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-500">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Service Type</p>
                                <p className="font-bold text-gray-900 text-lg">{request.serviceName}</p>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-500">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Date Created</p>
                                <p className="font-bold text-gray-900 text-lg">{new Date(request.dateCreated || request.createdAt!).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Client Name */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-500">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Client Name</p>
                                <p className="font-bold text-gray-900 text-lg">{request.clientName || 'Valued Client'}</p>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-500">
                                <ArrowRight size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                                <p className="font-bold text-primary-600 text-lg">{request.amount.toLocaleString()} SAR</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={handleCancel}
                        className="w-full sm:w-auto px-12 py-3.5 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-colors"
                    >
                        Cancel Order
                    </button>
                    <button
                        onClick={handleContinue}
                        className="w-full sm:w-auto px-12 py-3.5 rounded-xl bg-[#FCD34D] text-gray-900 font-bold hover:bg-[#FBBF24] shadow-lg shadow-yellow-100 transition-all transform hover:-translate-y-1"
                    >
                        Continue to Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestReceived;
