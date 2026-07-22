import React from 'react';
import { X } from 'lucide-react';

export default function CreateViewSideDrawer({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave?: () => void }) {
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
            Create Saved View
          </h2>
          <p className="text-[13px] text-gray-600 mb-12 max-w-[550px] leading-relaxed">
            Create a customized view to filter and organize project documents, drawings, and other assets for specific workflows and easier collaboration.
          </p>

          {/* View Information */}
          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-6">View Information</h3>
          <div className="flex flex-col gap-8 mb-12">
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">View Name</label>
              <input type="text" className="w-full h-12 rounded-md border border-[#022C4F] px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm" />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Description (Optional)</label>
              <textarea className="w-full h-32 rounded-md border border-[#022C4F] p-4 text-[14px] resize-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"></textarea>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            {/* View Scope */}
            <div>
              <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-3">View Scope</h3>
              <p className="text-[11px] text-[#022C4F] mb-6">Select what this view should display</p>
              
              <div className="flex flex-col gap-4">
                {[
                  { label: "Drawings", checked: true },
                  { label: "Documents", checked: true },
                  { label: "Design Packages", checked: false },
                  { label: "Technical Reports", checked: true },
                  { label: "Reviews", checked: false },
                  { label: "Tasks", checked: true },
                  { label: "Activities", checked: false },
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white">
                      <input type="checkbox" className="hidden" defaultChecked={item.checked} />
                      <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[11px] font-medium text-[#0F181F]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Folder Selection */}
            <div>
              <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-3">Folder Selection</h3>
              <p className="text-[11px] text-[#022C4F] mb-6">Choose folders to include</p>
              
              <div className="flex flex-col gap-4">
                {[
                  { label: "Architectural Drawings", checked: true },
                  { label: "Structural Drawings", checked: true },
                  { label: "MEP Drawings", checked: false },
                  { label: "BOQ", checked: true },
                  { label: "Technical Reports", checked: true },
                  { label: "Reviews & Approvals", checked: false },
                  { label: "Construction Handoff", checked: false },
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white">
                      <input type="checkbox" className="hidden" defaultChecked={item.checked} />
                      <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[11px] font-medium text-[#0F181F]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            {/* Filter Options */}
            <div>
              <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-3">Filter Options</h3>
              <p className="text-[11px] text-[#022C4F] mb-6">Document Status</p>
              
              <div className="flex flex-col gap-4">
                {[
                  { label: "Draft", checked: true },
                  { label: "Under Review", checked: false },
                  { label: "Approved", checked: false },
                  { label: "Revision Required", checked: true },
                  { label: "Archived", checked: true },
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white">
                      <input type="checkbox" className="hidden" defaultChecked={item.checked} />
                      <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[11px] font-medium text-[#0F181F]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Discipline */}
            <div>
              <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-3">Discipline</h3>
              <p className="text-[11px] text-[#022C4F] mb-6 opacity-0">Spacer</p>
              
              <div className="flex flex-col gap-4">
                {[
                  { label: "Architecture", checked: true },
                  { label: "Structural", checked: false },
                  { label: "Civil", checked: false },
                  { label: "Mechanical", checked: false },
                  { label: "Electrical", checked: false },
                  { label: "Quantity Surveying", checked: false },
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white">
                      <input type="checkbox" className="hidden" defaultChecked={item.checked} />
                      <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[11px] font-medium text-[#0F181F]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Assigned To */}
          <div className="mb-12">
            <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-5">Assigned To</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {[
                { label: "Everyone", checked: true },
                { label: "Assigned to Me", checked: true },
                { label: "My Team", checked: false },
                { label: "Custom Selection", checked: true },
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white">
                    <input type="checkbox" className="hidden" defaultChecked={item.checked} />
                    <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[11px] font-medium text-[#0F181F]">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 pb-4">
            <button 
              onClick={onClose}
              className="w-full bg-[#022C4F] hover:bg-[#033A6B] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Preview View
            </button>
            <button 
              onClick={() => {
                if (onSave) onSave();
                else onClose();
              }}
              className="w-full bg-[#111827] hover:bg-[#1F2937] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Save View
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
