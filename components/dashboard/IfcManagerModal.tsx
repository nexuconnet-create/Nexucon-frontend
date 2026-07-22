import React, { useState } from 'react';
import { X, UploadCloud, DownloadCloud, Box, Eye, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface IfcManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IfcManagerModal({ isOpen, onClose }: IfcManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'viewer'>('import');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-[800px] h-[600px] flex overflow-hidden shadow-2xl flex-col relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#022C4F]/10 flex items-center justify-center text-[#022C4F]">
              <Box size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-extrabold text-[#022C4F]">IFC Manager</h2>
              <p className="text-[12px] text-gray-500 font-medium">Native BIM workflow support</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[200px] bg-gray-50 border-r border-gray-100 p-4 flex flex-col gap-2 shrink-0">
            <button 
              onClick={() => setActiveTab('import')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-colors ${activeTab === 'import' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <UploadCloud size={16} /> Import IFC
            </button>
            <button 
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-colors ${activeTab === 'export' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <DownloadCloud size={16} /> Export IFC
            </button>
            <button 
              onClick={() => setActiveTab('viewer')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-colors ${activeTab === 'viewer' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Eye size={16} /> Model Viewer
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto relative bg-white">
            
            {activeTab === 'import' && (
              <div className="flex flex-col h-full animate-in fade-in">
                <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-2">Import IFC Model</h3>
                <p className="text-[13px] text-gray-500 mb-6">Upload native .ifc files to integrate with your existing BIM workflows.</p>
                
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-[24px] flex flex-col items-center justify-center gap-4 bg-[#FAFAFA] hover:bg-gray-50 hover:border-[#022C4F]/50 transition-colors cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#022C4F]">
                    <UploadCloud size={28} />
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-bold text-gray-700">Click or drag IFC file here</p>
                    <p className="text-[12px] text-gray-400 mt-1">Supports IFC2x3 and IFC4 up to 500MB</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); showToast("IFC Model uploaded and processing started."); }}
                    className="mt-4 px-6 py-2.5 bg-[#022C4F] text-white rounded-full text-[12px] font-bold hover:bg-[#033A6B] transition-colors"
                  >
                    Select File
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="flex flex-col h-full animate-in fade-in">
                <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-2">Export IFC Package</h3>
                <p className="text-[13px] text-gray-500 mb-6">Export consolidated models and data in open BIM formats for external coordination.</p>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <h4 className="text-[13px] font-bold text-gray-800 mb-1">Architectural Model V4.0</h4>
                    <p className="text-[11px] text-gray-500 mb-3">Last updated: Today by Olivia Thompson</p>
                    <button 
                      onClick={() => showToast("Exporting Architectural Model...")}
                      className="text-[12px] font-bold text-[#022C4F] bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Export IFC2x3
                    </button>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <h4 className="text-[13px] font-bold text-gray-800 mb-1">Structural Model V3.2</h4>
                    <p className="text-[11px] text-gray-500 mb-3">Last updated: Yesterday by Michael Adeyemi</p>
                    <button 
                      onClick={() => showToast("Exporting Structural Model...")}
                      className="text-[12px] font-bold text-[#022C4F] bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Export IFC4
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'viewer' && (
              <div className="flex flex-col h-full animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#022C4F]">Integrated Model Viewer</h3>
                    <p className="text-[12px] text-gray-500">Preview 3D geometry and BIM metadata directly in the browser.</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 text-[11px] font-bold rounded-lg hover:bg-gray-200 transition-colors">
                    Fullscreen
                  </button>
                </div>
                
                <div className="flex-1 rounded-[24px] overflow-hidden bg-black relative shadow-inner">
                  <Image 
                    src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784703934/Chapman_Taylor___Why_BIM_matters_gnfw89.jpg" 
                    alt="BIM Viewer Mock" 
                    fill 
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 text-white text-[13px] font-bold flex items-center gap-2 cursor-pointer hover:bg-black/80 transition-colors">
                      <Eye size={16} /> Load 3D Viewer
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0F181F] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[300] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-[12px] font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
