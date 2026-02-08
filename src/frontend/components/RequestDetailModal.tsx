import React from 'react';
import { X, Check, FileText, Download, Clock, CheckCircle } from 'lucide-react';
import { Button } from './UI';
import { SmartUploadWidget } from './SmartUploadWidget';
import { DocumentBatchList } from './DocumentBatchList';
import { Request, FileBatch, ClientGamification } from '../types';

interface RequestDetailModalProps {
    request: Request;
    onClose: () => void;
    onApprove: (req: Request) => void;
    onUpdateBatches: (newBatches: FileBatch[]) => void;
    onSmartUpload: (files: File[], requestId: string) => void;
    clientGamification?: ClientGamification;
    onComplianceAction?: (action: 'nothing_today' | 'upload_clicked') => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
    request,
    onClose,
    onApprove,
    onUpdateBatches,
    onSmartUpload,
    clientGamification,
    onComplianceAction
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{request.serviceName}</h3>
                        <p className="text-gray-500 text-sm font-mono">{request.displayId || request.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Timeline Stepper */}
                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                        {['NEW', 'MATCHED', 'IN_PROGRESS', 'REVIEW_CLIENT', 'COMPLETED'].map((step, idx) => {
                            const statusMap: any = { NEW: 0, MATCHED: 1, IN_PROGRESS: 2, REVIEW_CLIENT: 3, REVIEW_ADMIN: 4, COMPLETED: 5 };
                            const currentStep = statusMap[request.status] || 0;
                            const stepIndex = idx;
                            const isCompleted = stepIndex < currentStep;
                            const isCurrent = stepIndex === currentStep;

                            let label = step.replace('_', ' ');
                            if (step === 'REVIEW_CLIENT') label = 'Review & Approval';

                            return (
                                <div key={step} className="flex items-start gap-4 mb-6 relative z-10 last:mb-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors shrink-0 ${isCompleted ? 'bg-green-100 border-green-500 text-green-600' :
                                        isCurrent ? 'bg-blue-100 border-blue-500 text-blue-600 animate-pulse' :
                                            'bg-white border-gray-200 text-gray-300'
                                        }`}>
                                        {isCompleted ? <Check size={20} /> : (stepIndex + 1)}
                                    </div>
                                    <div className="pt-1">
                                        <h4 className={`font-bold text-sm ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>{label}</h4>
                                        {isCurrent && <p className="text-xs text-blue-600 font-medium mt-1">Current Status</p>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* File Batch Manager Integration */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-8">
                        <SmartUploadWidget
                            activeRequests={[request]}
                            preselectedRequestId={request.id}
                            onUploadComplete={onSmartUpload}
                            className='border-dashed border-2 shadow-sm'
                        />

                        {request.files && request.files.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <FileText size={18} className="text-blue-500" /> Attached Documents
                                    </h4>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{request.files.length} files</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {request.files.map((file) => (
                                        <div key={file.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-700 text-sm truncate max-w-[200px] sm:max-w-md" title={file.name}>{file.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {file.category && (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 uppercase tracking-wide">
                                                                {file.category}
                                                            </span>
                                                        )}
                                                        <p className="text-xs text-gray-400 flex items-center gap-2">
                                                            <Clock size={10} />
                                                            {new Date(file.createdAt || file.uploadedAt).toLocaleString()}
                                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                            <span>{file.size ? (parseFloat(file.size) / 1024).toFixed(0) + ' KB' : 'Unknown Size'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <a
                                                href={`/api/files/${file.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Download/View"
                                            >
                                                <Download size={18} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <DocumentBatchList
                            batches={request.batches || []}
                            onUpdateBatches={onUpdateBatches}
                            userRole="CLIENT"
                            requestId={request.id}
                            clientGamification={clientGamification}
                            onComplianceAction={onComplianceAction}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                    {request.status === 'REVIEW_CLIENT' && (
                        <Button onClick={() => onApprove(request)} className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                            <CheckCircle size={18} /> Approve & Close
                        </Button>
                    )}
                    <Button variant="secondary" onClick={onClose}>Close Details</Button>
                </div>
            </div>
        </div>
    );
};
