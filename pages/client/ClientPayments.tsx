
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { Download, CreditCard, FileText, Printer, X, Eye, FileCheck, CornerUpLeft, PieChart, Wallet, TrendingDown, TrendingUp, AlertCircle, ShoppingBag } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

const ClientPayments = () => {
    const { user, requests, t, language } = useAppContext();
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

    const VAT_RATE = 0.15;

    // Mock payments based on requests
    const payments = requests
        .filter(r => r.clientId === user?.id && r.status !== 'NEW')
        .map(r => {
            const isCreditNote = r.status === 'CANCELLED';
            const subtotal = r.amount;
            const vatAmount = subtotal * VAT_RATE;
            const totalAmount = subtotal + vatAmount;

            return {
                id: isCreditNote ? `CN-${r.id.split('-')[1]}` : `INV-${r.id.split('-')[1]}`,
                requestId: r.id,
                description: r.serviceName,
                date: r.dateCreated,
                subtotal: isCreditNote ? -subtotal : subtotal,
                vat: isCreditNote ? -vatAmount : vatAmount,
                total: isCreditNote ? -totalAmount : totalAmount,
                status: isCreditNote ? 'REFUNDED' : 'PAID',
                type: isCreditNote ? 'CREDIT_NOTE' : 'INVOICE',
                client: { name: r.clientName, address: 'Building 1234, Riyadh', vatId: '300000000000003' }
            };
        });

    const totalSpent = payments.reduce((acc, curr) => acc + curr.total, 0);

    // --- Financial Insights Data ---
    // 1. Top Category
    const categorySpend: { [key: string]: number } = {};
    payments.forEach(p => {
        const cat = p.description.split(' ')[0]; // Simple category extraction
        categorySpend[cat] = (categorySpend[cat] || 0) + p.total;
    });
    const topCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

    // 2. Chart Data: Monthly Spending with trend
    const chartData = [
        { name: 'Jan', amount: 4500, projected: 4500 },
        { name: 'Feb', amount: 2300, projected: 4000 },
        { name: 'Mar', amount: 6700, projected: 5000 },
        { name: 'Apr', amount: 1200, projected: 4500 },
        { name: 'May', amount: 3400, projected: 4800 },
        { name: 'Jun', amount: 5600, projected: 5000 },
    ];

    const handlePrint = () => window.print();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('sidebar.payments')}</h1>
                    <p className="text-gray-500">View transaction history and download tax invoices.</p>
                </div>
                <Button variant="outline" className="hidden md:flex bg-white">
                    <Download size={16} /> Export CSV
                </Button>
            </div>

            {/* Catchy Financial Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Card 1: Total Spend (Big Visual) */}
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet size={80} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">YTD Spend</p>
                        <p className="text-3xl font-extrabold">{totalSpent.toLocaleString()} <span className="text-lg font-normal text-gray-500">SAR</span></p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-green-400 bg-white/10 w-fit px-2 py-1 rounded">
                            <TrendingDown size={14} /> 12% lower than avg
                        </div>
                    </div>
                </Card>

                {/* Card 2: Top Category */}
                <Card className="border-l-4 border-l-purple-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <ShoppingBag size={20} />
                        </div>
                        <span className="text-xs text-gray-400 font-bold uppercase">{t('financials.topCategory')}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{topCategory[0]}</h3>
                    <p className="text-sm text-gray-500 mt-1">{(topCategory[1] as number).toLocaleString()} SAR</p>
                </Card>

                {/* Card 3: Monthly Burn Rate */}
                <Card className="border-l-4 border-l-red-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-xs text-gray-400 font-bold uppercase">{t('financials.burnRate')}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">~3,950 SAR</h3>
                    <p className="text-sm text-gray-500 mt-1">Based on last 3 months</p>
                </Card>

                {/* Card 4: Compliance Proof */}
                <Card className="border-l-4 border-l-green-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <FileCheck size={20} />
                        </div>
                        <span className="text-xs text-gray-400 font-bold uppercase">{t('financials.proof')}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">100% Valid</h3>
                    <p className="text-sm text-gray-500 mt-1">All invoices ZATCA compliant</p>
                </Card>
            </div>

            {/* Detailed Layout: Chart + Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-md h-full">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-gray-800">{t('financials.projected')}</h3>
                                <p className="text-xs text-gray-500">Actual vs Planned Spend</p>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `${val / 1000}k`} />
                                    <Tooltip cursor={{ stroke: '#cbd5e1' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                    <Area type="monotone" dataKey="projected" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Mini Ledger */}
                <div className="lg:col-span-1">
                    <Card className="h-full border-none shadow-md flex flex-col">
                        <h3 className="font-bold text-gray-800 mb-4">{t('client.recentRequests')}</h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[250px] custom-scrollbar">
                            {payments.slice(0, 5).map(pay => (
                                <div key={pay.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 truncate w-32">{pay.description}</p>
                                        <p className="text-xs text-gray-500">{pay.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{pay.total.toLocaleString()}</p>
                                        <p className="text-[10px] text-green-600 uppercase font-bold">{pay.status === 'PAID' ? t('financials.paid') : t('financials.refunded')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={18} className="text-primary-600" /> {t('financials.ledger')}
                    </h3>
                    <div className="flex gap-2">
                        <select className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option>{t('common.all')}</option>
                            <option>{t('financials.invoice')}</option>
                            <option>{t('financials.creditNote')}</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-gray-500 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">{t('common.id')}</th>
                                <th className="px-6 py-4">{t('common.description')}</th>
                                <th className="px-6 py-4">{t('common.date')}</th>
                                <th className="px-6 py-4 text-right">{t('financials.vat')}</th>
                                <th className="px-6 py-4 text-right font-bold">{t('common.amount')}</th>
                                <th className="px-6 py-4 text-center">{t('common.status')}</th>
                                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.map(pay => (
                                <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-gray-600 font-medium text-xs">
                                        {pay.id}
                                        {pay.type === 'CREDIT_NOTE' && <span className="block text-[10px] text-red-500">{t('financials.creditNote')}</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-800 block">{pay.description}</span>
                                        <span className="text-xs text-gray-400">{t('financials.proofPayment')} #{pay.requestId}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{pay.date}</td>
                                    <td className={`px-6 py-4 text-right ${pay.vat < 0 ? 'text-red-500' : 'text-gray-500'}`}>{pay.vat.toLocaleString()}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${pay.total < 0 ? 'text-red-600' : 'text-gray-900'}`}>{pay.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${pay.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {pay.status === 'PAID' ? t('financials.paid') : t('financials.refunded')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedInvoice(pay)}
                                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50"
                                            title="View Invoice"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No payment history available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Invoice Modal (Same as before, ensures consistency) */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0">
                    <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-full print:shadow-none print:rounded-none">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center print:hidden">
                            <h3 className="font-bold text-gray-800">Document Preview</h3>
                            <div className="flex gap-2">
                                <Button onClick={handlePrint} variant="primary">
                                    <Printer size={18} /> {t('common.print')}
                                </Button>
                                <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 overflow-y-auto bg-white flex-1" id="invoice-content">
                            {/* Header */}
                            <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                                <div>
                                    <div className="text-3xl font-bold text-primary-600 mb-2">FINUME</div>
                                    <p className="text-gray-500 text-sm">Financial Marketplace Platform</p>
                                    <p className="text-gray-500 text-sm">Riyadh, Saudi Arabia</p>
                                    <p className="text-gray-500 text-sm">VAT: 310123456700003</p>
                                </div>
                                <div className="text-right">
                                    <h2 className={`text-2xl font-bold mb-1 ${selectedInvoice.type === 'CREDIT_NOTE' ? 'text-red-600' : 'text-gray-900'}`}>
                                        {selectedInvoice.type === 'CREDIT_NOTE' ? t('financials.creditNote') : t('financials.invoice')}
                                    </h2>
                                    <p className="text-gray-500 font-mono mb-4">{selectedInvoice.id}</p>
                                    <div className={`inline-block px-3 py-1 rounded font-bold text-sm border ${selectedInvoice.status === 'REFUNDED'
                                        ? 'bg-orange-100 text-orange-700 border-orange-200'
                                        : 'bg-green-100 text-green-700 border-green-200'
                                        }`}>
                                        {selectedInvoice.status === 'PAID' ? t('financials.paid') : t('financials.refunded')}
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase mb-2">
                                        {selectedInvoice.type === 'CREDIT_NOTE' ? t('financials.creditTo') : t('financials.billTo')}
                                    </p>
                                    <p className="font-bold text-gray-900">{selectedInvoice.client.name}</p>
                                    <p className="text-gray-600 text-sm">{selectedInvoice.client.address}</p>
                                    <p className="text-gray-600 text-sm mt-1">VAT ID: <span className="font-mono">{selectedInvoice.client.vatId}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-400 uppercase mb-2">{t('common.details')}</p>
                                    <p className="text-sm text-gray-600">Date: <span className="font-bold text-gray-900">{selectedInvoice.date}</span></p>
                                    <p className="text-sm text-gray-600">Reference: <span className="font-bold text-gray-900">{selectedInvoice.requestId}</span></p>
                                </div>
                            </div>

                            {/* Line Items */}
                            <table className="w-full text-left mb-8">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-3 font-bold text-gray-700">{t('common.description')}</th>
                                        <th className="py-3 font-bold text-gray-700 text-right">{t('common.amount')} (SAR)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-4 text-gray-800">
                                            {selectedInvoice.description}
                                            <div className="text-xs text-gray-500 mt-1">
                                                {selectedInvoice.type === 'CREDIT_NOTE'
                                                    ? t('financials.refundDesc')
                                                    : t('financials.serviceDesc')
                                                }
                                            </div>
                                        </td>
                                        <td className={`py-4 text-right font-medium ${selectedInvoice.subtotal < 0 ? 'text-red-600' : ''}`}>
                                            {selectedInvoice.subtotal.toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="flex justify-end mb-12">
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t('financials.subtotal')}</span>
                                        <span>{selectedInvoice.subtotal.toLocaleString()} SAR</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t('financials.vat')}</span>
                                        <span>{selectedInvoice.vat.toLocaleString()} SAR</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t border-gray-200">
                                        <span>{t('financials.grandTotal')}</span>
                                        <span className={selectedInvoice.total < 0 ? 'text-red-600' : 'text-gray-900'}>
                                            {selectedInvoice.total.toLocaleString()} SAR
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
                                <p className="mb-2">{t('financials.thankYou')}</p>
                                <p className="text-xs text-gray-400">{t('financials.generatedDoc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientPayments;
