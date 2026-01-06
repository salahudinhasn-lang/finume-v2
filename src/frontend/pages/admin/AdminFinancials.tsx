
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button, Badge } from '../../components/UI';
import { ResponsiveContainer, Tooltip, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis, Area, ComposedChart, Line } from 'recharts';
import { X, FileText, DollarSign, Wallet, Eye, Printer, Download, TrendingUp, Calendar, QrCode, Check, AlertOctagon, RefreshCcw, Search, CheckSquare, Square, ArrowRight, Coins, CreditCard, CheckCircle, Users, Loader2 } from 'lucide-react';

const AdminFinancials = () => {
    const { requests, payoutRequests, processPayout, manualSettle } = useAppContext();
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

    // Ledger Filters
    const [filterType, setFilterType] = useState<'ALL' | 'UNSETTLED'>('ALL');
    const [expertSearch, setExpertSearch] = useState('');

    // Bulk Action State
    const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);

    // Expanded payout requests
    const [expandedPayouts, setExpandedPayouts] = useState<Set<string>>(new Set());

    // --- Calculations ---
    const completedRequests = requests.filter(r => r.status === 'COMPLETED');

    // 1. Total Volume
    const totalVolume = completedRequests.reduce((acc, r) => acc + r.amount, 0);

    // 2. Expert Share (80% of Total)
    const totalExpertShare = totalVolume * 0.8;

    // 3. Net Revenue (20% of Total)
    const netRevenue = totalVolume * 0.2;

    // Helper to determine status
    const getSettlementStatus = (req: any) => {
        if (!req.payoutId) return 'UNSETTLED';
        const payout = payoutRequests.find(p => p.id === req.payoutId);
        if (!payout) {
            return req.payoutId.startsWith('SETTLE-MANUAL') ? 'SETTLED' : 'PROCESSING';
        }
        return payout.status === 'APPROVED' ? 'SETTLED' : 'PROCESSING';
    };

    // 4. Disbursed to Experts (Settled/Approved Payouts)
    // We look at requests that have a payoutId that links to an APPROVED payout
    const disbursedAmount = completedRequests
        .filter(r => getSettlementStatus(r) === 'SETTLED')
        .reduce((acc, r) => acc + (r.amount * 0.8), 0);

    // 5. Available for Payout (Unsettled)
    const unsettledRequests = completedRequests.filter(r => getSettlementStatus(r) === 'UNSETTLED');
    const availableForPayout = unsettledRequests.reduce((acc, r) => acc + (r.amount * 0.8), 0);

    // Filter Logic for Table
    const filteredLedger = completedRequests.filter(req => {
        const status = getSettlementStatus(req);
        const matchesType = filterType === 'ALL' || (filterType === 'UNSETTLED' && status === 'UNSETTLED');
        const matchesExpert = expertSearch === '' || (req.expertName && req.expertName.toLowerCase().includes(expertSearch.toLowerCase()));
        return matchesType && matchesExpert;
    });

    // Calculate Selected Totals
    const selectedRequests = requests.filter(r => selectedTxIds.has(r.id));
    const selectedPayoutTotal = selectedRequests.reduce((sum, r) => sum + (r.amount * 0.8), 0);

    // Actions
    const handlePrint = () => {
        window.print();
    };

    const openInvoice = (req: any) => {
        const subtotal = req.amount;
        const vat = subtotal * 0.15;
        const total = subtotal + vat;

        setSelectedInvoice({
            ...req,
            invoiceId: `INV-${req.id.split('-')[1] || '001'}`,
            date: new Date(req.dateCreated).toLocaleDateString(),
            subtotal,
            vat,
            total
        });
    };

    const handleSettleRequest = (reqId: string) => {
        // Immediate action for single row
        manualSettle([reqId]);
        if (selectedTxIds.has(reqId)) {
            const newSet = new Set(selectedTxIds);
            newSet.delete(reqId);
            setSelectedTxIds(newSet);
        }
    };

    const handlePayAction = async () => {
        setIsProcessing(true);

        // Determine targets: specific selection OR all unsettled
        let idsToPay: string[] = [];
        if (selectedTxIds.size > 0) {
            idsToPay = Array.from(selectedTxIds);
        } else {
            idsToPay = unsettledRequests.map(r => r.id);
        }

        if (idsToPay.length === 0) {
            setIsProcessing(false);
            return;
        }

        // Simulate short network delay for UX feel
        await new Promise(resolve => setTimeout(resolve, 600));

        manualSettle(idsToPay);

        // Cleanup
        setSelectedTxIds(new Set());
        setIsProcessing(false);
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedTxIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedTxIds(newSet);
    };

    const toggleSelectAll = () => {
        const visibleUnsettledIds = filteredLedger
            .filter(req => getSettlementStatus(req) === 'UNSETTLED')
            .map(req => req.id);

        if (visibleUnsettledIds.every(id => selectedTxIds.has(id)) && visibleUnsettledIds.length > 0) {
            const newSet = new Set(selectedTxIds);
            visibleUnsettledIds.forEach(id => newSet.delete(id));
            setSelectedTxIds(newSet);
        } else {
            const newSet = new Set(selectedTxIds);
            visibleUnsettledIds.forEach(id => newSet.add(id));
            setSelectedTxIds(newSet);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Financial Performance</h1>
                    <p className="text-gray-500">Revenue, payouts, and transaction ledger.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 shadow-sm">
                        <Calendar size={16} /> Last 6 Months
                    </div>
                    <Button variant="outline" onClick={() => window.alert("CSV Download started")} className="bg-white">
                        <Download size={16} /> Export Report
                    </Button>
                </div>
            </div>

            {/* Pending Payout Requests Section */}
            {payoutRequests.filter(p => p.status === 'PENDING').length > 0 && (
                <Card className="overflow-hidden border-2 border-amber-200 shadow-md bg-amber-50/30">
                    <div className="p-5 border-b border-amber-200 bg-amber-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                                    <AlertOctagon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Pending Payout Requests</h3>
                                    <p className="text-sm text-gray-600">Expert cash-out requests awaiting approval</p>
                                </div>
                            </div>
                            <Badge status="YELLOW" />
                        </div>
                    </div>

                    <div className="divide-y divide-amber-100">
                        {payoutRequests.filter(p => p.status === 'PENDING').map(payout => {
                            const expanded = expandedPayouts.has(payout.id);
                            const toggleExpanded = () => {
                                const newSet = new Set(expandedPayouts);
                                if (expanded) {
                                    newSet.delete(payout.id);
                                } else {
                                    newSet.add(payout.id);
                                }
                                setExpandedPayouts(newSet);
                            };
                            const requestsInPayout = requests.filter(r => payout.requestIds.includes(r.id));

                            return (
                                <div key={payout.id} className="p-5 bg-white hover:bg-amber-50/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-bold text-gray-900">{payout.expertName}</h4>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                                                    {payout.id}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    Requested: {payout.requestDate}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileText size={14} />
                                                    {payout.requestIds.length} requests
                                                </span>
                                                <span className="flex items-center gap-1 font-bold text-green-700">
                                                    <DollarSign size={14} />
                                                    {payout.amount.toLocaleString()} SAR
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={toggleExpanded}
                                                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                            >
                                                {expanded ? 'Hide' : 'View'} Requests
                                            </button>
                                            <button
                                                onClick={() => processPayout(payout.id, 'APPROVED')}
                                                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
                                            >
                                                <Check size={16} /> Approve
                                            </button>
                                            <button
                                                onClick={() => processPayout(payout.id, 'REJECTED')}
                                                className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-bold rounded-lg transition-all flex items-center gap-1"
                                            >
                                                <X size={16} /> Reject
                                            </button>
                                        </div>
                                    </div>

                                    {expanded && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Included Requests:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {requestsInPayout.map(req => (
                                                    <div key={req.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                                        <div>
                                                            <span className="font-mono text-xs text-gray-500">{req.id}</span>
                                                            <p className="font-medium text-gray-900">{req.serviceName}</p>
                                                        </div>
                                                        <span className="font-bold text-green-700">{(req.amount * 0.8).toLocaleString()} SAR</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* 5 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Total Volume */}
                <Card className="relative overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors p-5">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20} /></div>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Volume</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">{totalVolume.toLocaleString()} <span className="text-xs font-normal text-gray-400">SAR</span></p>
                </Card>

                {/* 2. Expert Shares (80%) */}
                <Card className="relative overflow-hidden border border-gray-200 hover:border-purple-300 transition-colors p-5">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20} /></div>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">80%</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expert Shares</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">{totalExpertShare.toLocaleString()} <span className="text-xs font-normal text-gray-400">SAR</span></p>
                </Card>

                {/* 3. Net Revenue (20%) */}
                <Card className="relative overflow-hidden border border-gray-200 hover:border-green-300 transition-colors p-5">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">20%</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Revenue</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">{netRevenue.toLocaleString()} <span className="text-xs font-normal text-gray-400">SAR</span></p>
                </Card>

                {/* 4. Disbursed */}
                <Card className="relative overflow-hidden border border-gray-200 hover:border-teal-300 transition-colors p-5">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><CheckCircle size={20} /></div>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Disbursed</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">{disbursedAmount.toLocaleString()} <span className="text-xs font-normal text-gray-400">SAR</span></p>
                </Card>

                {/* 5. Available for Payout (Dynamic Action Card) */}
                <Card className={`relative overflow-hidden border transition-all p-5 shadow-sm flex flex-col justify-between ${selectedTxIds.size > 0
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-white border-amber-200 hover:border-amber-300'
                    }`}>
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-lg transition-colors ${selectedTxIds.size > 0 ? 'bg-amber-200 text-amber-800' : 'bg-amber-100 text-amber-600'}`}>
                                <Coins size={20} />
                            </div>
                            {selectedTxIds.size > 0 && (
                                <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full animate-pulse">
                                    {selectedTxIds.size} Selected
                                </span>
                            )}
                        </div>

                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider transition-colors">
                            {selectedTxIds.size > 0 ? "Selected Total" : "Available Balance"}
                        </p>

                        <p className="text-xl font-extrabold text-gray-900 mt-1">
                            {selectedTxIds.size > 0 ? selectedPayoutTotal.toLocaleString() : availableForPayout.toLocaleString()}
                            <span className="text-xs font-normal text-gray-400"> SAR</span>
                        </p>
                    </div>

                    {(selectedTxIds.size > 0 || availableForPayout > 0) && (
                        <button
                            onClick={handlePayAction}
                            disabled={isProcessing}
                            className={`w-full mt-3 text-xs font-bold py-2 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${isProcessing
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                                }`}
                        >
                            {isProcessing ? (
                                <><Loader2 size={14} className="animate-spin" /> Processing...</>
                            ) : (
                                <>
                                    Pay Out {selectedTxIds.size > 0 ? 'Selected' : 'All'}
                                    <ArrowRight size={12} />
                                </>
                            )}
                        </button>
                    )}
                </Card>
            </div>

            {/* Detailed Financial Ledger */}
            <Card className="overflow-hidden border border-gray-200 shadow-sm p-0">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-4">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">Transaction Ledger</h3>
                        {selectedTxIds.size > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                {selectedTxIds.size} transactions selected
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Filter by Expert Name..."
                                value={expertSearch}
                                onChange={(e) => setExpertSearch(e.target.value)}
                                className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-48"
                            />
                        </div>
                        <div className="flex bg-white rounded-lg border border-gray-300 p-0.5">
                            <button
                                onClick={() => setFilterType('ALL')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterType === 'ALL' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterType('UNSETTLED')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterType === 'UNSETTLED' ? 'bg-orange-100 text-orange-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Unsettled Only
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 w-12 text-center">
                                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                                        <CheckSquare size={18} />
                                    </button>
                                </th>
                                <th className="px-6 py-4">Ref ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Expert</th>
                                <th className="px-6 py-4 text-xs">Payout ID</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Expert Share</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLedger.map(req => {
                                const total = req.amount;
                                const expert = total * 0.8;
                                const status = getSettlementStatus(req);
                                const isSelected = selectedTxIds.has(req.id);

                                return (
                                    <tr key={req.id} className={`hover:bg-gray-50 transition-colors ${status === 'UNSETTLED' ? 'bg-orange-50/10' : ''} ${isSelected ? 'bg-amber-50' : ''}`}>
                                        <td className="px-6 py-4 text-center">
                                            {status === 'UNSETTLED' ? (
                                                <button onClick={() => toggleSelection(req.id)} className={`${isSelected ? 'text-amber-600' : 'text-gray-300 hover:text-gray-500'}`}>
                                                    {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                                </button>
                                            ) : (
                                                <span className="text-green-200"><CheckCircle size={18} /></span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">{req.id.split('-')[1]}</td>
                                        <td className="px-6 py-4 text-gray-600">{req.dateCreated}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{req.serviceName}</td>
                                        <td className="px-6 py-4 text-gray-700">{req.expertName || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            {req.payoutId ? (
                                                <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                                    {req.payoutId}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-600">{total.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-700">{(expert).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge status={status === 'UNSETTLED' ? 'YELLOW' : status === 'PROCESSING' ? 'REVIEW_ADMIN' : 'GREEN'} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {status === 'UNSETTLED' ? (
                                                    <button
                                                        onClick={() => handleSettleRequest(req.id)}
                                                        className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors font-bold shadow-sm"
                                                        title="Pay out this specific transaction"
                                                    >
                                                        <CreditCard size={12} /> Pay Out
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic px-3">Settled</span>
                                                )}
                                                <button onClick={() => openInvoice(req)} className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredLedger.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="text-center py-12 text-gray-500">No financial records found matching your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Invoice Preview Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0">
                    <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-full print:shadow-none print:rounded-none">
                        {/* Modal Header - Hidden when Printing */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center print:hidden shrink-0">
                            <h3 className="font-bold text-gray-800">Invoice Preview</h3>
                            <div className="flex gap-2">
                                <Button onClick={handlePrint} variant="primary">
                                    <Printer size={18} /> Print Invoice
                                </Button>
                                <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Printable Invoice Content */}
                        <div className="p-8 md:p-12 overflow-y-auto bg-white flex-1 relative print:overflow-visible print:h-auto">

                            {/* Invoice Header */}
                            <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-gray-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-primary-600">
                                        <h1 className="text-4xl font-bold tracking-tight">FINUME</h1>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">Financial Marketplace Platform</p>
                                    <p className="text-gray-500 text-sm">King Fahd Road, Riyadh, KSA</p>
                                    <p className="text-gray-500 text-sm">VAT: 310123456700003</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-1">TAX INVOICE</h2>
                                    <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-4">Fatoora / فاتورة ضريبية</p>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 inline-block text-right">
                                        <p className="text-sm text-gray-600 mb-1">Invoice #: <span className="font-bold text-gray-900">{selectedInvoice.invoiceId}</span></p>
                                        <p className="text-sm text-gray-600 mb-1">Date: <span className="font-bold text-gray-900">{selectedInvoice.date}</span></p>
                                        <p className="text-sm text-gray-600">Status: <span className="font-bold text-green-600">PAID</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Bill To / QR Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
                                    <p className="text-lg font-bold text-gray-900 mb-1">{selectedInvoice.clientName}</p>
                                    <p className="text-gray-600 text-sm">Building 1234, Olaya District</p>
                                    <p className="text-gray-600 text-sm">Riyadh 12211, Saudi Arabia</p>
                                    <p className="text-gray-600 text-sm mt-1">VAT ID: <span className="font-mono">300012345600003</span></p>
                                </div>
                                <div className="flex justify-end">
                                    <div className="border border-gray-200 p-2 rounded-lg bg-white">
                                        <QrCode size={96} className="text-gray-800" />
                                    </div>
                                </div>
                            </div>

                            {/* Line Items */}
                            <table className="w-full text-left mb-8">
                                <thead>
                                    <tr className="border-b-2 border-gray-100">
                                        <th className="py-3 text-sm font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="py-3 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Qty</th>
                                        <th className="py-3 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Unit Price</th>
                                        <th className="py-3 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    <tr className="border-b border-gray-50">
                                        <td className="py-4">
                                            <p className="font-bold text-gray-900">{selectedInvoice.serviceName}</p>
                                            <p className="text-xs text-gray-500 mt-1">Provided by Expert: {selectedInvoice.expertName}</p>
                                        </td>
                                        <td className="py-4 text-right">1</td>
                                        <td className="py-4 text-right">{selectedInvoice.subtotal.toLocaleString()} SAR</td>
                                        <td className="py-4 text-right font-bold">{selectedInvoice.subtotal.toLocaleString()} SAR</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="flex justify-end mb-16">
                                <div className="w-1/2 space-y-3">
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Subtotal (Excl. VAT)</span>
                                        <span>{selectedInvoice.subtotal.toLocaleString()} SAR</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Total VAT (15%)</span>
                                        <span>{selectedInvoice.vat.toLocaleString()} SAR</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xl text-gray-900 pt-4 border-t-2 border-gray-100">
                                        <span>Total (Incl. VAT)</span>
                                        <span>{selectedInvoice.total.toLocaleString()} SAR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 pt-8 text-center">
                                <p className="text-gray-900 font-bold mb-2">Thank you for choosing Finume.</p>
                                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                                    This is a computer-generated document and acts as a valid tax invoice under ZATCA regulations.
                                    For any inquiries, please contact support@finume.com using Ref: {selectedInvoice.invoiceId}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminFinancials;
