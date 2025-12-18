import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button, Badge } from '../../components/UI';
import { Plus, Clock, CheckCircle, Search, Eye, X, Check, UploadCloud, ShieldAlert, ShieldCheck, Zap, FileText, ChevronRight, AlertTriangle, Sparkles, Loader2, ArrowRight, File } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Request } from '../../types';
import { matchServiceWithAI } from '../../services/geminiService';


const ClientDashboard = () => {
    const { user, requests, t, language, services, plans, addRequest } = useAppContext();
    const navigate = useNavigate();



    // Smart Upload States
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [fileDescription, setFileDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [matchedService, setMatchedService] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const myRequests = requests.filter(r => r.clientId === user?.id);
    const activeRequests = myRequests.filter(r => ['NEW', 'MATCHED', 'IN_PROGRESS', 'REVIEW_CLIENT', 'REVIEW_ADMIN'].includes(r.status));
    const needsAction = activeRequests.some(r => r.status === 'REVIEW_CLIENT');

    // "Lazy" Status Logic
    const isSafe = (user as any)?.zatcaStatus !== 'RED';
    const finesSaved = (user as any)?.zatcaStatus === 'GREEN' ? 15000 : 0;

    // --- Drag & Drop Handlers ---
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(Array.from(e.target.files));
        }
    };

    const handleFileSelection = (files: File[]) => {
        setUploadedFiles(prev => [...prev, ...files]);
        setShowUploadModal(true);
        setMatchedService(null);
        setFileDescription('');
    };

    const handleAnalyze = async () => {
        if (!fileDescription) return;
        setIsAnalyzing(true);

        // AI Call
        const service = await matchServiceWithAI(fileDescription, services);

        setMatchedService(service);
        setIsAnalyzing(false);
    };

    const handleProceedToPayment = () => {
        if (!user || !matchedService) return;

        const requestId = `REQ-${Math.floor(Math.random() * 100000)}`;
        const today = new Date().toISOString().split('T')[0];

        // Create file batch with the uploaded files
        const fileBatch = uploadedFiles.length > 0 ? {
            id: `FB-${Date.now()}`,
            date: today,
            status: 'PENDING' as const,
            files: uploadedFiles.map((file, index) => ({
                id: `F-${Date.now()}-${index}`,
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)} KB`,
                type: file.type || 'application/octet-stream',
                url: URL.createObjectURL(file), // Valid for session
                uploadedBy: 'CLIENT' as const,
                uploadedAt: new Date().toISOString(),
                source: 'DESKTOP' as const
            }))
        } : undefined;

        // Create the request with file attached
        const newRequest: Request = {
            id: requestId,
            clientId: user.id,
            clientName: user.name,
            serviceId: matchedService.id,
            serviceName: matchedService.nameEn,
            status: 'PENDING_PAYMENT',
            amount: matchedService.price,
            dateCreated: today,
            description: `Smart Upload: ${fileDescription}. Files: ${uploadedFiles.map(f => f.name).join(', ')}`,
            batches: fileBatch ? [fileBatch] : []
        };

        // Add the request immediately to context so it persists
        addRequest(newRequest);

        // Navigate to payment page with state
        navigate('/client/checkout', { state: { pendingRequest: newRequest } });
        setShowUploadModal(false);
    };



    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto pb-12">

            {/* 1. Modern Glassy Header & Status Section */}
            <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 transition-all duration-500 shadow-2xl ${isSafe
                ? 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white'
                : 'bg-gradient-to-br from-red-600 via-red-500 to-orange-600 text-white'
                }`}>

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white opacity-[0.08] rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black opacity-[0.05] rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-sm font-medium">
                            {isSafe ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                            {isSafe ? t('client.safeTitle') : t('client.dangerTitle')}
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                                {t('client.welcome')} {user?.name.split(' ')[0]}
                            </h1>
                            <p className={`text-lg md:text-xl opacity-90 max-w-xl leading-relaxed`}>
                                {isSafe ? t('client.safeDesc') : t('client.dangerDesc')}
                            </p>
                        </div>

                        {/* Status Stats Inline */}
                        <div className="flex gap-6 pt-2">
                            <div className="flex flex-col">
                                <span className="text-sm opacity-70 uppercase tracking-wider font-semibold">ZATCA Status</span>
                                <span className="text-2xl font-bold flex items-center gap-2">{isSafe ? 'Compliant' : 'At Risk'} {isSafe && <Check size={20} />}</span>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div className="flex flex-col">
                                <span className="text-sm opacity-70 uppercase tracking-wider font-semibold">{t('client.finesAvoided')}</span>
                                <span className="text-2xl font-bold">{finesSaved.toLocaleString()} SAR</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 w-full md:w-auto min-w-[240px]">
                        <p className="text-sm opacity-80 uppercase tracking-wider font-bold mb-1">{t('client.actionNeeded')}</p>
                        <div className="flex items-center gap-4">
                            <span className="text-5xl font-black">{needsAction ? '1' : '0'}</span>
                            <div className="flex flex-col text-sm font-medium opacity-80 leading-tight">
                                <span>{needsAction ? 'Urgent Items' : 'All Clear'}</span>
                                <span>{needsAction ? 'Review Now' : 'Relax & Focus'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* 2. Main Action Area: Smart Upload (Span 7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Zap className="fill-yellow-400 text-yellow-500" /> Quick Actions
                        </h2>
                    </div>

                    {/* New Experimental Upload UI */}
                    <div
                        className={`group relative overflow-hidden rounded-[2rem] border-2 border-dashed transition-all duration-300 p-10 text-center cursor-pointer
                            ${dragActive
                                ? 'border-primary-500 bg-primary-50 scale-[1.01] shadow-xl'
                                : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50 hover:shadow-lg'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            multiple
                        />

                        <div className="mb-6 relative inline-block">
                            <div className="absolute inset-0 bg-blue-100 rounded-full scale-150 animate-pulse opacity-50 group-hover:scale-175 transition-transform duration-700"></div>
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 rounded-full relative z-10 shadow-lg group-hover:rotate-12 transition-transform duration-300">
                                <UploadCloud size={40} />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {t('client.dumpReceipts')}
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8 text-lg leading-relaxed">
                            {t('client.dumpDesc')}
                        </p>

                        <Button className="rounded-full px-10 py-4 h-auto text-lg font-bold shadow-lg bg-gray-900 text-white hover:bg-primary-600 hover:scale-105 transition-all">
                            Select Documents
                        </Button>

                        <p className="mt-6 text-xs text-gray-400 font-medium uppercase tracking-widest">
                            Supports PDF, PNG, JPG • Auto-Analysis Active
                        </p>
                    </div>
                </div>

                {/* 3. Sidebar: Recent Activity (Span 5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Recent Request</h2>
                        <button onClick={() => navigate('/client/requests')} className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {myRequests.slice(0, 4).map((req, idx) => (
                            <div key={req.id}
                                className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
                                onClick={() => navigate('/client/requests')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                                        }`}>
                                        {req.status === 'COMPLETED' ? <Check size={20} /> : (idx + 1)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{req.serviceName}</h4>
                                        <p className="text-xs text-gray-500 font-medium">{req.dateCreated}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-bold text-gray-900 text-sm">{req.amount.toLocaleString()} SAR</span>
                                    <Badge status={req.status} />
                                </div>
                            </div>
                        ))}

                        {myRequests.length === 0 && (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                                <FileText className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-400 font-medium">{t('client.noRequests')}</p>
                            </div>
                        )}

                        {/* Promo Card */}
                        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles size={100} />
                            </div>
                            <h4 className="font-bold text-lg mb-2 relative z-10">Need a dedicated expert?</h4>
                            <p className="text-white/80 text-sm mb-4 relative z-10">Get a full-time CFO or accountant today.</p>
                            <button className="bg-white text-indigo-900 px-6 py-2 rounded-full text-sm font-bold hover:bg-indigo-50 transition-colors relative z-10">
                                Browse Experts
                            </button>
                        </div>
                    </div>
                </div>


            </div>


            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="bg-gray-900 p-8 text-white flex justify-between items-start relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

                            <div>
                                <h3 className="font-bold text-2xl flex items-center gap-2 mb-1">
                                    <Sparkles size={24} className="text-yellow-400" /> {t('client.smartUploadTitle')}
                                </h3>
                                <p className="text-white/60 text-sm">AI-Powered Document Analysis</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8">
                            {/* File List Preview */}
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 mb-8 overflow-hidden">
                                <div className="max-h-56 overflow-y-auto p-2 space-y-1">
                                    {uploadedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors group">
                                            <div className="bg-white border border-gray-100 p-2 rounded-lg shrink-0 shadow-sm text-blue-600">
                                                <FileText size={20} />
                                            </div>
                                            <div className="overflow-hidden flex-1">
                                                <p className="font-bold text-gray-800 text-sm truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button
                                                onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                                                className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-4 border-t border-gray-200 text-xs font-bold text-primary-600 hover:bg-primary-50 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> Add more files
                                </button>
                            </div>

                            {!matchedService ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2 ml-1">{t('client.smartUploadDesc')}</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-4 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-lg placeholder-gray-400"
                                                placeholder={t('client.filePlaceholder')}
                                                value={fileDescription}
                                                onChange={(e) => setFileDescription(e.target.value)}
                                                autoFocus
                                            />
                                            {fileDescription && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-in fade-in zoom-in">
                                                    <CheckCircle size={24} fill="#dcfce7" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={!fileDescription.trim() || isAnalyzing}
                                        className="w-full bg-gray-900 hover:bg-black py-4 shadow-xl shadow-gray-200 rounded-xl text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isAnalyzing ? (
                                            <><Loader2 className="animate-spin mr-2" size={20} /> Analyzing...</>
                                        ) : (
                                            <><Zap size={20} className="mr-2 fill-yellow-400 text-yellow-500" /> {t('client.uploadBtn')}</>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                            <Check size={40} strokeWidth={3} />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-1">{t('client.matchFound')}</h3>
                                        <p className="text-gray-500">We've identified the perfect service for you</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-shadow">
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100 px-2 py-1 rounded-md">{t('financials.recommendedService')}</p>
                                                <Sparkles className="text-indigo-300" />
                                            </div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">{matchedService.nameEn}</h4>
                                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{matchedService.description}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-gray-900">{matchedService.price}</span>
                                                <span className="text-sm font-bold text-gray-500">{t('common.sar')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <Button onClick={handleProceedToPayment} className="w-full bg-emerald-600 hover:bg-emerald-700 py-4 text-lg shadow-lg shadow-emerald-200 rounded-xl font-bold">
                                            {t('client.proceedPayment')} <ArrowRight size={20} className="ml-2" />
                                        </Button>

                                        <button
                                            onClick={() => setMatchedService(null)}
                                            className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            Try a different description
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ClientDashboard;
