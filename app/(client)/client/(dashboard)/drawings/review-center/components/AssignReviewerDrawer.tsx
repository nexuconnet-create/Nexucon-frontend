'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface AssignReviewerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignReviewerDrawer({ isOpen, onClose }: AssignReviewerDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const reviewerTypes = [
    'Internal Team Member',
    'External Consultant',
    'Peer Reviewer',
    'Technical Specialist',
    'Client Representative'
  ];

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

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
              <h2 className="text-[28px] font-extrabold text-[#022C4F] mb-3 pr-12">Assign Reviewer</h2>
              <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                Invite internal team members, consultants, or external reviewers to evaluate drawings, documents, and design packages before approval.
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">

              {/* Review Information */}
              <div className="mb-10">
                <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Review Information</h3>

                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Review Item</h4>
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
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Current Reviewers</h4>
                    <p className="text-[11px] text-gray-500 font-medium">3 Assigned</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Required Reviewers</h4>
                    <p className="text-[11px] text-gray-500 font-medium">4 Reviewers</p>
                  </div>
                </div>
              </div>

              {/* Search Reviewer */}
              <div className="mb-10">
                <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-4">Search Reviewer</h3>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, discipline, specialization, or organization..."
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 text-[12px] text-[#0F181F] placeholder-gray-400 focus:outline-none focus:border-[#022C4F] transition-colors shadow-sm"
                />
              </div>

              {/* Reviewer Type */}
              <div>
                <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-4">Reviewer Type</h3>
                <div className="flex flex-col gap-4">
                  {reviewerTypes.map((type) => {
                    const isSelected = selectedTypes.includes(type);
                    return (
                      <div 
                        key={type} 
                        className="flex items-center gap-4 cursor-pointer group"
                        onClick={() => toggleType(type)}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-black border-black' : 'border-gray-400 group-hover:border-black'}`}>
                          {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[12px] font-medium text-[#0F181F]">{type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-10 pt-6 mt-auto shrink-0 bg-white border-t border-gray-100 flex flex-col gap-3">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Reviewer assigned successfully!', type: 'success' } }));
                  onClose();
                  setSearchQuery('');
                  setSelectedTypes([]);
                }}
                className="w-full py-4 bg-[#022C4F] text-white rounded-2xl text-[14px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
              >
                Assign Reviewer
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
