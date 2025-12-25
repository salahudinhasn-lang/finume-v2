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
        <div className={`bg-white rounded-[2rem] border-2 border-dashed transition-all duration-300 overflow-hidden ${dragActive ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' : 'border-gray-200'} ${className}`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        >
            {isProcessing ? (
                <div className="p-10 flex flex-col items-center justify-center text-center h-full">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                        <Loader2 size={48} className="text-blue-600 animate-spin relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{progress.stage}</h3>
                    <p className="text-gray-500 text-sm mb-6">Processed {progress.current} / {progress.total} files</p>

                    <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ) : (
                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UploadCloud size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Smart Quick Upload</h3>
                        <p className="text-gray-500 text-sm">Drop invoices, receipts, or contracts here</p>
                    </div>

                    {/* Request Selector */}
                    {activeRequests.length > 0 ? (
                        <div className="mb-6 max-w-xs mx-auto">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">Assign to Request</label>
                            <div className="relative">
                                <select
                                    value={selectedRequestId}
                                    onChange={(e) => setSelectedRequestId(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                    disabled={!!preselectedRequestId}
                                >
                                    {activeRequests.map(req => (
                                        <option key={req.id} value={req.id}>
                                            {req.serviceName} ({req.id})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 text-center">
                            <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg inline-flex items-center gap-2 text-xs font-bold border border-yellow-200">
                                <AlertTriangle size={14} /> No active requests found
                            </div>
                        </div>
                    )}

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mb-6 bg-gray-50 rounded-xl p-2 max-h-40 overflow-y-auto">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FileText size={16} className="text-gray-400 shrink-0" />
                                        <span className="text-sm text-gray-700 truncate max-w-[180px]">{file.name}</span>
                                    </div>
                                    <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-3 justify-center">
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
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                            Select Files
                        </Button>
                        {files.length > 0 && (
                            <Button
                                onClick={simulateAIProcessing}
                                disabled={!selectedRequestId}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200"
                            >
                                <Zap size={16} className="mr-2 fill-yellow-400 text-yellow-500" />
                                Process Upload
                            </Button>
                        )}
                    </div>

                    <p className="mt-6 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        AI Auto-Categorization Active
                    </p>
                </div>
            )}
        </div>
    );
};
