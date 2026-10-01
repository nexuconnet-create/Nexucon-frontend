"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  X,
  AlertTriangle,
  Building2,
  Sparkles,
  Download,
} from "lucide-react";
import { getInspectorEvidence, verifyInspectorEvidence } from "@/services/inspector";
import { dateOr, orDash } from "@/lib/display";
import { getAssignableProjects } from "@/services/inspector";

export default function GovernmentEvidenceRegistryPage() {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Verification & Inspection Modal state
  const [selectedEvidence, setSelectedEvidence] = useState<any | null>(null);
  const [verifyingMap, setVerifyingMap] = useState<Record<string, boolean>>({});
  const [verifiedMap, setVerifiedMap] = useState<Record<string, any>>({});

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [evidenceRes, projectsRes] = await Promise.all([
        getInspectorEvidence({
          project: selectedProjectId !== "ALL" ? selectedProjectId : undefined,
          source_type: sourceFilter !== "ALL" ? sourceFilter : undefined,
        }),
        getAssignableProjects().catch(() => []),
      ]);
      setEvidenceList(Array.isArray(evidenceRes) ? evidenceRes : []);
      setProjects(Array.isArray(projectsRes) ? projectsRes : []);
    } catch (err: any) {
      setEvidenceList([]);
      setLoadError(
        err?.response?.data?.detail ||
          err?.message ||
          "Could not load records from the Centralized Evidence Registry."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, sourceFilter]);

  const handleVerify = async (ev: any) => {
    setVerifyingMap((prev) => ({ ...prev, [ev.id]: true }));
    try {
      const result = await verifyInspectorEvidence(ev.id);
      setVerifiedMap((prev) => ({ ...prev, [ev.id]: result }));
    } catch (err: any) {
      setVerifiedMap((prev) => ({
        ...prev,
        [ev.id]: {
          file_bytes_ok: false,
          note: err?.message || "Cryptographic verification check failed",
        },
      }));
    } finally {
      setVerifyingMap((prev) => ({ ...prev, [ev.id]: false }));
    }
  };

  // Filtered evidence by search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return evidenceList;
    const q = searchQuery.toLowerCase();
    return evidenceList.filter((ev) => {
      const ref = (ev.evidence_reference || "").toLowerCase();
      const elem = (ev.structural_element_id || "").toLowerCase();
      const proj = (ev.project_name || "").toLowerCase();
      const desc = (ev.payload?.description || "").toLowerCase();
      const cat = (ev.payload?.category || "").toLowerCase();
      const hash = (ev.evidence_hash || "").toLowerCase();
      return (
        ref.includes(q) ||
        elem.includes(q) ||
        proj.includes(q) ||
        desc.includes(q) ||
        cat.includes(q) ||
        hash.includes(q)
      );
    });
  }, [evidenceList, searchQuery]);

  // Aggregate KPI metrics
  const kpis = useMemo(() => {
    const total = evidenceList.length;
    const photos = evidenceList.filter(
      (e) =>
        e.source_type === "photo" ||
        e.photo_url ||
        e.payload?.photo_url ||
        e.file?.file_url
    ).length;
    const critical = evidenceList.filter(
      (e) =>
        e.payload?.severity === "CRITICAL" ||
        e.payload?.severity === "HIGH"
    ).length;
    const sealed = evidenceList.filter((e) => Boolean(e.evidence_hash)).length;
    return { total, photos, critical, sealed };
  }, [evidenceList]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#022C4F] flex items-center justify-center text-white shadow-lg">
              <Layers size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 uppercase tracking-wider">
                  State Directorate & Command Center
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] leading-tight">
                Unified Field Evidence & Defect Registry
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[60px] max-w-3xl">
            Statutory registry of high-resolution photographic defect evidence, ultrasonic UPV waveforms, and subsurface GPR radar scans submitted by accredited field inspectors. All artifacts are sealed with immutable cryptographic SHA-256 checksums.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Sync Live Records</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Ingested Evidence
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
              {kpis.total}
            </span>
            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Multi-source
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Field Test Photos
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
              {kpis.photos}
            </span>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
              <Camera size={11} />
              Inspected
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Critical / High Defects
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {kpis.critical}
            </span>
            <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
              <AlertTriangle size={11} />
              Requires Action
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            SHA-256 Sealed Records
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {kpis.sealed}
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck size={11} />
              100% Cryptographic
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Source Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: "All Evidence" },
            { id: "photo", label: "Field Photos" },
            { id: "pundit", label: "PUNDIT UPV" },
            { id: "gpr", label: "GPR Radar" },
            { id: "bim_element", label: "BIM Elements" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSourceFilter(st.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs transition-colors shrink-0 ${
                sourceFilter === st.id
                  ? "bg-[#022C4F] text-white font-bold shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 font-medium"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Project Selector & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Jurisdiction Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, element, hash..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center">
          <RefreshCw size={24} className="animate-spin mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-semibold text-slate-700">
            Fetching unified evidence register from secure vault...
          </p>
        </div>
      )}

      {!isLoading && loadError && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Registry Fetch Error</span>
          </h3>
          <p className="text-xs text-amber-800 mt-1">{loadError}</p>
        </div>
      )}

      {!isLoading && !loadError && filteredList.length === 0 && (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-2">
          <Layers size={28} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No Evidence Found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No field evidence records match your current filter parameters or jurisdiction scope.
          </p>
        </div>
      )}

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {!isLoading &&
          !loadError &&
          filteredList.map((ev) => {
            const photoUrl =
              ev.photo_url ||
              ev.payload?.photo_url ||
              ev.payload?.url ||
              ev.file?.file_url;
            const verification = verifiedMap[ev.id];
            const isVerifying = verifyingMap[ev.id];

            return (
              <div
                key={ev.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Photo Evidence Thumbnail Preview */}
                  {photoUrl ? (
                    <div
                      onClick={() => setSelectedEvidence(ev)}
                      className="relative h-44 bg-slate-900 overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={photoUrl}
                        alt="Evidence artifact"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                            {orDash(ev.evidence_reference, "REF")}
                          </span>
                          <span className="text-[10px] text-white bg-indigo-600/90 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                            <Eye size={11} />
                            <span>Audit Dossier</span>
                          </span>
                        </div>

                        <div>
                          <span className="text-xs font-bold text-white block truncate">
                            {ev.payload?.description || ev.payload?.caption || "Field Inspection Photograph"}
                          </span>
                          <span className="text-[10px] text-slate-300 font-mono">
                            {ev.structural_element_id || "Unlinked Element"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                      <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                        {orDash(ev.evidence_reference, "REF")}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {ev.source_type_display || ev.source_type}
                      </span>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#022C4F] flex items-center justify-between gap-2">
                        <span>{ev.project_name || "Assigned Project"}</span>
                        {ev.payload?.severity && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              ev.payload.severity === "CRITICAL"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : ev.payload.severity === "HIGH"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {ev.payload.severity}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Element: <span className="font-bold text-slate-800">{ev.structural_element_id || "General Site"}</span>
                      </p>
                    </div>

                    {/* Metadata breakdown box */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                      {ev.payload?.category && (
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="text-slate-400 font-medium text-[11px]">Defect Type:</span>
                          <span className="font-semibold text-indigo-700 capitalize">
                            {ev.payload.category.replace(/_/g, " ")}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-slate-400 font-medium text-[11px]">SHA-256 Digest:</span>
                        <span
                          className="font-mono text-[11px] text-slate-700 truncate max-w-[170px]"
                          title={ev.evidence_hash}
                        >
                          {orDash(ev.evidence_hash, "Pending Seal")}
                        </span>
                      </div>

                      {ev.coordinates && (
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="text-slate-400 font-medium text-[11px]">GPS Fix:</span>
                          <span className="text-[11px] font-mono text-slate-700">
                            {ev.coordinates.latitude && ev.coordinates.longitude
                              ? `${ev.coordinates.latitude}, ${ev.coordinates.longitude}`
                              : "Logged"}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-slate-400 font-medium text-[11px]">Inspector:</span>
                        <span className="font-medium text-slate-800">
                          {ev.inspector_name || ev.payload?.inspector_name || "Accredited Inspector"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Attestation Status */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {dateOr(ev.captured_at, "Date unrecorded")}
                  </span>

                  <div className="flex items-center gap-2">
                    {verification ? (
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          verification.file_bytes_ok
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {verification.file_bytes_ok ? (
                          <>
                            <ShieldCheck size={11} />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={11} />
                            <span>Seal Altered</span>
                          </>
                        )}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleVerify(ev)}
                        disabled={isVerifying}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#022C4F] font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      >
                        <RefreshCw size={10} className={isVerifying ? "animate-spin" : ""} />
                        <span>{isVerifying ? "Verifying..." : "Verify Seal"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Lightbox / Audit Inspection Dossier Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Camera size={18} className="text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold">
                    {selectedEvidence.evidence_reference} — Official Inspection Artifact
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Project: {selectedEvidence.project_name} | Element: {selectedEvidence.structural_element_id || "General"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvidence(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
              <img
                src={
                  selectedEvidence.photo_url ||
                  selectedEvidence.payload?.photo_url ||
                  selectedEvidence.payload?.url ||
                  selectedEvidence.file?.file_url
                }
                alt="High-resolution evidence"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="p-5 bg-white text-xs text-slate-700 space-y-3 overflow-y-auto">
              {selectedEvidence.payload?.description && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Inspector Defect Notes:</h4>
                  <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedEvidence.payload.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Cryptographic Verification</span>
                  <div className="font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 break-all">
                    {selectedEvidence.evidence_hash}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Attestation & Lineage</span>
                  <div className="text-slate-600">
                    <div>Officer: <span className="font-bold text-slate-800">{selectedEvidence.inspector_name || selectedEvidence.payload?.inspector_name || "Field Inspector"}</span></div>
                    <div>Timestamp: <span className="text-slate-800">{dateOr(selectedEvidence.captured_at, "N/A")}</span></div>
                    {selectedEvidence.coordinates && (
                      <div>GPS: <span className="font-mono text-slate-800">{selectedEvidence.coordinates.latitude}, {selectedEvidence.coordinates.longitude}</span></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
