
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Card } from '../../components/UI';
import { CheckCircle, CreditCard, Lock, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Request } from '../../types';

const PaymentPage = () => {
    const { user, addRequest, updateRequestStatus, t, language } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    // Get state passed from dashboard (service, file info, etc)
    const { pendingRequest } = location.state || {}; // Expecting a prepared request object

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'MADA' | 'VISA' | 'APPLE' | 'STC'>('MADA');

    // If no request data, redirect back
    if (!pendingRequest) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-gray-500 mb-4">No pending order found.</p>
                <Button onClick={() => navigate('/client')}>Back to Dashboard</Button>
            </div>
        )
    }

    const handlePay = () => {
        setIsProcessing(true);

        // Simulate API call
        setTimeout(() => {
            // Update the existing request status from PENDING_PAYMENT to NEW
            // This starts the official workflow
            updateRequestStatus(pendingRequest.id, 'NEW');

            setIsProcessing(false);
            setIsSuccess(true);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t('client.paymentSuccess')}</h2>
                <p className="text-gray-500 text-lg mb-8 max-w-md text-center">{t('client.paymentSuccessDesc')}</p>
                <Button onClick={() => navigate('/client/requests')} className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 rounded-xl shadow-lg">
                    {t('client.backToDashboard')}
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft size={18} className={language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'} /> {t('common.back')}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Payment Form */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('client.paymentTitle')}</h1>
                        <p className="text-gray-500">{t('client.paymentDesc')}</p>
                    </div>

                    <Card className="p-6 bg-white shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">{t('client.paymentMethod')}</h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                            {[
                                { id: 'MADA', icon: '💳', name: 'Mada' },
                                { id: 'VISA', icon: '💳', name: 'Visa/Master' },
                                { id: 'APPLE', icon: '', name: 'Apple Pay' },
                                { id: 'STC', icon: '📱', name: 'STC Pay' },
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMethod(m.id as any)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedMethod === m.id
                                        ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold'
                                        : 'border-gray-100 hover:border-gray-200 text-gray-500'
                                        }`}
                                >
                                    <span className="text-2xl mb-1">{m.icon}</span>
                                    <span className="text-sm">{m.name}</span>
                                </button>
                            ))}
                        </div>

                        {selectedMethod !== 'APPLE' && selectedMethod !== 'STC' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('client.cardHolder')}</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="ex. MOHAMMED AL SAUD" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('client.cardNumber')}</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none font-mono" placeholder="0000 0000 0000 0000" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('client.expiry')}</label>
                                        <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-center" placeholder="MM / YY" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('client.cvv')}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input type="text" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-center" placeholder="123" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(selectedMethod === 'APPLE' || selectedMethod === 'STC') && (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                                <p className="mb-2">Click Pay to authenticate with {selectedMethod === 'APPLE' ? 'Apple ID' : 'STC Pay App'}.</p>
                            </div>
                        )}
                    </Card>

                    <p className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                        <ShieldCheck size={14} /> {t('client.secureTransaction')}
                    </p>
                </div>

                {/* Right: Order Summary */}
                <div className="md:col-span-1">
                    <Card className="bg-gray-50 border border-gray-200 shadow-none sticky top-24">
                        <h2 className="font-bold text-lg text-gray-900 mb-6">{t('client.orderSummary')}</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{pendingRequest.serviceName}</span>
                                <span className="font-bold text-gray-900">{pendingRequest.amount.toLocaleString()} {t('common.sar')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">VAT (15%)</span>
                                <span className="font-bold text-gray-900">{(pendingRequest.amount * 0.15).toLocaleString()} {t('common.sar')}</span>
                            </div>
                            <div className="border-t border-gray-200"></div>
                            <div className="flex justify-between text-lg">
                                <span className="font-bold text-gray-900">{t('client.totalDue')}</span>
                                <span className="font-extrabold text-primary-600">{(pendingRequest.amount * 1.15).toLocaleString()} {t('common.sar')}</span>
                            </div>
                        </div>

                        <Button
                            onClick={handlePay}
                            disabled={isProcessing}
                            className="w-full py-3.5 text-lg shadow-lg bg-gray-900 hover:bg-gray-800"
                        >
                            {isProcessing ? (
                                <><Loader2 className="animate-spin mr-2" /> {t('client.processing')}</>
                            ) : (
                                <>{t('client.payNow')}</>
                            )}
                        </Button>

                        <div className="mt-4 flex flex-wrap gap-2 justify-center opacity-50 grayscale">
                            {/* Dummy trust badges */}
                            <div className="h-6 w-10 bg-gray-300 rounded"></div>
                            <div className="h-6 w-10 bg-gray-300 rounded"></div>
                            <div className="h-6 w-10 bg-gray-300 rounded"></div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
