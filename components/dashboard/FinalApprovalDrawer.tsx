import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import Button from '@/components/ui/Button';

interface FinalApprovalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
}

export default function FinalApprovalDrawer({ isOpen, onClose, onApprove }: FinalApprovalDrawerProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const checklistItems = [
    "All required drawings have been submitted",
    "Peer review comments have been resolved",
    "Design revisions have been incorporated",
    "Cost estimates have been reviewed",
    "Technical specifications are complete",
    "Documentation package is complete",
    "Project is ready for execution planning"
  ];

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#022C4F]/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full sm:h-[calc(100vh-32px)] sm:my-4 sm:mr-4 rounded-[32px] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out z-10 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors z-20"
        >
          <X size={16} />
        </button>

        <div className="flex-1 overflow-y-auto flex flex-col p-6 lg:p-8">
          <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-2 pr-8 shrink-0">Final Drawing Approval</h2>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-8 shrink-0">
            Review the completed design package and provide final approval before the project moves to the execution planning and contractor selection stage.
          </p>

          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-4 shrink-0">Project Information</h3>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8 shrink-0">
            <div>
              <p className="text-[10px] font-bold text-[#0F181F] mb-1">Project</p>
              <p className="text-[11px] text-gray-600 font-medium">Victoria Heights Residential Estate</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0F181F] mb-1">Project Type</p>
              <p className="text-[11px] text-gray-600 font-medium">Residential Development</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0F181F] mb-1">Current Stage</p>
              <p className="text-[11px] text-gray-600 font-medium">Final Design Approval</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0F181F] mb-1">Completion Status</p>
              <p className="text-[11px] text-gray-600 font-medium">100% Design Complete</p>
            </div>
          </div>

          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-4 shrink-0">Before Approving</h3>

          <div className="flex flex-col gap-4 flex-1">
            {checklistItems.map((item, index) => (
              <label key={index} className="flex items-center gap-4 cursor-pointer group">
                <div 
                  className={`w-5 h-5 flex items-center justify-center rounded transition-all duration-200 border-2 ${
                    checkedItems[index]
                      ? 'bg-black border-black text-white' 
                      : 'border-black text-transparent hover:border-gray-600'
                  }`}
                  onClick={() => toggleCheck(index)}
                >
                  <Check size={14} className="stroke-[3]" />
                </div>
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-[#0F181F] transition-colors">{item}</span>
              </label>
            ))}
          </div>

          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-4 shrink-0 mt-6">Multi-Stage Approval Workflow</h3>
          <div className="flex flex-col gap-3 flex-1 mb-8">
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#4CAF50] bg-[#4CAF50]/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4CAF50] text-white flex items-center justify-center"><Check size={14} strokeWidth={3} /></div>
                <div>
                  <p className="text-[11px] font-bold text-[#0F181F]">Navigator</p>
                  <p className="text-[9px] text-gray-500">Quality Assurance Review</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#4CAF50]">Approved</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#4CAF50] bg-[#4CAF50]/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4CAF50] text-white flex items-center justify-center"><Check size={14} strokeWidth={3} /></div>
                <div>
                  <p className="text-[11px] font-bold text-[#0F181F]">Skipper</p>
                  <p className="text-[9px] text-gray-500">Technical Certification</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#4CAF50]">Approved</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#4CAF50] bg-[#4CAF50]/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4CAF50] text-white flex items-center justify-center"><Check size={14} strokeWidth={3} /></div>
                <div>
                  <p className="text-[11px] font-bold text-[#0F181F]">Consultant</p>
                  <p className="text-[9px] text-gray-500">Discipline Coordination</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#4CAF50]">Approved</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#022C4F] bg-[#022C4F]/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#022C4F] text-white flex items-center justify-center">4</div>
                <div>
                  <p className="text-[11px] font-bold text-[#022C4F]">Client (You)</p>
                  <p className="text-[9px] text-gray-500">Commercial Sign-Off</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#FF9800]">Pending</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 shrink-0">
            <Button 
              variant="primary"
              onClick={onApprove}
              className="w-full h-[50px] flex items-center justify-center text-[12px] uppercase tracking-wider"
            >
              Provide Final Client Approval
            </Button>
            <Button 
              variant="outline"
              onClick={onClose}
              className="w-full h-[50px] flex items-center justify-center text-[12px] uppercase tracking-wider"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
