import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2, X, ChevronDown, Zap, AlertTriangle } from 'lucide-react';
import { Button } from './UI';
import { Request } from '../types';

interface SmartUploadWidgetProps {
    activeRequests: Request[];
    onUploadComplete: (files: File[], requestId: string) => void;
    className?: string;
    preselectedRequestId?: string;
}

export const SmartUploadWidget: React.FC<SmartUploadWidgetProps> = ({
    activeRequests,
    onUploadComplete,
    className = '',
    preselectedRequestId
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [selectedRequestId, setSelectedRequestId] = useState<string>(preselectedRequestId || (activeRequests.length > 0 ? activeRequests[0].id : ''));
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number; stage: string }>({ current: 0, total: 0, stage: 'idle' });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (preselectedRequestId) setSelectedRequestId(preselectedRequestId);
    }, [preselectedRequestId]);

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
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFiles = (newFiles: File[]) => {
        setFiles(prev => [...prev, ...newFiles]);
    };

    const simulateAIProcessing = async () => {
        if (!selectedRequestId || files.length === 0) return;

        setIsProcessing(true);
        setProgress({ current: 0, total: files.length, stage: 'Uploading...' });

        // Step 1: Uploading
        await new Promise(resolve => setTimeout(resolve, 800));

        // Step 2: OCR Extraction
        setProgress(prev => ({ ...prev, stage: 'Running OCR Extraction...' }));
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 3: AI Categorization
        for (let i = 0; i <= files.length; i++) {
            setProgress({ current: i, total: files.length, stage: `AI Categorizing: ${files[i]?.name || 'Finalizing'}...` });
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        // Done
        setIsProcessing(false);
        onUploadComplete(files, selectedRequestId);
        setFiles([]); // Reset
    };


    return (
        <div className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-xl transition-all duration-300 overflow-hidden relative group ${dragActive ? 'ring-4 ring-blue-100 border-blue-400' : 'hover:shadow-2xl'} ${className}`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        >
            {/* Decorative Gradient Blob */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

            {isProcessing ? (
                <div className="p-10 flex flex-col items-center justify-center text-center h-full relative z-10">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <div className="bg-white p-4 rounded-full shadow-lg relative z-10">
                            <Loader2 size={48} className="text-blue-600 animate-spin" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">{progress.stage}</h3>
                    <p className="text-gray-500 font-medium mb-8">Processed {progress.current} / {progress.total} files</p>

                    <div className="w-64 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full relative"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-10 relative z-10 flex flex-col h-full justify-center">
                    <div className="text-center mb-8">
                        <div className={`w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform transition-transform duration-500 ${dragActive ? 'scale-110 rotate-3' : 'group-hover:scale-105 group-hover:-rotate-3'} shadow-inner border border-white`}>
                            <UploadCloud size={48} className={`transition-all duration-500 ${dragActive ? 'text-blue-700 scale-110' : ''}`} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Smart Quick Upload</h3>
                        <p className="text-gray-500 font-medium text-base">Drop invoices, receipts, or contracts here</p>
                    </div>

                    {/* Request Selector */}
                    {activeRequests.length > 0 ? (
                        <div className="mb-8 max-w-sm mx-auto w-full">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Assign to Request</label>
                            <div className="relative group/select">
                                <select
                                    value={selectedRequestId}
                                    onChange={(e) => setSelectedRequestId(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 hover:bg-white border border-gray-200 text-gray-900 text-sm rounded-xl py-4 pl-5 pr-12 focus:outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-200 font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                                    disabled={!!preselectedRequestId}
                                >
                                    {activeRequests.map(req => (
                                        <option key={req.id} value={req.id}>
                                            {req.serviceName} ({req.id})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover/select:text-blue-500 transition-colors pointer-events-none" size={20} />
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 text-center">
                            <div className="bg-orange-50 text-orange-700 px-6 py-3 rounded-full inline-flex items-center gap-2 text-sm font-bold border border-orange-100 shadow-sm">
                                <AlertTriangle size={16} /> No active requests found
                            </div>
                        </div>
                    )}

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mb-8 bg-white border border-gray-100 rounded-2xl p-2 max-h-48 overflow-y-auto shadow-inner custom-scrollbar">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group/file animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-bold text-gray-700 truncate max-w-[180px]">{file.name}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">{(file.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-4 justify-center items-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                            multiple
                        />
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 py-3 px-6 rounded-xl font-bold"
                        >
                            Select Files
                        </Button>
                        {files.length > 0 && (
                            <Button
                                onClick={simulateAIProcessing}
                                disabled={!selectedRequestId}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 py-3 px-8 rounded-xl font-bold transform hover:scale-105 transition-all"
                            >
                                <Zap size={18} className="mr-2 fill-yellow-400 text-yellow-500" />
                                Process Upload
                            </Button>
                        )}
                    </div>

                    <p className="mt-8 text-center text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center justify-center gap-2 opacity-60">
                        <Zap size={12} className="fill-current" /> AI Auto-Categorization Active
                    </p>
                </div>
            )}
        </div>
    );
};
