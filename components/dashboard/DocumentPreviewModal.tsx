import React, { useEffect, useState } from 'react';
import { X, FileText, Download } from 'lucide-react';
import Button from '@/components/ui/Button';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

export default function DocumentPreviewModal({ isOpen, onClose, file }: DocumentPreviewModalProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [actionStatus, setActionStatus] = useState<'pending' | 'acknowledged' | 'rejected'>('pending');

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setIsComparing(false);
      setActionStatus('pending');
      return () => URL.revokeObjectURL(url);
    } else {
      setFileUrl(null);
      setIsComparing(false);
      setActionStatus('pending');
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isDocx = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#022C4F]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 z-10"
      >
        <X size={24} />
      </button>

      <div className="bg-[#0F181F] rounded-[24px] w-[90%] max-w-5xl h-[85vh] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden border border-white/10">
        
        {/* Top: Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-white text-lg font-bold mb-1 truncate max-w-2xl">{file.name}</h2>
            <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • {isPdf ? 'PDF Document' : isDocx ? 'Word Document' : 'Document'}</p>
          </div>
          <div className="flex items-center gap-4">
            {isPdf && (
              <button 
                onClick={() => setIsComparing(!isComparing)}
                className={`flex items-center gap-2 px-6 py-2.5 border text-[11px] font-bold rounded-xl transition-colors ${isComparing ? 'bg-white text-[#022C4F] border-white shadow-sm' : 'border-white/20 text-white hover:bg-white/10'}`}
              >
                {isComparing ? 'Exit Comparison' : 'Compare Versions'}
              </button>
            )}
            <button 
              onClick={() => {
                if (fileUrl) {
                  const a = document.createElement('a');
                  a.href = fileUrl;
                  a.download = file.name;
                  a.click();
                }
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors"
            >
              <Download size={16} /> Download
            </button>
          </div>
        </div>

        {/* Bottom: Document Content */}
        <div className="relative w-full flex-1 bg-white overflow-hidden p-2 rounded-b-[24px]">
          <div className="w-full h-full rounded-[20px] overflow-hidden flex items-stretch justify-center bg-gray-100 gap-2">
            {isPdf && fileUrl ? (
              isComparing ? (
                <>
                   {/* Left Panel: Previous Version */}
                   <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-100 p-3 border-b border-gray-200 flex items-center justify-between shrink-0">
                         <span className="text-[12px] font-bold text-[#0F181F]">Previous Version (v2.0)</span>
                         <span className="text-[10px] text-gray-500 font-medium">May 12, 2026</span>
                      </div>
                      <iframe 
                        src={`${fileUrl}#toolbar=0`} 
                        className="w-full flex-1"
                        title={`${file.name} - v2.0`}
                      />
                   </div>

                   {/* Right Panel: Current Version */}
                   <div className="flex-1 flex flex-col bg-white border border-[#022C4F] rounded-xl overflow-hidden relative shadow-lg">
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#4CAF50] text-white text-[9px] font-bold px-4 py-1 rounded-full z-10 shadow-md border border-[#388E3C] flex items-center gap-1.5 whitespace-nowrap">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                        12 Changes Detected
                      </div>
                      <div className="bg-[#022C4F]/5 p-3 border-b border-[#022C4F]/10 flex items-center justify-between shrink-0">
                         <span className="text-[12px] font-bold text-[#022C4F]">Current Version (v3.0)</span>
                         <span className="text-[10px] text-[#022C4F]/70 font-medium">Today</span>
                      </div>
                      <div className="relative flex-1">
                        <iframe 
                          src={`${fileUrl}#toolbar=0`} 
                          className="w-full h-full"
                          title={`${file.name} - v3.0`}
                        />
                        
                        {/* Fake Annotation Overlay */}
                        <div className="absolute top-[25%] left-[20%] w-[35%] h-[20%] border-[3px] border-[#E53935] bg-[#E53935]/10 rounded-lg pointer-events-none z-10 flex flex-col items-start shadow-[0_0_0_1px_rgba(255,255,255,0.5)]">
                           <div className="bg-[#E53935] text-white text-[10px] font-bold px-2.5 py-1 rounded-br-lg rounded-tl-sm pointer-events-auto shadow-sm flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                             Change #1
                           </div>
                        </div>

                        {/* Comment Log */}
                        <div className="absolute top-[22%] left-[58%] w-[260px] bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 z-20 pointer-events-auto animate-in zoom-in-95 duration-300">
                           <div className="flex items-center justify-between mb-2.5">
                              <span className="text-[9px] font-bold bg-[#FFEBEE] text-[#D32F2F] px-2.5 py-1 rounded-full border border-[#FFCDD2] uppercase tracking-wider">Modification</span>
                              <span className="text-[10px] text-gray-400 font-medium">2 hours ago</span>
                           </div>
                           <h5 className="text-[12px] font-bold text-[#0F181F] mb-1.5 leading-tight">Rebar spacing changed from 200mm to 150mm</h5>
                           <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-3">
                             <p className="text-[11px] text-gray-600 leading-relaxed italic">
                               <span className="font-bold text-[#022C4F] not-italic block mb-0.5">Michael Adeyemi (Engineer)</span> 
                               "This change saves 15% on steel cost while maintaining structural integrity according to the revised load calculations."
                             </p>
                           </div>
                           
                           {actionStatus === 'pending' ? (
                             <div className="flex gap-2 mt-1">
                                <button onClick={() => setActionStatus('rejected')} className="flex-1 py-2 bg-white hover:bg-gray-50 text-gray-600 text-[10px] font-bold rounded-xl transition-colors border border-gray-200 shadow-sm">Reject</button>
                                <button onClick={() => setActionStatus('acknowledged')} className="flex-1 py-2 bg-[#022C4F] hover:bg-[#033A6B] text-white text-[10px] font-bold rounded-xl transition-colors shadow-sm">Acknowledge</button>
                             </div>
                           ) : (
                             <div className={`mt-1 py-2.5 rounded-xl text-center text-[11px] font-bold border transition-all animate-in fade-in zoom-in duration-200 ${
                               actionStatus === 'acknowledged' 
                                 ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]' 
                                 : 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]'
                             }`}>
                               {actionStatus === 'acknowledged' ? '✅ Change Acknowledged' : '❌ Change Rejected'}
                             </div>
                           )}
                        </div>
                      </div>
                   </div>
                </>
              ) : (
                <iframe 
                  src={`${fileUrl}#toolbar=0`} 
                  className="w-full h-full rounded-xl"
                  title={file.name}
                />
              )
            ) : isDocx ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-[#022C4F]/10 rounded-2xl flex items-center justify-center text-[#022C4F] mb-6">
                  <FileText size={48} />
                </div>
                <h3 className="text-xl font-bold text-[#0F181F] mb-2">Word Document Preview</h3>
                <p className="text-gray-500 max-w-md mb-8">
                  Native browser preview for DOCX files is not supported. Please download the file to view its contents.
                </p>
                <Button 
                  variant="primary"
                  onClick={() => {
                    if (fileUrl) {
                      const a = document.createElement('a');
                      a.href = fileUrl;
                      a.download = file.name;
                      a.click();
                    }
                  }}
                >
                  <Download size={18} className="mr-2" /> Download Document
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <FileText size={48} className="text-gray-400 mb-6" />
                <h3 className="text-xl font-bold text-[#0F181F] mb-2">No Preview Available</h3>
                <p className="text-gray-500 max-w-md">
                  This file format cannot be previewed in the browser.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
