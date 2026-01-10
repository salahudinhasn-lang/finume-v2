import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Check, ArrowRight, AlertTriangle, Building2, Users, Receipt, TrendingUp, ChevronRight, ChevronLeft, RefreshCcw } from 'lucide-react';

interface TierCalculatorProps {
    onRecommend?: (planId: string) => void;
}

const TierCalculator: React.FC<TierCalculatorProps> = ({ onRecommend }) => {
    const navigate = useNavigate();
    const { plans, user } = useAppContext();

    // Inputs
    const [revenue, setRevenue] = useState(200000);
    const [transactionTier, setTransactionTier] = useState<0 | 1 | 2>(0);
    const [employeeTier, setEmployeeTier] = useState<0 | 1 | 2>(0);

    // Logic
    const getRecommendation = () => {
        // Fallback plans if DB is empty to prevent crash, though usually not needed if seeded
        const basicPlan = plans.find(p => p.name.includes('CR')) || plans[0];
        const growthPlan = plans.find(p => p.name.includes('ZATCA')) || plans[1];
        const enterprisePlan = plans.find(p => p.name.includes('Audit')) || plans[2];

        if (!basicPlan) return null; // Wait for data load

        if (revenue > 5000000) return { plan: enterprisePlan || basicPlan, reason: 'Revenue > 5M SAR requires statutory Financial Audit' };
        if (transactionTier === 2) return { plan: enterprisePlan || basicPlan, reason: 'High volume transactions require enterprise bookkeeping' };
        if (employeeTier === 2) return { plan: enterprisePlan || basicPlan, reason: 'Large team requires advanced payroll & HR support' };

        if (revenue > 375000) return { plan: growthPlan || basicPlan, reason: 'Revenue > 375k SAR mandates full VAT compliance' };
        if (transactionTier === 1) return { plan: growthPlan || basicPlan, reason: 'Active business requires monthly bookkeeping' };
        if (employeeTier === 1) return { plan: growthPlan || basicPlan, reason: 'Employees require GOSI & Payroll management' };

        return { plan: basicPlan, reason: 'Best for maintaining legal status with minimal activity' };
    };

    const recommendation = getRecommendation();

    if (!recommendation || !recommendation.plan) return null;
    const { plan, reason } = recommendation;

    const handleGetStarted = () => {
        if (onRecommend) {
            onRecommend(plan.id);
            return;
        }

        if (user) {
            navigate(`/client/checkout?planId=${plan.id}&billing=YEARLY`);
        } else {
            navigate(`/login?redirect=/client/checkout&planId=${plan.id}&billing=YEARLY`);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12">

                    {/* Left: Inputs */}
                    <div className="lg:col-span-5 p-8 bg-slate-50 border-r border-slate-100 flex flex-col justify-center">
                        <h3 className="text-2xl font-black text-slate-900 mb-6">Configure Your Needs</h3>

                        <div className="space-y-8">
                            {/* Revenue Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Annual Revenue</label>
                                <div className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                                    {revenue.toLocaleString()} <span className="text-sm font-bold text-slate-400">SAR</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="6000000"
                                    step="50000"
                                    value={revenue}
                                    onChange={(e) => setRevenue(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Startup</span>
                                    <span>Growth</span>
                                    <span>Enterprise</span>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <Receipt size={16} className="text-slate-400" /> Monthly Transactions
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { val: 0, label: '< 50' },
                                            { val: 1, label: '50-300' },
                                            { val: 2, label: '300+' }
                                        ].map(opt => (
                                            <button
                                                key={opt.val}
                                                onClick={() => setTransactionTier(opt.val as any)}
                                                className={`py-2 px-1 rounded-lg text-sm font-bold transition-all border ${transactionTier === opt.val ? 'bg-white border-blue-600 text-blue-600 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <Users size={16} className="text-slate-400" /> Employees
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { val: 0, label: 'None' },
                                            { val: 1, label: '1-10' },
                                            { val: 2, label: '10+' }
                                        ].map(opt => (
                                            <button
                                                key={opt.val}
                                                onClick={() => setEmployeeTier(opt.val as any)}
                                                className={`py-2 px-1 rounded-lg text-sm font-bold transition-all border ${employeeTier === opt.val ? 'bg-white border-purple-600 text-purple-600 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Result */}
                    <div className="lg:col-span-7 p-8 bg-white flex flex-col justify-center relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <TrendingUp size={150} />
                        </div>

                        <div className="relative z-10 animate-in fade-in slide-in-from-right-4 duration-500" key={plan.id}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${plan.name.includes('Audit') ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                    Recommended Plan
                                </span>
                            </div>

                            <h2 className={`text-4xl font-black mb-2 ${plan.name.includes('Audit') ? 'text-purple-600' : plan.name.includes('ZATCA') ? 'text-blue-600' : 'text-slate-900'}`}>
                                {plan.name}
                            </h2>
                            <p className="text-lg text-slate-500 mb-6">{plan.description}</p>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
                                {plan.features.slice(0, 4).map((feat, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                                        <Check size={16} className={`mt-0.5 shrink-0 ${plan.name.includes('Audit') ? 'text-purple-500' : 'text-green-500'}`} strokeWidth={3} />
                                        {feat}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                                <div className="text-sm font-medium text-slate-600 italic">
                                    "{reason}"
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleGetStarted}
                                    className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 ${plan.name.includes('Audit') ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : plan.name.includes('ZATCA') ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
                                >
                                    Get Started <ChevronRight size={20} />
                                </button>
                                <div className="text-right px-4">
                                    <div className="text-2xl font-black text-slate-900">{plan.price.toLocaleString()} SAR</div>
                                    <div className="text-xs text-slate-400 font-bold uppercase">Per Month</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const CheckCircle = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default TierCalculator;
