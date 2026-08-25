"use client";

import React from 'react';
import { 
  X, Download, Printer, FileText, CheckCircle2, 
  ShieldCheck, ArrowUpRight, Copy, ExternalLink 
} from 'lucide-react';
import { GeneratedDocumentResult, ReportConfig } from '@/utils/documentGenerator';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GeneratedDocumentResult | null;
  config: ReportConfig | null;
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  result,
  config
}: ReportPreviewModalProps) {
  if (!isOpen || !result || !config) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && result.previewHtml) {
      printWindow.document.write(result.previewHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.fileUrl;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[130] overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F181F]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {config.reportReference}
                </span>
                <span className="text-xs font-bold text-slate-500">• {config.format} Format</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{config.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-slate-200 shadow-sm cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Print / Save PDF"
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Download File</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document Preview Frame */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-100/60 min-h-[400px]">
          {result.previewHtml ? (
            <div className="bg-white shadow-md rounded-2xl border border-slate-200 overflow-hidden max-w-3xl mx-auto">
              <iframe
                srcDoc={result.previewHtml}
                title="Report Preview"
                className="w-full h-[540px] border-0"
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center max-w-md mx-auto my-12">
              <CheckCircle2 size={44} className="text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-black text-slate-900 mb-1">Document Ready</h4>
              <p className="text-xs text-slate-500 mb-4">
                The {config.format} file <span className="font-mono font-bold text-slate-700">{result.fileName}</span> ({result.fileSize}) has been generated successfully.
              </p>
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={15} />
                <span>Save to Local Drive</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-emerald-600 font-bold">
            <ShieldCheck size={15} />
            <span>Cryptographically sealed by Nexucon Platform Security</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">File size: {result.fileSize}</span>
        </div>
      </div>
    </div>
  );
}
