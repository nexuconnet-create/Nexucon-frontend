"use client";

import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, AlertTriangle, FileText, Check } from 'lucide-react';
import { NonConformanceReport, closeNCR } from '@/services/compliance';

interface VerifyCloseNCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  ncr: NonConformanceReport | null;
  onSuccess?: () => void;
}

export default function VerifyCloseNCRModal({
  isOpen,
  onClose,
  ncr,
  onSuccess
}: VerifyCloseNCRModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState(
    'Site re-inspection conducted. Corrective actions verified and in full compliance with statutory building standards.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !ncr) return null;

  const handleConfirmClose = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await closeNCR(ncr.id, { resolution_notes: resolutionNotes });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Non-conformance "${ncr.ncr_reference}" verified, resolved, and closed!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to verify and close NCR';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Verify & Close Non-Conformance</h3>
              <p className="text-xs text-slate-500 font-mono">Reference: {ncr.ncr_reference}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Target NCR Details Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Target Infraction</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
              ncr.severity === 'Critical' ? 'bg-red-100 text-red-700' :
              ncr.severity === 'Major' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {ncr.severity} • {ncr.category}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 leading-snug">{ncr.title}</p>
          <p className="text-[11px] text-slate-500">Assignee: <span className="font-semibold text-slate-700">{ncr.assignee_name}</span></p>
        </div>

        {/* Linked CAPA Notice */}
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs mb-5 flex items-start gap-2.5">
          <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Automated CAPA Task Resolution</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Closing this NCR will officially resolve and close all associated corrective action plan (CAPA) tasks.</p>
          </div>
        </div>

        {/* Resolution Form */}
        <form onSubmit={handleConfirmClose} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Verification & Resolution Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Detail site re-inspection findings, test certificate verification, or remedial work completed..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
            />
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Verify & Close NCR</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
