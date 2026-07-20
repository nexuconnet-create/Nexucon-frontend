'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Bug, Lightbulb, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/ui/Button';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug'>('suggestion');
  const [feedbackText, setFeedbackText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    
    window.dispatchEvent(
      new CustomEvent('show-toast', {
        detail: { message: 'Thank you! Your feedback has been submitted.', type: 'success' },
      })
    );
    setFeedbackText('');
    onClose();
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
            className="fixed inset-0 bg-[#022C4F]/60 backdrop-blur-sm z-[150]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[500px] bg-white rounded-3xl shadow-2xl z-[151] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#022C4F] p-6 pb-8 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3 text-white mb-2">
                <MessageSquare size={24} />
                <h2 className="text-xl font-extrabold">Send Feedback</h2>
              </div>
              <p className="text-white/80 text-[13px] font-medium leading-relaxed max-w-[90%]">
                Your input helps us improve the platform. Found a bug or have a suggestion? Let us know!
              </p>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-8 pt-6">
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setFeedbackType('suggestion')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                    feedbackType === 'suggestion' 
                      ? 'border-[#022C4F] bg-blue-50 text-[#022C4F] font-bold' 
                      : 'border-gray-100 bg-white text-gray-500 font-medium hover:bg-gray-50'
                  }`}
                >
                  <Lightbulb size={18} />
                  Suggestion
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('bug')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                    feedbackType === 'bug' 
                      ? 'border-orange-500 bg-orange-50 text-orange-600 font-bold' 
                      : 'border-gray-100 bg-white text-gray-500 font-medium hover:bg-gray-50'
                  }`}
                >
                  <Bug size={18} />
                  Report Issue
                </button>
              </div>

              <div className="mb-4">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={feedbackType === 'suggestion' ? "I'd love to see a feature that..." : "I noticed a problem when..."}
                  className="w-full h-32 p-4 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#022C4F] resize-none"
                  required
                />
              </div>

              <button
                type="button"
                className="flex items-center gap-2 text-[12px] font-bold text-gray-500 hover:text-[#022C4F] transition-colors mb-6"
              >
                <ImageIcon size={16} />
                Add Screenshot (Optional)
              </button>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="w-full" disabled={!feedbackText.trim()}>
                  Submit
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
