import React from 'react';
import { X, ChevronDown } from 'lucide-react';

export default function CreateReleaseSideDrawer({ isOpen, onClose, onPublish }: { isOpen: boolean, onClose: () => void, onPublish?: () => void }) {
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
            Create Deliverable Release
          </h2>
          <p className="text-[13px] text-gray-600 mb-12 max-w-[550px] leading-relaxed">
            Package approved project deliverables into an official release for client review, consultant coordination, regulatory submission, or construction handoff.
          </p>

          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-6">Release Information</h3>
          
          <div className="flex flex-col gap-6 mb-10">
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Release Name</label>
              <input type="text" className="w-full h-12 rounded-md border border-[#022C4F] px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm" />
            </div>
            
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Release ID</label>
              <input type="text" className="w-full h-12 rounded-md border border-[#022C4F] px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm" />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Release Purpose</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Release Description</label>
              <textarea className="w-full h-40 rounded-md border border-[#022C4F] p-4 text-[14px] resize-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"></textarea>
            </div>
          </div>

          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-3">Select Deliverables</h3>
          <p className="text-[11px] text-[#022C4F] mb-6">Choose the files and packages to include.</p>
          
          <div className="flex flex-col gap-4 mb-8">
            {[
              "Architectural Design Package (V4.0)",
              "Structural Design Package (V3.2)",
              "Mechanical Design Package (V2.4)",
              "Electrical Design Package (V2.1)"
            ].map((item, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white">
                  <input type="checkbox" className="hidden" defaultChecked={true} />
                  <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-[11px] font-medium text-[#0F181F]">{item}</span>
              </label>
            ))}
            
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Others:</span>
              <input type="text" className="flex-1 border-b border-[#022C4F] bg-transparent focus:outline-none text-[13px] px-2 py-1 max-w-[200px]" />
            </div>
          </div>

          <div className="mb-12">
            <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Release Version</label>
            <input type="text" className="w-full h-12 rounded-md border border-[#022C4F] px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm" />
          </div>

          <div className="flex flex-col gap-4 mt-auto pt-4 pb-4">
            <button 
              onClick={() => {
                if (onPublish) onPublish();
                else onClose();
              }}
              className="w-full bg-[#022C4F] hover:bg-[#033A6B] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Publish Release
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-[#111827] hover:bg-[#1F2937] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Preview Release
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
