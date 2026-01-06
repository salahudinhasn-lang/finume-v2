
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Card } from '../../components/UI';
import { CheckCircle, CreditCard, Lock, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Request } from '../../types';
import { MOCK_PLANS } from '../../mockData';

const PaymentPage = () => {
    const { user, addRequest, updateRequestStatus, requests, services, t, language } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // 1. Get State from navigation (priority) OR Params (fallback)
    const stateRequest = location.state?.pendingRequest;
    const planId = searchParams.get('planId') || location.state?.planId;
    const serviceId = searchParams.get('serviceId') || location.state?.serviceId;
    const billingCycle = searchParams.get('billing') || location.state?.billing || 'monthly';

    // 2. Derive Request Data
    const [pendingRequest, setPendingRequest] = useState<Request | null>(stateRequest || null);
    // services is already destructured from context above

    useEffect(() => {
        if (pendingRequest) return;

        if (user) {
            // Handle Plan Subscription
            if (planId) {
                const plan = MOCK_PLANS.find(p => p.id === planId);
                if (plan) {
                    const isYearly = billingCycle === 'yearly';
                    const basePrice = plan.price;
                    const finalAmount = isYearly ? Math.floor(basePrice * 12 * 0.8) : basePrice;

                    setPendingRequest({
                        id: `REQ-${Date.now()}`,
                        clientId: user.id,
                        clientName: user.name,
                        serviceId: plan.id,
                        serviceName: `${plan.name} (${isYearly ? 'Yearly' : 'Monthly'})`,
                        status: 'PENDING_PAYMENT',
                        amount: finalAmount,
                        dateCreated: new Date().toISOString(),
                        description: `Subscription to ${plan.name} - ${isYearly ? 'Yearly Plan (Save 20%)' : 'Monthly Plan'}`,
                        batches: []
                    } as Request);
                }
            }
            // Handle Single Service Booking
            else if (serviceId) {
                const service = services.find(s => s.id === serviceId);
                if (service) {
                    setPendingRequest({
                        id: `REQ-${Date.now()}`,
                        clientId: user.id,
                        clientName: user.name,
                        serviceId: service.id,
                        serviceName: service.nameEn,
                        status: 'PENDING_PAYMENT',
                        amount: service.price,
                        dateCreated: new Date().toISOString(),
                        description: `Booking for ${service.nameEn}`,
                        batches: []
                    } as Request);
                }
            }
        }
    }, [planId, serviceId, billingCycle, user, pendingRequest, services]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'MADA' | 'VISA' | 'APPLE' | 'STC'>('MADA');

    // If no request data and construction failed
    if (!pendingRequest && !planId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-gray-500 mb-4">No pending order found.</p>
                <Button onClick={() => navigate('/client')}>Back to Dashboard</Button>
            </div>
        )
    }

    if (!pendingRequest) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /> Loading Order...</div>;

    const handlePay = () => {
        setIsProcessing(true);

        // Simulate API call
        setTimeout(() => {
            if (pendingRequest) {
                // Check if request already exists in 'requests' (need to import requests from context)
                // Since we don't have 'requests' in scope, we can rely on ID convention or just try to update first.
                // But updateRequest only updates state if ID matches.
                // Best approach: Try to update. If it's a new plan subscription (generated here), add it.
                // If it came from navigation state (ClientServices), it was likely already added as PENDING.

                // However, ClientServices DOES add it.
                // So we should Update.
                // But PaymentPage also handles "New Plan" directly from URL params?
                // In that case (useEffect logic), we generated a new ID but didn't add it to context yet.

                // Let's assume: If it came from state (ClientServices), it's in DB.
                // If constructed here (Plan), it's not.

                // Better yet: we can check 'requests' if we import it.
                // Let's add 'requests' to the destructuring at the top.

                // For now, let's implement the logic assuming we have 'requests' available (will add to destructuring).
                const isExisting = requests.some(r => r.id === pendingRequest.id);

                if (isExisting) {
                    updateRequestStatus(pendingRequest.id, 'NEW');
                } else {
                    addRequest({ ...pendingRequest, status: 'NEW' });
                }
            }
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
