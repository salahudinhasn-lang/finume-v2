
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Card } from '../../components/UI';
import { CheckCircle, CreditCard, Lock, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Request } from '../../types';
import { MOCK_PLANS } from '../../mockData';

const PaymentPage = () => {
    const { user, addRequest, updateRequest, requests, services, plans, t, language, settings } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // 1. Get State
    const stateRequest = location.state?.pendingRequest;

    // 2. Derive Request Data or Use State
    const [pendingRequest, setPendingRequest] = useState<Request | null>(stateRequest || null);

    useEffect(() => {
        const initializeFromParams = async () => {
            if (pendingRequest) return;

            const planId = searchParams.get('planId');
            const serviceId = searchParams.get('serviceId');
            const billing = searchParams.get('billing');

            if (planId) {
                const plan = plans.find(p => p.id === planId);
                if (plan && user) {
                    const discount = billing === 'YEARLY' ? (settings?.yearlyDiscountPercentage || 20) / 100 : 0;
                    const finalPrice = billing === 'YEARLY' ? Math.round(plan.price * 12 * (1 - discount)) : plan.price;

                    const newReq: any = {
                        id: `SUB-${Date.now()}`,
                        pricingPlanId: plan.id,
                        serviceName: `${plan.name} (${billing || 'YEARLY'})`,
                        clientId: user.id,
                        clientName: user.name,
                        expertId: null,
                        expertName: null,
                        status: 'PENDING_PAYMENT',
                        dateCreated: new Date().toISOString(),
                        amount: finalPrice,
                        description: `Subscription to ${plan.name} plan. Billed ${billing || 'YEARLY'}.`,
                        batches: []
                    };
                    setPendingRequest(newReq);
                    // Optionally autosave to DB here if desired, 
                    // but typically we wait for "Continue" or "Pay".
                    // However, to match "Request Received" ID flow, we might need to save.
                    // But PaymentPage is for Checkout. 
                    // If user wants to see "Request Received" page content, we should maybe redirect there?
                    // User said: "direct him to the request received".
                    // Request Received page usually shows details.
                    // Making this page handle the "Creation" on the fly is good.
                }
            } else if (serviceId) {
                const service = services.find(s => s.id === serviceId);
                if (service && user) {
                    const newReq: any = {
                        id: `REQ-${Date.now()}`,
                        serviceId: service.id,
                        serviceName: service.nameEn,
                        clientId: user.id,
                        clientName: user.name,
                        expertId: null,
                        expertName: null,
                        status: 'PENDING_PAYMENT',
                        dateCreated: new Date().toISOString(),
                        amount: service.price,
                        description: service.description,
                        batches: []
                    };
                    setPendingRequest(newReq);
                }
            } else if (!stateRequest) {
                navigate('/client');
            }
        };

        initializeFromParams();
    }, [pendingRequest, stateRequest, navigate, searchParams, plans, services, user, settings]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'MADA' | 'VISA' | 'APPLE' | 'STC'>('VISA');

    const handlePay = async () => {
        if (!pendingRequest) return;
        setIsProcessing(true);
        try {
            // Find existing
            const isExisting = requests.some(r => r.id === pendingRequest.id);
            if (isExisting) {
                await updateRequest(pendingRequest.id, { status: 'NEW' });
            } else {
                await addRequest({ ...pendingRequest, status: 'NEW' });
            }
            setIsSuccess(true);
        } catch (e) {
            console.error(e);
            alert('Payment processing failed.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!pendingRequest) return;
        if (confirm('Are you sure you want to cancel this order?')) {
            await updateRequest(pendingRequest.id, { status: 'CANCELLED' });
            navigate(`/client/request-received/${pendingRequest.id}`);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t('client.paymentSuccess')}</h2>
                <Button onClick={() => navigate('/client/requests')} className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 rounded-xl shadow-lg mt-8">
                    {t('client.backToDashboard')}
                </Button>
            </div>
        );
    }

    if (!pendingRequest) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    // Calculate VAT
    // Calculate VAT
    const subtotal = Number(pendingRequest.amount);
    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 font-sans">

            {/* Stepper (Step 4 Active) */}
            <div className="flex items-center justify-between max-w-4xl mx-auto mb-12 relative px-4 text-sm font-bold text-gray-400 flex-row-reverse">
                <div className="absolute left-0 top-4 right-0 h-1 bg-gray-200 -z-10 rounded-full"></div>
                <div className="absolute right-0 top-4 h-1 bg-[#65a30d] -z-10 rounded-full w-full"></div>
                {['Service Selection', 'Confirm Order', 'Unit Details', 'Payment'].map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 px-2 bg-white/50 backdrop-blur-sm rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-colors bg-[#65a30d] border-[#65a30d] text-white`}>
                            {i + 1}
                        </div>
                        <span className="hidden sm:block text-gray-800">{step}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-8">

                {/* Left: Summary (Order: 1 on mobile, 1 on desktop based on image "left side") */}
                <div className="w-full md:w-1/3 order-2 md:order-1">
                    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-right">Payment Summary</h2>

                        <div className="space-y-4 text-right">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR</span>
                                <span className="text-gray-500 text-sm">Base Price</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">0.00 SAR</span>
                                <span className="text-gray-500 text-sm">Additional Fees</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">{vat.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR</span>
                                <span className="text-gray-500 text-sm">VAT (15%)</span>
                            </div>

                            <div className="h-px bg-gray-100 my-4"></div>

                            <div className="flex justify-between items-center text-xl">
                                <span className="font-black text-[#65a30d]">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR</span>
                                <span className="font-bold text-gray-900">Total</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Payment Method (Order: 1 on mobile, 2 on desktop) */}
                <div className="w-full md:w-2/3 order-1 md:order-2">
                    <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-right">Choose Payment Method</h1>

                        {/* Payment Selection Box */}
                        <div className="border-2 border-[#65a30d] bg-green-50 rounded-2xl p-6 mb-8 relative overflow-hidden">
                            <div className="flex items-center justify-end gap-4 relative z-10">
                                <div className="text-right">
                                    <h3 className="font-bold text-gray-900">Pay Now</h3>
                                    <p className="text-sm text-gray-500">Full amount via Visa/Mastercard</p>
                                </div>
                                <div className="w-6 h-6 rounded-full border-2 border-[#65a30d] flex items-center justify-center bg-white">
                                    <div className="w-3 h-3 rounded-full bg-[#65a30d]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Card Form */}
                        <div className="border border-blue-200 rounded-3xl p-6 md:p-8 relative">
                            <div className="flex items-center gap-2 mb-6 justify-end">
                                <div className="flex gap-2">
                                    <div className="bg-blue-900 text-white text-xs font-bold px-2 py-1 rounded">VISA</div>
                                    <div className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">MC</div>
                                </div>
                                <h3 className="font-bold text-gray-900">Credit Card</h3>
                            </div>

                            <div className="space-y-6 text-right">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Card Number</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-right font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1234 5678 9012 3456" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Expiry</label>
                                        <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="MM/YY" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Secret Code</label>
                                        <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="CVC" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <label className="text-sm font-bold text-gray-600">I agree to terms and conditions</label>
                                    <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between items-center mt-8">
                        <button
                            onClick={handleCancel}
                            className="px-8 py-3 rounded-xl bg-red-100 text-red-500 font-bold hover:bg-red-200 transition-colors w-full sm:w-auto"
                        >
                            Cancel Request
                        </button>
                        <div className="flex gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-8 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors flex-1 sm:flex-none"
                            >
                                Back
                            </button>
                            <button
                                onClick={handlePay}
                                disabled={isProcessing}
                                className="px-12 py-3 rounded-xl bg-[#FCD34D] text-gray-900 font-bold hover:bg-[#FBBF24] shadow-lg shadow-yellow-100 transition-all flex-1 sm:flex-none"
                            >
                                {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
