"use client";

import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import { ConstructionMilestone, verifyMilestone, flagMilestoneDelay } from '@/services/monitoring';

interface VerifyMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: ConstructionMilestone | null;
  onSuccess?: () => void;
}

export default function VerifyMilestoneModal({
  isOpen,
  onClose,
  milestone,
  onSuccess
}: VerifyMilestoneModalProps) {
  const [actionType, setActionType] = useState<'VERIFY' | 'DELAY'>('VERIFY');
  const [delayReason, setDelayReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !milestone) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (actionType === 'VERIFY') {
        await verifyMilestone(milestone.id);
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `Milestone "${milestone.name}" verified & signed off!`, type: 'success' } 
        }));
      } else {
        await flagMilestoneDelay(milestone.id, { reason: delayReason || 'Construction progress pacing delay.' });
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `Milestone "${milestone.name}" flagged as delayed.`, type: 'warning' } 
        }));
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update milestone';
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Milestone Review</h3>
              <p className="text-xs text-slate-500">{milestone.project_name}</p>
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
            <p className="font-bold text-slate-800">{milestone.name}</p>
            <p className="text-slate-500">Target Date: {new Date(milestone.target_date).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center gap-3 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActionType('VERIFY')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                actionType === 'VERIFY' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Verify Milestone
            </button>
            <button
              type="button"
              onClick={() => setActionType('DELAY')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                actionType === 'DELAY' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Flag Delay
            </button>
          </div>

          {actionType === 'DELAY' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Delay Justification</label>
              <textarea
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                rows={3}
                required
                placeholder="State the reasons for milestone delay (e.g. material supply chain delay, curing duration)..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          )}

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
                actionType === 'VERIFY' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              <CheckCircle size={14} /> {isSubmitting ? 'Saving...' : actionType === 'VERIFY' ? 'Sign Off Verified' : 'Confirm Delay'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
