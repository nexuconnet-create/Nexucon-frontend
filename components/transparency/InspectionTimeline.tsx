import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Shield, ArrowRight } from 'lucide-react';
import { PublicInspectionOutcome } from '@/services/publicPortal';

interface InspectionTimelineProps {
  inspections: PublicInspectionOutcome[];
}

export const InspectionTimeline: React.FC<InspectionTimelineProps> = ({ inspections }) => {
  if (!inspections || inspections.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
        <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No Historical Inspections Logged Yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Statutory inspection audits will appear here once ratified by the Zonal Directorate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Statutory Inspection History ({inspections.length} Recorded Audits)
        </h4>
        <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
          ✓ Verified Public Records
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {inspections.map((insp, index) => {
          const isPass = insp.outcome === 'PASS';
          const isConditional = insp.outcome === 'CONDITIONAL';
          const isFail = insp.outcome === 'FAIL';

          return (
            <div key={insp.id || index} className="relative group">
              {/* Timeline Dot Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                  isPass
                    ? 'bg-emerald-500 text-white'
                    : isConditional
                    ? 'bg-amber-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {isPass && <CheckCircle2 className="w-4 h-4" />}
                {isConditional && <AlertTriangle className="w-4 h-4" />}
                {isFail && <XCircle className="w-4 h-4" />}
              </div>

              {/* Inspection Card Content */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {insp.inspection_reference}
                    </span>
                    <h5 className="text-sm sm:text-base font-bold text-[#022C4F] mt-1">
                      {insp.inspection_type}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isPass
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isConditional
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {insp.outcome === 'PASS'
                        ? 'Passed Statutory Audit'
                        : insp.outcome === 'CONDITIONAL'
                        ? 'Conditional Approval'
                        : 'Audit Non-Conformance'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                      {insp.completed_date}
                    </span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  <span className="font-semibold text-slate-700 block mb-0.5">Finding Summary:</span>
                  {insp.summary}
                </div>

                {insp.next_stage_required && (
                  <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-50/80 px-3 py-2 rounded-lg border border-blue-200/60 font-medium">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      <strong>Next Regulatory Milestone:</strong> {insp.next_stage_required}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
