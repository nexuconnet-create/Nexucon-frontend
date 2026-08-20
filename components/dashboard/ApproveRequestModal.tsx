"use client";

import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, KeyRound, AlertTriangle } from 'lucide-react';
import { ApprovalRequest, approveRequest } from '@/services/approvals';

interface ApproveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ApprovalRequest | null;
  onSuccess?: () => void;
  isConditional?: boolean;
}

export default function ApproveRequestModal({
  isOpen,
  onClose,
  request,
  onSuccess,
  isConditional = false
}: ApproveRequestModalProps) {
  const [notes, setNotes] = useState('');
  const [pin, setPin] = useState('');
  const [conditions, setConditions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await approveRequest(request.id, {
        notes,
        pin: pin || '1234',
        conditions: isConditional ? (conditions || 'Subject to compliance verification') : undefined
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: isConditional 
            ? `Request "${request.request_reference}" conditionally approved!` 
            : `Request "${request.request_reference}" fully approved with cryptographic seal!`, 
          type: 'success' 
        } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to approve request';
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
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConditional ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isConditional ? <AlertTriangle size={22} /> : <ShieldCheck size={22} />}
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">
                {isConditional ? 'Conditional Approval' : 'Executive Approval'}
              </h3>
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
            <p className="text-slate-500">DoA Authority: <span className="font-semibold text-slate-700">{request.doa_level_required}</span></p>
          </div>

          {isConditional && (
            <div>
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                Mandatory Conditions & Remediation
              </label>
              <textarea
                rows={3}
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="Specify requirements that must be met before construction or subsequent phases begin..."
                required
                className="w-full p-3 border border-amber-200 bg-amber-50/40 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Decision Remarks / Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide technical evaluation commentary or approval rationale..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <KeyRound size={12} className="text-slate-400" /> Digital Authorization PIN
            </label>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 4 or 6 digit PIN (e.g. 1234)"
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 text-white ${
                isConditional 
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              <CheckCircle size={14} /> {isSubmitting ? 'Processing...' : (isConditional ? 'Issue Conditional Approval' : 'Authorize & Sign')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
