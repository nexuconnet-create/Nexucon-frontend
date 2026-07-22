"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Box, Database, Calendar, Users, Send } from "lucide-react";

interface SiteSuperviseHandoffDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SiteSuperviseHandoffDrawer({
  isOpen,
  onClose,
}: SiteSuperviseHandoffDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataSelection, setDataSelection] = useState({
    bim: true,
    schedule: true,
    team: true,
    documents: true
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-[100] backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300 rounded-l-[32px]">
        
        {/* Header */}
        <div className="px-10 pt-10 pb-6 bg-[#022C4F] text-white shrink-0 rounded-tl-[32px] relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-[28px] font-extrabold mb-4">Site Handoff</h2>
          <p className="text-[12px] text-white/70 font-medium leading-relaxed pr-4">
            Transfer structured project data, not just flat files, to the SiteSupervise execution team. This intelligent handoff populates the contractor's dashboard automatically.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 flex flex-col gap-8 pt-8 custom-scrollbar">
          
          <div className="flex flex-col gap-6">
            <h3 className="text-[14px] font-extrabold text-[#022C4F]">Data Payloads</h3>
            
            {/* BIM Model Data */}
            <label className="flex items-start gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors border-gray-200">
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  checked={dataSelection.bim} 
                  onChange={(e) => setDataSelection({...dataSelection, bim: e.target.checked})}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2 text-[#022C4F]">
                  <Database size={16} />
                  <span className="text-[13px] font-extrabold">Structured BIM Data (IFC)</span>
                </div>
                <span className="text-[11px] text-gray-500">Transfers model geometry, element properties, and clash data for AR validation.</span>
              </div>
            </label>

            {/* Schedule Data */}
            <label className="flex items-start gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors border-gray-200">
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  checked={dataSelection.schedule} 
                  onChange={(e) => setDataSelection({...dataSelection, schedule: e.target.checked})}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2 text-[#022C4F]">
                  <Calendar size={16} />
                  <span className="text-[13px] font-extrabold">Execution Schedule</span>
                </div>
                <span className="text-[11px] text-gray-500">Populates the SiteSupervise task board with pre-linked dependencies and milestones.</span>
              </div>
            </label>

            {/* Team Mapping */}
            <label className="flex items-start gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors border-gray-200">
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  checked={dataSelection.team} 
                  onChange={(e) => setDataSelection({...dataSelection, team: e.target.checked})}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2 text-[#022C4F]">
                  <Users size={16} />
                  <span className="text-[13px] font-extrabold">Team Mapping & Roles</span>
                </div>
                <span className="text-[11px] text-gray-500">Transfers responsibility matrices so contractors know who to submit RFIs to.</span>
              </div>
            </label>

          </div>

        </div>

        {/* Footer */}
        <div className="p-10 bg-white border-t border-gray-100 shrink-0">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-14 rounded-full bg-[#022C4F] text-white font-bold text-[14px] hover:bg-[#033A6B] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? "Transferring Data..." : <><Send size={18} /> Execute Intelligent Handoff</>}
          </button>
        </div>
      </div>
    </>
  );
}
