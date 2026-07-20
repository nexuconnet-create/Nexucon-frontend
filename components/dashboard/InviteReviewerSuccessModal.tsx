import React from 'react';
import { Check } from 'lucide-react';
import Button from '@/components/ui/Button';

interface InviteReviewerSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteAnother: () => void;
}

export default function InviteReviewerSuccessModal({ isOpen, onClose, onInviteAnother }: InviteReviewerSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center px-4 sm:px-6">
      <div 
        className="absolute inset-0 bg-[#022C4F]/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-3xl bg-white rounded-[24px] shadow-2xl p-8 md:p-14 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 ease-out z-10">
        
        <h2 className="text-[20px] md:text-[24px] font-extrabold text-[#022C4F] mb-4">
          Invitation Sent Successfully
        </h2>
        
        <p className="text-[12px] md:text-[13px] text-gray-600 mb-10 max-w-lg leading-relaxed">
          The reviewer has been invited and will receive access to the selected drawings, documents, review sessions, and collaboration tools upon accepting the invitation.
        </p>
        
        {/* Checkmark Circle */}
        <div className="relative flex items-center justify-center mb-10 w-32 h-32 md:w-36 md:h-36">
          <div className="absolute inset-0 rounded-full border-4 border-[#4CAF50]"></div>
          <div className="absolute inset-[6px] rounded-full bg-[#4CAF50] flex items-center justify-center border-[6px] border-white shadow-inner">
            <Check size={56} className="text-white stroke-[4]" />
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          <Button 
            variant="primary"
            onClick={onInviteAnother}
            className="!w-full h-[48px]"
          >
            Invite Another Reviewer
          </Button>
          
          <Button 
            onClick={onClose}
            className="!w-full h-[48px] bg-[#0F181F] text-white hover:bg-black border-none"
          >
            View Review Team
          </Button>

          <Button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Invitation Resent.', type: 'info' } }));
            }}
            className="!w-full h-[48px] bg-[#005A9C] text-white hover:bg-[#004A80] border-none"
          >
            Resend Invitation
          </Button>
        </div>

      </div>
    </div>
  );
}
