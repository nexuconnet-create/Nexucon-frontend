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
import { dateOr, orDash } from "@/lib/display";

export default function InspectorEvidencePage() {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchEvidence = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getInspectorEvidence({
        source_type: sourceFilter !== "ALL" ? sourceFilter : undefined,
      });
      setEvidenceList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      // This page used to answer a failed fetch with four invented evidence
      // records — EV-2026-0091/0087/0082/0079, complete with plausible SHA-256
      // digests and "SHA-256 Validated" badges, for projects and structural
      // elements that were never scanned. On a registry whose entire purpose is
      // to attest what was captured, a fabricated attestation is the worst
      // possible failure mode: it is indistinguishable from a real one.
      //
      // An error is now an error. The list stays empty and the failure is named.
      setEvidenceList([]);
      setLoadError(
        err?.response?.data?.detail ||
          err?.message ||
          "Could not reach the evidence registry."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilter]);

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

      {/* Failure, emptiness and loading are three different facts and the page
          now says which one it is. Previously all three rendered the same four
          invented cards. */}
      {isLoading && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 text-center">
          <RefreshCw size={20} className="animate-spin mx-auto text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Loading evidence registry…</p>
        </div>
      )}

      {!isLoading && loadError && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
          <h3 className="text-sm font-bold text-amber-900 mb-1">
            Evidence registry unavailable
          </h3>
          <p className="text-xs text-amber-800">{loadError}</p>
          <p className="text-xs text-amber-700 mt-2">
            Nothing is shown because nothing could be read. This is not an empty
            registry.
          </p>
        </div>
      )}

      {!isLoading && !loadError && evidenceList.length === 0 && (
        <div className="p-10 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
          <Layers size={22} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-600">
            No evidence recorded yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {sourceFilter === "ALL"
              ? "No scans, radargrams or field photos have been registered against your projects."
              : `No ${sourceFilter.toUpperCase()} evidence has been registered against your projects.`}
          </p>
        </div>
      )}

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isLoading &&
          !loadError &&
          evidenceList.map((ev) => (
          <div
            key={ev.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  {orDash(ev.evidence_reference, "Unreferenced")}
                </span>
                {/* The list endpoint returns the record's hash but not the
                    result of re-verifying it — that lives on the file, behind
                    the detail endpoint. So this states what is actually known
                    here: a digest is on file. It does not claim it was checked,
                    which is what the old unconditional "SHA-256 Validated"
                    badge did on every row, including invented ones. */}
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                  <Hash size={13} />
                  <span>Digest on file</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#022C4F] mb-1">
                {orDash(ev.source_type_display || ev.source_type, "Source not recorded")}
              </h3>
              <p className="text-xs text-slate-500">
                {orDash(ev.project_name, "Project not recorded")}
              </p>

              <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 font-medium text-[11px]">Element Link:</span>
                  <span className="font-bold text-[#022C4F]">
                    {orDash(ev.structural_element_id, "Not linked to an element")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 font-medium text-[11px]">Integrity Hash:</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate max-w-[200px]">
                    {orDash(ev.evidence_hash, "Not recorded")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{dateOr(ev.captured_at, "Capture time not recorded")}</span>
              <span className="font-medium">
                Confidence:{" "}
                {typeof ev.confidence === "number"
                  ? `${Math.round(ev.confidence * 100)}%`
                  : "Not recorded"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
