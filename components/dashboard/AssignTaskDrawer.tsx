import React, { useState } from 'react';
import { X, Calendar, Paperclip, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface AssignTaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  role: string;
}

export default function AssignTaskDrawer({ isOpen, onClose, memberName, role }: AssignTaskDrawerProps) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');

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
                <h2 className="text-xl font-bold text-[#022C4F]">Assign Task</h2>
                <p className="text-[12px] text-gray-500 font-medium mt-1">
                  Assigning to: <span className="text-[#022C4F] font-bold">{memberName}</span>
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#022C4F] transition-colors shadow-sm shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Assignee Card */}
              <div className="bg-[#022C4F]/5 border border-[#022C4F]/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#022C4F] shrink-0 shadow-sm">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#022C4F]">{memberName}</h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">{role}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Task Title</label>
                  <input 
                    type="text" 
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="e.g. Review Foundation Load Calculations" 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-[#0F181F] placeholder:text-gray-400 focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Priority</label>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-[#0F181F] bg-white focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-shadow appearance-none">
                      <option value="high">High Priority</option>
                      <option value="medium" selected>Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Due Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-[13px] text-[#0F181F] focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-shadow"
                      />
                      <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the task..." 
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-[#0F181F] placeholder:text-gray-400 focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-shadow resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Attachments</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-[#022C4F]/30 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-[#022C4F] mb-3 shadow-sm transition-colors">
                      <Paperclip size={18} />
                    </div>
                    <p className="text-[12px] font-bold text-gray-600">Click to upload files</p>
                    <p className="text-[10px] text-gray-400 mt-1">PDF, DOCX, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-[#FAFAFA] flex justify-end gap-3">
               <Button 
                 variant="outline"
                 onClick={onClose}
               >
                 Cancel
               </Button>
               <Button 
                 variant="primary"
                 onClick={() => {
                   window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Task assigned successfully!', type: 'success' } }));
                   onClose();
                 }}
               >
                 Send Assignment
               </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
