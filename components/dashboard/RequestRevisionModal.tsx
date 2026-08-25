"use client";

import React, { useState } from 'react';
import { X, AlertTriangle, Send, FileText } from 'lucide-react';
import { ApprovalRequest, requestRevision } from '@/services/approvals';

interface RequestRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ApprovalRequest | null;
  onSuccess?: () => void;
}

export default function RequestRevisionModal({
  isOpen,
  onClose,
  request,
  onSuccess
}: RequestRevisionModalProps) {
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNotes.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Revision notes are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await requestRevision(request.id, { revision_notes: revisionNotes });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Formal revision request dispatched for "${request.request_reference}"!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to request revision';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Request Formal Revision</h3>
              <p className="text-xs text-slate-500 font-mono">{request.request_reference}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-slate-800">{request.title}</p>
            <p className="text-slate-500">Submitted By: <span className="font-semibold text-slate-700">{request.submitted_by_name}</span></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Revision Details & Correction Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Specify structural calculation errors, drawing discrepancies, or missing statutory annexures..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900">
            <p className="font-bold">Lifecycle Impact</p>
            <p className="text-[11px] text-amber-700 mt-0.5">Status will change to &quot;Awaiting Fix&quot; and the applicant will be alerted to upload a revised version.</p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Sending Request...' : 'Send Revision Request'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
