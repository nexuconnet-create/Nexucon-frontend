import React from 'react';
import { Upload, Trash2 } from 'lucide-react';

export default function UploadFileModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="bg-white rounded-[32px] p-8 w-full max-w-[800px] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300 z-10">

        {/* Drag and Drop Zone */}
        <div className="border border-dashed border-gray-400 rounded-[24px] bg-[#F9F9F9] flex flex-col items-center justify-center py-20 mb-8 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6">
            <Upload className="w-8 h-8 text-[#0F181F]" strokeWidth={2.5} />
          </div>
          <h3 className="text-[22px] font-medium text-[#0F181F] mb-3">
            Drop your file here or browse
          </h3>
          <p className="text-[16px] text-gray-400">
            Max file size up to 1GB
          </p>
        </div>

        {/* Uploads Section */}
        <div className="px-2">
          <h4 className="text-[18px] text-[#0F181F] mb-4">Recent Uploads</h4>

          <div className="flex flex-col gap-4">
            <div className="border border-[#0F181F] rounded-[16px] p-3 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center text-[13px] font-medium text-[#0F181F]">
                  PDF
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-medium text-[#0F181F]">Architectural Floor Plan.pdf</span>
                  <span className="text-[11px] text-gray-500">Architectural Drawings</span>
                </div>
              </div>
              <button className="w-12 h-12 flex items-center justify-center text-[#0F181F] hover:bg-gray-100 rounded-full transition-colors mr-2">
                <Trash2 className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
