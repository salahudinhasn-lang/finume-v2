
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button, Badge } from '../../components/UI';
import { DollarSign, TrendingUp, Calendar, Wallet, ArrowUpRight, ArrowDownLeft, X, AlertCircle, CheckCircle, Download, CreditCard, PieChart as PieIcon, Clock, Lock, CheckSquare, Square } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const ExpertEarnings = () => {
  const { user, requests, payoutRequests, requestPayout } = useAppContext();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // 1. Calculate Earnings (Strictly from Completed Requests)
  const myCompletedRequests = requests.filter(r => r.assignedExpertId === user?.id && r.status === 'COMPLETED');
  
  // Expert gets 80% of the value
  const lifetimeEarnings = myCompletedRequests.reduce((acc, r) => acc + (r.amount * 0.8), 0);

  // 2. Unsettled Requests (Available for Payout)
  const unsettledRequests = myCompletedRequests.filter(r => !r.payoutId);
  const totalUnsettledBalance = unsettledRequests.reduce((acc, r) => acc + (r.amount * 0.8), 0);

  // Initialize selected IDs with all unsettled (default behavior: select all)
  // We use a flag to do this only once when the data loads or changes significantly
  useEffect(() => {
      // Logic: If user hasn't manually interacted (size 0), we *could* auto-select all.
      // But react strict mode might double fire. Let's just default check all unsettled on mount.
      const ids = new Set(unsettledRequests.map(r => r.id));
      setSelectedIds(ids);
  }, [unsettledRequests.length]);

  // Calculate Available Balance based on SELECTION
  const selectedBalance = unsettledRequests
    .filter(r => selectedIds.has(r.id))
    .reduce((acc, r) => acc + (r.amount * 0.8), 0);

  // 3. Calculate Pending Payouts (Requested but not Approved)
  const pendingRequests = myCompletedRequests.filter(r => {
      if (!r.payoutId) return false;
      const payout = payoutRequests.find(p => p.id === r.payoutId);
      return payout && payout.status === 'PENDING';
  });
  const pendingBalance = pendingRequests.reduce((acc, r) => acc + (r.amount * 0.8), 0);

  // 4. Calculate Settled (Paid)
  const settledRequests = myCompletedRequests.filter(r => {
      if (!r.payoutId) return false;
      const payout = payoutRequests.find(p => p.id === r.payoutId);
      return payout && payout.status === 'APPROVED';
  });
  const totalWithdrawn = settledRequests.reduce((acc, r) => acc + (r.amount * 0.8), 0);

  // 5. Pipeline Value (Active Jobs)
  const pipelineRequests = requests.filter(r => r.assignedExpertId === user?.id && ['MATCHED', 'IN_PROGRESS', 'REVIEW_CLIENT'].includes(r.status));
  const pendingEarnings = pipelineRequests.reduce((acc, curr) => acc + (curr.amount * 0.8), 0);

  // Chart Data
  const data = [
    { name: 'Week 1', income: 1200, projected: 1200 },
    { name: 'Week 2', income: 1900, projected: 1900 },
    { name: 'Week 3', income: 800, projected: 1500 },
    { name: 'Week 4', income: 2400, projected: 3000 },
  ];

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedIds.size === unsettledRequests.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(unsettledRequests.map(r => r.id)));
      }
  };

  const handleWithdraw = () => {
    if (selectedBalance <= 0) {
      alert("Please select at least one task to cash out.");
      return;
    }

    // Call Context Action with specific IDs
    requestPayout(selectedBalance, Array.from(selectedIds));

    setIsSuccess(true);
    setTimeout(() => {
        setIsSuccess(false);
        setShowWithdrawModal(false);
        // Clear selection after success
        setSelectedIds(new Set()); 
    }, 1500);
  };

  const getSettlementStatus = (req: any) => {
      if (!req.payoutId) return 'UNSETTLED';
      const payout = payoutRequests.find(p => p.id === req.payoutId);
      if (!payout) return 'UNSETTLED'; // Should not happen
      return payout.status === 'APPROVED' ? 'SETTLED' : 'PROCESSING';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">My Wallet</h1>
            <p className="text-gray-500">Manage your earnings, payouts, and financial health.</p>
        </div>
        <Button variant="outline" className="hidden md:flex">
            <Download size={16} /> Download Statement
        </Button>
      </div>

      {/* Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none relative overflow-hidden shadow-xl transform transition-transform hover:scale-[1.01]">
           <div className="relative z-10 h-full flex flex-col justify-between">
             <div>
                 <div className="flex items-center gap-2 mb-4 opacity-80">
                   <Wallet size={18} className="text-emerald-400" />
                   <span className="font-medium text-sm tracking-wide uppercase">Available for Payout</span>
                 </div>
                 <p className="text-4xl font-extrabold tracking-tight">
                     {selectedBalance.toLocaleString()} <span className="text-lg font-normal text-gray-400">SAR</span>
                 </p>
                 <div className="flex flex-col gap-1 mt-2">
                     <p className="text-xs text-gray-400">
                         {selectedIds.size} of {unsettledRequests.length} tasks selected
                     </p>
                     {pendingBalance > 0 && (
                         <p className="text-xs text-yellow-400 flex items-center gap-1">
                             <Clock size={12} /> {pendingBalance.toLocaleString()} SAR Processing
                         </p>
                     )}
                 </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-gray-700 flex gap-3">
                 <Button 
                    onClick={() => setShowWithdrawModal(true)} 
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-none font-bold"
                    disabled={selectedBalance <= 0}
                 >
                    Cash Out Now
                 </Button>
             </div>
           </div>
           <div className="absolute -right-8 -bottom-8 opacity-10">
              <DollarSign size={180} />
           </div>
        </Card>

        {/* Pipeline Card */}
        <Card className="bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
           <div>
               <div className="flex items-center gap-2 mb-2 text-gray-500">
                 <TrendingUp size={18} />
                 <span className="font-bold text-sm uppercase tracking-wide">Pipeline Value</span>
               </div>
               <p className="text-3xl font-extrabold text-gray-900">{pendingEarnings.toLocaleString()} <span className="text-sm font-normal text-gray-400">SAR</span></p>
               <p className="text-sm text-gray-500 mt-2">Estimated earnings from {pipelineRequests.length} active tasks.</p>
           </div>
           <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-2 text-xs text-blue-700">
                <AlertCircle size={14} />
                <span>Funds move to available balance upon completion.</span>
           </div>
        </Card>

        {/* Lifetime Stats */}
        <Card className="bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
           <div>
               <div className="flex items-center gap-2 mb-2 text-gray-500">
                 <Calendar size={18} />
                 <span className="font-bold text-sm uppercase tracking-wide">Lifetime Earnings</span>
               </div>
               <p className="text-3xl font-extrabold text-gray-900">{lifetimeEarnings.toLocaleString()} <span className="text-sm font-normal text-gray-400">SAR</span></p>
           </div>
           <div className="space-y-3 mt-4">
               <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Total Settled</span>
                   <span className="font-bold text-gray-700">{totalWithdrawn.toLocaleString()} SAR</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-1.5">
                   <div className="bg-green-50 h-1.5 rounded-full" style={{width: `${lifetimeEarnings > 0 ? Math.min(100, (totalWithdrawn/lifetimeEarnings)*100) : 0}%`}}></div>
               </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Charts */}
         <div className="lg:col-span-2">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Revenue Trends</h3>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Actual</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-200"></span> Projected</span>
                    </div>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `${val}`} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="projected" stroke="#93c5fd" strokeDasharray="5 5" fill="none" strokeWidth={2} />
                            <Area type="monotone" dataKey="income" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
         </div>

         {/* Payout History / Ledger */}
         <div className="lg:col-span-1 flex flex-col h-full">
            <Card className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800">Income Ledger</h3>
                        {selectedIds.size > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{selectedIds.size}</span>
                        )}
                    </div>
                    {unsettledRequests.length > 0 && (
                        <button 
                            onClick={toggleSelectAll} 
                            className="text-xs text-blue-600 font-bold hover:underline"
                        >
                            {selectedIds.size === unsettledRequests.length ? 'Deselect All' : 'Select All'}
                        </button>
                    )}
                </div>
                
                <div className="space-y-0 overflow-y-auto flex-1 custom-scrollbar max-h-[400px]">
                    {myCompletedRequests.length > 0 ? myCompletedRequests.map(req => {
                        const status = getSettlementStatus(req);
                        const amount = req.amount * 0.8;
                        const isSelected = selectedIds.has(req.id);
                        
                        return (
                            <div 
                                key={req.id} 
                                onClick={() => status === 'UNSETTLED' && toggleSelection(req.id)}
                                className={`p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${
                                    status === 'UNSETTLED' && isSelected ? 'bg-blue-50/50' : ''
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        {status === 'UNSETTLED' && (
                                            <div className={`${isSelected ? 'text-blue-600' : 'text-gray-300'}`}>
                                                {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                            </div>
                                        )}
                                        <span className="font-bold text-gray-800 text-sm">{req.serviceName}</span>
                                    </div>
                                    <span className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-green-600'}`}>+{amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs pl-6">
                                    <span className="text-gray-500">{req.dateCreated} • {req.id}</span>
                                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                                        status === 'SETTLED' ? 'bg-green-100 text-green-700' :
                                        status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {status === 'UNSETTLED' ? 'Available' : status}
                                    </span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="p-8 text-center text-gray-500">No earnings yet.</div>
                    )}
                </div>
            </Card>
         </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">Cash Out</h3>
                    <button onClick={() => setShowWithdrawModal(false)} className="hover:bg-gray-700 p-1 rounded"><X size={20} /></button>
                </div>
                
                {!isSuccess ? (
                    <div className="p-6 space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Selected Amount</p>
                            <p className="text-3xl font-extrabold text-gray-900">{selectedBalance.toLocaleString()} <span className="text-sm text-gray-400">SAR</span></p>
                        </div>

                        <div className="text-sm text-gray-600 text-center px-4">
                            You are requesting a payout for <span className="font-bold text-gray-900">{selectedIds.size} tasks</span>.
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                            <CreditCard size={20} className="text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-blue-900">Bank Transfer</p>
                                <p className="text-xs text-blue-700">Funds will be sent to Al Rajhi Bank ending in ****8842.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setShowWithdrawModal(false)} className="flex-1">Cancel</Button>
                            <Button onClick={handleWithdraw} className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg">
                                Confirm & Withdraw
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                        <p className="text-gray-500 mb-6">Your withdrawal request has been sent to the admin for approval.</p>
                        <Button onClick={() => { setIsSuccess(false); setShowWithdrawModal(false); }} className="w-full">Done</Button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ExpertEarnings;
