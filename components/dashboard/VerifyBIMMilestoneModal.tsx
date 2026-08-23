"use client";

import React, { useState, useEffect } from 'react';
import { X, Award, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText, Lock } from 'lucide-react';
import { 
  BIMConstructionMilestone, 
  BIMMilestoneGateStatus, 
  getBIMMilestoneGateStatus, 
  verifyBIMMilestone 
} from '@/services/bim';

interface VerifyBIMMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: BIMConstructionMilestone | null;
  onSuccess?: () => void;
}

export default function VerifyBIMMilestoneModal({
  isOpen,
  onClose,
  milestone,
  onSuccess
}: VerifyBIMMilestoneModalProps) {
  const [gateStatus, setGateStatus] = useState<BIMMilestoneGateStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !milestone) return;
    setLoading(true);
    getBIMMilestoneGateStatus(milestone.id)
      .then(res => setGateStatus(res))
      .catch(err => console.error("Failed to load milestone gate status", err))
      .finally(() => setLoading(false));
  }, [isOpen, milestone]);

  if (!isOpen || !milestone) return null;

  const handleVerify = async () => {
    setIsSubmitting(true);
    try {
      await verifyBIMMilestone(milestone.id, { notes });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Milestone "${milestone.name}" verified & stamped!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Verification gate failed';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#022C4F]">BIM Verification Gate Assessment</h2>
              <p className="text-xs text-slate-500">{milestone.milestone_code} • {milestone.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Auditing statutory verification gates...</p>
          </div>
        ) : gateStatus ? (
          <div className="space-y-5">
            
            {/* Gate Summary Card */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              gateStatus.all_gates_passed 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-3">
                {gateStatus.all_gates_passed ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 size={18} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md">
                    <AlertTriangle size={18} />
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {gateStatus.all_gates_passed ? 'All Statutory Gates Satisfied' : 'Verification Blockers Detected'}
                  </h4>
                  <p className="text-xs opacity-80 mt-0.5">
                    {gateStatus.all_gates_passed 
                      ? 'Approved for official cryptographic directorate sign-off.' 
                      : `${gateStatus.blockers.length} criteria must be resolved before sign-off.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">Gate Check Matrix</h4>
              {gateStatus.gates.map((g, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${
                    g.passed ? 'bg-slate-50/60 border-slate-200' : 'bg-rose-50/50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {g.passed ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold text-slate-800">{g.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{g.detail}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    g.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {g.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>

            {/* Blockers Alert if any */}
            {gateStatus.blockers.length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5">
                <h5 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Action Required Before Sign-off:
                </h5>
                <ul className="text-xs text-rose-700 list-disc list-inside space-y-1">
                  {gateStatus.blockers.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviewer Notes & Signoff */}
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Regulatory Reviewer Sign-off Notes</label>
              <textarea 
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Confirmation statement and statutory audit reference..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock size={16} className="text-emerald-400" />
                <div>
                  <p className="text-xs font-bold">Government Cryptographic Stamp</p>
                  <p className="text-[10px] text-slate-400">SHA-256 digital signature will be applied upon verification</p>
                </div>
              </div>
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button 
                type="button"
                onClick={handleVerify}
                disabled={!gateStatus.all_gates_passed || isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isSubmitting ? 'Applying Stamp...' : 'Apply Official Verification Seal'}
              </button>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
