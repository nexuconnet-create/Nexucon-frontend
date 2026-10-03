import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle, Award } from 'lucide-react';

interface VerificationBadgeProps {
  permitNumber?: string;
  isVerified?: boolean;
  authority?: string;
  variant?: 'compact' | 'full' | 'banner';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  permitNumber,
  isVerified = true,
  authority = 'Lagos State Building Control Agency (LASBCA)',
  variant = 'compact'
}) => {
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-emerald-950 via-[#022C4F] to-emerald-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        {/* Holographic background sheen */}
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  OFFICIAL GOVERNMENT VERIFICATION
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">
                Statutory Verified Building Project
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Planning Permit No: <span className="font-mono text-emerald-300 font-semibold">{permitNumber || "LASBCA/PRM/VERIFIED"}</span>
              </p>
            </div>
          </div>
          <div className="sm:text-right border-t sm:border-t-0 border-slate-700/60 pt-3 sm:pt-0">
            <div className="text-xs text-slate-400">Ratified By Authority:</div>
            <div className="text-xs sm:text-sm font-semibold text-emerald-200 mt-0.5 max-w-xs">{authority}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center sm:justify-end gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
              Digital Cryptographic Signature Valid
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
        </div>
        <div className="text-left">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 leading-none">
            Verified Statutory Permit
          </div>
          {permitNumber && (
            <div className="text-[11px] font-mono text-emerald-700 font-semibold mt-0.5">
              {permitNumber}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-300/80 shadow-2xs"
      title={`Verified by ${authority}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
      <span>Verified Permit</span>
    </span>
  );
};
