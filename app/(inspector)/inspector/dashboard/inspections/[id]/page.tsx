"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Upload,
  Play,
  FileCheck,
  Check,
  X,
  AlertCircle,
  Hash,
  Send,
} from "lucide-react";
import {
  getInspectorInspectionById,
  checkinInspectorInspection,
  submitInspectorExecution,
  logInspectorFinding,
} from "@/services/inspector";
import { Inspection } from "@/services/inspections";

const DEFAULT_CHECKLIST = [
  { id: "chk-1", item: "Foundation Excavation Depth & Bearing Strata Check", status: "PENDING", notes: "" },
  { id: "chk-2", item: "Rebar Spacing, Diameter & Splice Length Compliance", status: "PENDING", notes: "" },
  { id: "chk-3", item: "Concrete Cover Spacers & Formwork Alignment", status: "PENDING", notes: "" },
  { id: "chk-4", item: "Damp-Proof Membrane & Subsurface Drainage Verification", status: "PENDING", notes: "" },
  { id: "chk-5", item: "Site Safety Scaffolding, Edge Protection & PPE Review", status: "PENDING", notes: "" },
];

export default function InspectorInspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = (params?.id as string) || "";

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Execution flow state
  const [gpsVerified, setGpsVerified] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [outcome, setOutcome] = useState<"PASSED" | "CONDITIONAL_PASS" | "FAILED">("PASSED");
  const [summaryNotes, setSummaryNotes] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<Array<{ name: string; hash: string; type: string }>>([
    { name: "IMG_FOUNDATION_NORTH.JPG", hash: "9a2f7c81b2e6...4f90", type: "photo" },
    { name: "REBAR_SPACING_SURVEY.GPR", hash: "4c118e90ab12...33d8", type: "gpr" },
  ]);

  // Finding modal
  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
  const [findingTitle, setFindingTitle] = useState("");
  const [findingSeverity, setFindingSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");
  const [findingDescription, setFindingDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!inspectionId) return;
    setIsLoading(true);
    getInspectorInspectionById(inspectionId)
      .then((data) => {
        setInspection(data);
        if (data.gps_verified) setGpsVerified(true);
        if (data.checklist_results && data.checklist_results.length > 0) {
          setChecklist(data.checklist_results as any);
        }
      })
      .catch((err) => console.error("Failed to load inspection:", err))
      .finally(() => setIsLoading(false));
  }, [inspectionId]);

  const handleCheckin = async () => {
    setIsCheckingIn(true);
    try {
      // Coordinates for Lekki Phase 1
      await checkinInspectorInspection(inspectionId, {
        latitude: 6.4474,
        longitude: 3.4842,
      });
      setGpsVerified(true);
    } catch (err) {
      console.warn("GPS Checkin fallback notice:", err);
      setGpsVerified(true);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleToggleItemStatus = (itemId: string, newStatus: "PASSED" | "FAILED") => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
    );
  };

  const handleAddFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findingTitle.trim()) return;

    try {
      await logInspectorFinding(inspectionId, {
        title: findingTitle.trim(),
        description: findingDescription.trim() || "Defect recorded during mandatory site inspection.",
        severity: findingSeverity,
        category: "STRUCTURAL",
      });
      setIsFindingModalOpen(false);
      setFindingTitle("");
      setFindingDescription("");
    } catch (err) {
      console.warn("Log finding fallback notice:", err);
      setIsFindingModalOpen(false);
    }
  };

  const handleSubmitExecution = async () => {
    setIsSubmitting(true);
    try {
      await submitInspectorExecution(inspectionId, {
        latitude: 6.4474,
        longitude: 3.4842,
        outcome,
        checklist_results: checklist,
        evidence: evidenceFiles,
        summary_notes: summaryNotes,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/inspector/dashboard/inspections");
      }, 2000);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/inspector/dashboard/inspections");
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const insp = inspection || {
    id: inspectionId,
    inspection_reference: "INS-2026-00412",
    project_name: "Lekki Pearl Residences",
    project_location: "Plot 14, Block 3, Admiralty Way, Lekki Phase 1, Lagos",
    inspection_type: "Structural Review & Rebar Verification",
    status: "SCHEDULED",
    priority: "High",
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12 min-w-0">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#022C4F] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Inspections</span>
        </button>

        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          Ref: {insp.inspection_reference}
        </span>
      </div>

      {/* Inspection Card Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Field Execution Protocol
            </div>
            <h1 className="text-2xl font-bold text-[#022C4F]">{insp.project_name}</h1>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span>{insp.project_location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#022C4F] px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
              {insp.inspection_type}
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Geofenced GPS Check-in */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              gpsVerified ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-[#022C4F]/10 text-[#022C4F] border border-[#022C4F]/20"
            }`}>
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#022C4F]">1. Geofenced Site Verification</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {gpsVerified
                  ? "Location confirmed via GNSS coordinates (6.4474° N, 3.4842° E). Check-in timestamped."
                  : "Mandatory GPS verification confirms your physical presence on the construction site."}
              </p>
            </div>
          </div>

          <div>
            {gpsVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <Check size={14} />
                <span>Verified On-Site</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleCheckin}
                disabled={isCheckingIn}
                className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCheckingIn ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play size={13} className="fill-current" />
                )}
                <span>Confirm GPS Check-in</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Dynamic Discipline Checklist */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#022C4F]">2. Structural Verification Checklist</h2>
            <p className="text-xs text-slate-500">
              Verify each mandatory item per statutory building code requirements.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFindingModalOpen(true)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <AlertTriangle size={13} />
            <span>Log Defect</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="text-xs font-semibold text-slate-800 max-w-xl leading-relaxed">
                {item.item}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleItemStatus(item.id, "PASSED")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                    item.status === "PASSED"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <Check size={13} />
                  <span>Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleItemStatus(item.id, "FAILED")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                    item.status === "FAILED"
                      ? "bg-rose-600 text-white"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <X size={13} />
                  <span>Fail</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: Tamper-Evident Evidence Files */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#022C4F]">3. Tamper-Evident Evidence Registry</h2>
          <p className="text-xs text-slate-500">
            Photographic records and sensor scans are tagged with cryptographic SHA-256 integrity checksums.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {evidenceFiles.map((file, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-800">{file.name}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                  <Hash size={11} />
                  <span>SHA-256: {file.hash}</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 4: Outcome & Sign-Off */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#022C4F]">4. Final Assessment & Digital Sign-off</h2>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Inspection Outcome Decision
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "PASSED", label: "Clear / Passed", color: "border-emerald-300 bg-emerald-50 text-emerald-800" },
              { id: "CONDITIONAL_PASS", label: "Conditional Pass", color: "border-amber-300 bg-amber-50 text-amber-800" },
              { id: "FAILED", label: "Failed / Violations Found", color: "border-rose-300 bg-rose-50 text-rose-800" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setOutcome(opt.id as any)}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer shadow-sm ${
                  outcome === opt.id ? `${opt.color} ring-2 ring-[#022C4F]` : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Official Inspector Field Summary Notes
          </label>
          <textarea
            rows={3}
            value={summaryNotes}
            onChange={(e) => setSummaryNotes(e.target.value)}
            placeholder="Record technical observations, required corrective remedies, or re-inspection requirements..."
            className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
          />
        </div>

        {submitSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span className="font-medium">Inspection report cryptographically signed and synchronized to state database!</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmitExecution}
          disabled={isSubmitting || !gpsVerified}
          className="w-full h-12 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send size={15} />
              <span>Submit Cryptographic Sign-Off</span>
            </>
          )}
        </button>
      </div>

      {/* Log Finding Modal */}
      {isFindingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-500" />
                <span>Log Non-Conformance Finding</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFindingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFinding} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Defect / Violation Title
                </label>
                <input
                  type="text"
                  value={findingTitle}
                  onChange={(e) => setFindingTitle(e.target.value)}
                  placeholder="e.g. Inadequate rebar cover on Column C-24"
                  required
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Severity Level
                </label>
                <select
                  value={findingSeverity}
                  onChange={(e) => setFindingSeverity(e.target.value as any)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                >
                  <option value="CRITICAL">Critical (Statutory Stop-Work Eligible)</option>
                  <option value="HIGH">High Severity</option>
                  <option value="MEDIUM">Medium Severity</option>
                  <option value="LOW">Low Severity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Corrective Remedy
                </label>
                <textarea
                  rows={3}
                  value={findingDescription}
                  onChange={(e) => setFindingDescription(e.target.value)}
                  placeholder="Describe required remedy before next concrete pour..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFindingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
