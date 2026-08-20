"use client";

import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import { ApprovalRequest, requestInfo } from '@/services/approvals';

interface RequestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ApprovalRequest | null;
  onSuccess?: () => void;
}

export default function RequestInfoModal({
  isOpen,
  onClose,
  request,
  onSuccess
}: RequestInfoModalProps) {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await requestInfo(request.id, { query });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Information request sent to ${request.submitted_by_name}.`, type: 'info' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit inquiry';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Request Additional Information</h3>
              <p className="text-xs text-slate-500">{request.request_reference}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-slate-800">{request.title}</p>
            <p className="text-slate-500">Recipient: <span className="font-semibold text-slate-700">{request.submitted_by_name}</span></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Required Documents / Clarification Questions
            </label>
            <textarea
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Detail specific engineering drawings, calculations, or revised forms required from the applicant..."
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Send size={14} /> {isSubmitting ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
