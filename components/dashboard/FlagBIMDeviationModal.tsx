"use client";

import React, { useState } from 'react';
import { X, AlertTriangle, Activity, UploadCloud, ShieldAlert } from 'lucide-react';
import { BIMConstructionMilestone, flagBIMMilestoneDeviation } from '@/services/bim';

interface FlagBIMDeviationModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: BIMConstructionMilestone | null;
  onSuccess?: () => void;
}

export default function FlagBIMDeviationModal({
  isOpen,
  onClose,
  milestone,
  onSuccess
}: FlagBIMDeviationModalProps) {
  const [deviationMm, setDeviationMm] = useState(25.0);
  const [reason, setReason] = useState('Scan-to-BIM point cloud comparison revealed concrete core out-of-plumbness exceeding allowable 15mm tolerance.');
  const [evidenceName, setEvidenceName] = useState('Point Cloud Heatmap & Deviation Log');
  const [evidenceUrl, setEvidenceUrl] = useState('https://assets.nexucon.com/bim/deviations/scan_heatmap.ply');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !milestone) return null;

  const isExceeded = deviationMm > milestone.tolerance_max_mm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await flagBIMMilestoneDeviation(milestone.id, {
        deviation_mm: deviationMm,
        reason,
        evidence_name: evidenceName,
        evidence_url: evidenceUrl
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Spatial deviation recorded for "${milestone.name}". Status updated to Flagged.`, type: 'warning' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to flag milestone deviation';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#022C4F]">Flag BIM Spatial Deviation</h2>
              <p className="text-xs text-slate-500">{milestone.milestone_code} • Tolerance Limit: {milestone.tolerance_max_mm}mm</p>
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
          
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-900 uppercase">Max Allowable Tolerance</p>
              <p className="text-lg font-black text-amber-950">{milestone.tolerance_max_mm} mm</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-amber-900 uppercase">Tolerance Status</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isExceeded ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isExceeded ? 'NON-COMPLIANT' : 'WITHIN TOLERANCE'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Measured Deviation (mm) *</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.1"
                value={deviationMm}
                onChange={(e) => setDeviationMm(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">mm</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Deviation Reason & Non-Conformance Description *</label>
            <textarea 
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detailed description of physical deviation vs approved BIM coordinates..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Evidence Title</label>
              <input 
                type="text" 
                value={evidenceName}
                onChange={(e) => setEvidenceName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Point Cloud / Survey URL</label>
              <input 
                type="text" 
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Submitting a critical deviation will automatically generate a formal Non-Conformance Report (NCR) in the statutory compliance register.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Flagging...' : 'Flag Deviation & Log NCR'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
