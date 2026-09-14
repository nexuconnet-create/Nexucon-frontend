"use client";

import React, { useState } from "react";
import {
  FolderOpen,
  Search,
  FileText,
  Download,
  Building2,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function InspectorDocumentsPage() {
  const [docCategory, setDocCategory] = useState("ALL");

  const sampleDocs = [
    {
      id: "doc-1",
      name: "Approved Architectural Drawing Set v3.pdf",
      category: "Drawings",
      project: "Lekki Pearl Residences",
      size: "24.2 MB",
      date: "2026-08-14",
    },
    {
      id: "doc-2",
      name: "Building Permit LASBCA-2026-0491.pdf",
      category: "Permits",
      project: "Lekki Pearl Residences",
      size: "1.8 MB",
      date: "2026-08-01",
    },
    {
      id: "doc-3",
      name: "Structural Calculations & Pile Load Test.pdf",
      category: "Technical Reports",
      project: "Eko Atlantic Tower D",
      size: "14.6 MB",
      date: "2026-08-20",
    },
    {
      id: "doc-4",
      name: "Environmental Compliance Certificate.pdf",
      category: "Compliance",
      project: "Victoria Island Hub",
      size: "2.1 MB",
      date: "2026-07-28",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
          <FolderOpen size={20} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
            Statutory & Project Documents
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
            Access authenticated permits, structural drawings, geotechnical certificates, and formal inspection reports.
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "Permits", "Drawings", "Technical Reports", "Compliance"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setDocCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-sm ${
              docCategory === cat
                ? "bg-[#022C4F] text-white font-bold"
                : "bg-white text-slate-600 hover:text-[#022C4F] border border-slate-200/80 font-medium"
            }`}
          >
            {cat === "ALL" ? "All Documents" : cat}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {sampleDocs
            .filter((d) => docCategory === "ALL" || d.category === docCategory)
            .map((doc) => (
              <div
                key={doc.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#022C4F]/5 border border-[#022C4F]/10 text-[#022C4F] flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#022C4F]">{doc.name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{doc.project}</span>
                      <span>&bull;</span>
                      <span>{doc.size}</span>
                      <span>&bull;</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#022C4F] transition-colors cursor-pointer shadow-sm"
                    title="Download Document"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#022C4F] transition-colors cursor-pointer shadow-sm"
                    title="View Document"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
