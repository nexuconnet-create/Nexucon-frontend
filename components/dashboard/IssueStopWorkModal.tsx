"use client";

import React, { useState } from 'react';
import { X, AlertOctagon, ShieldAlert } from 'lucide-react';
import { Inspection, issueStopWorkOrder } from '@/services/inspections';

interface IssueStopWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: Inspection | null;
  onSuccess?: () => void;
}

export default function IssueStopWorkModal({
  isOpen,
  onClose,
  inspection,
  onSuccess
}: IssueStopWorkModalProps) {
  const [reason, setReason] = useState('Critical structural defect posing imminent hazard.');
  const [severity, setSeverity] = useState('CRITICAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !inspection) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Reason is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await issueStopWorkOrder(inspection.id, {
        reason,
        severity
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Stop-Work Order officially enforced. Site activities suspended.', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to issue Stop-Work Order';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertOctagon size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Issue Stop-Work Order</h3>
              <p className="text-xs text-rose-600 font-bold">{inspection.project_name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl mb-4 text-xs text-rose-800 leading-relaxed font-medium">
          <span className="font-bold">Legal Notice:</span> Issuing this order will immediately suspend the construction project and dispatch automated regulatory violation notices.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Violation Justification / Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              placeholder="Specify the regulatory breach, safety violation, or structural failure..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5"
            >
              <AlertOctagon size={14} /> {isSubmitting ? 'Enforcing...' : 'Enforce Stop-Work'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
