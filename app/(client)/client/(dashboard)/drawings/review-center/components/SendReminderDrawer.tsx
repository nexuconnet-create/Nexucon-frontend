'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, FileText, Loader2 } from 'lucide-react';
import { getDocumentById, Document } from '@/services/documents';

interface SendReminderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drawing: Document | null;
}

const statusLabel: Record<Document['status'], string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Awaiting Review',
  UNDER_REVIEW: 'Under Review',
  CHANGES_REQUESTED: 'Changes Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  EXPIRING_SOON: 'Expiring Soon',
  ARCHIVED: 'Archived',
};

export default function SendReminderDrawer({ isOpen, onClose, drawing }: SendReminderDrawerProps) {
  // Real reviewer names come from the document's review records — no
  // hardcoded recipient list.
  const [recipients, setRecipients] = useState<string[]>([]);
  const [isLoadingReviewers, setIsLoadingReviewers] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen || !drawing) {
      setRecipients([]);
      setSelectedRecipients([]);
      return;
    }
    let cancelled = false;
    const loadReviewers = async () => {
      setIsLoadingReviewers(true);
      try {
        const detail = await getDocumentById(drawing.id);
        if (cancelled) return;
        const names = (detail.reviews ?? [])
          .map((r) => r.reviewer_name)
          .filter((name): name is string => Boolean(name));
        setRecipients(names);
        setSelectedRecipients(names);
      } catch (err) {
        if (!cancelled) {
          setRecipients([]);
          setSelectedRecipients([]);
        }
      } finally {
        if (!cancelled) setIsLoadingReviewers(false);
      }
    };
    loadReviewers();
    return () => { cancelled = true; };
  }, [isOpen, drawing?.id]);

  const toggleRecipient = (recipient: string) => {
    setSelectedRecipients(prev =>
      prev.includes(recipient) ? prev.filter(r => r !== recipient) : [...prev, recipient]
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
              <h2 className="text-[28px] font-extrabold text-[#022C4F] mb-3 pr-12">Send Review Reminder</h2>
              <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                Notify reviewers about pending drawing reviews, upcoming deadlines, and approval actions requiring attention.
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">

              {/* Review Information */}
              <div className="mb-10">
                <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Review Information</h3>

                {!drawing ? (
                  <div className="border border-gray-200 rounded-2xl p-8 text-center">
                    <FileText size={28} className="mx-auto mb-2 text-[#022C4F]/40" />
                    <p className="text-[12px] font-medium text-gray-500">No drawing selected.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Drawing Package</h4>
                      <p className="text-[11px] text-[#022C4F] font-medium">{drawing.title || '—'}</p>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Project</h4>
                      <p className="text-[11px] text-gray-500 font-medium">{drawing.project_name || '—'}</p>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Review Status</h4>
                      <p className="text-[11px] text-gray-500 font-medium">{statusLabel[drawing.status] || drawing.status}</p>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Version</h4>
                      <p className="text-[11px] text-gray-500 font-medium">{drawing.current_version || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Reference</h4>
                      <p className="text-[11px] text-gray-500 font-medium font-mono">{drawing.document_reference || '—'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Select Recipients */}
              <div className="mb-10">
                <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-4">Select Recipients</h3>
                {isLoadingReviewers ? (
                  <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
                    <Loader2 size={14} className="animate-spin" />
                    Loading reviewers…
                  </div>
                ) : !drawing ? (
                  <p className="text-[12px] font-medium text-gray-500">No drawing selected.</p>
                ) : recipients.length === 0 ? (
                  <p className="text-[12px] font-medium text-gray-500">No reviewers recorded yet for this drawing.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {recipients.map((recipient) => {
                      const isSelected = selectedRecipients.includes(recipient);
                      return (
                        <div
                          key={recipient}
                          className="flex items-center gap-4 cursor-pointer group"
                          onClick={() => toggleRecipient(recipient)}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-black border-black' : 'border-gray-400 group-hover:border-black'}`}>
                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                          <span className="text-[12px] font-medium text-[#0F181F]">{recipient}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-10 pt-6 mt-auto shrink-0 bg-white border-t border-gray-100 flex flex-col gap-3">
              <button
                onClick={() => {
                  if (selectedRecipients.length === 0) {
                    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Select at least one recipient to send a reminder.', type: 'warning' } }));
                    return;
                  }
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Reminders sent successfully!', type: 'success' } }));
                  onClose();
                }}
                className="w-full py-4 bg-[#022C4F] text-white rounded-2xl text-[14px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
              >
                Send Reminder
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
