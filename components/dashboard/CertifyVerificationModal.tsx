import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Lock, 
  Stamp,
  Radio,
  MapPin,
  Calendar
} from 'lucide-react';
import { SiteVerification, certifySiteVerification } from '@/services/monitoring';

interface CertifyVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: SiteVerification | null;
  onSuccess?: (certified: SiteVerification) => void;
}

export default function CertifyVerificationModal({
  isOpen,
  onClose,
  verification,
  onSuccess
}: CertifyVerificationModalProps) {
  const [officerName, setOfficerName] = useState('Surv. Olumide Balogun');
  const [officerRole, setOfficerRole] = useState('Directorate of Cadastral & Structural Survey');
  const [notes, setNotes] = useState('Cadastral coordinates, boundary beacons, and statutory setback limits verified 100% compliant with approved planning permits.');
  const [overrideTolerance, setOverrideTolerance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !verification) return null;

  const isVarianceDetected = verification.variance_detected || (verification.variance_meters > (verification.tolerance_limit_meters || 0.05));
  const preCertRef = verification.digital_cert_ref || `CERT-VRF-${new Date().getFullYear()}-LASBCA-${Math.floor(10000 + Math.random() * 90000)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVarianceDetected && !overrideTolerance) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Cannot certify without checking administrative override for measured variance.', type: 'error' } 
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await certifySiteVerification(verification.id, {
        notes,
        override_tolerance: overrideTolerance,
        verified_by_name: officerName.trim(),
        verified_by_role: officerRole.trim()
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `Site verification ${verification.verification_reference} formally certified and digitally signed!`, 
          type: 'success' 
        } 
      }));

      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to certify site verification';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 my-8 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Statutory Cadastral Certification</h3>
              <p className="text-xs text-emerald-200 font-medium">
                Official Building Control Directorate Sign-Off & Verification Seal
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Target Verification Snapshot */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {verification.verification_reference}
              </span>
              <span className="text-xs font-black uppercase text-slate-500">{verification.method?.replace(/_/g, ' ')}</span>
            </div>

            <div>
              <h4 className="text-sm font-black text-[#022C4F]">{verification.project_name}</h4>
              <p className="text-xs text-slate-500 font-medium">{verification.device_identifier}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Measured Variance</span>
                <span className={`font-mono font-bold ${isVarianceDetected ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {verification.variance_meters}m ({Math.round(verification.variance_meters * 1000)}mm)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Tolerance Limit</span>
                <span className="font-mono font-bold text-slate-700">≤ {verification.tolerance_limit_meters || 0.05}m</span>
              </div>
            </div>
          </div>

          {/* Variance Warning if Detected */}
          {isVarianceDetected && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <span>Measured Variance Exceeds Statutory Limit</span>
              </div>
              <p className="text-[11px] font-medium text-rose-800">
                The measured spatial displacement ({verification.variance_meters}m) is greater than the allowed 0.05m tolerance threshold. An administrative override justification is mandatory to certify this record.
              </p>
              <label className="flex items-center gap-2 text-xs font-bold pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideTolerance}
                  onChange={(e) => setOverrideTolerance(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Grant Statutory Administrative Exemption & Override</span>
              </label>
            </div>
          )}

          {/* Officer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Certifying Cadastral Officer</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Directorate Title</label>
              <input
                type="text"
                value={officerRole}
                onChange={(e) => setOfficerRole(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Certificate Reference & Signature Preview */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-emerald-900 font-bold">
              <span className="flex items-center gap-1.5">
                <Lock size={13} className="text-emerald-700" /> Digital Certificate Ref
              </span>
              <span>{preCertRef}</span>
            </div>
            <div className="text-[10px] text-emerald-700 truncate font-mono">
              Sig Hash: 0xLASBCA-VRF-SURV-{Math.floor(10000000 + Math.random() * 90000000).toString(16).toUpperCase()}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Regulatory Endorsement Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
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
              disabled={isSubmitting || (isVarianceDetected && !overrideTolerance)}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Stamp size={16} />
              {isSubmitting ? 'Signing & Sealing...' : 'Certify & Issue Digital Seal'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
