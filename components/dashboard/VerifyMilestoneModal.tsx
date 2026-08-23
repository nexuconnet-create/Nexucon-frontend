"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, ShieldCheck, AlertTriangle, 
  FileCheck, Sparkles, AlertOctagon, Check, Lock
} from 'lucide-react';
import { 
  ConstructionMilestone, verifyMilestone, 
  flagMilestoneDelay, getMilestoneGateStatus,
  MilestoneGateEvaluation
} from '@/services/monitoring';

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
  const [verificationNotes, setVerificationNotes] = useState('');
  const [overrideGate, setOverrideGate] = useState(false);
  const [gateStatus, setGateStatus] = useState<MilestoneGateEvaluation | null>(null);
  const [isLoadingGates, setIsLoadingGates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && milestone) {
      setVerificationNotes(`Statutory verification for ${milestone.name} completed. Piling, structural dimensions, and laboratory test records certified compliant with Lagos State Building Control regulations.`);
      setIsLoadingGates(true);
      getMilestoneGateStatus(milestone.id)
        .then(res => setGateStatus(res))
        .catch(() => null)
        .finally(() => setIsLoadingGates(false));
    }
  }, [isOpen, milestone]);

  if (!isOpen || !milestone) return null;

  const gatesList = gateStatus?.gates || milestone.gate_evaluation?.gates || [];
  const allPassed = gateStatus ? gateStatus.all_gates_passed : (milestone.gate_evaluation?.all_gates_passed ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await verifyMilestone(milestone.id, {
        notes: verificationNotes.trim(),
        override_gate: overrideGate
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `Milestone "${milestone.name}" successfully certified & officially signed off!`, 
          type: 'success' 
        } 
      }));

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to verify milestone';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Building Control Directorate
              </span>
              <h3 className="text-lg font-black text-[#022C4F] mt-0.5">Statutory Milestone Sign-Off</h3>
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
          
          {/* Milestone Target Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-blue-700 font-bold">{milestone.milestone_code}</span>
              <span className="text-slate-400 font-semibold">{milestone.phase}</span>
            </div>
            <h4 className="font-black text-sm text-[#022C4F]">{milestone.name}</h4>
            <p className="text-slate-500 font-semibold">{milestone.project_name}</p>
          </div>

          {/* Verification Gates Summary */}
          <div className="space-y-2">
            <label className="text-xs font-black text-[#022C4F] uppercase tracking-wider block">
              Statutory Verification Gate Readiness
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {gatesList.map((g, i) => (
                <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 ${
                      g.status === 'PASSED' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}>
                      {g.status === 'PASSED' ? <Check size={11} /> : <X size={11} />}
                    </div>
                    <span className="font-bold text-slate-800 truncate">{g.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                    g.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {g.status}
                  </span>
                </div>
              ))}
            </div>

            {!allPassed && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900 mt-2">
                <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={15} />
                <div>
                  <strong className="block font-black">Gate Warning:</strong>
                  Some mandatory criteria are incomplete. Verification requires directorate override.
                </div>
              </div>
            )}
          </div>

          {/* Verification Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#022C4F]">Statutory Certification & Inspection Notes *</label>
            <textarea
              rows={3}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Override checkbox if gates not passed */}
          {!allPassed && (
            <label className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
              <input 
                type="checkbox"
                checked={overrideGate}
                onChange={(e) => setOverrideGate(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-amber-300"
              />
              <span className="text-xs font-bold text-amber-900">
                Apply Executive Directorate Override (Log in Audit Trail)
              </span>
            </label>
          )}

          {/* Digital Signature Preview Stamp */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-emerald-700" />
              <span>Digital Regulatory Seal will be appended to permanent audit ledger.</span>
            </div>
            <span className="font-mono text-[9px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
              0xLASBCA-VERIFIED
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!allPassed && !overrideGate)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Signing Certificate...</>
              ) : (
                <>
                  <ShieldCheck size={15} /> Execute & Sign Off Milestone
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

