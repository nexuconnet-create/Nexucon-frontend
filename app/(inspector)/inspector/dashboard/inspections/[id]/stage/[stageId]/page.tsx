"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Camera,
  Mic,
  MicOff,
  AlertTriangle,
  FileText,
  Save,
  Send,
  Sparkles,
  Check,
  X,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { computeSHA256, enqueueSyncItem } from "@/lib/offline-sync";

interface ChecklistItem {
  id: number;
  title: string;
  status: "PASS" | "FAIL" | "NA" | "UNSET";
  comment: string;
  photos: Array<{ name: string; hash: string; url: string }>;
  voiceNote: string | null;
}

const INITIAL_ITEMS: ChecklistItem[] = [
  {
    id: 1,
    title: "1. Foundation Excavation Depth & Bearing Strata Check",
    status: "PASS",
    comment: "Excavation depth is 2.5m, matches structural foundation design specifications.",
    photos: [
      {
        name: "FOUNDATION_STRATA_NORTH.JPG",
        hash: "a3f5b8c2d1e4f7a9b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3",
        url: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=400&auto=format&fit=crop",
      },
    ],
    voiceNote: "Recorded: 14s (Clear strata confirmed at 2.5m depth)",
  },
  {
    id: 2,
    title: "2. Rebar Spacing, Diameter & Splice Length Compliance",
    status: "PASS",
    comment: "Spacing is 150mm, within tolerance. T20 rebar diameter verified with digital gauge.",
    photos: [],
    voiceNote: null,
  },
  {
    id: 3,
    title: "3. Concrete Cover Spacers & Formwork Alignment",
    status: "PASS",
    comment: "Cover spacers in place (50mm nominal), formwork aligned plumb within 3mm.",
    photos: [],
    voiceNote: null,
  },
  {
    id: 4,
    title: "4. Damp-Proof Membrane & Subsurface Drainage Verification",
    status: "UNSET",
    comment: "Not yet installed - pending completion of sub-base compaction.",
    photos: [],
    voiceNote: null,
  },
  {
    id: 5,
    title: "5. Site Safety Scaffolding, Edge Protection & PPE Review",
    status: "UNSET",
    comment: "Safety compliance verified for perimeter excavation berms.",
    photos: [],
    voiceNote: null,
  },
];

export default function ChecklistStagePage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = (params?.id as string) || "insp-001";
  const stageId = (params?.stageId as string) || "stage-1";

  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_ITEMS);
  const [activeRecordingId, setActiveRecordingId] = useState<number | null>(null);
  const [isSavedDraft, setIsSavedDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Defect Modal State
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [defectTitle, setDefectTitle] = useState("");
  const [defectSeverity, setDefectSeverity] = useState<"HIGH" | "MEDIUM" | "CRITICAL">("HIGH");
  const [defectDesc, setDefectDesc] = useState("");

  const completedCount = items.filter((i) => i.status !== "UNSET").length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  const handleStatusChange = (id: number, status: "PASS" | "FAIL" | "NA") => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  const handleCommentChange = (id: number, comment: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, comment } : i))
    );
  };

  const handleAddPhoto = async (id: number) => {
    const mockHash = await computeSHA256(`PHOTO_${id}_${Date.now()}`);
    const newPhoto = {
      name: `CHK_EVIDENCE_ITEM_${id}_${Date.now().toString().slice(-4)}.JPG`,
      hash: mockHash,
      url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=400&auto=format&fit=crop",
    };

    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, photos: [...i.photos, newPhoto] } : i
      )
    );

    enqueueSyncItem({
      type: "EVIDENCE",
      title: newPhoto.name,
      payload: { itemId: id, inspectionId, stageId },
      hash: mockHash,
      timestamp: new Date().toISOString(),
      sizeBytes: 1850000,
      source: "FIELD_TERMINAL",
    });
  };

  const handleToggleVoice = (id: number) => {
    if (activeRecordingId === id) {
      setActiveRecordingId(null);
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, voiceNote: `Voice Note (${new Date().toLocaleTimeString()}) - Audio Verified` }
            : i
        )
      );
    } else {
      setActiveRecordingId(id);
    }
  };

  const handleSaveDraft = () => {
    setIsSavedDraft(true);
    setTimeout(() => setIsSavedDraft(false), 2500);
  };

  const handleSubmitStage = async () => {
    setIsSubmitting(true);
    const stageHash = await computeSHA256(JSON.stringify(items));
    enqueueSyncItem({
      type: "CHECKLIST_STAGE",
      title: `Stage 1 Foundation Checklist - ${inspectionId}`,
      payload: { stageId, items, completedCount, progressPercent },
      hash: stageHash,
      timestamp: new Date().toISOString(),
      sizeBytes: 12400,
      source: "FIELD_TERMINAL",
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const handleLogDefect = () => {
    if (!defectTitle) return;
    enqueueSyncItem({
      type: "EVIDENCE",
      title: `Finding: ${defectTitle}`,
      payload: { severity: defectSeverity, description: defectDesc, inspectionId },
      hash: "f7a9b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3a3f5b8c2d1e4",
      timestamp: new Date().toISOString(),
      sizeBytes: 3200,
      source: "FIELD_TERMINAL",
    });
    setIsDefectModalOpen(false);
    setDefectTitle("");
    setDefectDesc("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/inspector/dashboard/inspections/${inspectionId}`)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to Inspection Terminal"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[11px] font-mono text-gray-400 font-bold uppercase">
              STRUCTURAL INSPECTION CHECKLIST
            </div>
            <h1 className="text-lg sm:text-xl font-black text-[#022C4F]">
              STAGE 1: FOUNDATION EXCAVATION
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={14} />
            <span>{isSavedDraft ? "Draft Saved ✅" : "Save Draft"}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Widget (Specified in Wireframe 3) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-gray-600">
            PROGRESS: {completedCount}/{items.length} items completed
          </span>
          <span className="text-[#022C4F]">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#022C4F] h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Items Container */}
      <div className="space-y-4">
        <div className="px-2 text-xs font-mono font-bold uppercase text-gray-500 tracking-wider">
          CHECKLIST ITEMS
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition-all ${
              item.status === "PASS"
                ? "border-emerald-200 bg-emerald-50/15"
                : item.status === "FAIL"
                ? "border-rose-300 bg-rose-50/20"
                : item.status === "NA"
                ? "border-slate-300 bg-slate-50/40"
                : "border-slate-200/80"
            }`}
          >
            {/* Title & Status Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900 leading-snug">
                {item.title}
              </h3>

              {/* Status Radio Toggles: PASS, FAIL, N/A */}
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleStatusChange(item.id, "PASS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${
                    item.status === "PASS"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>PASS</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(item.id, "FAIL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${
                    item.status === "FAIL"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <XCircle size={13} />
                  <span>FAIL</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(item.id, "NA")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${
                    item.status === "NA"
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MinusCircle size={13} />
                  <span>N/A</span>
                </button>
              </div>
            </div>

            {/* Comments Field */}
            <div>
              <label className="text-[11px] font-mono text-gray-500 font-bold block mb-1">
                Comments:
              </label>
              <textarea
                value={item.comment}
                onChange={(e) => handleCommentChange(item.id, e.target.value)}
                placeholder="Enter field notes, tolerance measurements or remarks..."
                rows={2}
                className="w-full text-xs font-medium text-gray-800 bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#022C4F] transition-colors"
              />
            </div>

            {/* Photos & Voice Note Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddPhoto(item.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera size={14} className="text-[#0284C7]" />
                  <span>📸 Add Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleVoice(item.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeRecordingId === item.id
                      ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {activeRecordingId === item.id ? (
                    <>
                      <MicOff size={14} className="text-rose-600" />
                      <span>Recording... (Tap to Stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic size={14} className="text-indigo-600" />
                      <span>🎤 Voice Note</span>
                    </>
                  )}
                </button>
              </div>

              {/* Photos Count / Voice Note Status Badge */}
              <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                {item.photos.length > 0 && (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    <ImageIcon size={12} />
                    <span>{item.photos.length} Photo Attached</span>
                  </span>
                )}
                {item.voiceNote && (
                  <span className="flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    <span>{item.voiceNote}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Sticky Action Bar (Wireframe 3: Log Defect, Add Comment, Submit Stage) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsDefectModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle size={15} className="text-rose-600" />
            <span>⚠️ LOG DEFECT</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText size={15} />
            <span>📝 ADD COMMENT</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmitStage}
          disabled={isSubmitting || isSubmitted}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            isSubmitted
              ? "bg-emerald-600 text-white cursor-default"
              : "bg-[#022C4F] hover:bg-[#022C4F]/90 text-white"
          }`}
        >
          {isSubmitted ? (
            <>
              <CheckCircle2 size={16} />
              <span>STAGE SUBMITTED &amp; HASHED ✅</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>{isSubmitting ? "Encrypting & Submitting..." : "✅ SUBMIT STAGE"}</span>
            </>
          )}
        </button>
      </div>

      {/* Log Defect Modal */}
      {isDefectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle size={18} />
                <h3 className="text-base font-bold text-gray-900">Log Structural Defect</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDefectModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Defect Title</label>
                <input
                  type="text"
                  value={defectTitle}
                  onChange={(e) => setDefectTitle(e.target.value)}
                  placeholder="e.g. Excessive deflection on cantilever beam"
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Severity</label>
                <select
                  value={defectSeverity}
                  onChange={(e) => setDefectSeverity(e.target.value as any)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="MEDIUM">MEDIUM (Corrective action required within 7 days)</option>
                  <option value="HIGH">HIGH (Notice of non-compliance)</option>
                  <option value="CRITICAL">CRITICAL (Immediate Stop-Work Order trigger)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Technical Description</label>
                <textarea
                  value={defectDesc}
                  onChange={(e) => setDefectDesc(e.target.value)}
                  rows={3}
                  placeholder="Specify location grid, tolerance deviation and required remedy..."
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDefectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogDefect}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase"
              >
                File Finding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
