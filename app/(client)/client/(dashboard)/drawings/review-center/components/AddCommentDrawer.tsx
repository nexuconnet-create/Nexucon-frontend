'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AddCommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCommentDrawer({ isOpen, onClose }: AddCommentDrawerProps) {
  const [comment, setComment] = useState('');

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
              <h2 className="text-[28px] font-extrabold text-[#022C4F] mb-3 pr-12">Add Review Comments</h2>
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

              {/* Text Area */}
              <div className="w-full">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add comments, observations, approval notes, or revision requests..."
                  className="w-full h-[240px] rounded-xl border border-[#022C4F] p-4 text-[12px] text-[#0F181F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F]/20 transition-all resize-none"
                />
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-10 pt-6 mt-auto shrink-0 bg-white border-t border-gray-100 flex flex-col gap-3">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Comment submitted successfully!', type: 'success' } }));
                  onClose();
                  setComment('');
                }}
                className="w-full py-4 bg-[#022C4F] text-white rounded-2xl text-[14px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
              >
                Submit Comment
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 bg-[#F23005] text-white rounded-2xl text-[14px] font-bold hover:bg-[#D92A04] transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
