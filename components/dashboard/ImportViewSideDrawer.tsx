import React from 'react';
import { X, Upload } from 'lucide-react';

export default function ImportViewSideDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[650px] bg-white rounded-[32px] p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex-1 overflow-y-auto pr-4 -mr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h2 className="text-[28px] font-extrabold text-[#0F181F] mb-3 tracking-tight">
            Import View Configuration
          </h2>
          <p className="text-[13px] text-gray-600 mb-12 max-w-[550px] leading-relaxed">
            Import a previously saved workspace configuration to quickly restore your preferred project layout, filters, folder structure, and viewing preferences.
          </p>

          {/* Import Source */}
          <div className="mb-12">
            <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-3">Import Source</h3>
            <p className="text-[11px] text-[#022C4F] mb-6">Select Import Method</p>
            
            <div className="flex flex-col gap-5">
              {[
                { label: "Upload Configuration File", checked: false },
                { label: "Import from Another Project", checked: false },
                { label: "Import Shared Team View", checked: true },
                { label: "Restore from Backup", checked: false },
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-[#022C4F] flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                    <input type="radio" name="importSource" defaultChecked={item.checked} className="hidden" />
                    <div className="w-3 h-3 rounded-full bg-[#022C4F] opacity-0 group-has-[:checked]:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-[12px] font-medium text-[#0F181F]">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Upload Configuration */}
          <div className="mb-12">
            <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-6">Upload Configuration</h3>
            
            <div className="border border-dashed border-[#022C4F] rounded-[24px] bg-white flex flex-col items-center justify-center py-12 mb-6 cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="w-8 h-8 text-[#0F181F] mb-4" strokeWidth={2} />
              <p className="text-[13px] font-bold text-[#022C4F] mb-1">
                Drop your configuration file here
              </p>
              <p className="text-[13px] font-bold text-[#0284C7] underline underline-offset-2">
                Browse Files
              </p>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Supported Formats</span>
                <span className="bg-[#022C4F] text-white px-2 py-0.5 rounded font-medium">json</span>
                <span className="bg-[#022C4F] text-white px-2 py-0.5 rounded font-medium">xml</span>
                <span className="bg-[#022C4F] text-white px-2 py-0.5 rounded font-medium">nexview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Maximum File Size</span>
                <span className="bg-[#022C4F] text-white px-2 py-0.5 rounded font-medium">10MB</span>
              </div>
            </div>
          </div>

          {/* Select Existing Configuration */}
          <div className="mb-8">
            <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-3">Select Existing Configuration</h3>
            <p className="text-[11px] text-[#022C4F] mb-6">Available Configurations</p>
            
            <div className="flex flex-col gap-5">
              {[
                "Architectural Review Workspace",
                "Structural Coordination View",
                "MEP Collaboration Workspace",
                "Construction Handoff Workspace",
                "Client Review Dashboard"
              ].map((label, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-[#022C4F] flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                    <input type="radio" name="existingConfig" className="hidden" />
                    <div className="w-3 h-3 rounded-full bg-[#022C4F] opacity-0 group-has-[:checked]:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-[12px] font-medium text-[#0F181F]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-6 pb-4 mt-auto">
            <button 
              onClick={onClose}
              className="w-full bg-[#022C4F] hover:bg-[#033A6B] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Import Configuration
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-[#111827] hover:bg-[#1F2937] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Choose Another File
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
