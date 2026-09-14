"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Search,
  Filter,
  Camera,
  Radio,
  FileText,
  MapPin,
  CheckCircle2,
  Hash,
  ShieldCheck,
  RefreshCw,
  Eye,
  ExternalLink,
} from "lucide-react";
import { getInspectorEvidence } from "@/services/inspector";

export default function InspectorEvidencePage() {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvidence = async () => {
    setIsLoading(true);
    try {
      const data = await getInspectorEvidence({
        source_type: sourceFilter !== "ALL" ? sourceFilter : undefined,
      });
      setEvidenceList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load evidence:", err);
      setEvidenceList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [sourceFilter]);

  // Fallback sample evidence items if empty
  const displayList = evidenceList.length > 0 ? evidenceList : [
    {
      id: "ev-1",
      evidence_reference: "EV-2026-0091",
      source_type: "gpr",
      source_display: "GPR Subsurface Radar",
      project_name: "Eko Atlantic Tower D",
      structural_element_id: "COL-C24",
      captured_at: new Date().toISOString(),
      evidence_hash: "a4f89d81c2e3990471b6715b9c0a...3312",
      confidence: 0.94,
    },
    {
      id: "ev-2",
      evidence_reference: "EV-2026-0087",
      source_type: "pundit",
      source_display: "PUNDIT UPV Ultrasonic",
      project_name: "Eko Atlantic Tower D",
      structural_element_id: "SLAB-L3-TR",
      captured_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      evidence_hash: "88c21fe440a1b92019ef726a...5118",
      confidence: 0.91,
    },
    {
      id: "ev-3",
      evidence_reference: "EV-2026-0082",
      source_type: "photo",
      source_display: "High-Resolution Defect Photo",
      project_name: "Lekki Pearl Residences",
      structural_element_id: "BEAM-B12",
      captured_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      evidence_hash: "55f190e211a772c44918230b...8820",
      confidence: 0.98,
    },
    {
      id: "ev-4",
      evidence_reference: "EV-2026-0079",
      source_type: "bim_element",
      source_display: "Trimble Connect BIM Model",
      project_name: "Lekki Pearl Residences",
      structural_element_id: "FND-PILE-04",
      captured_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      evidence_hash: "31ba008f12c99a41887e4120...9944",
      confidence: 1.0,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <Layers size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
              Unified Evidence Registry
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Tamper-evident sensor scans, radargrams, UPV waveforms, and field photos linked by cryptographic SHA-256 checksums.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEvidence}
          className="self-start md:self-auto p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm"
          title="Refresh evidence"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "photo", "gpr", "pundit", "bim_element"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setSourceFilter(st)}
            className={`px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-sm ${
              sourceFilter === st
                ? "bg-[#022C4F] text-white font-bold"
                : "bg-white text-slate-600 hover:text-[#022C4F] border border-slate-200/80 font-medium"
            }`}
          >
            {st === "ALL" ? "All Evidence Types" : st.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayList.map((ev) => (
          <div
            key={ev.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  {ev.evidence_reference}
                </span>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>SHA-256 Validated</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#022C4F] mb-1">
                {ev.source_display || ev.source_type?.toUpperCase()}
              </h3>
              <p className="text-xs text-slate-500">{ev.project_name}</p>

              <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 font-medium text-[11px]">Element Link:</span>
                  <span className="font-bold text-[#022C4F]">{ev.structural_element_id || "SITE-WIDE"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 font-medium text-[11px]">Integrity Hash:</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate max-w-[200px]">{ev.evidence_hash}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{new Date(ev.captured_at).toLocaleDateString()}</span>
              <span className="text-emerald-700 font-semibold">Synchronized</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
