import React from 'react';
import { X, ChevronDown } from 'lucide-react';

export default function CreateFolderSideDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[600px] bg-white rounded-[32px] p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex-1 overflow-y-auto pr-4 -mr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h2 className="text-[28px] font-extrabold text-[#0F181F] mb-3 tracking-tight">
            Create New Folder
          </h2>
          <p className="text-[13px] text-gray-600 mb-12 max-w-[650px] leading-relaxed">
            Create a folder to organize project drawings, documents, reports, and other project assets for easier collaboration and file management.
          </p>

          {/* Folder Information */}
          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-6">Folder Information</h3>
          <div className="flex flex-col gap-8 mb-12">
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Folder Name</label>
              <input type="text" className="w-full h-12 rounded-md border border-[#022C4F] px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm" />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Parent Location</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Folder Category */}
          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-6">Folder Category</h3>
          <div className="flex flex-col gap-8 mb-12">
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Select Category</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Folder Description (Optional)</label>
              <textarea className="w-full h-32 rounded-md border border-[#022C4F] p-4 text-[14px] resize-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"></textarea>
            </div>
          </div>

          {/* Access & Permissions */}
          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-6">Access & Permissions</h3>
          <div className="flex flex-col gap-10 mb-12">
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-5">Visibility</label>
              <div className="flex flex-wrap gap-x-10 gap-y-4">
                {["Private", "Project Team", "Selected Members", "Entire Organization"].map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border-[1.5px] border-[#022C4F] flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                      <input type="radio" name="folderVisibility" defaultChecked={idx === 0} className="hidden" />
                      <div className="w-3 h-3 rounded-full bg-[#022C4F] opacity-0 group-has-[:checked]:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="text-[11px] font-medium text-[#0F181F]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-5">Allow Team Members To</label>
              <div className="flex flex-col gap-4">
                {[
                  "Upload Files",
                  "Edit Files",
                  "Download Files",
                  "Comment",
                  "Share Folder",
                  "Manage Versions"
                ].map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white">
                      <input type="checkbox" className="hidden" defaultChecked={idx !== 3} />
                      <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[11px] font-medium text-[#0F181F]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 pb-4">
            <button 
              onClick={onClose}
              className="w-full bg-[#022C4F] hover:bg-[#033A6B] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Create Folder
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-[#111827] hover:bg-[#1F2937] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Create & Open
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
