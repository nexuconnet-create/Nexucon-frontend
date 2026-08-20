"use client";

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { RiskAssessmentAlert, mitigateRiskAlert } from '@/services/analytics';

interface RiskMitigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: RiskAssessmentAlert | null;
  onSuccess?: () => void;
}

export default function RiskMitigationModal({
  isOpen,
  onClose,
  alert,
  onSuccess
}: RiskMitigationModalProps) {
  const [mitigationNotes, setMitigationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !alert) return null;

  const handleMitigate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await mitigateRiskAlert(alert.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Risk alert for "${alert.structure_name}" marked as Mitigated!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to update alert', type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Mitigate Structural Risk</h3>
              <p className="text-xs text-slate-500">Risk Score: {alert.risk_score}/100 ({alert.risk_level})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleMitigate} className="space-y-4">
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs space-y-1">
            <p className="font-bold text-rose-900">{alert.structure_name}</p>
            <p className="text-rose-700">Vulnerability: {alert.primary_vulnerability}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mitigation Actions Taken
            </label>
            <textarea
              rows={3}
              value={mitigationNotes}
              onChange={(e) => setMitigationNotes(e.target.value)}
              placeholder="State corrective engineering remedies applied (e.g. Underpinning completed, rebar density reinforced)..."
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} /> {isSubmitting ? 'Updating...' : 'Mark as Mitigated'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
