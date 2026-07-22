import React from 'react';
import { Check } from 'lucide-react';

export default function SubmitDeliverableSuccessModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm flex items-center justify-center z-[120] p-4 animate-in fade-in duration-300">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="bg-white rounded-[32px] p-12 w-full max-w-[650px] shadow-2xl flex flex-col items-center text-center relative animate-in zoom-in-95 duration-300 z-10">
        
        <h2 className="text-[24px] font-extrabold text-[#022C4F] mb-4">
          Deliverable Submitted Successfully
        </h2>
        <p className="text-[13px] text-gray-600 mb-12 max-w-[500px] leading-relaxed">
          Your deliverable has been submitted and entered the review workflow. Assigned reviewers have been notified, and the submission is now available in the Deliverables section for tracking and approval.
        </p>

        {/* Success Icon */}
        <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
          <div className="absolute inset-0 border-[4px] border-[#4CAF50] rounded-full"></div>
          <div className="w-[104px] h-[104px] bg-[#4CAF50] rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-white" strokeWidth={4} />
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-4 max-w-[500px]">
          <button 
            onClick={onClose}
            className="w-full bg-[#022C4F] hover:bg-[#033A6B] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
          >
            View Deliverable
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-[#111827] hover:bg-[#1F2937] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
          >
            Track Review Comments
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-[#005C8A] hover:bg-[#004A70] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
          >
            Schedule Review Session
          </button>
        </div>
      </div>
    </div>
  );
}
