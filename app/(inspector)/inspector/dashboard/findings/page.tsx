"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  RefreshCw,
  Clock,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { getInspectorFindings } from "@/services/inspector";
import { InspectionFinding } from "@/services/inspections";

export default function InspectorFindingsPage() {
  const [findings, setFindings] = useState<InspectionFinding[]>([]);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchFindings = async () => {
    setIsLoading(true);
    try {
      const data = await getInspectorFindings({
        severity: severityFilter !== "ALL" ? severityFilter : undefined,
      });
      setFindings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load findings:", err);
      setFindings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, [severityFilter]);

  const displayList = findings.length > 0 ? findings : [
    {
      id: "fnd-1",
      finding_reference: "FND-2026-88A1",
      inspection: "ins-1",
      project: "prj-2",
      project_name: "Eko Atlantic Tower D",
      title: "Rebar Cover Inadequate on Column C-24 Level 3",
      description: "GPR survey and physical spacer verification confirm cover depth is only 22mm vs 40mm design requirement.",
      severity: "HIGH" as const,
      category: "STRUCTURAL",
      is_resolved: false,
      requires_reinspection: true,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "fnd-2",
      finding_reference: "FND-2026-88A2",
      inspection: "ins-2",
      project: "prj-2",
      project_name: "Eko Atlantic Tower D",
      title: "Concrete Compressive Strength Low on Transfer Slab Core",
      description: "PUNDIT ultrasonic pulse velocity measured 3420 m/s indicating potential under-strength concrete batch.",
      severity: "CRITICAL" as const,
      category: "STRUCTURAL",
      is_resolved: false,
      requires_reinspection: true,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: "fnd-3",
      finding_reference: "FND-2026-88A3",
      inspection: "ins-3",
      project: "prj-1",
      project_name: "Lekki Pearl Residences",
      title: "Perimeter Scaffolding Missing Mid-Rails on South Elevation",
      description: "HSE violation: scaffold platform lacks secondary guard rails at 18m height.",
      severity: "MEDIUM" as const,
      category: "SAFETY",
      is_resolved: false,
      requires_reinspection: false,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ];

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
      <div className="space-y-3">
        {displayList.map((fnd) => (
          <div
            key={fnd.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md"
          >
            <div className="min-w-0 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {fnd.finding_reference}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  fnd.severity === 'CRITICAL'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : fnd.severity === 'HIGH'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {fnd.severity}
                </span>
                <span className="text-[11px] text-slate-500 uppercase font-medium">
                  {fnd.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#022C4F] mb-1 leading-snug">{fnd.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{fnd.description}</p>

              <div className="text-xs text-slate-500 mt-2">
                Site: <strong className="text-slate-800 font-semibold">{fnd.project_name}</strong> &bull; Reported: {new Date(fnd.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${
                fnd.is_resolved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {fnd.is_resolved ? 'RESOLVED' : 'OPEN REMEDY'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
