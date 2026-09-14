"use client";

import React, { useEffect, useRef, useState } from "react";
import { Eye, FileDown, Loader2, Maximize2, Minus, PencilLine, Plus, X } from "lucide-react";
import {
  fetchNdtReportPreview,
  downloadNdtReport,
} from "@/services/digitalEye";

/**
 * NDT report preview modal (REFINED EXECUTIVE SUMMARY §2.1): renders the
 * EXACT PDF the generate endpoint will produce — same service, same CMS
 * overrides, same branding — streamed by the preview endpoint without
 * archiving. The operator inspects the document before committing to the
 * certified dossier; "Back to edit" just closes the modal (nothing was
 * committed), "Edit in CMS" jumps to the report-CMS panel pre-filled with
 * the generated wording (11 Sep client flow), and "Generate & archive"
 * runs the real generation flow.
 */
export default function NdtReportPreviewModal({
  projectId,
  open,
  onClose,
  onGenerated,
  onEditInCms,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onGenerated?: () => void;
  /** Closes the modal and scrolls to the CMS panel (nothing archived). */
  onEditInCms?: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const frameRef = useRef<HTMLDivElement>(null);

  // Fetch the exact preview bytes each time the modal opens — data may have
  // changed since the last look; nothing is cached client-side.
  useEffect(() => {
    if (!open || !projectId) {
      setBlobUrl(null);
      setLoadError(null);
      setZoom(1.0);
      return;
    }
    let objectUrl: string | null = null;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetchNdtReportPreview(projectId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = window.URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch((err: any) => {
        if (cancelled) return;
        const detail =
          err?.response?.data?.detail ||
          err?.message ||
          "The preview could not be rendered.";
        setLoadError(String(detail));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [open, projectId]);

  const toast = (message: string, type: "success" | "error" | "info") => {
    window.dispatchEvent(
      new CustomEvent("show-toast", { detail: { message, type } }),
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await downloadNdtReport(projectId);
      onGenerated?.();
      onClose();
    } catch (err: any) {
      toast(
        `⚠️ ${err?.response?.data?.detail || err?.message || "Generation failed."}`,
        "error",
      );
    } finally {
      setGenerating(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="NDT report preview"
    >
      <div className="flex w-full max-w-5xl h-[85vh] flex-col rounded-xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="w-5 h-5 text-[#0A3D2E] shrink-0" />
            <div className="min-w-0">
              <h2 className="font-semibold text-[#0F181F] text-sm truncate">
                NDT Report Preview
              </h2>
              <p className="text-xs text-[#6B7A85] truncate">
                The exact certified document — preview only, nothing archived yet.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
              className="rounded-lg border border-slate-200 p-1.5 text-[#0F181F] hover:bg-slate-50 disabled:opacity-40"
              disabled={!blobUrl || zoom <= 0.5}
              aria-label="Zoom out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#4B5B66] tabular-nums w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.0, +(z + 0.1).toFixed(2)))}
              className="rounded-lg border border-slate-200 p-1.5 text-[#0F181F] hover:bg-slate-50 disabled:opacity-40"
              disabled={!blobUrl || zoom >= 2.0}
              aria-label="Zoom in"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1.0)}
              className="rounded-lg border border-slate-200 p-1.5 text-[#0F181F] hover:bg-slate-50 disabled:opacity-40"
              disabled={!blobUrl || zoom === 1.0}
              aria-label="Reset zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 p-1.5 text-[#0F181F] hover:bg-slate-50"
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body: the real PDF */}
        <div
          ref={frameRef}
          className="flex-grow overflow-auto bg-slate-100"
        >
          {loading && (
            <div className="flex h-full flex-col items-center justify-center gap-3" role="status">
              <Loader2 className="w-7 h-7 animate-spin text-[#0A3D2E]" />
              <p className="text-sm text-[#4B5B66]">
                Rendering the exact report the generate button will produce…
              </p>
            </div>
          )}
          {loadError && (
            <div className="flex h-full items-center justify-center p-6">
              <div className="max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {loadError}
              </div>
            </div>
          )}
          {blobUrl && !loading && !loadError && (
            <div className="flex justify-center p-4">
              <iframe
                src={blobUrl}
                title="NDT report preview"
                className="bg-white shadow-lg border border-slate-300"
                style={{
                  width: `${zoom * 100}%`,
                  height: "100%",
                  minHeight: "70vh",
                }}
              />
            </div>
          )}
        </div>

        {/* Footer: edit-in-CMS / back-to-edit vs generate */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
          <p className="text-xs text-[#6B7A85] hidden sm:block">
            Nothing is archived until Generate &amp; Archive — the wording can
            still be reworked in the CMS with the generated content pre-filled.
          </p>
          <div className="flex items-center gap-3 ml-auto flex-wrap justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-[#0F181F] hover:bg-slate-50"
            >
              Back to edit
            </button>
            {onEditInCms && (
              <button
                type="button"
                onClick={onEditInCms}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
                title="Open the report-CMS panel pre-filled with this report's generated wording"
              >
                <PencilLine className="w-4 h-4" />
                Edit in CMS
              </button>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || loading || !!loadError}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0A3D2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0A3D2E]/90 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              {generating ? "Archiving…" : "Generate & Archive"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
