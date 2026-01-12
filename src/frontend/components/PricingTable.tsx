import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PLANS } from '../mockData';
import { Check, X, HelpCircle, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface PricingTableProps {
    billingCycle?: 'monthly' | 'yearly';
    highlightedPlanId?: string | null;
}

const PricingTable = ({ billingCycle: externalBilling, highlightedPlanId }: PricingTableProps) => {
    const navigate = useNavigate();
    const { settings, plans, user, addRequest } = useAppContext();
    const [internalBilling, setInternalBilling] = useState<'monthly' | 'yearly'>('monthly');
    const [showOverage, setShowOverage] = useState(false);

    const billingCycle = externalBilling || internalBilling;

    const discountPercent = settings?.yearlyDiscountPercentage || 20;
    const discountMultiplier = 1 - (discountPercent / 100);

    const toggleBilling = () => {
        setInternalBilling(prev => prev === 'monthly' ? 'yearly' : 'monthly');
    };

    const calculatePrice = (basePrice: number) => {
        if (billingCycle === 'yearly') {
            // Show monthly equivalent (Dynamic discount off)
            return Math.floor(basePrice * discountMultiplier).toLocaleString();
        }
        return basePrice.toLocaleString();
    };

    if (!plans || plans.length === 0) return null;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-white mb-4">Compare Plans & Limits</h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                    Choose the plan that fits your current business scale. Upgrade anytime as you grow.
                </p>

                {/* Billing Toggle - Only show if not controlled externally */}
                {!externalBilling && (
                    <div className="flex justify-center items-center gap-4">
                        <div className="relative bg-slate-800 p-1 rounded-full flex items-center cursor-pointer select-none border border-slate-700" onClick={toggleBilling}>
                            <div
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 z-10 ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Monthly
                            </div>
                            <div
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 z-10 flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Yearly
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${billingCycle === 'yearly' ? 'bg-green-500 text-white' : 'bg-green-900/30 text-green-400'}`}>
                                    -{discountPercent}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-xl bg-white">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-6 text-left w-1/4">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Criteria</span>
                            </th>
                            {plans.map(plan => {
                                const isHighlighted = plan.id === highlightedPlanId;
                                return (
                                    <th key={plan.id} className={`p-6 text-center w-1/4 border-l border-gray-100 relative transition-all duration-500 ${plan.isPopular ? 'bg-indigo-50/50' : ''} ${isHighlighted ? 'bg-blue-50 !border-blue-200 shadow-inner' : ''}`}>
                                        {isHighlighted && (
                                            <div className="absolute top-0 inset-x-0 h-1 bg-blue-500 animate-in fade-in duration-500"></div>
                                        )}
                                        <h3 className={`text-xl font-bold ${isHighlighted ? 'text-blue-700' : 'text-gray-900'}`}>{plan.name}</h3>
                                        <div className="mt-2 flex flex-col items-center">
                                            <div className={`text-3xl font-black ${isHighlighted ? 'text-blue-900' : 'text-gray-900'}`}>
                                                {calculatePrice(plan.price)} <span className="text-sm font-bold text-gray-500">SAR / mo</span>
                                            </div>
                                            {billingCycle === 'yearly' && (
                                                <div className="text-xs text-slate-400 font-medium mt-1">
                                                    Billed {Math.round(plan.price * 12 * discountMultiplier).toLocaleString()} SAR yearly
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 mt-1">{plan.tagline}</p>
                                        {billingCycle === 'yearly' && (
                                            <p className="text-xs text-green-600 font-bold mt-2">
                                                Save {Math.round(plan.price * 12 * (discountPercent / 100)).toLocaleString()} SAR
                                            </p>
                                        )}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Dynamic Sections */}
                        {(() => {
                            const config = settings?.pricingTableConfig ? JSON.parse(settings.pricingTableConfig) : [];
                            // Group by section
                            const sections: Record<string, any[]> = {};
                            config.forEach((row: any) => {
                                if (!sections[row.section]) sections[row.section] = [];
                                sections[row.section].push(row);
                            });

                            return Object.keys(sections).map(section => (
                                <React.Fragment key={section}>
                                    <tr className="bg-gray-50/50">
                                        <td colSpan={plans.length + 1} className="p-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            {section}
                                        </td>
                                    </tr>
                                    {sections[section].map((row: any) => (
                                        <tr key={row.id}>
                                            <td className="p-4 px-6 text-gray-600 font-medium">{row.label}</td>
                                            {plans.map(plan => {
                                                const val = plan.attributes?.[row.id];
                                                const isHighlighted = plan.id === highlightedPlanId;
                                                return (
                                                    <td key={plan.id} className={`p-4 text-center border-l border-gray-100 transition-colors duration-500 ${isHighlighted ? 'bg-blue-50/50' : ''}`}>
                                                        {row.type === 'boolean' || typeof val === 'boolean' ? (
                                                            val === true ? <Check className="mx-auto text-emerald-500" size={20} /> :
                                                                val === false ? <X className="mx-auto text-gray-300" size={20} /> :
                                                                    <span className="text-sm font-bold text-gray-700">{val}</span>
                                                        ) : (
                                                            <span className={`text-sm font-bold ${val === '-' || !val ? 'text-gray-300' : 'text-gray-900'}`}>
                                                                {val || '-'}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ));
                        })()}

                        {/* Guarantee */}
                        <tr className="bg-emerald-50">
                            <td className="p-4 px-6 font-bold text-emerald-800">Fine Protection Guarantee</td>
                            {plans.map(plan => (
                                <td key={plan.id} className={`p-4 text-center font-bold text-emerald-700 border-l border-emerald-100 ${plan.id === highlightedPlanId ? 'bg-emerald-100/50' : ''}`}>
                                    {plan.guarantee}
                                </td>
                            ))}
                        </tr>

                        <tr className="bg-gray-50 border-t border-gray-200">
                            <td className="p-4 px-6"></td>
                            {plans.map(plan => {
                                const isHighlighted = plan.id === highlightedPlanId;
                                return (
                                    <td key={plan.id} className={`p-4 border-l border-gray-200 ${isHighlighted ? 'bg-blue-50/50' : ''}`}>
                                        <button
                                            onClick={() => {
                                                if (user) {
                                                    const discount = billingCycle === 'yearly' ? (settings?.yearlyDiscountPercentage || 20) / 100 : 0;
                                                    const finalPrice = billingCycle === 'yearly' ? Math.round(plan.price * (1 - discount)) : plan.price;

                                                    const newReq: any = {
                                                        id: `SUB-${Date.now()}`,
                                                        pricingPlanId: plan.id,
                                                        serviceName: `${plan.name} (${billingCycle})`,
                                                        clientId: user.id,
                                                        clientName: user.name,
                                                        expertId: null,
                                                        expertName: null,
                                                        status: 'PENDING_PAYMENT',
                                                        dateCreated: new Date().toISOString(),
                                                        amount: finalPrice,
                                                        description: `Subscription to ${plan.name} plan. Billed ${billingCycle}.`,
                                                        batches: []
                                                    };

                                                    if (addRequest) {
                                                        addRequest(newReq);
                                                        navigate(`/client/request-received/${newReq.id}`);
                                                    }
                                                } else {
                                                    navigate(`/login?redirect=/pricing`);
                                                }
                                            }}
                                            className={`block w-full py-3 text-center rounded-xl font-bold transition-all shadow-sm hover:shadow-md ${plan.isPopular || isHighlighted
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                                                } ${isHighlighted ? 'transform scale-105 ring-4 ring-blue-500/20' : ''}`}
                                        >
                                            Choose {plan.name?.split(' ')[0]}
                                        </button>
                                    </td>
                                )
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Overage Policy Toggle */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => setShowOverage(!showOverage)}
                    className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors"
                >
                    <AlertTriangle size={16} className="mr-2" />
                    {showOverage ? 'Hide Overage Policy' : 'Show Overage Policy & Fees'}
                </button>

                {showOverage && (
                    <div className="mt-6 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left animate-in fade-in zoom-in duration-300">
                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                            <h4 className="font-bold text-orange-900 mb-2">ZATCA Shield Overages</h4>
                            <ul className="space-y-2 text-sm text-orange-800">
                                <li>• Extra 50 transactions: <span className="font-bold">+SAR 200</span></li>
                                <li>• Extra bank account: <span className="font-bold">+SAR 150/mo</span></li>
                                <li>• Extra employee: <span className="font-bold">+SAR 100/mo</span></li>
                            </ul>
                        </div>
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-900 mb-2">Audit Proof Overages</h4>
                            <ul className="space-y-2 text-sm text-indigo-800">
                                <li>• Extra entity: <span className="font-bold">+SAR 2,000/mo</span></li>
                                <li>• Extra CFO hour: <span className="font-bold">+SAR 400/hr</span></li>
                                <li>• Rush filing: <span className="font-bold">+SAR 1,000 flat</span></li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricingTable;
