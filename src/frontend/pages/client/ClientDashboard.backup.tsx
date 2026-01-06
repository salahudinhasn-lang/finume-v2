
import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button, Badge } from '../../components/UI';
import { Plus, Clock, CheckCircle, Search, Eye, X, Check, UploadCloud, ShieldAlert, ShieldCheck, Zap, FileText, ChevronRight, AlertTriangle, Sparkles, Loader2, ArrowRight, File } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Request } from '../../types';
import { matchServiceWithAI } from '../../services/geminiService';

const ClientDashboard = () => {
    const { user, requests, t, language, services, addRequest } = useAppContext();
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

        // Create file batch with the uploaded file
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
            status: 'NEW',
            amount: matchedService.price,
            dateCreated: today,
            description: `Smart Upload: ${fileDescription}. Files: ${uploadedFiles.map(f => f.name).join(', ')}`,
            batches: fileBatch ? [fileBatch] : []
        };

        // Navigate to payment page with state
        navigate('/client/checkout', { state: { pendingRequest: newRequest } });
        setShowUploadModal(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">

            {/* 1. Header: Personal Greeting */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">{t('client.welcome')} {user?.name.split(' ')[0]} 👋</h1>
                    <p className="text-gray-500 text-lg mt-1">{t('client.subtitle')}</p>
                </div>
            </div>

            {/* 2. THE BIG TRAFFIC LIGHT (Safety Status) */}
            <div
                className={`relative overflow-hidden rounded-3xl p-8 border-4 transition-all duration-500 shadow-xl ${isSafe
                    ? 'bg-emerald-50 border-emerald-400'
                    : 'bg-red-50 border-red-500 animate-pulse'
                    }`}
            >
                <div className="flex items-center gap-6">
                    <div className={`p-6 rounded-full shrink-0 shadow-inner ${isSafe ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                        {isSafe ? <ShieldCheck size={48} /> : <ShieldAlert size={48} />}
                    </div>
                    <div>
                        <h2 className={`text-2xl md:text-4xl font-extrabold mb-2 ${isSafe ? 'text-emerald-800' : 'text-red-800'}`}>
                            {isSafe ? t('client.safeTitle') : t('client.dangerTitle')}
                        </h2>
                        <p className={`text-lg font-medium ${isSafe ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isSafe ? t('client.safeDesc') : t('client.dangerDesc')}
                        </p>
                    </div>
                </div>

                {/* Decorative Background Icon */}
                <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
                    {isSafe ? <ShieldCheck size={200} /> : <AlertTriangle size={200} />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 3. The "Dump Zone" (Smart Quick Upload) */}
                <div
                    className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 group cursor-pointer relative overflow-hidden ${dragActive ? 'border-primary-500 bg-primary-50 scale-[1.02]' : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        multiple
                    />

                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Sparkles size={100} className="text-blue-600" />
                    </div>

                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform relative z-10">
                        <UploadCloud size={40} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">{t('client.dumpReceipts')}</h3>
                    <p className="text-blue-700 max-w-xs mx-auto mb-6">{t('client.dumpDesc')}</p>
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg px-8 py-3 h-auto text-lg rounded-xl z-10 pointer-events-none">
                        {t('client.uploadBtn')}
                    </Button>
                </div>

                {/* 4. Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-white border-l-4 border-l-orange-400 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 text-orange-600 font-bold uppercase tracking-wider text-xs">
                            <Zap size={16} /> {t('client.actionNeeded')}
                        </div>
                        <div className="text-4xl font-extrabold text-gray-900">
                            {needsAction ? '1' : '0'}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {needsAction ? t('client.urgent') : t('client.relax')}
                        </p>
                    </Card>

                    <Card className="bg-white border-l-4 border-l-green-500 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 text-green-600 font-bold uppercase tracking-wider text-xs">
                            <ShieldCheck size={16} /> {t('client.finesAvoided')}
                        </div>
                        <div className="text-4xl font-extrabold text-gray-900">
                            {finesSaved.toLocaleString()} <span className="text-lg text-gray-400 font-medium">{t('common.sar')}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Estimated savings</p>
                    </Card>

                    <Card className="col-span-2 bg-gray-900 text-white shadow-lg cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => navigate('/client/requests')}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase">{t('client.activeJobs')}</p>
                                <p className="text-2xl font-bold mt-1">{activeRequests.length} Requests</p>
                            </div>
                            <div className="bg-white/10 p-3 rounded-full">
                                <ChevronRight size={24} className={language === 'ar' ? 'rotate-180' : ''} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* 5. Simple List */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{t('client.recentRequests')}</h3>
                <div className="space-y-3">
                    {myRequests.slice(0, 3).map(req => (
                        <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${req.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    {req.status === 'COMPLETED' ? <CheckCircle size={24} /> : <Clock size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{req.serviceName}</h4>
                                    <p className="text-xs text-gray-500">{req.dateCreated} • {req.expertName || 'Assigning...'}</p>
                                </div>
                            </div>
                            <Badge status={req.status} />
                        </div>
                    ))}
                    {myRequests.length === 0 && (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                            {t('client.noRequests')}
                        </div>
                    )}
                </div>
            </div>

            {/* Smart Analysis Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Sparkles size={18} className="text-yellow-400" /> {t('client.smartUploadTitle')}
                            </h3>
                            <button onClick={() => setShowUploadModal(false)} className="hover:bg-gray-700 p-1 rounded"><X size={20} /></button>
                        </div>

                        <div className="p-6">
                            {/* File Preview */}
                            {/* File List Preview */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 max-h-40 overflow-y-auto space-y-2">
                                {uploadedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg shrink-0"><FileText size={16} /></div>
                                        <div className="overflow-hidden flex-1">
                                            <p className="font-bold text-gray-800 text-sm truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button
                                            onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {uploadedFiles.length === 0 && <p className="text-center text-gray-400 text-sm py-2">No files selected</p>}

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> Add more files
                                </button>
                            </div>

                            {!matchedService ? (
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">{t('client.smartUploadDesc')}</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                                            placeholder={t('client.filePlaceholder')}
                                            value={fileDescription}
                                            onChange={(e) => setFileDescription(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={!fileDescription.trim() || isAnalyzing}
                                        className="w-full bg-primary-600 hover:bg-primary-700 py-3 shadow-lg rounded-xl"
                                    >
                                        {isAnalyzing ? (
                                            <><Loader2 className="animate-spin mr-2" size={18} /> {t('client.analyzing')}</>
                                        ) : (
                                            <><Zap size={18} className="mr-2 fill-current" /> {t('client.uploadBtn')}</>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center animate-in fade-in slide-in-from-bottom-2">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{t('client.matchFound')}</h3>
                                    </div>

                                    <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 p-5 rounded-xl relative overflow-hidden">
                                        <div className="relative z-10">
                                            <p className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-1">{t('financials.recommendedService')}</p>
                                            <h4 className="text-lg font-bold text-gray-900">{matchedService.nameEn}</h4>
                                            <p className="text-sm text-gray-600 mt-1 mb-3">{matchedService.description}</p>
                                            <div className="text-2xl font-extrabold text-gray-900">{matchedService.price} <span className="text-sm font-medium text-gray-500">{t('common.sar')}</span></div>
                                        </div>
                                        <div className="absolute top-0 right-0 -mr-4 -mt-4 text-primary-200 opacity-50">
                                            <Sparkles size={80} />
                                        </div>
                                    </div>

                                    <Button onClick={handleProceedToPayment} className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg shadow-lg rounded-xl">
                                        {t('client.proceedPayment')} <ArrowRight size={20} className="ml-2" />
                                    </Button>

                                    <button
                                        onClick={() => setMatchedService(null)}
                                        className="w-full text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        {t('financials.tryDiffDesc')}
                                    </button>
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
