import React, { useState } from 'react';
import { FileBatch, UploadedFile, UserRole, DocumentCategory } from '../types';
import { Folder, FileText, CheckCircle, Clock, Trash2, Download, Search, Filter, AlertCircle, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './UI';

interface DocumentBatchListProps {
    batches: FileBatch[];
    onUpdateBatches: (batches: FileBatch[]) => void;
    userRole: UserRole;
    requestId: string;
}

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
    'Sales Invoice': 'bg-blue-100 text-blue-700 border-blue-200',
    'Purchase Invoice': 'bg-purple-100 text-purple-700 border-purple-200',
    'Contract': 'bg-slate-100 text-slate-700 border-slate-200',
    'Expense': 'bg-orange-100 text-orange-700 border-orange-200',
    'Petty Cash': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Bank Statement': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'VAT Return': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Other': 'bg-gray-100 text-gray-600 border-gray-200',
};

export const DocumentBatchList: React.FC<DocumentBatchListProps> = ({
    batches,
    onUpdateBatches,
    userRole
}) => {
    const [expandedBatchId, setExpandedBatchId] = useState<string | null>(batches.length > 0 ? batches[0].id : null);
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [editingFileId, setEditingFileId] = useState<string | null>(null);

    const toggleBatch = (id: string) => {
        setExpandedBatchId(expandedBatchId === id ? null : id);
    };

    const handleDeleteFile = (batchId: string, fileId: string) => {
        const updated = batches.map(b => {
            if (b.id === batchId) {
                return { ...b, files: b.files.filter(f => f.id !== fileId) };
            }
            return b;
        }).filter(b => b.files.length > 0);
        onUpdateBatches(updated);
    };

    const handleUpdateCategory = (batchId: string, fileId: string, newCategory: DocumentCategory) => {
        const updated = batches.map(b => {
            if (b.id === batchId) {
                return {
                    ...b,
                    files: b.files.map(f => f.id === fileId ? { ...f, category: newCategory } : f)
                };
            }
            return b;
        });
        onUpdateBatches(updated);
        setEditingFileId(null);
    };

    const getFilteredFiles = (files: UploadedFile[]) => {
        if (filterCategory === 'All') return files;
        return files.filter(f => f.category === filterCategory);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Folder className="text-blue-600" size={20} /> Document Batches
                </h3>

                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-400" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="text-sm border-none bg-gray-50 rounded-lg px-2 py-1 font-medium focus:ring-0 cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        {Object.keys(CATEGORY_COLORS).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {batches.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Folder size={24} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">No document batches found</p>
                        <p className="text-xs text-gray-400">Upload documents to create your first batch</p>
                    </div>
                )}

                {batches.map(batch => {
                    const isExpanded = expandedBatchId === batch.id;
                    const visibleFiles = getFilteredFiles(batch.files);

                    if (visibleFiles.length === 0 && filterCategory !== 'All') return null;

                    return (
                        <div key={batch.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer bg-gray-50/50 hover:bg-gray-50"
                                onClick={() => toggleBatch(batch.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-1 rounded transition-transform duration-200 ${isExpanded ? 'rotate-90 text-gray-800' : 'text-gray-400'}`}>
                                        <ChevronRight size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                            {batch.date}
                                            <span className="text-xs font-normal text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full shadow-sm">
                                                {batch.files.length} files
                                            </span>
                                        </h4>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {batch.status === 'COMPLETED' ? (
                                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                            <CheckCircle size={12} /> Processed
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                            <Clock size={12} /> Processing
                                        </span>
                                    )}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-gray-100">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 font-medium w-1/3">File Name</th>
                                                <th className="px-6 py-3 font-medium w-1/3">Category (AI Detected)</th>
                                                <th className="px-6 py-3 font-medium w-1/6">Uploaded At</th>
                                                <th className="px-6 py-3 font-medium text-right w-1/6">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {visibleFiles.map(file => (
                                                <tr key={file.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white border border-gray-100 rounded-lg text-blue-600 shadow-sm">
                                                                <FileText size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800 truncate max-w-[200px]" title={file.name}>{file.name}</p>
                                                                <p className="text-xs text-gray-400">{file.size}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {editingFileId === file.id ? (
                                                            <select
                                                                autoFocus
                                                                className="w-full bg-white border border-blue-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-100 outline-none text-xs font-medium"
                                                                value={file.category || 'Other'}
                                                                onChange={(e) => handleUpdateCategory(batch.id, file.id, e.target.value as DocumentCategory)}
                                                                onBlur={() => setEditingFileId(null)}
                                                            >
                                                                {Object.keys(CATEGORY_COLORS).map(cat => (
                                                                    <option key={cat} value={cat}>{cat}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <div
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer hover:shadow-sm transition-all ${CATEGORY_COLORS[file.category || 'Other']}`}
                                                                onClick={() => setEditingFileId(file.id)}
                                                                title="Click to edit category"
                                                            >
                                                                {file.category || 'Other'}
                                                                <Edit2 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        )}
                                                        {!file.category && (
                                                            <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                                                                <AlertCircle size={10} /> Needs review
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                                        {new Date(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                                <Download size={16} />
                                                            </button>
                                                            <button
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                onClick={() => handleDeleteFile(batch.id, file.id)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
