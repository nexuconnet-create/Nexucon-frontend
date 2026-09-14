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

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFileUrl(null);
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

        {/* Bottom: Document Content — the real file only, no synthetic overlays */}
        <div className="relative w-full flex-1 bg-white overflow-hidden p-2 rounded-b-[24px]">
          <div className="w-full h-full rounded-[20px] overflow-hidden flex items-stretch justify-center bg-gray-100 gap-2">
            {isPdf && fileUrl ? (
              <iframe
                src={`${fileUrl}#toolbar=0`}
                className="w-full h-full rounded-xl"
                title={file.name}
              />
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
