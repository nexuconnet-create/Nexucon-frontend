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
  X,
  AlertTriangle,
} from "lucide-react";
import { getInspectorEvidence, verifyInspectorEvidence } from "@/services/inspector";
import { dateOr, orDash } from "@/lib/display";
import FieldPhotoCaptureModal from "@/components/inspector/FieldPhotoCaptureModal";

export default function InspectorEvidencePage() {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [selectedPhotoEvidence, setSelectedPhotoEvidence] = useState<any | null>(null);
  const [verifyingMap, setVerifyingMap] = useState<Record<string, boolean>>({});
  const [verifyOutcomeMap, setVerifyOutcomeMap] = useState<Record<string, any>>({});

  const fetchEvidence = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getInspectorEvidence({
        source_type: sourceFilter !== "ALL" ? sourceFilter : undefined,
      });
      setEvidenceList(Array.isArray(data) ? data : []);
    } catch (err: any) {
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

  const handleVerify = async (ev: any) => {
    setVerifyingMap((prev) => ({ ...prev, [ev.id]: true }));
    try {
      const result = await verifyInspectorEvidence(ev.id);
      setVerifyOutcomeMap((prev) => ({
        ...prev,
        [ev.id]: {
          ...result,
          check_performed: true,
        },
      }));
    } catch (err: any) {
      setVerifyOutcomeMap((prev) => ({
        ...prev,
        [ev.id]: {
          file_bytes_ok: null,
          check_performed: false,
          error: true,
          note: err?.message || "Verification service unreachable",
        },
      }));
    } finally {
      setVerifyingMap((prev) => ({ ...prev, [ev.id]: false }));
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
            Tamper-evident sensor scans, radargrams, UPV waveforms, and field photos linked by cryptographic SHA-256 checksums and reported directly to the Government Command Center.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setIsCaptureModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Camera size={16} />
            <span>Take Photo Evidence</span>
          </button>

          <button
            type="button"
            onClick={fetchEvidence}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm"
            title="Refresh evidence"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
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
            Nothing is shown because nothing could be read. This is not an empty registry.
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
          evidenceList.map((ev) => {
            const photoUrl =
              ev.photo_url ||
              ev.payload?.photo_url ||
              ev.payload?.url ||
              ev.file?.file_url;
            const verification = verifyOutcomeMap[ev.id];
            const isVerifying = verifyingMap[ev.id];

            return (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                      {orDash(ev.evidence_reference, "Unreferenced")}
                    </span>

                    {verification ? (
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          verification.file_bytes_ok === true
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : verification.file_bytes_ok === false && verification.check_performed
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {verification.file_bytes_ok === true ? (
                          <>
                            <ShieldCheck size={12} />
                            <span>SHA-256 Validated</span>
                          </>
                        ) : verification.file_bytes_ok === false && verification.check_performed ? (
                          <>
                            <AlertTriangle size={12} />
                            <span>Hash Mismatch</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={12} />
                            <span>Check Unavailable</span>
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                        <Hash size={13} />
                        <span>Digest on file</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#022C4F] mb-1">
                    {orDash(ev.source_type_display || ev.source_type, "Source not recorded")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {orDash(ev.project_name, "Project not recorded")}
                  </p>

                  {/* Photo Evidence Preview Banner */}
                  {photoUrl && (
                    <div
                      onClick={() => setSelectedPhotoEvidence(ev)}
                      className="mt-3 relative h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 group cursor-pointer"
                    >
                      <img
                        src={photoUrl}
                        alt="Field test evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold truncate max-w-[200px]">
                            {ev.payload?.description || ev.payload?.caption || "Field Inspection Photo"}
                          </span>
                          <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1">
                            <Eye size={11} />
                            <span>View Full</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 font-medium text-[11px]">Element Link:</span>
                      <span className="font-bold text-[#022C4F]">
                        {orDash(ev.structural_element_id, "Not linked to an element")}
                      </span>
                    </div>

                    {ev.payload?.category && (
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 font-medium text-[11px]">Defect Category:</span>
                        <span className="font-semibold text-indigo-700 capitalize">
                          {ev.payload.category.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}

                    {ev.payload?.severity && (
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 font-medium text-[11px]">Severity:</span>
                        <span className={`px-2 py-0.2 rounded font-bold text-[10px] ${
                          ev.payload.severity === 'CRITICAL' ? 'text-rose-700 bg-rose-50' :
                          ev.payload.severity === 'HIGH' ? 'text-amber-800 bg-amber-50' :
                          'text-slate-700 bg-slate-100'
                        }`}>
                          {ev.payload.severity}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 font-medium text-[11px]">Integrity Hash:</span>
                      <span className="font-mono text-[11px] text-slate-600 truncate max-w-[200px]" title={ev.evidence_hash}>
                        {orDash(ev.evidence_hash, "Not recorded")}
                      </span>
                    </div>

                    {ev.coordinates && (
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 font-medium text-[11px]">Coordinates:</span>
                        <span className="text-[11px] text-slate-600 font-mono">
                          {ev.coordinates.latitude && ev.coordinates.longitude
                            ? `${ev.coordinates.latitude}, ${ev.coordinates.longitude}`
                            : JSON.stringify(ev.coordinates)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{dateOr(ev.captured_at, "Capture time not recorded")}</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleVerify(ev)}
                      disabled={isVerifying}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <RefreshCw size={10} className={isVerifying ? "animate-spin" : ""} />
                      <span>{isVerifying ? "Verifying..." : "Verify Hash"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Lightbox / High-Resolution Photo Evidence Modal */}
      {selectedPhotoEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-cyan-400" />
                <div>
                  <h3 className="text-xs font-bold truncate">
                    {selectedPhotoEvidence.evidence_reference} — Field Photo Evidence
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {selectedPhotoEvidence.structural_element_id || "Unlinked Element"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoEvidence(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={
                  selectedPhotoEvidence.photo_url ||
                  selectedPhotoEvidence.payload?.photo_url ||
                  selectedPhotoEvidence.payload?.url ||
                  selectedPhotoEvidence.file?.file_url
                }
                alt="High-resolution evidence"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="p-5 bg-white text-xs text-slate-700 space-y-3">
              {selectedPhotoEvidence.payload?.description && (
                <p className="text-xs text-slate-800 leading-relaxed">
                  <strong>Inspector Remarks:</strong> {selectedPhotoEvidence.payload.description}
                </p>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">SHA-256 Digest:</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate max-w-[360px]" title={selectedPhotoEvidence.evidence_hash}>
                    {selectedPhotoEvidence.evidence_hash}
                  </span>
                </div>

                {selectedPhotoEvidence.coordinates && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-semibold">GPS Location:</span>
                    <span className="font-mono text-slate-800">
                      {selectedPhotoEvidence.coordinates.latitude}, {selectedPhotoEvidence.coordinates.longitude}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Captured By:</span>
                  <span className="text-slate-800">
                    {selectedPhotoEvidence.inspector_name || selectedPhotoEvidence.payload?.inspector_name || "Field Inspector"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Field Photo Capture Modal */}
      <FieldPhotoCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onEvidenceCreated={() => {
          fetchEvidence();
        }}
      />
    </div>
  );
}
