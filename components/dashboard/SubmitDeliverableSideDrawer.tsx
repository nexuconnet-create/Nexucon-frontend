import React from 'react';
import { X, ChevronDown, Upload } from 'lucide-react';

export default function SubmitDeliverableSideDrawer({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit?: () => void }) {
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
            Submit New Deliverable
          </h2>
          <p className="text-[13px] text-gray-600 mb-12 max-w-[550px] leading-relaxed">
            Submit a new project deliverable for review, approval, or release. Deliverables can include drawings, reports, specifications, calculations, BOQs, and complete design packages.
          </p>

          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-6">Deliverable Information</h3>
          
          <div className="flex flex-col gap-6 mb-8">
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Deliverable Title</label>
              <input type="text" className="w-full h-12 rounded-md border border-[#022C4F] px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm" />
            </div>
            
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Deliverable Type</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Discipline</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Submission Stage</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Revision Notes</label>
              <textarea className="w-full h-32 rounded-md border border-[#022C4F] p-4 text-[14px] resize-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"></textarea>
            </div>
          </div>

          <div className="border border-dashed border-[#022C4F] rounded-[16px] bg-white flex flex-col items-center justify-center py-10 mb-8 cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="w-8 h-8 text-[#0F181F] mb-3" strokeWidth={2} />
            <p className="text-[13px] font-bold text-[#022C4F]">
              Drop your files here or Browse Files
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-auto pt-4 pb-4">
            <button 
              onClick={() => {
                if (onSubmit) onSubmit();
                else onClose();
              }}
              className="w-full bg-[#022C4F] hover:bg-[#033A6B] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Submit Deliverable
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-[#111827] hover:bg-[#1F2937] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Preview Submission
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
