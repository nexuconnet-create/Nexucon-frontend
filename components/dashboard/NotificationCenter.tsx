import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CreditCard, FileText, Landmark, X, Settings, ArrowLeft } from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'feed' | 'preferences'>('feed');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#022C4F]/40 backdrop-blur-sm z-50"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col sm:rounded-l-[30px] overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {view === 'preferences' && (
                    <button onClick={() => setView('feed')} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <h2 className="text-xl font-extrabold text-[#022C4F]">
                    {view === 'preferences' ? 'Notification Preferences' : 'Notification Center'}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  {view === 'feed' && (
                    <button
                      onClick={() => setView('preferences')}
                      className="p-1.5 text-gray-400 hover:text-[#022C4F] hover:bg-gray-100 rounded-full transition-colors"
                      title="Preferences"
                    >
                      <Settings size={18} />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-[#0F181F] hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tabs (Only in feed view) */}
              {view === 'feed' && (
                <div className="flex flex-wrap items-center bg-gray-100 p-1.5 rounded-xl gap-1">
                  <button className="flex-1 min-w-[70px] py-1.5 text-[10px] font-bold bg-white text-[#0F181F] rounded-lg shadow-sm">
                    All
                  </button>
                  <button className="flex-1 min-w-[70px] py-1.5 text-[10px] font-medium text-gray-500 hover:text-[#0F181F] transition-colors">
                    Documents
                  </button>
                  <button className="flex-1 min-w-[70px] py-1.5 text-[10px] font-medium text-gray-500 hover:text-[#0F181F] transition-colors">
                    Comments
                  </button>
                  <button className="flex-1 min-w-[70px] py-1.5 text-[10px] font-medium text-gray-500 hover:text-[#0F181F] transition-colors">
                    Approvals
                  </button>
                  <button className="flex-1 min-w-[80px] py-1.5 text-[10px] font-medium text-gray-500 hover:text-[#0F181F] transition-colors">
                    Team Changes
                  </button>
                  <button className="flex-1 min-w-[80px] py-1.5 text-[10px] font-medium text-gray-500 hover:text-[#0F181F] transition-colors">
                    System Alerts
                  </button>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {view === 'preferences' ? (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <p className="text-[12px] text-gray-500 leading-relaxed font-medium mb-2">
                    Customize how you want to be notified about project updates.
                  </p>
                  
                  {/* Pref 1 */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div className="pr-4">
                      <h4 className="text-[13px] font-bold text-[#0F181F] mb-1">Email Approvals</h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Receive an email when your approval is required on drawings or documents.</p>
                    </div>
                    <div className="relative inline-block w-10 h-6 shrink-0 rounded-full bg-[#022C4F] cursor-pointer shadow-inner">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform translate-x-4 shadow-sm"></div>
                    </div>
                  </div>

                  {/* Pref 2 */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div className="pr-4">
                      <h4 className="text-[13px] font-bold text-[#0F181F] mb-1">SMS for Urgent Risks</h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Get an SMS text message immediately when a critical risk or delay is flagged.</p>
                    </div>
                    <div className="relative inline-block w-10 h-6 shrink-0 rounded-full bg-[#022C4F] cursor-pointer shadow-inner">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform translate-x-4 shadow-sm"></div>
                    </div>
                  </div>

                  {/* Pref 3 */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div className="pr-4">
                      <h4 className="text-[13px] font-bold text-[#0F181F] mb-1">In-App Only (Mentions)</h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Only notify me inside the app when someone mentions me directly.</p>
                    </div>
                    <div className="relative inline-block w-10 h-6 shrink-0 rounded-full bg-gray-300 cursor-pointer shadow-inner">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm"></div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Preferences saved successfully.', type: 'success' } }));
                      setView('feed');
                    }}
                    className="mt-6 w-full py-4 bg-[#022C4F] text-white rounded-xl text-[13px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
                  >
                    Save Preferences
                  </button>
                </div>
              ) : (
                <div className="flex flex-col animate-in fade-in duration-300">

                {/* Notification Item 1 */}
                <div className="py-6 border-b border-[#0F181F]/10 flex gap-4">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-xs font-extrabold text-[#022C4F]">Approval Required</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                      Victoria Heights Estate - Engr. Michael Adeyemi submitted a foundation inspection report for your review.
                    </p>
                  </div>
                </div>

                {/* Notification Item 2 */}
                <div className="py-6 border-b border-[#0F181F]/10 flex gap-4">
                  <div className="mt-1 relative">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                      <CreditCard size={16} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 size={8} className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-xs font-extrabold text-[#022C4F]">Payment Action Needed</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                      Milestone 2 for Lekki Commercial Plaza has been approved and is awaiting payment release.
                    </p>
                  </div>
                </div>

                {/* Notification Item 3 */}
                <div className="py-6 border-b border-[#0F181F]/10 flex gap-4">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                      <FileText size={16} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-xs font-extrabold text-[#022C4F]">New Proposal Received</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                      A verified Structural Engineer has submitted a proposal for Green Valley Apartments.
                    </p>
                  </div>
                </div>

                {/* Notification Item 4 */}
                <div className="py-6 border-b border-[#0F181F]/10 flex gap-4">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                      <Landmark size={16} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-xs font-extrabold text-[#022C4F]">Escrow Funded Successfully</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                      Escrow funding of ₦15,000,000 has been successfully deposited for Victoria Heights Estate.
                    </p>
                  </div>
                </div>

                </div>
              )}
              </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
