import React, { useState } from 'react';
import { X, Calendar, Square, CheckSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface GenerateReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GenerateReportDrawer({ isOpen, onClose }: GenerateReportDrawerProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const sections = {
    'Review Summary': [
      'Review Overview',
      'Review Objectives',
      'Review Scope',
      'Review Timeline'
    ],
    'Reviewer Information': [
      'Reviewer List',
      'Reviewer Roles',
      'Review Participation Metrics',
      'Review Completion Status'
    ],
    'Feedback & Comments': [
      'All Review Comments',
      'Comment Resolution Status',
      'Reviewer Recommendations',
      'Design Concerns Identified'
    ],
    'Annotations & Markups': [
      'Drawing Annotations',
      'Technical Markups',
      'Design Revisions Requested',
      'Resolved Annotations'
    ]
  };

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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 w-full max-w-[550px] bg-white shadow-2xl z-[210] flex flex-col border-l border-gray-100"
          >
            {/* Header / Intro */}
            <div className="flex items-start justify-between p-8 pt-10">
              <div>
                <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-3">Generate Peer Review Report</h2>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed pr-6 max-w-sm">
                  Compile reviewer feedback, annotations, recommendations, endorsements, and approval outcomes into a comprehensive review report for project stakeholders.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#022C4F] transition-colors shadow-sm shrink-0"
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
                    <span className="text-[11px] font-medium text-gray-600">Peer Review Summary Report</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#0F181F] mb-1">Review Period</span>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-[11px] font-medium">June 10, 2026 - June 25, 2026</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[11px] font-bold text-[#0F181F] mb-1">Current Reviewers</span>
                    <span className="text-[11px] font-medium text-gray-600">4 Assigned</span>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Include Sections */}
              <div>
                <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Include Sections</h3>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[12px] font-bold text-[#0F181F] mb-2">Review Summary</h4>
                    {sections['Review Summary'].map(item => (
                      <div key={item} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleCheck(item)}>
                        <div className={`w-[14px] h-[14px] border flex items-center justify-center transition-colors ${checkedItems[item] ? 'border-[#0F181F] bg-[#0F181F]' : 'border-gray-300'}`}>
                          {checkedItems[item] && <CheckSquare size={10} className="text-white" />}
                        </div>
                        <span className="text-[11px] text-gray-600 font-medium group-hover:text-gray-900">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <h4 className="text-[12px] font-bold text-[#0F181F] mb-2">Reviewer Information</h4>
                    {sections['Reviewer Information'].map(item => (
                      <div key={item} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleCheck(item)}>
                        <div className={`w-[14px] h-[14px] border flex items-center justify-center transition-colors ${checkedItems[item] ? 'border-[#0F181F] bg-[#0F181F]' : 'border-gray-300'}`}>
                          {checkedItems[item] && <CheckSquare size={10} className="text-white" />}
                        </div>
                        <span className="text-[11px] text-gray-600 font-medium group-hover:text-gray-900">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <h4 className="text-[12px] font-bold text-[#0F181F] mb-2">Feedback & Comments</h4>
                    {sections['Feedback & Comments'].map(item => (
                      <div key={item} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleCheck(item)}>
                        <div className={`w-[14px] h-[14px] border flex items-center justify-center transition-colors ${checkedItems[item] ? 'border-[#0F181F] bg-[#0F181F]' : 'border-gray-300'}`}>
                          {checkedItems[item] && <CheckSquare size={10} className="text-white" />}
                        </div>
                        <span className="text-[11px] text-gray-600 font-medium group-hover:text-gray-900">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <h4 className="text-[12px] font-bold text-[#0F181F] mb-2">Annotations & Markups</h4>
                    {sections['Annotations & Markups'].map(item => (
                      <div key={item} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleCheck(item)}>
                        <div className={`w-[14px] h-[14px] border flex items-center justify-center transition-colors ${checkedItems[item] ? 'border-[#0F181F] bg-[#0F181F]' : 'border-gray-300'}`}>
                          {checkedItems[item] && <CheckSquare size={10} className="text-white" />}
                        </div>
                        <span className="text-[11px] text-gray-600 font-medium group-hover:text-gray-900">{item}</span>
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
                   window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Report Generated successfully!', type: 'success' } }));
                   onClose();
                 }}
                 className="!w-full h-[48px]"
               >
                 Generate Report
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
