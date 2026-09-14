'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Loader2 } from 'lucide-react';
import { reviewDocument, Document } from '@/services/documents';

interface ReviewDrawingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drawing: Document | null;
  onReviewSubmitted?: () => void;
}

const statusLabel: Record<Document['status'], string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Awaiting Client Review',
  UNDER_REVIEW: 'Under Review',
  CHANGES_REQUESTED: 'Changes Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  EXPIRING_SOON: 'Expiring Soon',
  ARCHIVED: 'Archived',
};

const formatDateTime = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
};

const isImageUrl = (url: string, format?: string): boolean => {
  if (format && ['PNG', 'JPEG', 'JPG', 'WEBP', 'GIF', 'SVG', 'BMP'].includes(format.toUpperCase())) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);
};

export default function ReviewDrawingDrawer({ isOpen, onClose, drawing, onReviewSubmitted }: ReviewDrawingDrawerProps) {
  const [isConfirmingApproval, setIsConfirmingApproval] = useState(false);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the form state whenever a different drawing is opened.
  useEffect(() => {
    if (isOpen) {
      setIsConfirmingApproval(false);
      setComments('');
      setIsSubmitting(false);
    }
  }, [isOpen, drawing?.id]);

  const submitDecision = async (status: 'APPROVED' | 'CHANGES_REQUESTED') => {
    if (!drawing || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await reviewDocument(drawing.id, {
        status,
        comments: comments.trim() ? comments.trim() : undefined,
      });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: status === 'APPROVED' ? 'Drawing approved successfully!' : 'Change request submitted successfully!',
          type: 'success',
        },
      }));
      setIsConfirmingApproval(false);
      setComments('');
      onReviewSubmitted?.();
      onClose();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to submit review decision. Please try again.', type: 'error' },
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviews = drawing?.reviews ?? [];

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
              <h2 className="text-[28px] font-extrabold text-[#022C4F] mb-3 pr-12">Review Drawing Submission</h2>
              <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                Review submitted drawings, provide feedback, add annotations, and submit your approval decision.
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">

              {!drawing ? (
                <div className="border border-gray-200 rounded-2xl p-10 text-center">
                  <FileText size={32} className="mx-auto mb-3 text-[#022C4F]/40" />
                  <p className="text-[13px] font-bold text-[#022C4F]">No drawing selected.</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Close this panel and select a drawing from the review lists.
                  </p>
                </div>
              ) : (
                <>
                  {/* Drawing Information */}
                  <div className="mb-8">
                    <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Drawing Information</h3>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                      <div>
                        <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Drawing Name</h4>
                        <p className="text-[11px] text-gray-500 font-medium">{drawing.title || '—'}</p>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Discipline</h4>
                        <p className="text-[11px] text-gray-500 font-medium">{drawing.discipline || '—'}</p>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Project</h4>
                        <p className="text-[11px] text-gray-500 font-medium">{drawing.project_name || '—'}</p>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Submitted by</h4>
                        <p className="text-[11px] text-gray-500 font-medium">{drawing.uploader_name || '—'}</p>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Submission Date</h4>
                        <p className="text-[11px] text-gray-500 font-medium">{formatDateTime(drawing.created_at)}</p>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Version</h4>
                        <p className="text-[11px] text-gray-500 font-medium">{drawing.current_version || '—'}</p>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Reference</h4>
                        <p className="text-[11px] text-gray-500 font-medium font-mono">{drawing.document_reference || '—'}</p>
                      </div>
                      <div className="col-span-2">
                        <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1.5">Status</h4>
                        <p className="text-[11px] text-gray-500 font-medium">{statusLabel[drawing.status] || drawing.status}</p>
                      </div>
                    </div>
                  </div>

                  {/* Review History — real reviews recorded against this document */}
                  <div className="bg-white border border-gray-200 rounded-[24px] p-6 mb-8 shadow-sm">
                    <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Review Progress</h3>
                    {reviews.length === 0 ? (
                      <p className="text-[12px] text-gray-500 font-medium">No reviews recorded yet for this drawing.</p>
                    ) : (
                      <div className="flex flex-col gap-5">
                        {reviews.map((review) => (
                          <div key={review.id} className="flex gap-4 items-start">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#022C4F] mt-1.5 shrink-0"></div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[13px] font-extrabold text-[#0F181F]">{review.reviewer_name || '—'}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                                  review.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                                  review.status === 'CHANGES_REQUESTED' || review.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                  'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {review.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : review.status.charAt(0) + review.status.slice(1).toLowerCase()}
                                </span>
                              </div>
                              {review.comments && (
                                <p className="text-[11px] text-gray-500 font-medium">{review.comments}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Drawing File */}
                  <div className="w-full rounded-2xl overflow-hidden border border-gray-200 mb-8">
                    {drawing.file_url && isImageUrl(drawing.file_url, drawing.file_format) ? (
                      <div className="w-full h-[320px] bg-[#f8f9fa] relative flex items-center justify-center">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#022C4F 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={drawing.file_url}
                          alt={drawing.title || 'Drawing preview'}
                          className="w-full h-full object-cover relative z-10"
                        />
                      </div>
                    ) : drawing.file_url ? (
                      <div className="w-full h-[320px] bg-[#f8f9fa] flex flex-col items-center justify-center gap-3">
                        <FileText size={32} className="text-[#022C4F]/40" />
                        <p className="text-[12px] font-medium text-gray-500">
                          {drawing.file_format ? `${drawing.file_format} file attached — image preview not available.` : 'File attached — image preview not available.'}
                        </p>
                        <a
                          href={drawing.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-[#022C4F] text-[#022C4F] rounded-xl text-[11px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          Open File
                        </a>
                      </div>
                    ) : (
                      <div className="w-full h-[320px] bg-[#f8f9fa] flex items-center justify-center">
                        <p className="text-[12px] font-medium text-gray-500">No file attached</p>
                      </div>
                    )}
                  </div>

                  {/* Review Comments */}
                  <div className="w-full">
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-2">Review Comments</h4>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Add comments, observations, or revision requests to send with your decision..."
                      className="w-full h-[140px] rounded-xl border border-[#022C4F] p-4 text-[12px] text-[#0F181F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F]/20 transition-all resize-none"
                    />
                  </div>
                </>
              )}

            </div>

            {/* Footer Buttons */}
            {drawing && (
              <div className="p-10 pt-6 mt-auto shrink-0 bg-white border-t border-gray-100 flex flex-col gap-3">
                <AnimatePresence mode="wait">
                  {isConfirmingApproval ? (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col gap-3"
                    >
                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-2">
                        <p className="text-[12px] text-orange-800 font-bold mb-1">Confirm Approval</p>
                        <p className="text-[11px] text-orange-700">Are you sure you want to approve this drawing? This will advance the project to the next phase.</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsConfirmingApproval(false)}
                          disabled={isSubmitting}
                          className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl text-[14px] font-bold hover:bg-gray-200 transition-colors shadow-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => submitDecision('APPROVED')}
                          disabled={isSubmitting}
                          className="w-full py-4 bg-[#022C4F] text-white rounded-2xl text-[14px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                          Confirm Approval
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col gap-3"
                    >
                      <button
                        onClick={() => submitDecision('CHANGES_REQUESTED')}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#022C4F] text-white rounded-2xl text-[14px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        Request Changes
                      </button>
                      <button
                        onClick={() => setIsConfirmingApproval(true)}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-white text-[#0F181F] border border-gray-300 rounded-2xl text-[14px] font-bold hover:border-[#022C4F] hover:text-[#022C4F] transition-colors shadow-sm"
                      >
                        Approve Final Design
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
