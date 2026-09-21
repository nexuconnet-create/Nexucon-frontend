"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  FileDown,
  Loader2,
  PencilLine,
} from "lucide-react";
import {
  downloadNdtReport,
  fetchNdtReportPreviewBundle,
  type NdtPreviewSection,
} from "@/services/digitalEye";

/**
 * REPORT PREVIEW — the REFINED EXECUTIVE SUMMARY §2.1 wireframe, rendered
 * as an in-page state of the PUNDIT reports page (15 Sep 2026 client
 * feedback): header with "← Back to Edit", a toolbar (Page X of Y, zoom,
 * Download, Generate), a SECTIONS sidebar listing the wireframe's 14
 * entries, and the exact certified PDF beside it. The bundle endpoint
 * returns the sidebar map and the document from ONE render pass, so a
 * sidebar click always lands on the page it names. Nothing is archived
 * until "Generate & Archive"; "Edit in CMS" returns to the report-CMS
 * panel pre-filled with the generated wording (11 Sep client flow).
 */
const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

export default function NdtReportPreviewView({
  projectId,
  onBackToEdit,
  onGenerated,
  onEditInCms,
}: {
  projectId: string;
  /** Returns to the editing page exactly as it was left — nothing committed. */
  onBackToEdit: () => void;
  onGenerated?: () => void;
  /** Exits the preview and scrolls to the report-CMS panel. */
  onEditInCms?: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [sections, setSections] = useState<NdtPreviewSection[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Fetch the bundle fresh each time the view mounts — data may have
  // changed since the last look; nothing is cached client-side.
  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetchNdtReportPreviewBundle(projectId)
      .then(({ blob, sections: secs, pageCount: total }) => {
        if (cancelled) return;
        objectUrl = window.URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setSections(secs);
        setPageCount(total);
        setCurrentPage(secs[0]?.page ?? 1);
        setActiveKey(secs[0]?.key ?? null);
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
  }, [projectId]);

  const toast = (message: string, type: "success" | "error" | "info") => {
    window.dispatchEvent(
      new CustomEvent("show-toast", { detail: { message, type } })
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await downloadNdtReport(projectId);
      onGenerated?.();
    } catch (err: any) {
      toast(
        `⚠️ ${err?.response?.data?.detail || err?.message || "Generation failed."}`,
        "error"
      );
    } finally {
      setGenerating(false);
    }
  };

  // Navigating to a section: the blob URL gains a #page=N fragment, which
  // the browser's PDF viewer honours by jumping to that physical page.
  const jumpToSection = (section: NdtPreviewSection) => {
    setActiveKey(section.key);
    setCurrentPage(section.page);
  };

  const frameSrc = useMemo(
    () => (blobUrl && activeKey
      ? `${blobUrl}#page=${currentPage}`
      : blobUrl ?? ""),
    [blobUrl, activeKey, currentPage]
  );

  return (
    <div className="px-6 mt-6 animate-in fade-in duration-300">
      <div className="flex w-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header — the wireframe's "REPORT PREVIEW [← Back to Edit]" */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="w-5 h-5 text-[#0A3D2E] shrink-0" />
            <div className="min-w-0">
              <h2 className="font-semibold text-[#0F181F] text-sm truncate">
                Report Preview
              </h2>
              <p className="text-xs text-[#6B7A85] truncate">
                The exact certified document — preview only, nothing archived yet.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBackToEdit}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-[#0F181F] hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Edit
          </button>
        </div>

        {/* Toolbar — Page X of Y | zoom | download | generate */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-2.5">
          <span
            className="text-xs font-medium text-[#4B5B66] tabular-nums"
            aria-live="polite"
          >
            Page {currentPage} of {pageCount || "…"}
          </span>
          <label className="flex items-center gap-1.5 text-xs text-[#4B5B66]">
            Zoom
            <select
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={!blobUrl}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-[#0F181F] disabled:opacity-40"
              aria-label="Preview zoom"
            >
              {ZOOM_LEVELS.map((z) => (
                <option key={z} value={z}>{z}%</option>
              ))}
            </select>
          </label>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {blobUrl && (
              <a
                href={blobUrl}
                download={`ndt_report_PREVIEW_${projectId}.pdf`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-[#0F181F] hover:bg-slate-50"
                title="Download this preview — nothing is archived"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
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
                <CheckCircle2 className="w-4 h-4" />
              )}
              {generating ? "Archiving…" : "Generate & Archive"}
            </button>
          </div>
        </div>

        {/* Body — SECTIONS sidebar + PREVIEW pane (wireframe layout) */}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar: a vertical list on desktop, a scrollable pill strip on
              small screens (no horizontal page scroll either way). */}
          <nav
            aria-label="Report sections"
            className="md:w-56 md:shrink-0 md:border-r border-b md:border-b-0 border-slate-200 bg-slate-50/60 p-3"
          >
            <p className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-[#6B7A85] px-2 pb-2">
              Sections
            </p>
            <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible md:overflow-x-hidden pb-1 md:pb-0">
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <li
                    key={i}
                    className="h-8 w-28 md:w-full animate-pulse rounded-lg bg-slate-200"
                  />
                ))}
              {!loading &&
                sections.map((section) => {
                  const active = section.key === activeKey;
                  return (
                    <li key={section.key} className="shrink-0 md:shrink">
                      <button
                        type="button"
                        onClick={() => jumpToSection(section)}
                        aria-current={active ? "true" : undefined}
                        className={`flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                          active
                            ? "bg-[#0A3D2E] text-white"
                            : "text-[#0F181F] hover:bg-slate-100"
                        }`}
                      >
                        <span className="truncate">{section.label}</span>
                        <span
                          className={`hidden md:inline text-[10px] tabular-nums ${
                            active ? "text-white/70" : "text-[#6B7A85]"
                          }`}
                        >
                          p.{section.page}
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </nav>

          {/* Preview pane: the real PDF */}
          <div className="flex-grow overflow-auto bg-slate-100 min-h-[60vh]">
            {loading && (
              <div
                className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3"
                role="status"
              >
                <Loader2 className="w-7 h-7 animate-spin text-[#0A3D2E]" />
                <p className="text-sm text-[#4B5B66]">
                  Rendering the exact report the generate button will produce…
                </p>
              </div>
            )}
            {loadError && (
              <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
                <div
                  className="max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {loadError}
                </div>
              </div>
            )}
            {blobUrl && !loading && !loadError && (
              <div className="flex justify-center p-4">
                <iframe
                  key={frameSrc}
                  src={frameSrc}
                  title="NDT report preview"
                  className="bg-white shadow-lg border border-slate-300"
                  style={{
                    width: `${zoom}%`,
                    height: "100%",
                    minHeight: "70vh",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer: the honest-state note + the 11 Sep "Edit in CMS" flow */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
          <p className="text-xs text-[#6B7A85] hidden sm:block">
            Nothing is archived until Generate &amp; Archive — the wording can
            still be reworked in the CMS with the generated content pre-filled.
          </p>
          {onEditInCms && (
            <button
              type="button"
              onClick={onEditInCms}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
              title="Open the report-CMS panel pre-filled with this report's generated wording"
            >
              <PencilLine className="w-4 h-4" />
              Edit in CMS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
