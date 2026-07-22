import React, { useState } from 'react';
import { X, Search, ChevronDown, AlertCircle } from 'lucide-react';

export default function AssignReviewerSideDrawer({ isOpen, onClose, onAssign }: { isOpen: boolean, onClose: () => void, onAssign?: () => void }) {
  const [selectedMembers, setSelectedMembers] = useState<Record<string, { role: string, mustApprove: boolean }>>({});

  if (!isOpen) return null;

  const teamMembers = [
    { name: "Olivia Thompson", role: "Lead Architect", company: "Nexus Design Studio", rating: "4.9" },
    { name: "Michael Adeyemi", role: "Structural Engineer", company: "BuildCore Engineering", rating: "4.8" },
    { name: "James Ibrahim", role: "Electrical Engineer", company: "Volt Consulting", rating: "4.7" },
    { name: "Daniel Okoro", role: "Mechanical Engineer", company: "MEP Solutions Ltd.", rating: "4.8" },
    { name: "Sarah Williams", role: "Design Coordinator", company: "Nexucon Design Team", rating: "4.9" },
  ];

  const handleToggleMember = (name: string) => {
    if (selectedMembers[name]) {
      const newMembers = { ...selectedMembers };
      delete newMembers[name];
      setSelectedMembers(newMembers);
    } else {
      setSelectedMembers({ ...selectedMembers, [name]: { role: "Primary Reviewer", mustApprove: true } });
    }
  };

  const handleUpdateRole = (name: string, role: string) => {
    setSelectedMembers({ ...selectedMembers, [name]: { ...selectedMembers[name], role } });
  };

  const handleToggleApprove = (name: string) => {
    setSelectedMembers({ ...selectedMembers, [name]: { ...selectedMembers[name], mustApprove: !selectedMembers[name].mustApprove } });
  };

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
            Assign Multi-Disciplinary Reviewers
          </h2>
          <p className="text-[13px] text-gray-600 mb-8 max-w-[550px] leading-relaxed">
            Assign one or more reviewers from different disciplines to evaluate this topic. Define their specific roles and whether their approval is required before the topic can be closed.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mb-10">
            <AlertCircle className="w-5 h-5 text-[#022C4F] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[12px] font-bold text-[#022C4F] mb-1">Approval Logic</h4>
              <p className="text-[11px] text-[#022C4F]/80 leading-relaxed">
                ALL assignees marked as "Must Approve" must formally approve before this review topic can be marked as closed. Advisory reviewers provide feedback without blocking closure.
              </p>
            </div>
          </div>

          <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-6">Review Topic Details</h3>
          
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Topic</span>
              <span className="text-[12px] text-gray-700 font-medium">Beam Reinforcement - Grid B5</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Priority</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-[12px] text-gray-700 font-medium">High</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Reference ID</span>
              <span className="text-[12px] text-gray-700 font-medium">RT-00142</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Current Status</span>
              <span className="text-[12px] text-gray-700 font-medium">Awaiting Assignment</span>
            </div>
          </div>

          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Select Reviewers</h3>
          
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name, role, discipline, or company..." 
              className="w-full h-[52px] rounded-full border border-[#022C4F] pl-12 pr-6 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-4 mb-8">
            {teamMembers.map((member, idx) => {
              const isSelected = !!selectedMembers[member.name];
              const assignmentInfo = selectedMembers[member.name];

              return (
                <div key={idx} className={`flex flex-col rounded-2xl border transition-all ${isSelected ? 'border-[#022C4F] shadow-sm bg-white' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}`}>
                  {/* Header Row */}
                  <div className="flex items-start gap-4 p-5 cursor-pointer" onClick={() => handleToggleMember(member.name)}>
                    <div className={`w-5 h-5 rounded-[4px] border-[1.5px] flex items-center justify-center transition-colors mt-0.5 shrink-0 ${isSelected ? 'border-[#022C4F] bg-[#022C4F]' : 'border-gray-300 bg-white'}`}>
                      <svg className={`w-3.5 h-3.5 text-white transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-bold text-[#0F181F]">{member.name}</span>
                      <div className="flex items-center flex-wrap text-[11px] text-gray-500 gap-1.5 font-medium">
                        <span>{member.role}</span>
                        <span className="text-gray-300">•</span>
                        <span>{member.company}</span>
                      </div>
                    </div>
                  </div>

                  {/* Inline Configuration Options */}
                  {isSelected && assignmentInfo && (
                    <div className="px-5 pb-5 pt-1 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                      <div className="w-full h-[1px] bg-gray-100 mb-1"></div>
                      
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-gray-500 mb-2">Assignment Role</label>
                          <div className="relative">
                            <select 
                              value={assignmentInfo.role}
                              onChange={(e) => handleUpdateRole(member.name, e.target.value)}
                              className="w-full h-10 bg-gray-50 rounded-lg border border-gray-200 px-3 text-[12px] font-medium text-gray-700 appearance-none focus:outline-none focus:border-[#022C4F] shadow-sm cursor-pointer"
                            >
                              <option value="Primary Reviewer">Primary Reviewer</option>
                              <option value="Coordination Reviewer">Coordination Reviewer</option>
                              <option value="Clash Detection">Clash Detection (Advisory)</option>
                              <option value="BOQ Verification">BOQ Verification (Advisory)</option>
                              <option value="Client Consultant">Client Consultant (Advisory)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 md:mt-6 cursor-pointer" onClick={() => handleToggleApprove(member.name)}>
                          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${assignmentInfo.mustApprove ? 'bg-[#022C4F]' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${assignmentInfo.mustApprove ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-gray-800">Must Approve</span>
                            <span className="text-[10px] text-gray-500 leading-tight">Required to close topic</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 mt-auto pt-4 pb-4">
            <button 
              onClick={() => {
                if (onAssign) onAssign();
                else onClose();
              }}
              disabled={Object.keys(selectedMembers).length === 0}
              className="w-full bg-[#022C4F] hover:bg-[#033A6B] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm disabled:opacity-50 disabled:hover:bg-[#022C4F]"
            >
              Confirm Reviewer Assignments ({Object.keys(selectedMembers).length})
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
