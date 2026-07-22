import React from 'react';
import { Check } from 'lucide-react';

interface InviteTeamSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteAnother: () => void;
}

export default function InviteTeamSuccessModal({ isOpen, onClose, onInviteAnother }: InviteTeamSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[2rem] w-full max-w-[600px] p-12 flex flex-col items-center text-center shadow-2xl relative"
      >
        <h2 className="text-[24px] font-extrabold text-[#022C4F] mb-4">
          Invitation Sent Successfully
        </h2>
        
        <p className="text-[13px] text-gray-500 font-medium leading-relaxed mb-10 max-w-[450px]">
          The invitation has been sent to the selected team member. Once accepted, they will automatically gain access to the assigned project workspaces and collaboration tools based on the selected permissions.
        </p>
        
        <div className="w-28 h-28 bg-[#4CAF50] rounded-full flex items-center justify-center mb-10 border-[6px] border-white shadow-[0_0_0_2px_#4CAF50]">
          <Check size={56} className="text-white" strokeWidth={3} />
        </div>
        
        <div className="flex flex-col gap-3 w-full max-w-[400px]">
          <button 
            onClick={() => {
              onClose();
              onInviteAnother();
            }}
            className="w-full bg-[#022C4F] text-white py-4 rounded-xl text-[13px] font-bold hover:bg-[#033A6B] transition-colors"
          >
            Invite Another Member
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-white border border-[#022C4F] text-[#022C4F] py-4 rounded-xl text-[13px] font-bold hover:bg-[#022C4F]/5 transition-colors"
          >
            View Team Members
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-[#0F181F] text-white py-4 rounded-xl text-[13px] font-bold hover:bg-black transition-colors"
          >
            Edit Permissions
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-[#0369a1] text-white py-4 rounded-xl text-[13px] font-bold hover:bg-[#0284c7] transition-colors"
          >
            Track Invitation Status
          </button>
        </div>
      </div>
    </div>
  );
}
