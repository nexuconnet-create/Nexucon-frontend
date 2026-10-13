"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  PencilLine,
  Mail,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Copy,
  Check,
  ChevronRight,
  RefreshCw,
  X,
  FileText,
  Search,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import {
  downloadNdtReport,
  fetchNdtReportPreviewBundle,
  type NdtPreviewSection,
  notifyProjectNdtInspectors,
  reviewNdtReportPageQA,
  type NdtReportPageQAResponse,
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
 *
 * Enhanced with embedded Chartered Structural Engineer AI QA Assistant
 * (powered by Anthropic Claude / DeepSeek) for page-by-page statutory audit.
 */
const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

export default function NdtReportPreviewView({
  projectId,
  operator,
  elementId,
  onBackToEdit,
  onGenerated,
  onEditInCms,
}: {
  projectId: string;
  operator?: string;
  elementId?: string;
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
  const [notifying, setNotifying] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Embedded AI QA Assistant State
  const [qaOpen, setQaOpen] = useState(false);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaResponse, setQaResponse] = useState<NdtReportPageQAResponse | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);
  const [qaUserQuery, setQaUserQuery] = useState("");
  const [qaModelProvider, setQaModelProvider] = useState<"anthropic" | "deepseek" | "auto">("anthropic");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedNarrative, setCopiedNarrative] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "narrative">("cards");

  // Fetch the bundle fresh each time the view mounts
  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetchNdtReportPreviewBundle(projectId, operator, elementId)
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
  }, [projectId, operator, elementId]);

  const toast = (message: string, type: "success" | "error" | "info") => {
    window.dispatchEvent(
      new CustomEvent("show-toast", { detail: { message, type } })
    );
  };

  const handleNotifyInspectors = async () => {
    if (!projectId) return;
    setNotifying(true);
    try {
      const res = await notifyProjectNdtInspectors(projectId, { operator, force_resend: true });
      if (res?.notified_count > 0) {
        toast(`✉️ Alert emails dispatched to ${res.notified_count} project inspector(s).`, "success");
      } else if (res?.recipients && res.recipients.length > 0) {
        toast(`✉️ Notification sent to ${res.recipients.map((r: any) => r.name).join(", ")}.`, "info");
      } else {
        toast("No active field inspectors assigned to this project.", "info");
      }
    } catch (err: any) {
      toast(
        `⚠️ ${err?.response?.data?.detail || err?.message || "Failed to notify inspectors."}`,
        "error"
      );
    } finally {
      setNotifying(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await downloadNdtReport(projectId, operator, elementId);
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

  // Navigating to a section
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

  const activeSectionLabel = useMemo(() => {
    const match = sections.find((s) => s.page === currentPage);
    return match ? match.label : `Page ${currentPage}`;
  }, [sections, currentPage]);

  // Run AI Page QA Audit
  const handleRunPageQA = async (customQuery?: string) => {
    if (!projectId) return;
    setQaLoading(true);
    setQaError(null);
    try {
      const queryToSend = customQuery !== undefined ? customQuery : qaUserQuery;
      const res = await reviewNdtReportPageQA(
        projectId,
        currentPage,
        queryToSend || undefined,
        qaModelProvider,
        operator,
        elementId
      );
      setQaResponse(res);
      toast(`✅ Page ${currentPage} audited by ${res.provider_used} (${res.model_used}).`, "success");
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || "AI QA Assistant audit failed.";
      setQaError(String(detail));
      toast(`⚠️ QA Audit failed: ${detail}`, "error");
    } finally {
      setQaLoading(false);
    }
  };

  const copyReplacement = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast("📋 Replacement text copied to clipboard.", "info");
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const copyNarrative = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNarrative(true);
    toast("📋 Full engineering narrative copied.", "info");
    setTimeout(() => setCopiedNarrative(false), 2500);
  };

  return (
    <div className="px-6 mt-6 animate-in fade-in duration-300">
      <div className="flex w-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header — REPORT PREVIEW [← Back to Edit] */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="w-5 h-5 text-[#0A3D2E] shrink-0" />
            <div className="min-w-0">
              <h2 className="font-semibold text-[#0F181F] text-sm truncate">
                Report Preview &amp; QA Verification
              </h2>
              <p className="text-xs text-[#6B7A85] truncate">
                Certified document viewer with embedded page-by-page AI QA Assistant.
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

        {/* Toolbar — Page X of Y | Zoom | AI QA Assistant | Download | Generate */}
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

          {/* Forensic Page Audit Toggle Button */}
          <button
            type="button"
            onClick={() => {
              const nextState = !qaOpen;
              setQaOpen(nextState);
              if (nextState && !qaResponse) {
                handleRunPageQA();
              }
            }}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              qaOpen
                ? "border-[#022C4F] bg-[#022C4F] text-white ring-2 ring-[#022C4F]/20"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400"
            }`}
            title="Perform forensic document audit against raw sensor payload (BS 1881-203, BS EN 12504-4, LASBCA Phase 10)"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${qaOpen ? "text-emerald-400" : "text-[#022C4F]"}`} />
            <span>Forensic Page Audit</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono ${
                qaOpen ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {qaModelProvider === "anthropic" ? "Claude 3.5" : qaModelProvider === "deepseek" ? "DeepSeek" : "Auto"}
            </span>
          </button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {blobUrl && (
              <a
                href={blobUrl}
                download={`ndt_report_PREVIEW_${projectId}.pdf`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-[#0F181F] hover:bg-slate-50"
                title="Download this preview — nothing is archived"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            )}
            <button
              type="button"
              onClick={handleNotifyInspectors}
              disabled={notifying || loading || !projectId}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              title="Immediately dispatch email notification to field inspectors that this NDT report is ready for download"
            >
              {notifying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-700" />
              ) : (
                <Mail className="w-3.5 h-3.5 text-sky-700" />
              )}
              <span>{notifying ? "Notifying…" : "Notify"}</span>
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || loading || !!loadError}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0A3D2E] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#0A3D2E]/90 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              {generating ? "Archiving…" : "Generate & Archive"}
            </button>
          </div>
        </div>

        {/* Body — SECTIONS sidebar + PREVIEW pane + AI QA ASSISTANT panel */}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar: vertical list of sections */}
          <nav
            aria-label="Report sections"
            className="md:w-52 md:shrink-0 md:border-r border-b md:border-b-0 border-slate-200 bg-slate-50/60 p-3"
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
                        className={`flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-colors ${
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
                  Rendering certified document preview…
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
                    minHeight: "72vh",
                  }}
                />
              </div>
            )}
          </div>

          {/* Embedded Forensic Document Audit Panel */}
          {qaOpen && (
            <aside
              aria-label="Forensic Document Audit"
              className="w-full md:w-[440px] lg:w-[480px] md:shrink-0 md:border-l border-t md:border-t-0 border-slate-200 bg-white p-4 flex flex-col gap-3.5 shadow-xl animate-in slide-in-from-right-4 duration-300 max-h-[85vh] overflow-y-auto"
            >
              {/* Executive Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#022C4F] flex items-center justify-center text-white shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-[#0F181F] text-sm tracking-tight">
                        Forensic Document Audit
                      </h3>
                      <span className="rounded bg-slate-100 border border-slate-200/90 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 tracking-wider font-mono">
                        COREN / ISO QA
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      BS 1881-203 · BS EN 12504-4 · ACI 228.2R · LASBCA Phase 10
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQaOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label="Close Forensic Audit"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target & Model Selector Card */}
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Target: Page <span className="font-mono">{currentPage}</span> of <span className="font-mono">{pageCount}</span>
                  </span>
                  <span
                    className="text-[10px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md truncate max-w-[170px]"
                    title={activeSectionLabel}
                  >
                    {activeSectionLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                  <label className="text-[11px] font-semibold text-slate-600">Audit Engine:</label>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs text-xs">
                    <button
                      type="button"
                      onClick={() => setQaModelProvider("anthropic")}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        qaModelProvider === "anthropic"
                          ? "bg-[#022C4F] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Claude 3.5
                    </button>
                    <button
                      type="button"
                      onClick={() => setQaModelProvider("deepseek")}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        qaModelProvider === "deepseek"
                          ? "bg-[#022C4F] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      DeepSeek
                    </button>
                    <button
                      type="button"
                      onClick={() => setQaModelProvider("auto")}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        qaModelProvider === "auto"
                          ? "bg-[#022C4F] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Auto
                    </button>
                  </div>
                </div>

                {/* Audit Trigger Button */}
                <button
                  type="button"
                  onClick={() => handleRunPageQA()}
                  disabled={qaLoading || !projectId}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#022C4F] hover:bg-[#033E6E] px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  {qaLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>
                    {qaLoading
                      ? `Auditing Page ${currentPage} via ${qaModelProvider === "anthropic" ? "Claude 3.5" : qaModelProvider === "deepseek" ? "DeepSeek" : "Forensic Engine"}…`
                      : `Execute Forensic Audit (Page ${currentPage})`}
                  </span>
                </button>
              </div>

              {/* Inspecting Engineer Question / Custom Query */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span>Inspection Directive / Query</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </div>
                <input
                  type="text"
                  value={qaUserQuery}
                  onChange={(e) => setQaUserQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRunPageQA();
                  }}
                  placeholder="e.g. Cross-check S17 point count vs Table 5.5, or verify GPS perimeter..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#022C4F] focus:outline-hidden focus:ring-1 focus:ring-[#022C4F]"
                />
                {/* Forensic Quick Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setQaUserQuery("Verify Table 5.5 Phase 10 regulatory schema columns and reading counts");
                      handleRunPageQA("Verify Table 5.5 Phase 10 regulatory schema columns and reading counts");
                    }}
                    className="rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    Phase 10 Table Schema
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQaUserQuery("Verify calibration date validity window vs physical testing dates");
                      handleRunPageQA("Verify calibration date validity window vs physical testing dates");
                    }}
                    className="rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    Calibration Chronology
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQaUserQuery("Verify surveyed 4-Corner boundary coordinates and photographic GPS reconciliation");
                      handleRunPageQA("Verify surveyed 4-Corner boundary coordinates and photographic GPS reconciliation");
                    }}
                    className="rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    Boundary &amp; GPS Reconciliation
                  </button>
                </div>
              </div>

              {/* Error Notice */}
              {qaError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                  <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <p className="font-semibold">Audit Execution Incomplete</p>
                    <p className="text-[11px] mt-0.5">{qaError}</p>
                  </div>
                </div>
              )}

              {/* Forensic Audit Findings Section */}
              {qaResponse && (
                <div className="space-y-3 pt-3 border-t border-slate-200 animate-in fade-in duration-200">
                  {/* Executive Metric Cards Strip */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2 text-center">
                      <span className="block text-[9px] font-bold text-emerald-800 uppercase tracking-wider">
                        Concordant
                      </span>
                      <span className="text-base font-extrabold text-emerald-950 font-mono">
                        {qaResponse.verified.length}
                      </span>
                      <span className="block text-[9px] text-emerald-700 font-medium">
                        Data Points
                      </span>
                    </div>

                    <div
                      className={`rounded-lg border p-2 text-center ${
                        qaResponse.discrepancies.length === 0
                          ? "border-slate-200 bg-slate-50 text-slate-700"
                          : "border-rose-200 bg-rose-50 text-rose-950"
                      }`}
                    >
                      <span
                        className={`block text-[9px] font-bold uppercase tracking-wider ${
                          qaResponse.discrepancies.length === 0 ? "text-slate-600" : "text-rose-800"
                        }`}
                      >
                        Deviations
                      </span>
                      <span
                        className={`text-base font-extrabold font-mono ${
                          qaResponse.discrepancies.length === 0 ? "text-slate-800" : "text-rose-600"
                        }`}
                      >
                        {qaResponse.discrepancies.length}
                      </span>
                      <span className="block text-[9px] text-slate-500 font-medium">
                        {qaResponse.discrepancies.length === 0 ? "Zero Errors" : "Action Needed"}
                      </span>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2 text-center">
                      <span className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                        Statutory
                      </span>
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        {qaResponse.compliance_flags.length}
                      </span>
                      <span className="block text-[9px] text-slate-500 font-medium">
                        Directives
                      </span>
                    </div>
                  </div>

                  {/* View Mode Toggle: Structured Findings vs Formal Memorandum */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Page {qaResponse.page_number} Certified ({qaResponse.provider_used})
                    </span>
                    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setViewMode("cards")}
                        className={`px-2.5 py-0.5 rounded font-medium transition-all ${
                          viewMode === "cards" ? "bg-white text-slate-800 shadow-2xs font-semibold" : "text-slate-600"
                        }`}
                      >
                        Structured Findings
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("narrative")}
                        className={`px-2.5 py-0.5 rounded font-medium transition-all ${
                          viewMode === "narrative" ? "bg-white text-slate-800 shadow-2xs font-semibold" : "text-slate-600"
                        }`}
                      >
                        Memorandum
                      </button>
                    </div>
                  </div>

                  {/* 1. Formal Engineering Memorandum View */}
                  {viewMode === "narrative" ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Chartered Structural Review Memorandum
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Filing Verification Record · Page {qaResponse.page_number}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyNarrative(qaResponse.narrative_feedback)}
                          className="inline-flex items-center gap-1 text-[10px] text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded shadow-2xs font-medium cursor-pointer"
                        >
                          {copiedNarrative ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedNarrative ? "Copied" : "Copy Memo"}
                        </button>
                      </div>
                      <pre className="text-[11px] text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto p-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs">
                        {qaResponse.narrative_feedback}
                      </pre>
                      <div className="pt-1 text-[10px] text-slate-500 flex items-center justify-between">
                        <span>COREN Registered Engineer Review Engine</span>
                        <span className="font-mono">Page {qaResponse.page_number} of {qaResponse.total_pages}</span>
                      </div>
                    </div>
                  ) : (
                    /* 2. Structured Findings View */
                    <div className="space-y-3">
                      {/* Section 1: Verified Telemetry & Data Concordance */}
                      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-xs font-bold text-slate-900">
                              1. Telemetry &amp; Sensor Truth Concordance
                            </h4>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 rounded px-1.5 py-0.5">
                            {qaResponse.verified.length} Confirmed
                          </span>
                        </div>
                        <ul className="space-y-2 text-[11px] text-slate-700">
                          {qaResponse.verified.map((v, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-slate-800 font-medium">{v}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Section 2: Non-Conformance & Discrepancy Log */}
                      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className={`w-4 h-4 ${qaResponse.discrepancies.length === 0 ? "text-slate-400" : "text-rose-600"}`} />
                            <h4 className="text-xs font-bold text-slate-900">
                              2. Non-Conformance &amp; Discrepancy Log
                            </h4>
                          </div>
                          <span
                            className={`text-[10px] font-semibold rounded px-1.5 py-0.5 border ${
                              qaResponse.discrepancies.length === 0
                                ? "text-slate-700 bg-slate-50 border-slate-200"
                                : "text-rose-800 bg-rose-50 border-rose-200"
                            }`}
                          >
                            {qaResponse.discrepancies.length === 0 ? "0 Contradictions" : `${qaResponse.discrepancies.length} Requires Action`}
                          </span>
                        </div>

                        {qaResponse.discrepancies.length === 0 ? (
                          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 text-[11px] text-slate-600 flex items-center gap-2 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Zero numerical contradictions, chronological inversions, or asset misidentifications detected on this active page.</span>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {qaResponse.discrepancies.map((d, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border border-rose-200 bg-rose-50/30 p-2.5 space-y-2 text-[11px]"
                              >
                                <div className="flex items-start gap-1.5">
                                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                  <p className="font-semibold text-rose-950">
                                    {d.error}
                                  </p>
                                </div>
                                <div className="rounded bg-white border border-slate-200 p-2 space-y-1">
                                  <span className="text-slate-400 uppercase text-[9px] font-bold block">
                                    Sensor Telemetry Truth:
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-800 break-all">
                                    {d.raw_payload_value}
                                  </span>
                                </div>
                                <div className="rounded bg-white border border-rose-200 p-2 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-rose-700 uppercase text-[9px] font-bold block">
                                      Proposed Report Amendment:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => copyReplacement(d.exact_replacement, idx)}
                                      className="inline-flex items-center gap-1 text-[10px] text-rose-700 hover:text-rose-900 font-semibold cursor-pointer"
                                      title="Copy replacement string"
                                    >
                                      {copiedIndex === idx ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-600" />
                                          <span className="text-emerald-700">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copy Amendment</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <p className="font-mono text-[10px] text-slate-900 bg-slate-50 p-1.5 rounded border border-slate-200 break-all">
                                    {d.exact_replacement}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Section 3: Statutory & Standards Compliance */}
                      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-1.5">
                            <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                            <h4 className="text-xs font-bold text-slate-900">
                              3. Statutory &amp; Standards Compliance
                            </h4>
                          </div>
                          <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 border border-blue-200/70 rounded px-1.5 py-0.5">
                            BS / LASBCA Audit
                          </span>
                        </div>
                        <ul className="space-y-2 text-[11px] text-slate-700">
                          {qaResponse.compliance_flags.map((c, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold font-mono">
                                §
                              </span>
                              <span className="text-slate-800 font-medium">{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Footer: honest-state note + Edit in CMS flow */}
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
