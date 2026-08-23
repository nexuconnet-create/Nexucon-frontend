"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, AlertTriangle, Calendar, Clock, AlertOctagon, 
  Send, FileText, CheckCircle
} from 'lucide-react';
import { ConstructionMilestone, flagMilestoneDelay } from '@/services/monitoring';

interface FlagMilestoneDelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: ConstructionMilestone | null;
  onSuccess?: (updatedMilestone?: ConstructionMilestone) => void;
}

const DELAY_PRESETS = [
  "Custom curved facade glass logistics delay at Apapa Port terminal.",
  "Severe rainfall & groundwater ingress requiring extended dewatering pump operation.",
  "Batching plant concrete supply interruption during foundation pour.",
  "Tower crane mechanical maintenance & safety recalibration downtime.",
  "RFI structural design clarification pending consultant sign-off."
];

export default function FlagMilestoneDelayModal({
  isOpen,
  onClose,
  milestone,
  onSuccess
}: FlagMilestoneDelayModalProps) {
  const [reason, setReason] = useState(DELAY_PRESETS[0]);
  const [revisedTargetDate, setRevisedTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && milestone) {
      setReason(milestone.delay_reason || DELAY_PRESETS[0]);
      const currentTarget = new Date(milestone.target_date);
      const nextWeek = new Date(currentTarget);
      nextWeek.setDate(currentTarget.getDate() + 14);
      setRevisedTargetDate(nextWeek.toISOString().split('T')[0]);
    }
  }, [isOpen, milestone]);

  if (!isOpen || !milestone) return null;

  const currentTargetDate = new Date(milestone.target_date);
  const revisedDateObj = revisedTargetDate ? new Date(revisedTargetDate) : currentTargetDate;
  const slippageDays = Math.max(1, Math.round((revisedDateObj.getTime() - currentTargetDate.getTime()) / (1000 * 60 * 60 * 24)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'A specific delay reason is required.', type: 'error' } 
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await flagMilestoneDelay(milestone.id, {
        reason: reason.trim(),
        revised_target_date: revisedTargetDate || undefined
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `Milestone "${milestone.name}" flagged as DELAYED (+${slippageDays} days variance logged).`, 
          type: 'warning' 
        } 
      }));

      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to flag milestone delay';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-rose-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
              <AlertTriangle size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                Programme Non-Conformance
              </span>
              <h2 className="text-lg font-black text-[#022C4F] mt-0.5">Flag Schedule Delay</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Milestone Details Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-blue-100 text-blue-800 font-mono">
                {milestone.milestone_code}
              </span>
              <h3 className="text-xs font-black text-[#022C4F] truncate">{milestone.name}</h3>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold">{milestone.project_name}</p>
            <div className="pt-2 flex items-center justify-between text-xs font-bold border-t border-slate-200/60 mt-2">
              <span className="text-slate-500">Current Target Date:</span>
              <span className="text-slate-800">{new Date(milestone.target_date).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Revised Target Date & Slippage */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Revised Target Date</label>
              <input 
                type="date"
                value={revisedTargetDate}
                onChange={(e) => setRevisedTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-rose-700"
                required
              />
            </div>
            <div className="p-2 bg-white rounded-xl border border-rose-200 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Slippage</span>
              <span className="text-xl font-black text-rose-600">+{slippageDays} Days</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 block">Delay Root Cause Presets:</label>
            <div className="flex flex-wrap gap-1.5">
              {DELAY_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`text-left px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    reason === preset 
                      ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.slice(0, 45)}...
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#022C4F]">Detailed Non-Conformance / Delay Justification *</label>
            <textarea 
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the root cause of the delay, impact on successor construction phases, and recovery strategy..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Logging Delay...</>
              ) : (
                <>
                  <AlertOctagon size={15} /> Flag Schedule Delay
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
