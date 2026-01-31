
import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import {
    Users, TrendingUp, AlertCircle, DollarSign, Check, X,
    Briefcase, Activity, Calendar, ArrowUpRight, ArrowDownRight,
    ShieldCheck, FileText, CheckCircle, ExternalLink, Trophy, Medal, Crown, Zap, Wallet
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { clients, experts, requests, payoutRequests, updateExpertStatus, t } = useAppContext();
    const [stats, setStats] = React.useState<{
        totalExperts: number;
        activeExperts: number;
        totalClients: number;
    } | null>(null);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    setStats(await res.json());
                }
            } catch (e) { console.error("Failed to fetch admin stats", e) }
        };
        fetchStats();
    }, []);

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

    // --- 2. User Stats (Prefer DB Stats if available, else Context Fallback) ---
    const activeExpertsCount = stats?.activeExperts ?? experts.filter(e => e.status === 'ACTIVE' || e.kycStatus === 'APPROVED').length;
    const totalExpertsCount = stats?.totalExperts ?? experts.length;
    const pendingExperts = experts.filter(e => e.status === 'VETTING');
    const totalClients = stats?.totalClients ?? clients.length;

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
            if (r.assignedExpertId) map.set(r.assignedExpertId, (map.get(r.assignedExpertId) || 0) + r.amount);
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
            if (r.assignedExpertId) map.set(r.assignedExpertId, (map.get(r.assignedExpertId) || 0) + 1);
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
            const name = req.pricingPlan?.name || req.service?.nameEn || req.serviceName || 'Unknown';
            acc[name] = (Number(acc[name]) || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(dist)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => Number(b.value) - Number(a.value));
    }, [requests]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('admin.dashboardTitle')}</h1>
                    <p className="text-gray-500 mt-1">{t('admin.dashboardDesc')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {t('admin.liveSystem')}
                    </div>
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <span className="text-sm font-medium text-gray-500 px-3">{t('admin.last30Days')}</span>
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0"><Calendar size={16} /></Button>
                    </div>
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
                        <p className="text-gray-500 text-sm font-medium">{t('admin.netRevenue')}</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{netRevenue.toLocaleString()} <span className="text-sm font-medium text-gray-400">{t('common.sar')}</span></h3>
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
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700">{t('admin.total')}: {totalExpertsCount}</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">{t('admin.expertsNetwork')}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3 className="text-3xl font-extrabold text-gray-900">{activeExpertsCount}</h3>
                            <span className="text-sm text-gray-400">{t('admin.active')}</span>
                        </div>
                        <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${totalExpertsCount > 0 ? (activeExpertsCount / totalExpertsCount) * 100 : 0}%` }}></div>
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
                                <Activity size={12} /> {totalOrders} {t('admin.orders')}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">{t('admin.activeClients')}</p>
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
                            <p className="text-orange-100 text-sm font-medium mt-4">{t('admin.actionRequired')}</p>
                            <h3 className="text-3xl font-extrabold text-white mt-1">{totalPendingActions} <span className="text-lg font-normal text-orange-100">{t('admin.tasks')}</span></h3>
                        </div>

                        <div className="flex gap-2 mt-4">
                            {pendingPayouts.length > 0 && (
                                <div
                                    className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center hover:bg-white/30 transition-colors cursor-pointer"
                                    title="Pending Payout Requests"
                                    onClick={(e) => { e.stopPropagation(); navigate('/admin/financials'); }}
                                >
                                    <p className="text-xs text-orange-100 mb-1 flex items-center justify-center gap-1"><Wallet size={10} /> {t('admin.payouts')}</p>
                                    <p className="font-bold">{pendingPayouts.length}</p>
                                </div>
                            )}
                            {pendingExperts.length > 0 && (
                                <div
                                    className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center hover:bg-white/30 transition-colors cursor-pointer"
                                    title="Expert Vetting"
                                    onClick={(e) => { e.stopPropagation(); navigate('/admin/experts', { state: { filter: 'VETTING' } }); }}
                                >
                                    <p className="text-xs text-orange-100 mb-1 flex items-center justify-center gap-1"><ShieldCheck size={10} /> {t('admin.vetting')}</p>
                                    <p className="font-bold">{pendingExperts.length}</p>
                                </div>
                            )}
                            {pendingRequests.length > 0 && (
                                <div
                                    className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center hover:bg-white/30 transition-colors cursor-pointer"
                                    title="New Orders"
                                    onClick={(e) => { e.stopPropagation(); navigate('/admin/requests', { state: { filter: 'NEW' } }); }}
                                >
                                    <p className="text-xs text-orange-100 mb-1 flex items-center justify-center gap-1"><FileText size={10} /> {t('admin.orders')}</p>
                                    <p className="font-bold">{pendingRequests.length}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Charts Section - Glassmorphic */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 border border-gray-100 shadow-xl bg-white/80 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{t('admin.revenuePerformance')}</h3>
                            <p className="text-sm text-gray-500">{t('admin.revenueTrend')}</p>
                        </div>
                        <Button size="sm" variant="outline" className="bg-white/50 backdrop-blur-sm hover:bg-white" onClick={() => navigate('/admin/financials', { state: { view: 'REVENUE' } })}>
                            {t('admin.fullReport')}
                        </Button>
                    </div>
                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer>
                            <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} tickFormatter={(val: number) => val >= 1000 ? `${val / 1000}k` : `${val}`} />
                                <Tooltip
                                    formatter={(value: any) => [`${value.toLocaleString()} ${t('common.sar')}`, t('admin.netRevenue')] as any}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                                    itemStyle={{ color: '#059669', fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Service Distribution */}
                <Card className="border border-gray-100 shadow-xl bg-white/80 backdrop-blur-xl flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{t('admin.serviceDemand')}</h3>
                        <p className="text-sm text-gray-500 mb-6">{t('admin.marketplaceDist')}</p>
                    </div>
                    <div className="h-[250px] w-full relative flex-1 z-10">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col animate-in fade-in zoom-in duration-700">
                            <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{totalOrders}</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{t('admin.requests')}</p>
                        </div>
                    </div>
                    <div className="space-y-3 mt-6 relative z-10">
                        {pieData.slice(0, 3).map((entry, index) => (
                            <div key={index} className="flex items-center justify-between text-sm text-slate-600 bg-white/50 px-4 py-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="font-semibold">{entry.name}</span>
                                </div>
                                <span className="font-black text-slate-900">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* --- Top Performers Lists --- */}
            <div>
                <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
                        <Trophy size={28} />
                    </div>
                    {t('admin.leaderboards')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Top Experts by Value */}
                    <Card className="flex flex-col border border-gray-100 shadow-lg bg-white/90">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                            <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 shadow-sm"><Medal size={20} /></div>
                            <h3 className="font-bold text-slate-800">{t('admin.topRevenueExperts')}</h3>
                        </div>
                        <div className="flex-1 space-y-5">
                            {topExpertsByValue.map((exp: any, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-sm transition-transform group-hover:scale-110 ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-50' : 'bg-slate-100 text-slate-500'}`}>
                                            {idx + 1}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-md"><img src={exp?.avatarUrl} alt="" className="w-full h-full object-cover" /></div>
                                        <div className="flex flex-col">
                                            <span className="truncate w-24 text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors" title={exp?.name}>{exp?.name}</span>
                                            <span className="text-[10px] text-emerald-500 font-bold">{exp.value.toLocaleString()} SAR</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Top Experts by Count */}
                    <Card className="flex flex-col border border-gray-100 shadow-lg bg-white/90">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                            <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600 shadow-sm"><Briefcase size={20} /></div>
                            <h3 className="font-bold text-slate-800">{t('admin.mostActiveExperts')}</h3>
                        </div>
                        <div className="flex-1 space-y-5">
                            {topExpertsByCount.map((exp: any, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-sm transition-transform group-hover:scale-110 ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-50' : 'bg-slate-100 text-slate-500'}`}>
                                            {idx + 1}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-md"><img src={exp?.avatarUrl} alt="" className="w-full h-full object-cover" /></div>
                                        <div className="flex flex-col">
                                            <span className="truncate w-24 text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors" title={exp?.name}>{exp?.name}</span>
                                            <span className="text-[10px] text-blue-500 font-bold">{exp.count} {t('admin.jobs')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Top Clients by Value */}
                    <Card className="flex flex-col border border-gray-100 shadow-lg bg-white/90">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                            <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600 shadow-sm"><Crown size={20} /></div>
                            <h3 className="font-bold text-slate-800">{t('admin.topSpenders')}</h3>
                        </div>
                        <div className="flex-1 space-y-5">
                            {topClientsByValue.map((client: any, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-sm transition-transform group-hover:scale-110 ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-50' : 'bg-slate-100 text-slate-500'}`}>
                                            {idx + 1}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-md"><img src={client?.avatarUrl} alt="" className="w-full h-full object-cover" /></div>
                                        <div className="flex flex-col">
                                            <span className="truncate w-24 text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors" title={client?.name}>{client?.name}</span>
                                            <span className="text-[10px] text-purple-500 font-bold">{client.value.toLocaleString()} SAR</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Top Clients by Requests */}
                    <Card className="flex flex-col border border-gray-100 shadow-lg bg-white/90">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                            <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600 shadow-sm"><FileText size={20} /></div>
                            <h3 className="font-bold text-slate-800">{t('admin.mostFrequentClients')}</h3>
                        </div>
                        <div className="flex-1 space-y-5">
                            {topClientsByCount.map((client: any, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-sm transition-transform group-hover:scale-110 ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-50' : 'bg-slate-100 text-slate-500'}`}>
                                            {idx + 1}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-md"><img src={client?.avatarUrl} alt="" className="w-full h-full object-cover" /></div>
                                        <div className="flex flex-col">
                                            <span className="truncate w-24 text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors" title={client?.name}>{client?.name}</span>
                                            <span className="text-[10px] text-orange-500 font-bold">{client.count} {t('admin.requests')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>
            </div>

            {/* Action Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expert Vetting Queue */}
                <Card className="flex flex-col h-full border border-gray-100 shadow-lg bg-gradient-to-b from-white to-orange-50/30">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shadow-sm"><ShieldCheck size={24} /></div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{t('admin.expertVettingQueue')}</h3>
                                <p className="text-sm text-slate-500">{t('admin.vettingQueueDesc')}</p>
                            </div>
                        </div>
                        <Badge status="VETTING" />
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-4">
                        {pendingExperts.length > 0 ? (
                            pendingExperts.map(expert => (
                                <div key={expert.id} className="p-5 border border-white bg-white/60 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-5">
                                        <img src={expert.avatarUrl} alt="" className="w-12 h-12 rounded-full bg-slate-100 ring-4 ring-white shadow-sm" />
                                        <div>
                                            <p className="font-bold text-slate-900 text-base">{expert.name}</p>
                                            <p className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-full w-fit mt-1.5">{expert.specializations[0]}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => updateExpertStatus(expert.id, 'SUSPENDED')} className="text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 h-10 w-10 p-0 rounded-xl transition-all"><X size={18} /></Button>
                                        <Button size="sm" onClick={() => updateExpertStatus(expert.id, 'ACTIVE')} className="bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200 text-white h-10 w-10 p-0 rounded-xl transition-all hover:scale-105"><Check size={18} /></Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                <div className="p-4 bg-green-100 rounded-full mb-4 animate-bounce">
                                    <CheckCircle size={32} className="text-green-600" />
                                </div>
                                <p className="font-bold text-slate-700 text-lg">{t('admin.allCaughtUp')}</p>
                                <p className="text-sm">{t('admin.noPendingInfinite')}</p>
                            </div>
                        )}
                    </div>
                    <div className="pt-6 border-t border-gray-100 mt-6">
                        <Button variant="outline" className="w-full py-6 rounded-xl font-bold border-gray-200 hover:bg-white hover:shadow-md transition-all text-slate-600" onClick={() => navigate('/admin/experts', { state: { filter: 'VETTING' } })}>{t('admin.viewAllApps')}</Button>
                    </div>
                </Card>

                {/* Recent Activity / Requests */}
                <Card className="flex flex-col h-full border border-gray-100 shadow-lg bg-gradient-to-b from-white to-blue-50/30">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-sm"><Activity size={24} /></div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{t('admin.recentActivity')}</h3>
                                <p className="text-sm text-slate-500">{t('admin.latestRequests')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>

                        {requests.slice(0, 8).map((req, idx) => (
                            <div key={req.id}
                                onClick={() => navigate('/admin/requests')}
                                className="relative z-10 flex items-start gap-4 py-4 px-2 hover:bg-blue-50/50 rounded-xl transition-all cursor-pointer group"
                            >
                                <div className={`w-10 h-10 rounded-full shrink-0 shadow-sm flex items-center justify-center border-4 border-white ${req.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                    req.status === 'NEW' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                    {req.status === 'COMPLETED' ? <CheckCircle size={16} strokeWidth={3} /> : <FileText size={16} strokeWidth={3} />}
                                </div>

                                <div className="flex-1 min-w-0 pt-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{req.pricingPlan?.name || req.service?.nameEn || req.serviceName}</p>
                                        <p className="font-black text-slate-800 text-sm">{req.amount.toLocaleString()} SAR</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-slate-500 font-medium">{req.clientName} • <span className="text-slate-400">{req.dateCreated}</span></p>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${req.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                            req.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>{req.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-6 border-t border-gray-100 mt-6">
                        <Button variant="outline" className="w-full py-6 rounded-xl font-bold border-gray-200 hover:bg-white hover:shadow-md transition-all text-slate-600" onClick={() => navigate('/admin/requests')}>{t('admin.viewAllRequests')}</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
