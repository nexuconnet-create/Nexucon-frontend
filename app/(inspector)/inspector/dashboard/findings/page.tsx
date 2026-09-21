"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";
import { getInspectorFindings } from "@/services/inspector";
import { InspectionFinding } from "@/services/inspections";
import { orDash, dateOr } from "@/lib/display";

export default function InspectorFindingsPage() {
  const [findings, setFindings] = useState<InspectionFinding[]>([]);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchFindings = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getInspectorFindings({
        severity: severityFilter !== "ALL" ? severityFilter : undefined,
      });
      setFindings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      // Was a silent `setFindings([])` behind a `console.error`, which made an
      // unreachable server look like a clean record of non-conformance. On this
      // screen that is the worst possible wrong answer: the reader concludes
      // there are no outstanding defects.
      setFindings([]);
      setLoadError(
        err?.response?.data?.detail ||
          err?.message ||
          "Could not reach the findings service."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, [severityFilter]);

  // The three findings that used to be listed here when `findings` was empty —
  // "FND-2026-88A1" rebar cover on "Eko Atlantic Tower D", a PUNDIT strength
  // failure, a scaffolding HSE violation — were literals on a statutory
  // non-conformance register. They named real-sounding sites, quoted measured
  // values, and carried severity and remediation flags, so the panel looked
  // populated whether or not a single defect had ever been recorded. A
  // regulator reading this screen would have been reading fiction.
  const filteredFindings = findings.filter(
    (fnd) => severityFilter === "ALL" || fnd.severity === severityFilter
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <AlertTriangle size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
              Defect & Non-Conformance Tracker
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Official statutory findings recorded during inspections requiring contractor remediation.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchFindings}
          className="self-start md:self-auto p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm"
          title="Refresh findings"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setSeverityFilter(sev)}
            className={`px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-sm ${
              severityFilter === sev
                ? "bg-[#022C4F] text-white font-bold"
                : "bg-white text-slate-600 hover:text-[#022C4F] border border-slate-200/80 font-medium"
            }`}
          >
            {sev === "ALL" ? "All Severities" : sev}
          </button>
        ))}
      </div>

      {/* Findings List */}
      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loadError ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
          <h3 className="text-sm font-bold text-amber-900 mb-1">
            Findings could not be loaded
          </h3>
          <p className="text-xs text-amber-800">{loadError}</p>
          <p className="text-xs text-amber-700 mt-2">
            Nothing is listed because nothing could be read. This is not a clear
            record.
          </p>
        </div>
      ) : filteredFindings.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
          <ShieldAlert size={36} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            No Findings Recorded
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No non-conformance findings have been recorded under this filter.
            Findings are raised from an inspection workspace, not from this
            screen.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((fnd) => (
            <div
              key={fnd.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md"
            >
              <div className="min-w-0 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {orDash(fnd.finding_reference, "No reference")}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    fnd.severity === 'CRITICAL'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : fnd.severity === 'HIGH'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {orDash(fnd.severity, "Severity not recorded")}
                  </span>
                  <span className="text-[11px] text-slate-500 uppercase font-medium">
                    {orDash(fnd.category, "Uncategorised")}
                  </span>
                  {fnd.requires_reinspection && (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Re-inspection required
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#022C4F] mb-1 leading-snug">
                  {orDash(fnd.title, "Finding title not recorded")}
                </h3>
                {fnd.description ? (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {fnd.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic leading-relaxed">
                    No description recorded for this finding.
                  </p>
                )}

                <div className="text-xs text-slate-500 mt-2">
                  Site:{" "}
                  <strong className="text-slate-800 font-semibold">
                    {orDash(fnd.project_name, "Site name not recorded")}
                  </strong>{" "}
                  &bull; Reported: {dateOr(fnd.created_at)}
                  {fnd.resolution_deadline
                    ? ` • Remedy due ${dateOr(fnd.resolution_deadline)}`
                    : ""}
                </div>

                {fnd.corrective_action_required && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    <span className="font-semibold text-slate-700">
                      Corrective action:{" "}
                    </span>
                    {fnd.corrective_action_required}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${
                  fnd.is_resolved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {fnd.is_resolved ? 'RESOLVED' : 'OPEN REMEDY'}
                </span>
                {fnd.is_resolved && fnd.resolved_at && (
                  <span className="text-[11px] text-slate-500">
                    {dateOr(fnd.resolved_at)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
