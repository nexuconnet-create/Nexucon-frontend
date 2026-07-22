import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function ExportTopicsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="bg-white rounded-[32px] p-12 w-full max-w-[1000px] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300 z-10">
        
        {/* Header section with button */}
        <div className="flex justify-between items-start mb-12">
          <div className="max-w-[650px]">
            <h2 className="text-[28px] font-extrabold text-[#022C4F] mb-3">
              Export Topics Report
            </h2>
            <p className="text-[12px] text-gray-600 leading-relaxed">
              Generate a comprehensive report of review topics, design issues, discussions, resolutions, and reviewer activities for project documentation, client submissions, audits, or quality assurance.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-8 py-3.5 rounded-full font-bold transition-colors text-[13px] shadow-sm shrink-0"
          >
            Export Topic Report
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-12 max-w-[350px]">
            {/* Report Information */}
            <div>
              <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Report Information</h3>
              <label className="block text-[11px] font-extrabold text-[#022C4F] mb-3">Report Name</label>
              <input type="text" className="w-full h-12 rounded-md border border-[#022C4F] px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm" />
            </div>

            {/* Reporting Period */}
            <div>
              <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Reporting Period</h3>
              <label className="block text-[11px] font-extrabold text-[#022C4F] mb-3">Date Range</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-[1.5] flex flex-col gap-12">
            {/* Export Format */}
            <div>
              <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Export Format</h3>
              <label className="block text-[11px] font-extrabold text-[#022C4F] mb-3">Select Format</label>
              <div className="relative max-w-[400px]">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Checkbox Grids */}
            <div className="grid grid-cols-3 gap-8">
              
              {/* Topic Status */}
              <div>
                <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-2">Topic Status</h3>
                <p className="text-[11px] font-extrabold text-[#022C4F] mb-5">Include Topics</p>
                <div className="flex flex-col gap-4">
                  {[
                    "Open",
                    "In Progress",
                    "Awaiting Review",
                    "Resolved",
                    "Closed"
                  ].map((label, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                      <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white shrink-0">
                        <input type="checkbox" className="hidden" defaultChecked={true} />
                        <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-[11px] font-medium text-[#0F181F] whitespace-nowrap">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Disciplines */}
              <div>
                <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-2">Disciplines</h3>
                <p className="text-[11px] font-extrabold text-[#022C4F] mb-5">Select Disciplines</p>
                <div className="flex flex-col gap-4">
                  {[
                    "Architecture",
                    "Structural Engineering",
                    "Civil Engineering",
                    "Mechanical Engineering",
                    "Electrical Engineering"
                  ].map((label, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                      <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white shrink-0">
                        <input type="checkbox" className="hidden" defaultChecked={true} />
                        <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-[11px] font-medium text-[#0F181F] whitespace-nowrap">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Topic Categories */}
              <div>
                <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-2">Topic Categories</h3>
                <p className="text-[11px] font-extrabold text-[#022C4F] mb-5">Include</p>
                <div className="flex flex-col gap-4">
                  {[
                    "Design Reviews",
                    "Technical Queries",
                    "Coordination Issues",
                    "Drawing Annotations",
                    "Compliance Reviews"
                  ].map((label, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                      <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#111827] flex items-center justify-center transition-colors group-has-[:checked]:bg-[#111827] bg-white shrink-0">
                        <input type="checkbox" className="hidden" defaultChecked={true} />
                        <svg className="w-3.5 h-3.5 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-[11px] font-medium text-[#0F181F] whitespace-nowrap">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
