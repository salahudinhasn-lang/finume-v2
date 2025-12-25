import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PLANS } from '../mockData';
import { Check, X, HelpCircle, AlertTriangle } from 'lucide-react';

const PricingTable = () => {
    const navigate = useNavigate();
    const [showOverage, setShowOverage] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const toggleBilling = () => {
        setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly');
    };

    const calculatePrice = (basePrice: number) => {
        if (billingCycle === 'yearly') {
            return Math.floor(basePrice * 0.8 * 12).toLocaleString();
        }
        return basePrice.toLocaleString();
    };

    if (!MOCK_PLANS || MOCK_PLANS.length === 0) return null;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-slate-900 mb-4">Compare Plans & Limits</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                    Choose the plan that fits your current business scale. Upgrade anytime as you grow.
                </p>

                {/* Billing Toggle */}
                <div className="flex justify-center items-center gap-4">
                    <div className="relative bg-slate-100 p-1 rounded-full flex items-center cursor-pointer select-none" onClick={toggleBilling}>
                        <div
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 z-10 ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                        >
                            Monthly
                        </div>
                        <div
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 z-10 flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                        >
                            Yearly
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${billingCycle === 'yearly' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}>
                                -20%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-xl bg-white">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-6 text-left w-1/4">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Criteria</span>
                            </th>
                            {MOCK_PLANS.map(plan => (
                                <th key={plan.id} className={`p-6 text-center w-1/4 border-l border-gray-100 ${plan.isPopular ? 'bg-indigo-50/50' : ''}`}>
                                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                    <div className="mt-2 text-3xl font-black text-gray-900">
                                        {calculatePrice(plan.price)} <span className="text-sm font-bold text-gray-500">SAR / {billingCycle === 'yearly' ? 'year' : 'mo'}</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 mt-1">{plan.tagline}</p>
                                    {billingCycle === 'yearly' && (
                                        <p className="text-xs text-green-600 font-bold mt-2">
                                            Save {(plan.price * 12 * 0.2).toLocaleString()} SAR
                                        </p>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Financial Thresholds */}
                        <tr className="bg-gray-50/50"><td colSpan={4} className="p-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Financial Thresholds</td></tr>

                        <tr>
                            <td className="p-4 px-6 font-bold text-gray-700">Annual Revenue</td>
                            {MOCK_PLANS.map(plan => (
                                <td key={plan.id} className="p-4 text-center font-bold text-gray-900 border-l border-gray-100">
                                    {plan.limits?.revenue.label}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 px-6 font-bold text-gray-700">Monthly Transactions</td>
                            {MOCK_PLANS.map(plan => (
                                <td key={plan.id} className="p-4 text-center text-gray-700 border-l border-gray-100">
                                    {plan.limits?.transactions.label}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 px-6 text-gray-600">Monthly Invoices (Sales)</td>
                            {MOCK_PLANS.map(plan => (
                                <td key={plan.id} className="p-4 text-center text-gray-600 border-l border-gray-100">
                                    {plan.limits?.invoices.label}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 px-6 text-gray-600">Monthly Bills (Purchases)</td>
                            {MOCK_PLANS.map(plan => (
                                <td key={plan.id} className="p-4 text-center text-gray-600 border-l border-gray-100">
                                    {plan.limits?.bills.label}
                                </td>
                            ))}
                        </tr>

                        {/* Operational Limits */}
                        <tr className="bg-gray-50/50"><td colSpan={4} className="p-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Operational Limits</td></tr>

                        <tr>
                            <td className="p-4 px-6 font-bold text-gray-700">Bank Accounts</td>
                            {MOCK_PLANS.map(plan => (
                                <td key={plan.id} className="p-4 text-center text-gray-900 border-l border-gray-100">
                                    {plan.limits?.bankAccounts.label}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 px-6 text-gray-600">Employees (Payroll)</td>
                            {MOCK_PLANS.map(plan => (
                                <td key={plan.id} className="p-4 text-center text-gray-600 border-l border-gray-100">
                                    {plan.limits?.employees.label}
                                </td>
                            ))}
                        </tr>

                        {/* Features */}
                        <tr className="bg-gray-50/50"><td colSpan={4} className="p-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Advanced Features</td></tr>

                        <tr>
                            <td className="p-4 px-6 text-gray-600">International Transactions</td>
                            {MOCK_PLANS.map(plan => (
                                <td key={plan.id} className="p-4 text-center border-l border-gray-100">
                                    {plan.limits?.features.international === true ? <Check className="mx-auto text-emerald-500" size={20} /> :
                                        plan.limits?.features.international === 'Basic' ? <span className="text-orange-500 text-sm font-bold">Limit 10/mo</span> :
                                            <X className="mx-auto text-gray-300" size={20} />}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 px-6 text-gray-600">Stock / Inventory</td>
                            {MOCK_PLANS.map(plan => (
                                <td key={plan.id} className="p-4 text-center border-l border-gray-100">
                                    {plan.limits?.features.stock === 'Full' ? <span className="text-emerald-600 font-bold text-sm">Full ERP</span> :
                                        plan.limits?.features.stock === 'Basic' ? <span className="text-orange-500 text-sm font-bold">20 SKUs</span> :
                                            <X className="mx-auto text-gray-300" size={20} />}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 px-6 text-gray-600">Recurring Contracts</td>
                            {MOCK_PLANS.map(plan => (
                                <td key={plan.id} className="p-4 text-center border-l border-gray-100">
                                    {plan.limits?.features.contracts === true ? <span className="text-emerald-600 font-bold text-sm">Unlimited</span> :
                                        plan.limits?.features.contracts === 'Basic' ? <span className="text-orange-500 text-sm font-bold">Up to 5</span> :
                                            <X className="mx-auto text-gray-300" size={20} />}
                                </td>
                            ))}
                        </tr>

                        {/* Guarantee */}
                        <tr className="bg-emerald-50">
                            <td className="p-4 px-6 font-bold text-emerald-800">Fine Protection Guarantee</td>
                            {MOCK_PLANS.map(plan => (
                                <td key={plan.id} className="p-4 text-center font-bold text-emerald-700 border-l border-emerald-100">
                                    {plan.guarantee}
                                </td>
                            ))}
                        </tr>

                        <tr className="bg-gray-50 border-t border-gray-200">
                            <td className="p-4 px-6"></td>
                            {MOCK_PLANS.map(plan => (
                                <td key={plan.id} className="p-4 border-l border-gray-200">
                                    <button
                                        onClick={() => navigate(`/login?redirect=/client/checkout&planId=${plan.id}&billing=${billingCycle}`)}
                                        className={`block w-full py-3 text-center rounded-xl font-bold transition-all shadow-sm hover:shadow-md ${plan.isPopular
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        Choose {plan.name.split(' ')[0]}
                                    </button>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Overage Policy Toggle */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => setShowOverage(!showOverage)}
                    className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
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
