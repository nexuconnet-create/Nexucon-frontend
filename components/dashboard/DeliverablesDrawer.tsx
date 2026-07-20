import React from 'react';
import { X, FileText, Download, CheckCircle, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface Deliverable {
  id: string;
  name: string;
  status: 'Approved' | 'In Progress' | 'Under Review';
  date: string;
  size: string;
}

interface DeliverablesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  role: string;
  deliverables: Deliverable[];
}

export default function DeliverablesDrawer({ isOpen, onClose, memberName, role, deliverables }: DeliverablesDrawerProps) {
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
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[210] flex flex-col border-l border-gray-100"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#FAFAFA]">
              <div>
                <h2 className="text-xl font-bold text-[#022C4F]">Deliverables</h2>
                <p className="text-[12px] text-gray-500 font-medium mt-1">
                  {memberName} • <span className="text-[#022C4F]">{role}</span>
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#022C4F] transition-colors shadow-sm shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {deliverables.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FileText size={48} className="mb-4 opacity-50" />
                  <p className="text-[13px] font-medium">No deliverables found.</p>
                </div>
              ) : (
                deliverables.map((doc) => (
                  <div key={doc.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 hover:border-[#022C4F]/20 transition-colors hover:shadow-md bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#022C4F]/5 flex items-center justify-center text-[#022C4F] shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-[#0F181F] leading-tight">{doc.name}</h4>
                          <p className="text-[11px] text-gray-500 mt-1">{doc.size} • {doc.date}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        {doc.status === 'Approved' ? (
                          <CheckCircle size={14} className="text-[#4CAF50]" />
                        ) : (
                          <Clock size={14} className="text-[#D4AC0D]" />
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${
                          doc.status === 'Approved' ? 'text-[#4CAF50]' :
                          doc.status === 'Under Review' ? 'text-[#D4AC0D]' :
                          'text-blue-500'
                        }`}>
                          {doc.status}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-[#022C4F] text-[10px] font-bold rounded-lg transition-colors border border-gray-200">
                          View
                        </button>
                        <button className="px-3 py-1.5 bg-[#022C4F] hover:bg-[#033A6B] text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1">
                          <Download size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-[#FAFAFA] flex justify-center">
               <Button variant="outline">
                 Request New Deliverable
               </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
