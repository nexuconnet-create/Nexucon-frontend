import React from 'react';
import { Activity, ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { PublicFindingSummary } from '@/services/publicPortal';

interface PublicFindingCardProps {
  finding: PublicFindingSummary;
}

export const PublicFindingCard: React.FC<PublicFindingCardProps> = ({ finding }) => {
  const isPass = finding.outcome === 'PASS';
  const isMarginal = finding.outcome === 'MARGINAL';

  const typeLabels: Record<string, string> = {
    PUNDIT_ULTRASONIC: 'PUNDIT Ultrasonic Pulse Velocity (UPV)',
    REBAR_COVER_GPR: 'High-Frequency GPR Rebar Depth Scan',
    CONCRETE_CORE: 'Concrete Compressive Core Crushing Test',
    SETTLEMENT_MONITOR: 'Geodetic Foundation Settlement Telemetry',
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-blue-300 hover:shadow-xs transition-all space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              {typeLabels[finding.test_type] || finding.test_type}
            </div>
            <h5 className="text-sm font-bold text-[#022C4F]">
              {finding.element_name}
            </h5>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            isPass
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : isMarginal
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {isPass ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          <span>{finding.outcome}</span>
        </span>
      </div>

      {/* Measured Values Grid */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Measured Value</span>
          <span className="font-mono font-bold text-slate-800 text-sm">{finding.measured_value}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Statutory Threshold</span>
          <span className="font-mono text-slate-600 text-xs mt-0.5 block">{finding.required_threshold}</span>
        </div>
      </div>

      {/* Footer Standard & Sign-off */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>Standard: <strong className="text-slate-700">{finding.statutory_standard}</strong></span>
        <span>Verified By: <strong className="text-slate-700">{finding.signed_off_by_role}</strong> &bull; {finding.date_verified}</span>
      </div>
    </div>
  );
};
