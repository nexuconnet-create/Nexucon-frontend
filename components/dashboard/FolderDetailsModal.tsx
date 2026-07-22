import React from 'react';
import { X } from 'lucide-react';

export default function FolderDetailsModal({ folder, onClose, onOpenUploadFile }: { folder: any, onClose: () => void, onOpenUploadFile?: () => void }) {
  if (!folder) return null;

  return (
    <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] p-12 w-full max-w-[750px] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300 max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-[32px] font-bold text-[#022C4F] mb-2 tracking-tight">
          {folder.name}
        </h2>
        <p className="text-[15px] text-[#022C4F] font-medium mb-8">
          {folder.files} Files
        </p>

        <h3 className="text-[15px] font-bold text-[#022C4F] mb-4">Recent Files</h3>
        <p className="text-[15px] text-gray-700 mb-8 leading-relaxed max-w-[600px]">
          {folder.description}
        </p>

        <div className="flex flex-col gap-5 mb-12">
          {folder.recentFiles?.map((file: string, idx: number) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L8.1822 5.09312L13.1788 3.51868L9.93291 7.753L13.1788 11.9873L8.1822 10.4129L7 15.506L5.8178 10.4129L0.821217 11.9873L4.06709 7.753L0.821217 3.51868L5.8178 5.09312L7 0Z" fill="#022C4F"/>
                </svg>
              </div>
              <span className="text-[13px] text-gray-800 font-medium">{file}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-auto">
          <button className="flex-1 bg-white border-2 border-[#022C4F] text-[#022C4F] hover:bg-gray-50 py-3.5 rounded-full font-bold transition-colors text-[14px]">
            Open Folder
          </button>
          <button 
            className="flex-1 bg-[#022C4F] hover:bg-[#033A6B] text-white py-3.5 rounded-full font-bold transition-colors text-[14px]"
            onClick={() => {
              if (onOpenUploadFile) onOpenUploadFile();
            }}
          >
            Upload File
          </button>
        </div>
      </div>
    </div>
  );
}
