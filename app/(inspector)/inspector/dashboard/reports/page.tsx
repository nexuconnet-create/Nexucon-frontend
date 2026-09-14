"use client";

import React from "react";
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Building2,
  Calendar,
  CheckCircle2,
  Share2,
} from "lucide-react";

export default function InspectorReportsPage() {
  const sampleReports = [
    {
      id: "rep-1",
      title: "Statutory Foundation Review Certificate #INS-2026-00412",
      type: "Inspection Certificate",
      project: "Lekki Pearl Residences",
      generated_at: "2026-09-10",
      status: "Official Signed",
    },
    {
      id: "rep-2",
      title: "Comprehensive GPR Subsurface Radar Scan Report #GPR-88A1",
      type: "NDT Technical Report",
      project: "Eko Atlantic Tower D",
      generated_at: "2026-09-09",
      status: "Advisory Complete",
    },
    {
      id: "rep-3",
      title: "Concrete Ultrasonic UPV In-Situ Compressive Strength Assessment",
      type: "Materials Testing",
      project: "Eko Atlantic Tower D",
      generated_at: "2026-09-08",
      status: "Official Signed",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
          <FileText size={20} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
            Statutory Reports & Certificates
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
            Review, generate, and export digitally signed building control inspection reports and NDT summaries.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sampleReports.map((rep) => (
          <div
            key={rep.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {rep.type}
                </span>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {rep.status}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#022C4F]">{rep.title}</h3>
              <div className="text-xs text-slate-500 mt-1">
                Project: <strong className="text-slate-800 font-semibold">{rep.project}</strong> &bull; Generated: {rep.generated_at}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
