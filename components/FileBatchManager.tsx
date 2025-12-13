
import React, { useState } from 'react';
import { FileBatch, UploadedFile, UserRole, Expert } from '../types';
import { Folder, Upload, FileText, CheckCircle, Clock, Trash2, Download, Archive, RefreshCcw, Plus, UserPlus, User, Monitor, Smartphone, MessageCircle, Box } from 'lucide-react';
import { Button } from './UI';

interface FileBatchManagerProps {
  batches: FileBatch[];
  onUpdateBatches: (batches: FileBatch[]) => void;
  userRole: UserRole;
  requestId: string;
  experts?: Expert[]; // List of experts for assignment dropdown
  currentUserId?: string; // To check permissions for specific batches
  mainExpertId?: string; // The primary expert assigned to the request
}

export const FileBatchManager: React.FC<FileBatchManagerProps> = ({ 
  batches = [], 
  onUpdateBatches, 
  userRole, 
  experts = [],
  currentUserId,
  mainExpertId
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Determine source based on simple screen check (could be more robust)
      const isMobile = window.innerWidth < 768;
      const source = isMobile ? 'MOBILE_WEB' : 'DESKTOP';

      const newFiles: UploadedFile[] = Array.from(e.target.files).map((file: any, idx) => ({
        id: `f-${Date.now()}-${idx}`,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type || 'application/octet-stream',
        url: '#', // Mock URL
        uploadedBy: userRole,
        uploadedAt: new Date().toISOString(),
        source: source as any
      }));

      // Check if batch for today exists
      const existingBatchIndex = batches.findIndex(b => b.id === today);
      let updatedBatches = [...batches];

      if (existingBatchIndex >= 0) {
        // Append to existing batch
        const batch = updatedBatches[existingBatchIndex];
        updatedBatches[existingBatchIndex] = {
          ...batch,
          files: [...batch.files, ...newFiles],
          status: 'PENDING' 
        };
      } else {
        // Create new batch
        // Inherit main expert if exists, otherwise undefined
        updatedBatches.push({
          id: today,
          date: today,
          files: newFiles,
          status: 'PENDING',
          assignedExpertId: mainExpertId
        });
      }

      // Sort batches by date descending
      updatedBatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTimeout(() => {
        onUpdateBatches(updatedBatches);
        setIsUploading(false);
      }, 1000); // Simulate upload delay
    }
  };

  const handleStatusChange = (batchId: string, newStatus: 'PENDING' | 'COMPLETED') => {
    const updatedBatches = batches.map(b => 
      b.id === batchId ? { ...b, status: newStatus } : b
    );
    onUpdateBatches(updatedBatches);
  };

  const handleDeleteFile = (batchId: string, fileId: string) => {
    const updatedBatches = batches.map(b => {
      if (b.id === batchId) {
        const newFiles = b.files.filter(f => f.id !== fileId);
        return { ...b, files: newFiles };
      }
      return b;
    }).filter(b => b.files.length > 0); // Remove empty batches
    onUpdateBatches(updatedBatches);
  };

  const handleAssignBatch = (batchId: string, expertId: string) => {
      const expert = experts.find(e => e.id === expertId);
      const updatedBatches = batches.map(b => 
          b.id === batchId ? { ...b, assignedExpertId: expertId, assignedExpertName: expert?.name } : b
      );
      onUpdateBatches(updatedBatches);
  };

  const handleDownloadBatch = (batchId: string) => {
    alert(`Simulating download of compressed batch: ${batchId}.zip`);
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'WHATSAPP': return <MessageCircle size={12} className="text-green-500" />;
      case 'MOBILE_WEB': return <Smartphone size={12} className="text-blue-500" />;
      case 'APP': return <Box size={12} className="text-purple-500" />;
      case 'DESKTOP': default: return <Monitor size={12} className="text-gray-500" />;
    }
  };

  const formatSource = (source?: string) => {
      if (!source) return 'WEB';
      return source.replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
          <Archive size={16} /> Daily File Batches (Sub-tasks)
        </h3>
        {(userRole === 'CLIENT' || userRole === 'ADMIN' || userRole === 'EXPERT') && (
          <div className="relative">
            <input 
              type="file" 
              multiple 
              onChange={handleUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button size="sm" variant="outline" className={`text-xs ${isUploading ? 'opacity-50' : ''}`}>
              {isUploading ? 'Uploading...' : <><Plus size={14} className="mr-1" /> Upload Files</>}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {batches.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
            <Folder size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files uploaded yet.</p>
            {userRole === 'CLIENT' && <p className="text-xs mt-1">Upload documents to create a daily batch.</p>}
          </div>
        )}

        {batches.map(batch => {
            // Permission Logic
            const isAssignedToMe = currentUserId && batch.assignedExpertId === currentUserId;
            const isMainExpert = currentUserId && mainExpertId === currentUserId;
            const canManage = userRole === 'ADMIN' || isAssignedToMe || (isMainExpert && !batch.assignedExpertId);

            return (
              <div key={batch.id} className={`border rounded-xl overflow-hidden transition-all ${batch.status === 'COMPLETED' ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                {/* Batch Header */}
                <div className="p-3 sm:p-4 flex flex-col gap-3 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${batch.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          <Folder size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            {batch.date}
                            {batch.status === 'COMPLETED' ? (
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <CheckCircle size={10} /> Completed
                              </span>
                            ) : (
                              <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Clock size={10} /> Pending
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">{batch.files.length} file{batch.files.length !== 1 ? 's' : ''}</p>
                              
                              {/* Assignment Badge */}
                              {batch.assignedExpertId && (
                                  <span className="flex items-center gap-1 text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded border border-primary-100 font-medium">
                                      <User size={10} /> {batch.assignedExpertName || 'Assigned Expert'}
                                  </span>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDownloadBatch(batch.id)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs flex items-center gap-1"
                          title="Download Compressed Batch"
                        >
                          <Download size={16} />
                        </button>

                        {/* Admin Assignment Control */}
                        {userRole === 'ADMIN' && (
                            <div className="relative group">
                                <select 
                                    className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs rounded-lg py-1 pl-2 pr-6 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                                    value={batch.assignedExpertId || mainExpertId || ''}
                                    onChange={(e) => handleAssignBatch(batch.id, e.target.value)}
                                >
                                    <option value={mainExpertId || ''} disabled={!mainExpertId}>
                                        Main Expert {mainExpertId ? '(Default)' : ''}
                                    </option>
                                    {experts.map(exp => (
                                        <option key={exp.id} value={exp.id}>{exp.name}</option>
                                    ))}
                                </select>
                                <UserPlus size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        )}
                      </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex justify-end gap-2 pt-1">
                        {userRole === 'EXPERT' && canManage && (
                          batch.status === 'PENDING' ? (
                            <Button size="sm" onClick={() => handleStatusChange(batch.id, 'COMPLETED')} className="h-7 text-xs bg-green-600 hover:bg-green-700 px-3">
                              Mark Completed
                            </Button>
                          ) : (
                            <button 
                              onClick={() => handleStatusChange(batch.id, 'PENDING')}
                              className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg text-xs flex items-center gap-1"
                            >
                              <RefreshCcw size={12} /> Reopen
                            </button>
                          )
                        )}

                        {userRole === 'ADMIN' && (
                           <>
                             {batch.status === 'PENDING' ? (
                               <Button size="sm" onClick={() => handleStatusChange(batch.id, 'COMPLETED')} className="h-7 text-xs bg-green-600 hover:bg-green-700">
                                 Force Complete
                               </Button>
                             ) : (
                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(batch.id, 'PENDING')} className="h-7 text-xs border-orange-200 text-orange-700 hover:bg-orange-50">
                                  Return to Expert
                                </Button>
                             )}
                           </>
                        )}
                  </div>
                </div>

                {/* File List */}
                <div className="divide-y divide-gray-100">
                  {batch.files.map(file => (
                    <div key={file.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText size={16} className="text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-700 font-medium truncate">{file.name}</p>
                              {/* Source Indicator */}
                              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-500 font-bold uppercase tracking-wider" title={`Uploaded via ${formatSource(file.source)}`}>
                                  {getSourceIcon(file.source)}
                                  <span>{formatSource(file.source)}</span>
                              </div>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {file.size} • {new Date(file.uploadedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • by {file.uploadedBy.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-blue-600 p-1" title="Preview">
                            <FileText size={14} />
                        </button>
                        {(userRole === 'ADMIN' || (userRole === 'CLIENT' && batch.status !== 'COMPLETED')) && (
                          <button 
                            onClick={() => handleDeleteFile(batch.id, file.id)}
                            className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};
