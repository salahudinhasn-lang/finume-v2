
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
        <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-8">
            <Card className="p-8 shadow-2xl border-t-4 border-t-green-500">
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <CheckCircle size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Received</h1>
                    <p className="text-gray-500 text-lg">Your request has been created successfully and is pending payment.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-gray-500" /> Request Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Service / Plan</p>
                            <p className="font-bold text-gray-900 text-lg">{request.serviceName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Request ID</p>
                            <p className="font-mono text-gray-700 bg-white px-2 py-1 rounded border inline-block">{request.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Amount Due</p>
                            <p className="font-bold text-primary-600 text-xl">{request.amount.toLocaleString()} SAR</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Created Date</p>
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <Calendar size={16} />
                                {new Date(request.dateCreated || request.createdAt!).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        variant="danger"
                        onClick={handleCancel}
                        className="flex items-center justify-center gap-2 px-8"
                    >
                        <XCircle size={18} /> Cancel Order
                    </Button>
                    <Button
                        onClick={handleContinue}
                        className="flex items-center justify-center gap-2 px-8 bg-gray-900 text-white hover:bg-gray-800 shadow-lg transform transition-transform hover:-translate-y-1"
                    >
                        Continue to Payment <ArrowRight size={18} />
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default RequestReceived;
