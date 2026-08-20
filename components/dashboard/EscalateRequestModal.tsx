"use client";

import React, { useState } from 'react';
import { X, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { ApprovalRequest, escalateRequest } from '@/services/approvals';

interface EscalateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ApprovalRequest | null;
  onSuccess?: () => void;
}

export default function EscalateRequestModal({
  isOpen,
  onClose,
  request,
  onSuccess
}: EscalateRequestModalProps) {
  const [reason, setReason] = useState('');
  const [targetLevel, setTargetLevel] = useState('Permanent Secretary / Director General');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await escalateRequest(request.id, { reason, target_level: targetLevel });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Request "${request.request_reference}" escalated to ${targetLevel}!`, type: 'warning' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to escalate request';
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
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Executive Escalation</h3>
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
            <p className="text-slate-500">Value: ₦{(Number(request.value_amount) / 1000000).toFixed(1)}M</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Authority Level</label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              className="w-full p-3 border border-purple-200 bg-purple-50/40 rounded-xl text-xs font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="Permanent Secretary / Director General">Permanent Secretary / Director General (Above ₦50M / Critical Blocker)</option>
              <option value="Executive Directorate Board">Executive Directorate Board (Multi-Disciplinary Dispute)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Escalation Justification</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason for escalation (e.g. DoA threshold exceeded, schedule blocker, or complex inter-agency dispute)..."
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
            >
              <ArrowUpRight size={14} /> {isSubmitting ? 'Escalating...' : 'Escalate to DG'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
