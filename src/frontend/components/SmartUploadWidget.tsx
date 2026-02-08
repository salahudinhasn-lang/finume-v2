import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2, X, ChevronDown, Zap, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from './UI';
import { Request, DocumentCategory } from '../types';

interface SmartUploadWidgetProps {
    activeRequests: Request[];
    onUploadComplete: (files: File[], requestId: string) => void;
    className?: string;
    preselectedRequestId?: string;
}

interface FileItem {
    id: string; // unique temp id
    file: File;
    category: DocumentCategory | '';
    isAnalyzing: boolean;
}

export const SmartUploadWidget: React.FC<SmartUploadWidgetProps> = ({
    activeRequests,
    onUploadComplete,
    className = '',
    preselectedRequestId
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [fileItems, setFileItems] = useState<FileItem[]>([]);
    const [selectedRequestId, setSelectedRequestId] = useState<string>(preselectedRequestId || (activeRequests.length > 0 ? activeRequests[0].id : ''));
    // Removed global selectedCategory as we now do per-file
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number; stage: string }>({ current: 0, total: 0, stage: 'idle' });

    const categories: DocumentCategory[] = [
        'Sales Invoice', 'Purchase Invoice', 'Contract', 'Expense', 'Petty Cash', 'Bank Statement', 'VAT Return', 'Other'
    ];

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

    const handleFiles = async (newFiles: File[]) => {
        // Create initial items
        const newItems: FileItem[] = newFiles.map(f => ({
            id: Math.random().toString(36).substr(2, 9),
            file: f,
            category: '', // Start empty
            isAnalyzing: false // Start NOT analyzing
        }));

        setFileItems(prev => [...prev, ...newItems]);
    };

    const analyzeFile = async (item: FileItem) => {
        // Set analyzing state
        setFileItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, isAnalyzing: true } : i
        ));

        try {
            const formData = new FormData();
            formData.append('file', item.file);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.category) {
                    // Update item with detected category
                    setFileItems(prev => prev.map(i =>
                        i.id === item.id
                            ? { ...i, category: data.category as DocumentCategory, isAnalyzing: false }
                            : i
                    ));
                    return;
                }
            }
        } catch (err) {
            console.error("Analysis failed for", item.file.name, err);
        }

        // Output fail or done without result
        setFileItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, isAnalyzing: false } : i
        ));
    };

    const updateItemCategory = (id: string, category: DocumentCategory) => {
        setFileItems(prev => prev.map(i => i.id === id ? { ...i, category } : i));
    };

    const uploadFiles = async () => {
        if (!selectedRequestId || fileItems.length === 0) return;

        // Validate all have categories
        const missingCategory = fileItems.find(f => !f.category);
        if (missingCategory) {
            alert(`Please select a category for "${missingCategory.file.name}"`);
            return;
        }

        setIsProcessing(true);
        // setProgress({ current: 0, total: files.length, stage: 'Starting Upload...' });

        const uploadedFiles: any[] = [];
        const token = localStorage.getItem('finume_token'); // Corrected key from 'token' to 'finume_token'

        console.log("Starting upload with token:", token ? "Present" : "Missing");

        for (let i = 0; i < fileItems.length; i++) {
            const item = fileItems[i];
            const file = item.file;
            setProgress({ current: i + 1, total: fileItems.length, stage: `Uploading: ${file.name}...` });

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('requestId', selectedRequestId);
                formData.append('category', item.category); // Use per-file category

                const headers: Record<string, string> = {};
                if (token && token.trim() !== '') {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    credentials: 'include', // Ensure cookies are sent
                    headers: headers,
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Upload failed for ${file.name}`);
                }

                const data = await response.json();
                if (data.success) {
                    uploadedFiles.push({
                        name: data.name,
                        url: data.url,
                        type: data.type || file.type,
                        size: file.size,
                    });
                }
            } catch (error: any) {
                console.error(`Upload error for file ${file.name}:`, error);
                alert(`Error uploading ${file.name}: ${error.message || 'Unknown error'}`);
            }
        }

        // Done
        setIsProcessing(false);
        onUploadComplete(fileItems.map(f => f.file), selectedRequestId);
        setFileItems([]); // Reset
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
                        {/* Header Icons */}
                        <div className={`w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform transition-transform duration-500 ${dragActive ? 'scale-110 rotate-3' : 'group-hover:scale-105 group-hover:-rotate-3'} shadow-inner border border-white`}>
                            <UploadCloud size={48} className={`transition-all duration-500 ${dragActive ? 'text-blue-700 scale-110' : ''}`} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Smart Quick Upload</h3>
                        <p className="text-gray-500 font-medium text-base">Drop invoices, receipts, or contracts here</p>
                    </div>

                    {/* Request Selector */}
                    {activeRequests.length > 0 ? (
                        <div className="mb-4 max-w-sm mx-auto w-full space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Assign to Request</label>
                                <div className="relative group/select">
                                    <select
                                        value={selectedRequestId}
                                        onChange={(e) => setSelectedRequestId(e.target.value)}
                                        className="w-full appearance-none bg-gray-50 hover:bg-white border border-gray-200 text-gray-900 text-sm rounded-xl py-3 pl-5 pr-12 focus:outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-200 font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                                        disabled={!!preselectedRequestId}
                                    >
                                        {activeRequests.map(req => (
                                            <option key={req.id} value={req.id}>
                                                {req.serviceName} ({req.displayId || req.id})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover/select:text-blue-500 transition-colors pointer-events-none" size={20} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 text-center">
                            <div className="bg-orange-50 text-orange-700 px-6 py-3 rounded-full inline-flex items-center gap-2 text-sm font-bold border border-orange-100 shadow-sm">
                                <AlertTriangle size={16} /> No active requests found
                            </div>
                        </div>
                    )}

                    {/* File List with Analysis & Category Selectors */}
                    {fileItems.length > 0 && (
                        <div className="mb-8 bg-white border border-gray-100 rounded-2xl p-2 max-h-64 overflow-y-auto shadow-inner custom-scrollbar">
                            {fileItems.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group/file animate-in fade-in slide-in-from-bottom-2 gap-3">
                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-bold text-gray-700 truncate max-w-[180px]">{item.file.name}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">{(item.file.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                    </div>

                                    {/* Per-File Category Selector */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center">
                                        {/* Auto Detect Button */}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => analyzeFile(item)}
                                            disabled={item.isAnalyzing || !!item.category}
                                            className="h-8 text-[10px] px-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 whitespace-nowrap"
                                            title="Auto-Detect with AI"
                                        >
                                            {item.isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="mr-1" />}
                                            {item.isAnalyzing ? 'Analyzing...' : 'Auto Detect'}
                                        </Button>

                                        <div className="relative w-full sm:w-40">
                                            <select
                                                value={item.category}
                                                onChange={(e) => updateItemCategory(item.id, e.target.value as DocumentCategory)}
                                                className={`w-full appearance-none text-xs font-bold py-1.5 pl-2 pr-6 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer ${item.category ? 'bg-white border-gray-200 text-gray-800' : 'bg-red-50 border-red-200 text-red-500'}`}
                                            >
                                                <option value="">Select Category *</option>
                                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>

                                        <button onClick={() => setFileItems(prev => prev.filter(i => i.id !== item.id))} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
                                            <X size={18} />
                                        </button>
                                    </div>
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
                        {fileItems.length > 0 && (
                            <Button
                                onClick={uploadFiles}
                                disabled={!selectedRequestId || isProcessing || fileItems.some(f => f.isAnalyzing)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 py-3 px-8 rounded-xl font-bold transform hover:scale-105 transition-all disabled:opacity-50 disabled:pointer-events-none"
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
