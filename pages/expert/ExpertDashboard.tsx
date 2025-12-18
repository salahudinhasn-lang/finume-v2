import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { Briefcase, DollarSign, Star, Globe, ArrowRight, CheckCircle, Clock, Send, Zap, TrendingUp, Filter, Search, MoreHorizontal, MessageSquare, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Expert } from '../../types';

const ExpertDashboard = () => {
    const { user, requests, assignRequest, updateRequestStatus, t } = useAppContext();
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(true);

    const currentUser = user as Expert;
    const isVetting = currentUser?.status === 'VETTING';

    // My Tasks
    const myTasks = requests.filter(r => r.assignedExpertId === user?.id);
    const activeTasks = myTasks.filter(r => ['MATCHED', 'IN_PROGRESS', 'REVIEW_CLIENT', 'REVIEW_ADMIN'].includes(r.status));
    const completedTasks = myTasks.filter(r => r.status === 'COMPLETED');

    // Marketplace: Status is NEW and No Expert Assigned
    const marketplaceRequests = requests.filter(r => r.status === 'NEW' && !r.assignedExpertId);

    // Earnings Calculation (Strictly based on requests)
    // Expert gets 80% of the request amount
    const totalEarnings = completedTasks.reduce((acc, r) => acc + (r.amount * 0.8), 0);

    // Performance Metrics
    const totalAssigned = myTasks.length;
    const successRate = totalAssigned > 0
        ? Math.round((completedTasks.length / totalAssigned) * 100)
        : 0;

    // Completion Chart Data
    const taskStatusData = [
        { name: 'Completed', value: completedTasks.length, color: '#10b981' },
        { name: 'In Progress', value: activeTasks.length, color: '#3b82f6' },
    ];

    const handleAcceptJob = (requestId: string) => {
        if (isVetting) {
            alert("Account Restricted: You must be approved by an Admin before accepting new requests.");
            return;
        }
        if (user) {
            assignRequest(requestId, user.id);
            alert("Job Accepted! Head to 'My Tasks' to start working.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">

            {/* Vetting Warning Banner */}
            {isVetting && (
                <div className="bg-orange-50/80 backdrop-blur-sm border border-orange-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm animate-pulse">
                    <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-orange-900">{t('expert.vettingTitle')}</h3>
                        <p className="text-orange-800/80 mt-1 leading-relaxed max-w-2xl">
                            {t('expert.vettingDesc').replace('Active', 'Active')}
                        </p>
                    </div>
                </div>
            )}

            {/* 1. Glassmorphic Hero Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 shadow-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 opacity-[0.1] rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500 opacity-[0.1] rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 text-sm font-medium text-blue-200 mb-3 px-4 py-1.5 rounded-full bg-white/10 w-fit backdrop-blur-md border border-white/5">
                            <Clock size={14} />
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            {isVetting && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mx-1"></span>}
                            {isVetting && <span className="text-orange-300 font-bold tracking-wider text-xs">VETTING PENDING</span>}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
                            {t('expert.goodMorning')}, <span className="text-blue-400">{user?.name.split(' ')[0]}</span>
                        </h1>
                        <p className="text-lg text-blue-100/80 max-w-xl leading-relaxed">
                            You have <strong className="text-white border-b-2 border-green-400">{activeTasks.length} active tasks</strong> requiring your attention today. Keep up the momentum!
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 p-2 rounded-2xl backdrop-blur-sm border border-white/10">
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all border ${isOnline
                                ? 'bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30'
                                : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <span className={`w-3 h-3 rounded-full shadow-lg shadow-current ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
                            <span className="font-bold text-sm tracking-wide">{isOnline ? t('expert.availableForWork') : t('expert.away')}</span>
                        </button>

                        <Button
                            onClick={() => navigate('/expert/earnings')}
                            className="bg-white text-indigo-900 hover:bg-blue-50 shadow-lg shadow-black/20 font-bold px-6 py-3 h-auto rounded-xl border border-transparent"
                        >
                            <DollarSign size={18} className="mr-2" /> {t('expert.viewWallet')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. Stats Grid - Modern Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        title: t('expert.totalEarnings'),
                        value: `${totalEarnings.toLocaleString()}`,
                        suffix: 'SAR',
                        icon: <TrendingUp size={24} />,
                        color: 'emerald',
                        path: '/expert/earnings',
                        trend: '+12% vs last month'
                    },
                    {
                        title: t('expert.activeJobs'),
                        value: activeTasks.length,
                        icon: <Briefcase size={24} />,
                        color: 'blue',
                        path: '/expert/tasks',
                        trend: '3 due soon'
                    },
                    {
                        title: t('expert.clientRating'),
                        value: (user as any).rating > 0 ? (user as any).rating.toFixed(1) : '0.0',
                        icon: <Star size={24} fill="currentColor" />,
                        color: 'yellow',
                        path: '/expert/profile',
                        trend: 'Top Rated'
                    },
                    {
                        title: t('expert.jobSuccess'),
                        value: `${successRate}%`,
                        icon: <Zap size={24} />,
                        color: 'purple',
                        path: '/expert/profile',
                        trend: 'Excellent'
                    }
                ].map((stat, idx) => (
                    <div key={idx} onClick={() => navigate(stat.path)} className="cursor-pointer group relative">
                        <div className={`absolute inset-0 bg-${stat.color}-500 blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                        <Card className="relative h-full border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] overflow-hidden">
                            <div className={`absolute top-0 right-0 p-4 opacity-5 text-${stat.color}-600`}>
                                {stat.icon}
                            </div>
                            <div className="flex flex-col justify-between h-full space-y-4">
                                <div className={`p-3 w-fit rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 mb-2`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.title}</p>
                                    <h3 className="text-3xl font-black text-gray-900 flex items-baseline gap-1">
                                        {stat.value}
                                        {stat.suffix && <span className="text-sm font-bold text-gray-400">{stat.suffix}</span>}
                                    </h3>
                                </div>
                                <div className={`text-xs font-bold px-3 py-1 bg-${stat.color}-50 text-${stat.color}-700 rounded-full w-fit`}>
                                    {stat.trend}
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Main Column: Tasks & Marketplace */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Active Tasks Priority View */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity size={20} /></div>
                                {t('expert.priorityTasks')}
                            </h2>
                            <Button variant="ghost" onClick={() => navigate('/expert/tasks')} className="text-blue-600 hover:bg-blue-50 font-bold text-sm">
                                {t('expert.viewAllTasks')} <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {activeTasks.length > 0 ? (
                                activeTasks.slice(0, 3).map((task, idx) => (
                                    <div key={task.id} className="group bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>

                                        <div className="flex flex-col md:flex-row justify-between gap-6 pl-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Badge status={task.status} />
                                                    <span className="text-xs font-bold text-gray-400 tracking-wider">#{task.id}</span>
                                                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                        <Clock size={12} /> Due in 2 days
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{task.serviceName}</h3>
                                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{task.clientName.charAt(0)}</span>
                                                    {task.clientName}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[180px] justify-end">
                                                {task.status === 'MATCHED' && (
                                                    <Button onClick={() => updateRequestStatus(task.id, 'IN_PROGRESS')} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 w-full md:w-auto rounded-xl">
                                                        {t('expert.startWork')} <ArrowRight size={18} className="ml-2" />
                                                    </Button>
                                                )}
                                                {task.status === 'IN_PROGRESS' && (
                                                    <Button onClick={() => updateRequestStatus(task.id, 'REVIEW_CLIENT')} className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 w-full md:w-auto rounded-xl">
                                                        {t('expert.submitForReview')} <CheckCircle size={18} className="ml-2" />
                                                    </Button>
                                                )}
                                                {['REVIEW_CLIENT', 'REVIEW_ADMIN'].includes(task.status) && (
                                                    <div className="text-center">
                                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 mb-1">
                                                            <Clock size={20} />
                                                        </span>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('expert.awaitingApproval')}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[1.5rem] p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">All Caught Up!</h3>
                                    <p className="text-gray-500 text-sm mt-1 mb-6">You have no active tasks at the moment.</p>
                                    <Button variant="outline" onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}>
                                        Check Marketplace
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Marketplace Feed */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Globe size={20} /></div>
                                {t('expert.newOpportunities')}
                            </h2>
                            <div className="flex gap-2">
                                <button className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl text-gray-500 transition-all"><Search size={18} /></button>
                                <button className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl text-gray-500 transition-all"><Filter size={18} /></button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                            {marketplaceRequests.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {marketplaceRequests.slice(0, 5).map(req => (
                                        <div key={req.id} className={`p-6 hover:bg-indigo-50/50 transition-colors flex flex-col sm:flex-row justify-between gap-6 group ${isVetting ? 'opacity-60 grayscale-[0.8] pointer-events-none' : ''}`}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">New</span>
                                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">{req.serviceName}</h3>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{req.description}</p>
                                                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                                    <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-indigo-400" /> {req.clientName}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <span className="flex items-center gap-1.5"><Clock size={14} /> Posted {req.dateCreated}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end justify-center min-w-[140px] gap-3 pl-4 border-l border-gray-100 sm:border-0 sm:pl-0 sm:border-transparent">
                                                <div className="text-right">
                                                    <span className="block text-2xl font-black text-gray-900">{req.amount.toLocaleString()}</span>
                                                    <span className="block text-xs font-bold text-gray-400 uppercase">{t('common.sar')}</span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAcceptJob(req.id)}
                                                    className={`w-full rounded-xl font-bold ${isVetting ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-black'}`}
                                                >
                                                    {isVetting ? t('expert.locked') : t('expert.accept')}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Globe size={32} className="text-gray-300" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">No New Jobs</h3>
                                    <p className="text-gray-500 text-sm mt-1">{t('expert.noNewJobs')}</p>
                                </div>
                            )}
                            {marketplaceRequests.length > 0 && (
                                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide transition-colors">{t('expert.viewAllJobs')}</button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Side Column: Profile & Insights (Sticky) */}
                <div className="space-y-6 sticky top-8 h-fit">

                    {/* Task Breakdown Chart */}
                    <Card className="rounded-[2rem] border border-gray-100 shadow-sm p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="font-bold text-gray-900 text-lg">{t('expert.workload')}</h3>
                            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
                        </div>
                        <div className="h-[200px] w-full relative z-10">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={taskStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={4}
                                    >
                                        {taskStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span className="text-3xl font-black text-gray-900">{myTasks.length}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('expert.tasks')}</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {taskStatusData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    {item.name === 'Completed' ? t('expert.completed') : t('expert.inProgress')}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="rounded-[2rem] border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-gray-400">{t('expert.quickActions')}</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Briefcase size={20} /></div>
                                    <span className="text-sm font-bold text-gray-700">{t('expert.updatePortfolio')}</span>
                                </div>
                                <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-300 hover:shadow-lg hover:shadow-purple-50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform"><Globe size={20} /></div>
                                    <span className="text-sm font-bold text-gray-700">{t('expert.browseCategories')}</span>
                                </div>
                                <ArrowRight size={18} className="text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                            </button>
                            <button
                                onClick={() => navigate('/expert/profile')}
                                className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-orange-300 hover:shadow-lg hover:shadow-orange-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform"><Zap size={20} /></div>
                                    <span className="text-sm font-bold text-gray-700">{t('expert.boostProfile')}</span>
                                </div>
                                <ArrowRight size={18} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </Card>

                    {/* Support Widget - Enhanced */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-[2rem] p-8 text-white text-center shadow-xl shadow-indigo-200 group cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MessageSquare size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner border border-white/10">
                                <Send size={28} />
                            </div>
                            <h3 className="font-extrabold text-xl mb-2">{t('expert.needHelp')}</h3>
                            <p className="text-indigo-200 text-sm mb-6 px-2 leading-relaxed opacity-90">{t('expert.contactSupport')}</p>
                            <button className="w-full py-3.5 bg-white text-indigo-900 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
                                {t('expert.openTicket')}
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ExpertDashboard;
