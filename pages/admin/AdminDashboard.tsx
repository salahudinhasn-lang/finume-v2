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

  // Chart Data (Mocked but structure ready for real data)
  const chartData = [
      { name: 'Mon', revenue: 4000 },
      { name: 'Tue', revenue: 3000 },
      { name: 'Wed', revenue: 2000 },
      { name: 'Thu', revenue: 2780 },
      { name: 'Fri', revenue: 1890 },
      { name: 'Sat', revenue: 2390 },
      { name: 'Sun', revenue: 3490 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">System overview and critical action items.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" onClick={resetDatabase} className="text-red-600 border-red-200 hover:bg-red-50" title="Reset Data">
                <Trash2 size={16} /> Reset DB
            </Button>
            <Button onClick={() => navigate('/admin/financials')} className="bg-gray-900 hover:bg-gray-800">
                <FileText size={16} /> Financial Reports
            </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-lg">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><DollarSign size={24} /></div>
                  <span className={`text-xs font-bold px-2 py-1 rounded bg-white/20 flex items-center gap-1 ${revenueGrowth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {revenueGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} 
                      {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
              </div>
              <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Net Revenue</p>
              <p className="text-3xl font-extrabold mt-1">{netRevenue.toLocaleString()} <span className="text-lg font-normal text-indigo-200">SAR</span></p>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/requests')}>
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Activity size={24} /></div>
                  <div className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">{totalPendingActions} Pending</div>
              </div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Action Items</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalPendingActions}</p>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/clients')}>
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
              </div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Clients</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalClients}</p>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/experts')}>
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg"><ShieldCheck size={24} /></div>
                  <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">{activeExperts.length} Active</span>
              </div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Experts Onboard</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{experts.length}</p>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 space-y-6">
              <Card className="h-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-800">Revenue Overview</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div> Revenue
                      </div>
                  </div>
                  <div className="flex-1 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                              <defs>
                                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                              />
                              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </Card>

              {/* Recent Pending Actions Table */}
              <Card>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800">Urgent Actions</h3>
                      <Button size="sm" variant="outline" onClick={() => navigate('/admin/requests')}>View All</Button>
                  </div>
                  <div className="space-y-3">
                      {pendingExperts.slice(0, 2).map(exp => (
                          <div key={exp.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-xl">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white rounded-lg text-orange-600 shadow-sm"><ShieldCheck size={18} /></div>
                                  <div>
                                      <p className="font-bold text-gray-800 text-sm">New Expert Application</p>
                                      <p className="text-xs text-gray-500">{exp.name} • {exp.specializations[0]}</p>
                                  </div>
                              </div>
                              <Button size="sm" onClick={() => navigate('/admin/experts', { state: { filter: 'VETTING' } })} className="bg-white text-orange-600 hover:bg-orange-100 border border-orange-200 shadow-sm text-xs h-8">Review</Button>
                          </div>
                      ))}
                      {pendingPayouts.slice(0, 2).map(payout => (
                          <div key={payout.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm"><Wallet size={18} /></div>
                                  <div>
                                      <p className="font-bold text-gray-800 text-sm">Payout Request</p>
                                      <p className="text-xs text-gray-500">{payout.expertName} • {payout.amount.toLocaleString()} SAR</p>
                                  </div>
                              </div>
                              <Button size="sm" onClick={() => navigate('/admin/financials')} className="bg-white text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-sm text-xs h-8">Process</Button>
                          </div>
                      ))}
                      {totalPendingActions === 0 && (
                          <div className="text-center py-8 text-gray-400 text-sm">No pending actions required.</div>
                      )}
                  </div>
              </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
              {/* Top Experts */}
              <Card>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Trophy size={18} className="text-yellow-500" /> Top Performers
                  </h3>
                  <div className="space-y-4">
                      {topExpertsByValue.map((exp, idx) => (
                          <div key={idx} className="flex items-center gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                              <div className="font-bold text-gray-400 w-4 text-center">{idx + 1}</div>
                              <img src={(exp as any)?.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                              <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-900 truncate">{(exp as any)?.name || 'Unknown'}</p>
                                  <p className="text-xs text-gray-500">{(exp as any)?.value?.toLocaleString()} SAR Revenue</p>
                              </div>
                              {idx === 0 && <Crown size={16} className="text-yellow-500" />}
                          </div>
                      ))}
                      {topExpertsByValue.length === 0 && (
                          <div className="text-center text-gray-400 text-xs">No data available.</div>
                      )}
                  </div>
              </Card>

              {/* System Health */}
              <Card className="bg-slate-900 text-white border-slate-800">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Activity size={18} className="text-green-400" /> System Health
                  </h3>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Database Status</span>
                          <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Operational</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">API Latency</span>
                          <span className="text-slate-200">24ms</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Storage Usage</span>
                          <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div className="w-[45%] h-full bg-blue-500 rounded-full"></div>
                              </div>
                              <span className="text-slate-200">45%</span>
                          </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">ZATCA Sync</span>
                          <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Synced</span>
                      </div>
                  </div>
              </Card>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
