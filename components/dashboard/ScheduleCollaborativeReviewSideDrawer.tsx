import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ScheduleCollaborativeReviewSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleCollaborativeReviewSideDrawer({ isOpen, onClose }: ScheduleCollaborativeReviewSideDrawerProps) {
  const [platform, setPlatform] = useState('Nexucon Collaboration');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100]"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 sm:right-4 top-0 sm:top-4 bottom-0 sm:bottom-4 w-full sm:w-[500px] max-w-[500px] bg-white sm:rounded-[32px] shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <h2 className="text-[24px] font-extrabold text-[#022C4F] mb-3">Schedule Collaborative Review</h2>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-8">
                Plan a collaborative design review session where architects, engineers, consultants, clients, and external reviewers can discuss drawings, BIM models, annotations, and design decisions together.
              </p>

              <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Session Information</h3>

              <div className="flex flex-col gap-6 mb-8">
                <div>
                  <label className="block text-[11px] font-extrabold text-[#022C4F] mb-2">Review Session Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 text-[13px] text-[#0F181F] focus:outline-none focus:border-[#022C4F]"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-extrabold text-[#022C4F] mb-2">Select Review Type</label>
                  <div className="relative">
                    <select className="w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 text-[13px] text-[#0F181F] appearance-none focus:outline-none focus:border-[#022C4F]">
                      <option></option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#022C4F] mb-2">Project</label>
                  <p className="text-[12px] text-gray-500">Victoria Heights Commercial Development</p>
                </div>
              </div>

              <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Review Date</h3>

              <div className="flex gap-4 mb-8">
                <div className="flex-1">
                  <label className="block text-[11px] font-extrabold text-[#022C4F] mb-2">Select Date</label>
                  <div className="relative">
                    <select className="w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 text-[13px] text-[#0F181F] appearance-none focus:outline-none focus:border-[#022C4F]">
                      <option></option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-extrabold text-[#022C4F] mb-2">Start Time</label>
                  <div className="relative">
                    <select className="w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 text-[13px] text-[#0F181F] appearance-none focus:outline-none focus:border-[#022C4F]">
                      <option></option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Meeting Platform</h3>

              <div className="grid grid-cols-3 gap-2 mb-8">
                {['Nexucon Collaboration', 'Google Meet', 'Microsoft Teams'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`flex items-center gap-2 p-3 rounded-lg border ${platform === p ? 'border-[#022C4F] bg-[#FAFAFA]' : 'border-[#E5E7EB]'} transition-colors`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${platform === p ? 'border-[#022C4F]' : 'border-gray-300'}`}>
                      {platform === p && <div className="w-2.5 h-2.5 rounded-full bg-[#022C4F]" />}
                    </div>
                    <span className="text-[10px] text-[#0F181F] font-medium leading-tight">{p}</span>
                  </button>
                ))}
              </div>

              <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Meeting Agenda</h3>

              <div className="mb-4">
                <textarea 
                  rows={8}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 text-[13px] text-[#0F181F] focus:outline-none focus:border-[#022C4F] resize-none"
                />
              </div>

            </div>
            
            <div className="p-8 border-t border-[#E5E7EB] flex flex-col gap-3">
              <Button onClick={() => {
                alert("Review Scheduled!");
                onClose();
              }} variant="primary" className="w-full justify-center py-4 text-[13px]">
                Schedule Review
              </Button>
              <Button onClick={() => {
                alert("Saved as Draft");
                onClose();
              }} variant="outline" className="w-full justify-center py-4 text-[13px] bg-[#0F181F] text-white border-none hover:bg-gray-800 hover:text-white">
                Save as Draft
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
