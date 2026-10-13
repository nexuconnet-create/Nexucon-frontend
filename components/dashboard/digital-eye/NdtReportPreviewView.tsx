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
  Sparkles,
  Bot,
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

          {/* AI QA Assistant Toggle Button */}
          <button
            type="button"
            onClick={() => {
              const nextState = !qaOpen;
              setQaOpen(nextState);
              if (nextState && !qaResponse) {
                handleRunPageQA();
              }
            }}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all shadow-sm cursor-pointer ${
              qaOpen
                ? "border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-600/20"
                : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
            title="Open the Nexucon QA Assistant for chartered structural engineering review of the active page"
          >
            <Sparkles className={`w-3.5 h-3.5 ${qaOpen ? "text-amber-300 animate-pulse" : "text-emerald-700"}`} />
            <span>AI QA Assistant</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wide ${
                qaOpen ? "bg-white/20 text-white" : "bg-emerald-200/80 text-emerald-900"
              }`}
            >
              {qaModelProvider === "anthropic" ? "Claude" : qaModelProvider === "deepseek" ? "DeepSeek" : "Auto"}
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

          {/* Embedded AI QA Assistant Panel */}
          {qaOpen && (
            <aside
              aria-label="AI QA Assistant"
              className="w-full md:w-[420px] lg:w-[460px] md:shrink-0 md:border-l border-t md:border-t-0 border-slate-200 bg-white p-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-right-4 duration-300 max-h-[85vh] overflow-y-auto"
            >
              {/* QA Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0A3D2E] to-emerald-600 flex items-center justify-center text-white shadow-sm">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-[#0F181F] text-sm">
                        Nexucon QA Assistant
                      </h3>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase tracking-wider">
                        Chartered Engineer
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7A85]">
                      BS 1881-203 · BS EN 12504-4 · ACI 228.2R
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQaOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close QA Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target & Model Selector Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    Target: Page {currentPage} of {pageCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                    {activeSectionLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/80">
                  <label className="text-[11px] font-medium text-slate-600">Model:</label>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs text-xs">
                    <button
                      type="button"
                      onClick={() => setQaModelProvider("anthropic")}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        qaModelProvider === "anthropic"
                          ? "bg-[#0A3D2E] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Claude Sonnet
                    </button>
                    <button
                      type="button"
                      onClick={() => setQaModelProvider("deepseek")}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        qaModelProvider === "deepseek"
                          ? "bg-[#0A3D2E] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      DeepSeek
                    </button>
                    <button
                      type="button"
                      onClick={() => setQaModelProvider("auto")}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        qaModelProvider === "auto"
                          ? "bg-[#0A3D2E] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Auto
                    </button>
                  </div>
                </div>

                {/* Audit trigger button */}
                <button
                  type="button"
                  onClick={() => handleRunPageQA()}
                  disabled={qaLoading || !projectId}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {qaLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>
                    {qaLoading
                      ? `Auditing Page ${currentPage} via ${qaModelProvider === "anthropic" ? "Claude" : qaModelProvider === "deepseek" ? "DeepSeek" : "AI"}…`
                      : `⚡ Run Page ${currentPage} QA Audit`}
                  </span>
                </button>
              </div>

              {/* Inspecting Engineer Question / Custom Query */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Specific Engineering Query:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={qaUserQuery}
                    onChange={(e) => setQaUserQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRunPageQA();
                    }}
                    placeholder="e.g. Verify S17 readings count vs Table 5.5..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                {/* Quick chip queries */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setQaUserQuery("Verify Table 5.5 Phase 10 regulatory schema columns and reading counts");
                      handleRunPageQA("Verify Table 5.5 Phase 10 regulatory schema columns and reading counts");
                    }}
                    className="rounded bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                  >
                    Phase 10 Schema
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQaUserQuery("Verify calibration date validity window vs physical testing dates");
                      handleRunPageQA("Verify calibration date validity window vs physical testing dates");
                    }}
                    className="rounded bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                  >
                    Calibration Dates
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQaUserQuery("Verify surveyed 4-Corner boundary coordinates and photographic GPS reconciliation");
                      handleRunPageQA("Verify surveyed 4-Corner boundary coordinates and photographic GPS reconciliation");
                    }}
                    className="rounded bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                  >
                    GPS &amp; Boundary
                  </button>
                </div>
              </div>

              {/* QA Error Notice */}
              {qaError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                  <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Audit Execution Failed</p>
                    <p className="text-[11px] mt-0.5">{qaError}</p>
                  </div>
                </div>
              )}

              {/* QA Results Section */}
              {qaResponse && (
                <div className="space-y-3 pt-2 border-t border-slate-200 animate-in fade-in duration-200">
                  {/* Status header & view toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Page {qaResponse.page_number} Audited ({qaResponse.provider_used})
                    </span>
                    <div className="inline-flex rounded border border-slate-200 bg-slate-100 p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setViewMode("cards")}
                        className={`px-2 py-0.5 rounded font-medium ${
                          viewMode === "cards" ? "bg-white text-slate-800 shadow-xs" : "text-slate-600"
                        }`}
                      >
                        Cards
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("narrative")}
                        className={`px-2 py-0.5 rounded font-medium ${
                          viewMode === "narrative" ? "bg-white text-slate-800 shadow-xs" : "text-slate-600"
                        }`}
                      >
                        Narrative
                      </button>
                    </div>
                  </div>

                  {viewMode === "narrative" ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Full Engineering QA Narrative
                        </span>
                        <button
                          type="button"
                          onClick={() => copyNarrative(qaResponse.narrative_feedback)}
                          className="inline-flex items-center gap-1 text-[10px] text-slate-600 hover:text-emerald-700 font-medium"
                        >
                          {copiedNarrative ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedNarrative ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <pre className="text-[11px] text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto p-2 bg-white rounded border border-slate-200">
                        {qaResponse.narrative_feedback}
                      </pre>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* 1. VERIFIED CARD */}
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            [VERIFIED] ({qaResponse.verified.length})
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
                            Matches Raw Payload
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-emerald-950">
                          {qaResponse.verified.map((v, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-emerald-600 font-bold shrink-0">✓</span>
                              <span>{v}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 2. DISCREPANCY CARD */}
                      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-900">
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                            [DISCREPANCY] ({qaResponse.discrepancies.length})
                          </span>
                          {qaResponse.discrepancies.length === 0 ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
                              Zero Errors
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 rounded px-1.5 py-0.5">
                              Action Required
                            </span>
                          )}
                        </div>

                        {qaResponse.discrepancies.length === 0 ? (
                          <p className="text-[11px] text-emerald-900 font-medium">
                            Zero numerical contradictions or chronological discrepancies detected on active page.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {qaResponse.discrepancies.map((d, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border border-rose-300 bg-white p-2.5 space-y-1.5 text-[11px]"
                              >
                                <p className="font-semibold text-rose-900">
                                  ⚠️ {d.error}
                                </p>
                                <p className="text-slate-600 text-[10px]">
                                  <span className="font-bold">Raw Payload Citation:</span>{" "}
                                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">
                                    {d.raw_payload_value}
                                  </span>
                                </p>
                                <div className="rounded bg-rose-50/80 border border-rose-200 p-2 text-[11px] text-rose-950 flex items-start justify-between gap-2">
                                  <div className="font-mono text-[10px] leading-tight break-all">
                                    <span className="text-slate-500 font-sans block text-[9px] uppercase font-bold">
                                      Exact Replacement Text:
                                    </span>
                                    {d.exact_replacement}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => copyReplacement(d.exact_replacement, idx)}
                                    className="shrink-0 p-1 text-rose-700 hover:text-rose-900 rounded bg-white border border-rose-200 shadow-2xs"
                                    title="Copy replacement string"
                                  >
                                    {copiedIndex === idx ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. COMPLIANCE FLAG CARD */}
                      <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-900">
                            <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
                            [COMPLIANCE FLAG] ({qaResponse.compliance_flags.length})
                          </span>
                          <span className="text-[10px] font-semibold text-violet-700 bg-violet-100 rounded px-1.5 py-0.5">
                            Statutory Check
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-violet-950">
                          {qaResponse.compliance_flags.map((c, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-violet-600 font-bold shrink-0">§</span>
                              <span>{c}</span>
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
