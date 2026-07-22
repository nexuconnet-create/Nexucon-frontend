import React from 'react';
import { X, ChevronDown } from 'lucide-react';

export default function ExportActivityLogModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="bg-white rounded-[32px] p-12 w-full max-w-[800px] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300 z-10">
        
        {/* Header section with button */}
        <div className="flex justify-between items-start mb-10">
          <div className="max-w-[500px]">
            <h2 className="text-[28px] font-extrabold text-[#022C4F] mb-3">
              Export Activity Log
            </h2>
            <p className="text-[12px] text-gray-600 leading-relaxed">
              Generate and export a detailed record of project activities, including document updates, reviews, approvals, team actions, meetings, and collaboration history for reporting, auditing, or project documentation.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-8 py-3.5 rounded-full font-bold transition-colors text-[13px] shadow-sm shrink-0"
          >
            Generate Activity Report
          </button>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-10">
          {/* Export Information */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[16px] font-extrabold text-[#022C4F]">Export Information</h3>
            
            <div>
              <label className="block text-[11px] font-extrabold text-[#022C4F] mb-3">Report Name</label>
              <input type="text" className="w-full h-12 rounded-md border border-[#022C4F] px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm" />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#022C4F] mb-3">Select the activity period</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[16px] font-extrabold text-[#022C4F]">Export Format</h3>
            
            <div>
              <label className="block text-[11px] font-extrabold text-[#022C4F] mb-3">Select Format</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12">
          {/* Activity Categories */}
          <div>
            <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-3">Activity Categories</h3>
            <p className="text-[11px] font-extrabold text-[#022C4F] mb-6">Include the following activities</p>
            
            <div className="flex flex-col gap-5">
              {[
                "Document Uploads",
                "Drawing Revisions",
                "Comments & Discussions",
                "Review Activities"
              ].map((label, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white">
                    <input type="checkbox" className="hidden" defaultChecked={true} />
                    <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[11px] font-medium text-[#0F181F]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-3">Team Members</h3>
            <p className="text-[11px] font-extrabold text-[#022C4F] mb-6">Export activities for</p>
            
            <div className="flex flex-col gap-5">
              {[
                "All Team Members",
                "Assigned Members Only",
                "Selected Members"
              ].map((label, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white">
                    <input type="checkbox" className="hidden" defaultChecked={true} />
                    <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[11px] font-medium text-[#0F181F]">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
