
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/UI';
import { Briefcase, DollarSign, Star, Globe, ArrowRight, CheckCircle, Clock, Send, Zap, TrendingUp, Filter, Search, MoreHorizontal, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';
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
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Vetting Warning Banner */}
            {isVetting && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-bold text-orange-900">{t('expert.vettingTitle')}</h3>
                        <p className="text-sm text-orange-700 mt-1">
                            {t('expert.vettingDesc').replace('Active', '<strong>Active</strong>')}
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        {isVetting && <Badge status="VETTING" />}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('expert.goodMorning')}, {user?.name.split(' ')[0]}</h1>
                    <p className="text-gray-500 mt-1">{t('expert.activeTasksAlert').split('<bold>')[0]} <span className="font-bold text-blue-600">{activeTasks.length} active tasks</span> {t('expert.activeTasksAlert').split('</bold>')[1]}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-sm font-medium text-gray-700">{isOnline ? t('expert.availableForWork') : t('expert.away')}</span>
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className="ml-2 text-xs text-blue-600 hover:underline"
                        >
                            {t('expert.change')}
                        </button>
                    </div>
                    <Button onClick={() => navigate('/expert/earnings')} className="shadow-lg shadow-green-100 bg-emerald-600 hover:bg-emerald-700">
                        <DollarSign size={18} /> {t('expert.viewWallet')}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => navigate('/expert/earnings')} className="cursor-pointer group">
                    <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('expert.totalEarnings')}</p>
                                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{totalEarnings.toLocaleString()} <span className="text-sm font-medium text-gray-400">{t('common.sar')}</span></h3>
                            </div>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                    </Card>
                </div>

                <div onClick={() => navigate('/expert/tasks')} className="cursor-pointer group">
                    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('expert.activeJobs')}</p>
                                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{activeTasks.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <Briefcase size={20} />
                            </div>
                        </div>
                    </Card>
                </div>

                <div onClick={() => navigate('/expert/profile')} className="cursor-pointer group">
                    <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('expert.clientRating')}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <h3 className="text-2xl font-extrabold text-gray-900">
                                        {(user as any).rating > 0 ? (user as any).rating.toFixed(1) : '0.0'}
                                    </h3>
                                    <Star size={16} className={(user as any).rating > 0 ? "text-yellow-400 fill-current" : "text-gray-300"} />
                                </div>
                            </div>
                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg group-hover:bg-yellow-100 transition-colors">
                                <Star size={20} />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="group">
                    <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('expert.jobSuccess')}</p>
                                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{successRate}%</h3>
                            </div>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                <Zap size={20} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Main Column: Tasks & Marketplace */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Active Tasks Priority View */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Clock className="text-blue-600" size={20} />
                                {t('expert.priorityTasks')}
                            </h2>
                            <Button variant="outline" size="sm" onClick={() => navigate('/expert/tasks')} className="text-xs">
                                {t('expert.viewAllTasks')} <ArrowRight size={12} />
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {activeTasks.length > 0 ? (
                                activeTasks.slice(0, 2).map(task => (
                                    <div key={task.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge status={task.status} />
                                                <span className="text-xs text-gray-400 font-mono">{task.id}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1">{task.serviceName}</h3>
                                            <p className="text-sm text-gray-600 truncate">{task.clientName} • Due in 2 days</p>
                                        </div>
                                        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                            {task.status === 'MATCHED' && (
                                                <Button size="sm" onClick={() => updateRequestStatus(task.id, 'IN_PROGRESS')} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                                                    {t('expert.startWork')}
                                                </Button>
                                            )}
                                            {task.status === 'IN_PROGRESS' && (
                                                <Button size="sm" onClick={() => updateRequestStatus(task.id, 'REVIEW_CLIENT')} className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
                                                    {t('expert.submitForReview')}
                                                </Button>
                                            )}
                                            {['REVIEW_CLIENT', 'REVIEW_ADMIN'].includes(task.status) && (
                                                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                    <Clock size={14} /> {t('expert.awaitingApproval')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
                                    <CheckCircle size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">{t('expert.allCaughtUp')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Marketplace Feed */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Globe className="text-indigo-600" size={20} />
                                {t('expert.newOpportunities')}
                            </h2>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Search size={18} /></button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Filter size={18} /></button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {marketplaceRequests.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {marketplaceRequests.slice(0, 5).map(req => (
                                        <div key={req.id} className={`p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between gap-4 ${isVetting ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900 text-sm">{req.serviceName}</h3>
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">New</span>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-1 mb-2">{req.description}</p>
                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1"><Briefcase size={12} /> {req.clientName}</span>
                                                    <span>•</span>
                                                    <span>Posted {req.dateCreated}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[160px]">
                                                <span className="font-bold text-gray-900">{req.amount.toLocaleString()} {t('common.sar')}</span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAcceptJob(req.id)}
                                                    className={isVetting ? 'cursor-not-allowed text-gray-400 border-gray-200' : ''}
                                                >
                                                    {isVetting ? t('expert.locked') : t('expert.accept')}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Globe size={48} className="mx-auto text-gray-200 mb-3" />
                                    <p className="text-gray-500">{t('expert.noNewJobs')}</p>
                                </div>
                            )}
                            {marketplaceRequests.length > 0 && (
                                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                                    <button className="text-sm font-medium text-primary-600 hover:text-primary-700">{t('expert.viewAllJobs')}</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Side Column: Profile & Insights (Sticky) */}
                <div className="space-y-6 sticky top-24 self-start">

                    {/* Task Breakdown Chart */}
                    <Card className="border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">{t('expert.workload')}</h3>
                            <div className="p-1 bg-gray-100 rounded text-xs text-gray-500 px-2">{t('expert.thisWeek')}</div>
                        </div>
                        <div className="h-[180px] w-full relative">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={taskStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {taskStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span className="text-2xl font-bold text-gray-900">{myTasks.length}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('expert.tasks')}</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-3 mt-2">
                            {taskStatusData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    {item.name === 'Completed' ? t('expert.completed') : t('expert.inProgress')}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide text-gray-500">{t('expert.quickActions')}</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={18} /></div>
                                    <span className="text-sm font-medium text-gray-700">{t('expert.updatePortfolio')}</span>
                                </div>
                                <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Globe size={18} /></div>
                                    <span className="text-sm font-medium text-gray-700">{t('expert.browseCategories')}</span>
                                </div>
                                <ArrowRight size={16} className="text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                            </button>
                            <button
                                onClick={() => navigate('/expert/profile')}
                                className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-orange-400 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Zap size={18} /></div>
                                    <span className="text-sm font-medium text-gray-700">{t('expert.boostProfile')}</span>
                                </div>
                                <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </Card>

                    {/* Support Widget - Enhanced */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-blue-800 rounded-2xl p-6 text-white text-center shadow-lg group cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <MessageSquare size={60} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner border border-white/20">
                                <Send size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-1">{t('expert.needHelp')}</h3>
                            <p className="text-indigo-200 text-xs mb-4 px-2">{t('expert.contactSupport')}</p>
                            <button className="w-full py-2 bg-white text-indigo-900 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm">
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
