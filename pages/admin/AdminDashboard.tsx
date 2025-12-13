
import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { 
  Users, TrendingUp, AlertCircle, DollarSign, Check, X, 
  Briefcase, Activity, Calendar, ArrowUpRight, ArrowDownRight,
  ShieldCheck, FileText, CheckCircle, ExternalLink, Trophy, Medal, Crown, Zap, Wallet, Trash2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { clients, experts, requests, payoutRequests, updateExpertStatus, resetDatabase } = useAppContext();
  const navigate = useNavigate();

  // --- 1. Dynamic Financial Metrics ---
  const completedRequests = requests.filter(r => r.status === 'COMPLETED');
  
  // Total Volume & Net Revenue (20%)
  const totalVolume = completedRequests.reduce((acc: number, r) => acc + Number(r.amount), 0);
  const netRevenue = totalVolume * 0.20;

  // Revenue Growth Calculation (Last 30 days vs Previous 30 days)
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = new Date(now.getTime() - 30 * dayMs);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * dayMs);

  const currentPeriodRevenue: number = completedRequests
    .filter(r => new Date(r.dateCreated).getTime() >= thirtyDaysAgo.getTime())
    .reduce((acc: number, r) => acc + (Number(r.amount) * 0.20), 0);

  const prevPeriodRevenue: number = completedRequests
    .filter(r => new Date(r.dateCreated).getTime() >= sixtyDaysAgo.getTime() && new Date(r.dateCreated).getTime() < thirtyDaysAgo.getTime())
    .reduce((acc: number, r) => acc + (Number(r.amount) * 0.20), 0);

  const revenueGrowth = prevPeriodRevenue === 0 
    ? (currentPeriodRevenue > 0 ? 100 : 0) 
    : ((currentPeriodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100;

  // --- 2. User Stats ---
  const activeExperts = experts.filter(e => e.status === 'ACTIVE');
  const pendingExperts = experts.filter(e => e.status === 'VETTING');
  const totalClients = clients.length;
  
  // --- 3. Request & Payout Stats ---
  const pendingRequests = requests.filter(r => r.status === 'NEW');
  const pendingPayouts = payoutRequests.filter(p => p.status === 'PENDING');
  const totalOrders = requests.length;
  
  // Total Action Required = New Requests + Vetting Experts + Pending Payouts (Count of requests, not value)
  const totalPendingActions = pendingRequests.length + pendingExperts.length + pendingPayouts.length;

  // --- 4. Top Performers Lists ---
  const topExpertsByValue = useMemo(() => {
    const map = new Map<string, number>();
    completedRequests.forEach(r => {
        if(r.assignedExpertId) map.set(r.assignedExpertId, (map.get(r.assignedExpertId) || 0) + r.amount);
    });
    return [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, val]) => {
            const exp = experts.find(e => e.id === id);
            return { ...exp, value: val };
        });
  }, [completedRequests, experts]);

  const topExpertsByCount = useMemo(() => {
    const map = new Map<string, number>();
    completedRequests.forEach(r => {
        if(r.assignedExpertId) map.set(r.assignedExpertId, (map.get(r.assignedExpertId) || 0) + 1);
    });
    return [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => {
            const exp = experts.find(e => e.id === id);
            return { ...exp, count };
        });
  }, [completedRequests, experts]);

  const topClientsByValue = useMemo(() => {
    const map = new Map<string, number>();
    completedRequests.forEach(r => {
        map.set(r.clientId, (map.get(r.clientId) || 0) + r.amount);
    });
    return [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, val]) => {
            const client = clients.find(c => c.id === id);
            return { ...client, value: val };
        });
  }, [completedRequests, clients]);

  const topClientsByCount = useMemo(() => {
    const map = new Map<string, number>();
    requests.forEach(r => { // Using all requests for client engagement
        map.set(r.clientId, (map.get(r.clientId) || 0) + 1);
    });
    return [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => {
            const client = clients.find(c => c.id === id);
            return { ...client, count };
        });
  }, [requests, clients]);


  // --- 5. Dynamic Charts Data ---
  
  // Revenue Chart (Last 7 Days)
  const revenueChartData = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    return days.map(date => {
        const dayReqs = completedRequests.filter(r => r.dateCreated === date);
        const dayRev = dayReqs.reduce((acc: number, r) => acc + (Number(r.amount) * 0.20), 0);
        return {
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: date,
            revenue: dayRev,
            orders: dayReqs.length
        };
    });
  }, [completedRequests]);

  // Service Distribution (Pie Chart)
  const pieData = useMemo(() => {
      const dist = requests.reduce((acc, req) => {
        acc[req.serviceName] = (Number(acc[req.serviceName]) || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(dist)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => Number(b.value) - Number(a.value));
  }, [requests]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
         <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Real-time platform overview & performance metrics.</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live System
            </div>
            <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-sm font-medium text-gray-500 px-3">Last 30 Days</span>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0"><Calendar size={16} /></Button>
            </div>
            {/* Reset Button for Dev/Demo */}
            <Button size="sm" variant="danger" onClick={resetDatabase} className="h-9 px-3 text-xs bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" title="Reset all data to default mock state">
                <Trash2 size={14} className="mr-2" /> Reset Data
            </Button>
         </div>
       </div>

       {/* Key Metrics Grid - Modern Style */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. Revenue Card */}
          <div 
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden" 
            onClick={() => navigate('/admin/financials', { state: { view: 'REVENUE' } })}
          >
             <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                        <DollarSign size={24} />
                    </div>
                    {revenueGrowth !== 0 && (
                        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${revenueGrowth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {revenueGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} 
                            {Math.abs(revenueGrowth).toFixed(1)}%
                        </div>
                    )}
                </div>
                <p className="text-gray-500 text-sm font-medium">Net Revenue</p>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{netRevenue.toLocaleString()} <span className="text-sm font-medium text-gray-400">SAR</span></h3>
             </div>
          </div>

          {/* 2. Experts Card */}
          <div 
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden" 
            onClick={() => navigate('/admin/experts')}
          >
             <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Briefcase size={24} />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700">Total: {experts.length}</span>
                </div>
                <p className="text-gray-500 text-sm font-medium">Experts Network</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-3xl font-extrabold text-gray-900">{activeExperts.length}</h3>
                    <span className="text-sm text-gray-400">Active</span>
                </div>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(activeExperts.length / experts.length) * 100}%` }}></div>
                </div>
             </div>
          </div>

          {/* 3. Clients Card */}
          <div 
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden" 
            onClick={() => navigate('/admin/clients')}
          >
             <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                        <Users size={24} />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 flex items-center gap-1">
                        <Activity size={12} /> {totalOrders} Orders
                    </span>
                </div>
                <p className="text-gray-500 text-sm font-medium">Active Clients</p>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{totalClients}</h3>
             </div>
          </div>

          {/* 4. Pending Actions Card - Gradient Background */}
          <div 
             className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer text-white relative overflow-hidden"
             onClick={() => navigate('/admin/requests', { state: { filter: 'NEW' } })}
          >
             <div className="absolute -right-6 -top-6 text-white/10"><Zap size={100} /></div>
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                    <p className="text-orange-100 text-sm font-medium mt-4">Action Required</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1">{totalPendingActions} <span className="text-lg font-normal text-orange-100">Tasks</span></h3>
                </div>
                
                <div className="flex gap-2 mt-4">
                    {pendingPayouts.length > 0 && (
                        <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center" title="Pending Payout Requests">
                            <p className="text-xs text-orange-100 mb-1 flex items-center justify-center gap-1"><Wallet size={10}/> Payouts</p>
                            <p className="font-bold">{pendingPayouts.length}</p>
                        </div>
                    )}
                    {pendingExperts.length > 0 && (
                        <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center" title="Expert Vetting">
                            <p className="text-xs text-orange-100 mb-1 flex items-center justify-center gap-1"><ShieldCheck size={10}/> Vetting</p>
                            <p className="font-bold">{pendingExperts.length}</p>
                        </div>
                    )}
                    {pendingRequests.length > 0 && (
                        <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center" title="New Orders">
                            <p className="text-xs text-orange-100 mb-1 flex items-center justify-center gap-1"><FileText size={10}/> Orders</p>
                            <p className="font-bold">{pendingRequests.length}</p>
                        </div>
                    )}
                </div>
             </div>
          </div>
       </div>

       {/* Main Charts Section */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Revenue Chart */}
           <Card className="lg:col-span-2 border-none shadow-md">
               <div className="flex justify-between items-center mb-6">
                   <div>
                       <h3 className="text-lg font-bold text-gray-900">Revenue Performance</h3>
                       <p className="text-sm text-gray-500">Gross revenue trend over the last 7 days.</p>
                   </div>
                   <Button size="sm" variant="outline" onClick={() => navigate('/admin/financials', { state: { view: 'REVENUE' } })}>Full Report</Button>
               </div>
               <div className="h-[320px] w-full">
                   <ResponsiveContainer>
                       <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                           <defs>
                               <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val: number) => val >= 1000 ? `${val/1000}k` : `${val}`} />
                           <Tooltip 
                               formatter={(value: number) => [`${value.toLocaleString()} SAR`, 'Revenue']}
                               contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                               itemStyle={{ color: '#059669', fontWeight: 600 }}
                           />
                           <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </Card>

           {/* Service Distribution */}
           <Card className="border-none shadow-md flex flex-col">
               <h3 className="text-lg font-bold text-gray-900 mb-2">Service Demand</h3>
               <p className="text-sm text-gray-500 mb-6">Marketplace distribution</p>
               <div className="h-[250px] w-full relative flex-1">
                   <ResponsiveContainer>
                       <PieChart>
                           <Pie
                               data={pieData}
                               cx="50%"
                               cy="50%"
                               innerRadius={70}
                               outerRadius={90}
                               paddingAngle={5}
                               dataKey="value"
                               stroke="none"
                           >
                               {pieData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                           </Pie>
                           <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                       </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                       <p className="text-3xl font-extrabold text-gray-900">{totalOrders}</p>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Requests</p>
                   </div>
               </div>
               <div className="space-y-2 mt-4">
                   {pieData.slice(0, 3).map((entry, index) => (
                       <div key={index} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                           <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                <span className="font-medium">{entry.name}</span>
                           </div>
                           <span className="font-bold text-gray-900">{entry.value}</span>
                       </div>
                   ))}
               </div>
           </Card>
       </div>

       {/* --- Top Performers Lists --- */}
       <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Trophy size={24} className="text-yellow-500" /> Leaderboards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Top Experts by Value */}
              <Card className="flex flex-col border-none shadow-md">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Medal size={18} /></div>
                      <h3 className="font-bold text-gray-800 text-sm">Top Revenue Experts</h3>
                  </div>
                  <div className="flex-1 space-y-4">
                      {topExpertsByValue.map((exp: any, idx) => (
                          <div key={idx} className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                  <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{idx + 1}</span>
                                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-sm"><img src={exp?.avatarUrl} alt="" className="w-full h-full object-cover" /></div>
                                  <span className="truncate w-24 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors" title={exp?.name}>{exp?.name}</span>
                              </div>
                              <span className="text-sm font-bold text-emerald-600">{exp.value.toLocaleString()}</span>
                          </div>
                      ))}
                  </div>
              </Card>

              {/* Top Experts by Count */}
              <Card className="flex flex-col border-none shadow-md">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Briefcase size={18} /></div>
                      <h3 className="font-bold text-gray-800 text-sm">Most Active Experts</h3>
                  </div>
                  <div className="flex-1 space-y-4">
                      {topExpertsByCount.map((exp: any, idx) => (
                          <div key={idx} className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                  <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{idx + 1}</span>
                                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-sm"><img src={exp?.avatarUrl} alt="" className="w-full h-full object-cover" /></div>
                                  <span className="truncate w-24 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors" title={exp?.name}>{exp?.name}</span>
                              </div>
                              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{exp.count} Jobs</span>
                          </div>
                      ))}
                  </div>
              </Card>

              {/* Top Clients by Value */}
              <Card className="flex flex-col border-none shadow-md">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Crown size={18} /></div>
                      <h3 className="font-bold text-gray-800 text-sm">Top Spenders</h3>
                  </div>
                  <div className="flex-1 space-y-4">
                      {topClientsByValue.map((client: any, idx) => (
                          <div key={idx} className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                  <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{idx + 1}</span>
                                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-sm"><img src={client?.avatarUrl} alt="" className="w-full h-full object-cover" /></div>
                                  <span className="truncate w-24 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors" title={client?.companyName}>{client?.companyName}</span>
                              </div>
                              <span className="text-sm font-bold text-purple-600">{client.value.toLocaleString()}</span>
                          </div>
                      ))}
                  </div>
              </Card>

              {/* Top Clients by Requests */}
              <Card className="flex flex-col border-none shadow-md">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                      <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><FileText size={18} /></div>
                      <h3 className="font-bold text-gray-800 text-sm">Most Frequent Clients</h3>
                  </div>
                  <div className="flex-1 space-y-4">
                      {topClientsByCount.map((client: any, idx) => (
                          <div key={idx} className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                  <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{idx + 1}</span>
                                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-sm"><img src={client?.avatarUrl} alt="" className="w-full h-full object-cover" /></div>
                                  <span className="truncate w-24 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors" title={client?.companyName}>{client?.companyName}</span>
                              </div>
                              <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{client.count} Reqs</span>
                          </div>
                      ))}
                  </div>
              </Card>

          </div>
       </div>

       {/* Action Lists */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Expert Vetting Queue */}
           <Card className="flex flex-col h-full border-none shadow-md">
               <div className="flex justify-between items-center mb-6">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><ShieldCheck size={20} /></div>
                       <div>
                           <h3 className="text-lg font-bold text-gray-900">Expert Vetting Queue</h3>
                           <p className="text-xs text-gray-500">Review and approve new applications</p>
                       </div>
                   </div>
                   <Badge status="VETTING" />
               </div>
               
               <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-3">
                   {pendingExperts.length > 0 ? (
                       pendingExperts.map(expert => (
                           <div key={expert.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between group">
                               <div className="flex items-center gap-4">
                                   <img src={expert.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-gray-200 ring-2 ring-white shadow-sm" />
                                   <div>
                                       <p className="font-bold text-gray-900 text-sm">{expert.name}</p>
                                       <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full w-fit mt-1">{expert.specializations[0]}</p>
                                   </div>
                               </div>
                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button size="sm" variant="outline" onClick={() => updateExpertStatus(expert.id, 'SUSPENDED')} className="text-red-600 border-red-200 hover:bg-red-50"><X size={14}/></Button>
                                   <Button size="sm" onClick={() => updateExpertStatus(expert.id, 'ACTIVE')} className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"><Check size={14}/></Button>
                               </div>
                           </div>
                       ))
                   ) : (
                       <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                           <div className="p-4 bg-green-50 rounded-full mb-3">
                                <CheckCircle size={32} className="text-green-500" />
                           </div>
                           <p className="font-medium text-gray-600">All caught up!</p>
                           <p className="text-sm">No pending expert applications.</p>
                       </div>
                   )}
               </div>
               <div className="pt-4 border-t border-gray-100 mt-4">
                   <Button variant="outline" className="w-full text-sm font-medium" onClick={() => navigate('/admin/experts', { state: { filter: 'VETTING' } })}>View All Applications</Button>
               </div>
           </Card>

           {/* Recent Activity / Requests */}
           <Card className="flex flex-col h-full border-none shadow-md">
               <div className="flex justify-between items-center mb-6">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Activity size={20} /></div>
                       <div>
                           <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                           <p className="text-xs text-gray-500">Latest platform requests</p>
                       </div>
                   </div>
               </div>

               <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-0">
                   {requests.slice(0, 6).map((req, idx) => (
                       <div key={req.id} 
                            onClick={() => navigate('/admin/requests')}
                            className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-3 rounded-lg transition-colors cursor-pointer group"
                        >
                           <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${
                               req.status === 'COMPLETED' ? 'bg-green-500' : 
                               req.status === 'NEW' ? 'bg-blue-500' : 'bg-orange-500'
                           }`} />
                           <div className="flex-1 min-w-0">
                               <p className="font-bold text-gray-800 text-sm truncate group-hover:text-primary-600 transition-colors">{req.serviceName}</p>
                               <p className="text-xs text-gray-500 truncate mt-0.5">{req.clientName} • <span className="font-mono">{req.dateCreated}</span></p>
                           </div>
                           <div className="text-right">
                               <p className="font-bold text-gray-900 text-sm">{req.amount.toLocaleString()}</p>
                               <span className="text-[10px] text-gray-400 uppercase font-medium bg-gray-100 px-2 py-0.5 rounded">{req.status}</span>
                           </div>
                       </div>
                   ))}
               </div>
               <div className="pt-4 border-t border-gray-100 mt-4">
                   <Button variant="outline" className="w-full text-sm font-medium" onClick={() => navigate('/admin/requests')}>View All Requests</Button>
               </div>
           </Card>
       </div>
    </div>
  );
};

export default AdminDashboard;
