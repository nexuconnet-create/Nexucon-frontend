"use client";

import React, { useState } from 'react';
import { X, AlertOctagon, Gavel, ShieldAlert } from 'lucide-react';
import { NonConformanceReport, escalateNCR } from '@/services/compliance';

interface EscalateNCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  ncr: NonConformanceReport | null;
  onSuccess?: () => void;
}

export default function EscalateNCRModal({
  isOpen,
  onClose,
  ncr,
  onSuccess
}: EscalateNCRModalProps) {
  const [targetLevel, setTargetLevel] = useState<number>(ncr ? Math.min(5, ncr.escalation_level + 1) : 3);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !ncr) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await escalateNCR(ncr.id, { escalation_level: targetLevel });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `NCR "${ncr.ncr_reference}" escalated to Level ${targetLevel}!`, type: 'warning' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to escalate NCR';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const levelLabels: Record<number, string> = {
    1: "Level 1: Automated Reminder",
    2: "Level 2: Warning Letter",
    3: "Level 3: Senior Officer Enforcement",
    4: "Level 4: Directorate Executive Escalation",
    5: "Level 5: Legal Proceedings & Site Suspension"
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Gavel size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Regulatory Escalation</h3>
              <p className="text-xs text-slate-500">{ncr.ncr_reference}</p>
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
            <p className="font-bold text-slate-800">{ncr.title}</p>
            <p className="text-slate-500">Current Status: Level {ncr.escalation_level} ({ncr.days_open} Days Open)</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Escalation Level</label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(Number(e.target.value))}
              className="w-full p-3 border border-red-200 bg-red-50/40 rounded-xl text-xs font-bold text-red-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map(lvl => (
                <option key={lvl} value={lvl}>{levelLabels[lvl]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Escalation & Enforcement Justification</label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="State reason for manual escalation (e.g. Contractor failed to remedy scaffold tie-offs after repeated notices)..."
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
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
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5"
            >
              <AlertOctagon size={14} /> {isSubmitting ? 'Escalating...' : 'Confirm Escalation'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
