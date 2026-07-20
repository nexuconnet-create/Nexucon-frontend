'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ApprovalWorkflowStepper from '@/components/dashboard/ApprovalWorkflowStepper';

interface ReviewDrawingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewDrawingDrawer({ isOpen, onClose }: ReviewDrawingDrawerProps) {
  const [isConfirmingApproval, setIsConfirmingApproval] = useState(false);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[600px] bg-white rounded-l-[32px] shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-10 pb-6 relative shrink-0">
              <button
                onClick={onClose}
                className="absolute top-8 right-8 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-[28px] font-extrabold text-[#022C4F] mb-3 pr-12">Review Drawing Submission</h2>
              <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                Review submitted drawings, provide feedback, add annotations, and submit your approval decision.
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">

              {/* Drawing Information */}
              <div className="mb-8">
                <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Drawing Information</h3>

                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Drawing Name</h4>
                    <p className="text-[11px] text-gray-500 font-medium">Structural Foundation Layout - Revision 03</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Discipline</h4>
                    <p className="text-[11px] text-gray-500 font-medium">Structural Engineering</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Project</h4>
                    <p className="text-[11px] text-gray-500 font-medium">Victoria Heights Residential Estate</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Submitted by</h4>
                    <p className="text-[11px] text-gray-500 font-medium">Sarah Okafor - Civil Engineer</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Submission Date</h4>
                    <p className="text-[11px] text-gray-500 font-medium">June 17, 2026 • 10:42 AM</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Version</h4>
                    <p className="text-[11px] text-gray-500 font-medium">V3.0</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Status</h4>
                    <p className="text-[11px] text-gray-500 font-medium">Awaiting Client Review</p>
                  </div>
                </div>
              </div>

              {/* Approval Workflow Progress */}
              <ApprovalWorkflowStepper />

              {/* Floor Plan Image */}
              <div className="w-full rounded-2xl overflow-hidden border border-gray-200">
                {/* Fallback pattern in case image doesn't load immediately */}
                <div className="w-full h-[320px] bg-[#f8f9fa] relative flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#022C4F 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  <img
                    src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784538199/3_Bedroom_House_Plan_-_ID_13501_-_CAD_PDF___Architectural_Drawings_2_eihftb.png"
                    alt="Floor Plan Layout"
                    className="w-full h-full object-cover relative z-10 opacity-90 mix-blend-multiply grayscale"
                  />
                  {/* Decorative text overlay to simulate technical drawing */}
                  <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 -rotate-90 text-[12px] font-mono tracking-[0.2em] font-bold text-[#022C4F] z-20 mix-blend-color-burn">
                    TYPICAL FLOOR PLAN
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-10 pt-6 mt-auto shrink-0 bg-white border-t border-gray-100 flex flex-col gap-3">
              <AnimatePresence mode="wait">
                {isConfirmingApproval ? (
                  <motion.div 
                    key="confirm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-2">
                      <p className="text-[12px] text-orange-800 font-bold mb-1">Confirm Approval</p>
                      <p className="text-[11px] text-orange-700">Are you sure you want to approve this drawing? This will advance the project to the next phase.</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsConfirmingApproval(false)}
                        className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl text-[14px] font-bold hover:bg-gray-200 transition-colors shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setIsConfirmingApproval(false);
                          window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Drawings approved successfully!', type: 'success' } }));
                          onClose();
                        }}
                        className="w-full py-4 bg-[#022C4F] text-white rounded-2xl text-[14px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
                      >
                        Confirm Approval
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-3"
                  >
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Changes requested successfully!', type: 'success' } }));
                        onClose();
                      }}
                      className="w-full py-4 bg-[#022C4F] text-white rounded-2xl text-[14px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
                    >
                      Request Changes
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Comparing versions side-by-side...', type: 'info' } }));
                        }}
                        className="w-full py-4 bg-white text-[#0F181F] border border-gray-200 rounded-2xl text-[14px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Compare
                      </button>
                      <button
                        onClick={() => setIsConfirmingApproval(true)}
                        className="w-full py-4 bg-white text-[#0F181F] border border-gray-300 rounded-2xl text-[14px] font-bold hover:border-[#022C4F] hover:text-[#022C4F] transition-colors shadow-sm"
                      >
                        Approve Final Design
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
