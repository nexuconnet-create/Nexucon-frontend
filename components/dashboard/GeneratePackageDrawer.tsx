import React from 'react';
import { X, CheckCircle, Square, CheckSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface GeneratePackageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeneratePackageDrawer({ isOpen, onClose }: GeneratePackageDrawerProps) {
  const technicalDocs = [
    'Architectural Drawings',
    'Structural Drawings',
    'Mechanical Drawings',
    'Electrical Drawings',
    'Plumbing Drawings',
    'Site Development Plans'
  ];

  const commercialDocs = [
    'Bill of Quantities (BOQ)',
    'Cost Estimates',
    'Procurement Schedule',
    'Material Specifications'
  ];

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
            className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-white shadow-2xl z-[210] flex flex-col border-l border-gray-100"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-8 border-b border-gray-100 bg-white">
              <div>
                <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-3">Generate Construction Package</h2>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed max-w-sm">
                  Compile all approved project deliverables, drawings, reports, specifications, and endorsements into a single construction-ready package for contractors, consultants, and execution teams.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#022C4F] transition-colors shadow-sm shrink-0 mt-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10">
              
              {/* Project Information */}
              <div>
                <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Project Information</h3>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <span className="block text-[11px] font-bold text-[#0F181F] mb-1">Project</span>
                    <span className="text-[11px] font-medium text-blue-600">Foundation Layout Package V3.0</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#0F181F] mb-1">Project ID</span>
                    <span className="text-[11px] font-medium text-gray-600">NEX-PRJ-2026-048</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#0F181F] mb-1">Design Status</span>
                    <div className="flex items-center gap-1.5 text-[#8BC34A]">
                      <CheckCircle size={14} strokeWidth={3} />
                      <span className="text-[11px] font-bold">Approved</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#0F181F] mb-1">Construction Readiness</span>
                    <span className="text-[11px] font-medium text-gray-600">98%</span>
                  </div>
                </div>
              </div>

              {/* Document Lists */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex flex-col gap-4">
                    {technicalDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded flex items-center justify-center bg-[#0F181F] shrink-0">
                          <CheckSquare size={14} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="text-[11px] text-gray-700 font-medium">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-[#0F181F] mb-5">Commercial Documentation</h4>
                  <div className="flex flex-col gap-4">
                    {commercialDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded flex items-center justify-center bg-[#0F181F] shrink-0">
                          <CheckSquare size={14} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="text-[11px] text-gray-700 font-medium">{doc}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <span className="text-[11px] font-extrabold text-[#0F181F]">42 Documents Included</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-6">
                <span className="text-[11px] font-extrabold text-[#0F181F]">42 Documents Included</span>
              </div>
            </div>
            
            {/* Footer Buttons */}
            <div className="p-8 border-t border-gray-100 bg-white flex flex-col items-center gap-3">
               <Button 
                 variant="primary"
                 onClick={() => {
                   window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Package generated successfully!', type: 'success' } }));
                   onClose();
                 }}
               >
                 Generate Package
               </Button>
               
               <Button 
                 variant="outline"
                 onClick={() => {
                   window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Preview loading...', type: 'info' } }));
                 }}
                 className="bg-[#0F181F] text-white hover:bg-black border-none"
               >
                 Preview Package
               </Button>

               <Button 
                 variant="danger"
                 onClick={onClose}
               >
                 Cancel
               </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
