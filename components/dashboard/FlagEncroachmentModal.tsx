import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Compass, 
  FileWarning
} from 'lucide-react';
import { SiteVerification, flagSiteEncroachment } from '@/services/monitoring';

interface FlagEncroachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: SiteVerification | null;
  onSuccess?: (flagged: SiteVerification) => void;
}

const ENCROACHMENT_REASONS = [
  'Road Reserve Statutory Setback Encroachment',
  'Cadastral Boundary Parcel Beacon Displacement',
  'Drainage & Utility Easement Clearance Violation',
  'Unauthorized Foundation Perimeter Realignment',
  'High-Tension Powerline Right-of-Way Non-Compliance',
  'Adjacent Property Line Overhang & Cantilever Infringement'
];

export default function FlagEncroachmentModal({
  isOpen,
  onClose,
  verification,
  onSuccess
}: FlagEncroachmentModalProps) {
  const [selectedReason, setSelectedReason] = useState(ENCROACHMENT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('Issue 48-Hour Notice to Rectify and Halt Superstructure Pouring on Affected Grid Lines.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !verification) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullDetails = `${details.trim() ? details.trim() + ' | ' : ''}Action: ${recommendedAction.trim()}`;
      const result = await flagSiteEncroachment(verification.id, {
        reason: selectedReason,
        details: fullDetails
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `Encroachment flagged for verification ${verification.verification_reference}!`, 
          type: 'success' 
        } 
      }));

      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to flag encroachment';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 my-8 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-800 to-red-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-rose-300">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Flag Boundary Encroachment</h3>
              <p className="text-xs text-rose-200 font-medium">
                Cadastral Non-Conformance & Statutory Setback Violation
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Snapshot */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-blue-700">{verification.verification_reference}</span>
              <span className="font-bold text-slate-500">{verification.method}</span>
            </div>
            <div className="font-black text-[#022C4F]">{verification.project_name}</div>
            <div className="text-slate-500">
              Measured Variance: <strong className="text-rose-600">{verification.variance_meters}m</strong> (Tolerance: ≤ {verification.tolerance_limit_meters || 0.05}m)
            </div>
          </div>

          {/* Encroachment Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Violation Classification</label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {ENCROACHMENT_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Encroachment Details */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Encroachment Specifics & Affected Grid Lines</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="e.g. Measured 0.124m building line encroachment beyond mandatory 6.0m road setback on North-East corridor between Grid Lines 1 and 4."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Corrective Action */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Statutory Corrective Action</label>
            <input
              type="text"
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle size={16} />
              {isSubmitting ? 'Flagging Encroachment...' : 'Flag Encroachment & Log Finding'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
