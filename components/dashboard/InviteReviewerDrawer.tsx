import React, { useState } from 'react';
import { X, Square, CheckSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface InviteReviewerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InviteReviewerDrawer({ isOpen, onClose, onSuccess }: InviteReviewerDrawerProps) {
  const [priority, setPriority] = useState<string>('Standard');

  const priorityOptions = ['Standard', 'High Priority', 'Urgent'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[200]"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 sm:right-4 top-0 sm:top-4 bottom-0 sm:bottom-4 w-full sm:w-[500px] max-w-[500px] bg-white sm:rounded-[32px] shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header / Intro */}
            <div className="flex items-start justify-between p-8 pt-10">
              <div>
                <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-3">Invite Reviewer</h2>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed pr-6 max-w-sm">
                  Invite internal team members, external consultants, or independent professionals to participate in the peer review process for project drawings, reports, and technical documentation.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#022C4F] transition-colors shadow-sm shrink-0 -mt-2 -mr-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-8">
              
              {/* Review Information */}
              <div>
                <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Review Information</h3>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <span className="block text-[11px] font-bold text-[#0F181F] mb-1">Project</span>
                    <span className="text-[11px] font-medium text-gray-600">Victoria Heights Residential Estate</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#0F181F] mb-1">Review Package</span>
                    <span className="text-[11px] font-medium text-gray-600">Structural Design Package V3.0</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#0F181F] mb-1">Review Type</span>
                    <span className="text-[11px] font-medium text-gray-600">Peer Review</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#0F181F] mb-1">Review Deadline</span>
                    <span className="text-[11px] font-medium text-gray-600">June 25, 2026</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[11px] font-bold text-[#0F181F] mb-1">Current Reviewers</span>
                    <span className="text-[11px] font-medium text-gray-600">4 Assigned</span>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Form Fields */}
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-[#0F181F] mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full h-11 px-4 text-[13px] border border-gray-300 rounded-lg focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-[#0F181F] mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full h-11 px-4 text-[13px] border border-gray-300 rounded-lg focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0F181F] mb-4">Priority Level</label>
                  <div className="flex gap-6">
                    {priorityOptions.map((opt) => (
                      <div 
                        key={opt}
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => setPriority(opt)}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${priority === opt ? 'bg-[#0F181F] border-[#0F181F]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                          {priority === opt && <CheckSquare size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[11px] text-gray-600 font-medium">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
            </div>
            
            {/* Footer Buttons */}
            <div className="p-8 pb-10 bg-white flex flex-col gap-3">
               <Button 
                 variant="primary"
                 onClick={() => {
                   if (onSuccess) onSuccess();
                   else onClose();
                 }}
                 className="!w-full h-[48px]"
               >
                 Send Invitation
               </Button>
               
               <Button 
                 variant="outline"
                 onClick={() => {
                   window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Draft Saved.', type: 'info' } }));
                   onClose();
                 }}
                 className="!w-full h-[48px] bg-[#0F181F] text-white hover:bg-black border-none"
               >
                 Save Draft
               </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
