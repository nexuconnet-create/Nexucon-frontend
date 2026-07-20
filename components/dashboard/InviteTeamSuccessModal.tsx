import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import Button from '@/components/ui/Button';

interface InviteTeamSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteAnother: () => void;
}

export default function InviteTeamSuccessModal({ isOpen, onClose, onInviteAnother }: InviteTeamSuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0F181F]/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-12 flex flex-col items-center text-center"
          >
            <h2 className="text-[24px] font-extrabold text-[#022C4F] mb-4">
              Invitation Sent Successfully
            </h2>
            <p className="text-[13px] text-gray-600 font-medium max-w-md mx-auto leading-relaxed mb-10">
              The invitation has been sent to the selected team member. Once accepted, they will be added to the project team with the assigned role, permissions, and access to the Design Workspace.
            </p>

            <div className="w-32 h-32 rounded-full border-4 border-[#4CAF50] flex items-center justify-center bg-[#4CAF50] mb-12 shadow-lg">
              <Check size={64} className="text-white" strokeWidth={3} />
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm">
              <Button 
                variant="primary" 
                className="!w-full h-[56px] text-[14px]"
                onClick={() => {
                  onClose();
                  onInviteAnother();
                }}
              >
                Invite Another Team Member
              </Button>
              <Button 
                variant="outline" 
                className="!w-full h-[56px] text-[14px] bg-[#0F181F] text-white hover:bg-black border-none"
                onClick={onClose}
              >
                View Team Member
              </Button>
              <Button 
                variant="primary" 
                className="!w-full h-[56px] text-[14px] bg-[#005A9C] hover:bg-[#004A80] border-none"
                onClick={onClose}
              >
                Resend Invitation
              </Button>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
