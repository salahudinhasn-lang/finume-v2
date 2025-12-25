import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button, Badge } from '../../components/UI';
import { Plus, Clock, CheckCircle, Search, Eye, X, Check, UploadCloud, ShieldAlert, ShieldCheck, Zap, FileText, ChevronRight, AlertTriangle, Sparkles, Loader2, ArrowRight, File } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Request, UploadedFile, DocumentCategory } from '../../types';
import { matchServiceWithAI } from '../../services/geminiService';
import { SmartUploadWidget } from '../../components/SmartUploadWidget';

const ClientDashboard = () => {
    const { user, requests, t, language, services, plans, addRequest, updateRequest } = useAppContext();
    const navigate = useNavigate();

    const handleSmartUpload = (files: File[], requestId: string) => {
        const req = requests.find(r => r.id === requestId);
        if (!req) return;

        const categories: DocumentCategory[] = ['Sales Invoice', 'Purchase Invoice', 'Contract', 'Expense', 'Petty Cash', 'Bank Statement', 'VAT Return', 'Other'];

        const newFiles: UploadedFile[] = files.map((f, idx) => ({
            id: `f-${Date.now()}-${idx}`,
            name: f.name,
            size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
            type: f.type,
            url: '#',
            uploadedBy: 'CLIENT',
            uploadedAt: new Date().toISOString(),
            source: 'DESKTOP',
            category: categories[Math.floor(Math.random() * categories.length)] // Simulating AI Logic
        }));

        const today = new Date().toISOString().split('T')[0];
        let currentBatches = req.batches || [];
        const existingBatchIndex = currentBatches.findIndex(b => b.id === today);

        if (existingBatchIndex >= 0) {
            currentBatches[existingBatchIndex] = {
                ...currentBatches[existingBatchIndex],
                files: [...currentBatches[existingBatchIndex].files, ...newFiles]
            };
        } else {
            currentBatches = [{
                id: today,
                date: today,
                files: newFiles,
                status: 'PENDING'
            }, ...currentBatches];
        }

        updateRequest(req.id, { batches: currentBatches });
        navigate('/client/requests');
    };



    // "Lazy" Status Logic
    const isSafe = (user as any)?.zatcaStatus !== 'RED';
    const finesSaved = (user as any)?.zatcaStatus === 'GREEN' ? 15000 : 0;

    const myRequests = requests.filter(r => r.clientId === user?.id);
    const activeRequests = myRequests.filter(r => ['NEW', 'MATCHED', 'IN_PROGRESS', 'REVIEW_CLIENT', 'REVIEW_ADMIN'].includes(r.status));
    const needsAction = activeRequests.some(r => r.status === 'REVIEW_CLIENT');



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

                    <SmartUploadWidget
                        activeRequests={activeRequests}
                        onUploadComplete={handleSmartUpload}
                        className="shadow-xl hover:shadow-2xl h-full"
                    />
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




        </div>
    );
};

export default ClientDashboard;
