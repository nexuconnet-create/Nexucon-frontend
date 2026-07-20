import React from 'react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface ApprovalSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApprovalSuccessModal({ isOpen, onClose }: ApprovalSuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 sm:px-6">
      <div 
        className="absolute inset-0 bg-[#022C4F]/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-[24px] shadow-2xl p-8 md:p-14 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 ease-out z-10">
        
        <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#022C4F] mb-6">
          Design Package Approved
        </h2>
        
        <p className="text-[13px] md:text-[14px] text-[#0F181F] font-medium mb-4 max-w-xl">
          Congratulations! The project has successfully completed the design and review phase.
        </p>
        
        <p className="text-[13px] md:text-[14px] text-gray-600 mb-10 max-w-2xl leading-relaxed">
          The project is now marked as <span className="font-bold text-[#0F181F]">Ready for Execution</span> and can proceed with contractor selection, professional onboarding, procurement planning, and construction preparation.
        </p>

        {/* Checkmark Circle */}
        <div className="relative flex items-center justify-center mb-10 w-36 h-36">
          <div className="absolute inset-0 rounded-full border-4 border-[#4CAF50]"></div>
          <div className="absolute inset-[6px] rounded-full bg-[#4CAF50] flex items-center justify-center border-[6px] border-white shadow-inner">
            <Check size={56} className="text-white stroke-[4]" />
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-md flex flex-col items-center gap-3">
          <Button 
            variant="primary"
            onClick={() => { onClose(); router.push('/client/construction-handoff'); }}
          >
            View Execution Hub
          </Button>
          
          <Button 
            onClick={() => { onClose(); router.push('/client/hire-professionals'); }}
            className="bg-[#0F181F] text-white hover:bg-black"
          >
            Hire Contractor
          </Button>

          <Button 
            onClick={() => { onClose(); router.push('/client/team'); }}
            className="bg-[#005A9C] text-white hover:bg-[#004A80]"
          >
            Build Execution Team
          </Button>
        </div>

      </div>
    </div>
  );
}
