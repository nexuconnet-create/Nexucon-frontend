import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Search } from 'lucide-react';
import Button from '@/components/ui/Button';

interface StartDiscussionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StartDiscussionDrawer({ isOpen, onClose }: StartDiscussionDrawerProps) {
  const [formData, setFormData] = useState({
    recipients: '',
    subject: '',
    message: '',
  });

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
            className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 sm:right-4 top-0 sm:top-4 bottom-0 sm:bottom-4 w-full sm:w-[500px] max-w-[500px] bg-white sm:rounded-[32px] shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 pb-6 border-b border-gray-100 flex items-start justify-between">
              <div className="pr-8">
                <h2 className="text-[24px] font-extrabold text-[#022C4F] mb-2">Start Discussion</h2>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed mt-2">
                  Initiate a new conversation with team members, contractors, or external collaborators to discuss project details.
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
            <div className="flex-1 overflow-y-auto p-8 flex flex-col">
              
              {/* Form Fields */}
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-[#0F181F] mb-2">To:</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search team members by name or role..."
                      value={formData.recipients}
                      onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                      className="w-full h-12 rounded-xl border border-[#022C4F] px-4 pl-10 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"
                    />
                    <div className="absolute left-4 top-[14px] pointer-events-none text-gray-500">
                      <Search size={18} />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Enter discussion subject..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-12 rounded-xl border border-[#022C4F] px-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Message</label>
                  <textarea
                    placeholder="Type your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full h-64 rounded-xl border border-[#022C4F] p-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm resize-none"
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-8 pt-6 border-t border-gray-100 flex justify-end mt-auto">
              <Button 
                variant="primary" 
                className="w-32 h-[48px] flex items-center justify-center gap-2"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Discussion started successfully!', type: 'success' } }));
                  onClose();
                }}
              >
                <Send size={16} />
                Send
              </Button>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
