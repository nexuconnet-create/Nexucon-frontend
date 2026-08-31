"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Download,
  Calendar,
  FileCheck,
  Plus,
  Loader2,
  Folder,
  ChevronRight,
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  Shield,
  Thermometer,
  BarChart3,
  Mountain,
  X,
  User,
  Building,
  Hash,
  MapPin,
  Eye,
  RefreshCw,
  Zap,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api, { notify } from "@/lib/api";

interface ReportItem {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
  project: string;
  status: string;
  defects?: number | null;
  anomalies?: number | null;
  confidence?: number | null;
}

interface ReportTemplateItem {
  id: number;
  name: string;
  description: string;
  report_type: string;
}

interface CoverPageForm {
  clientName: string;
  projectNumber: string;
  siteAddress: string;
  clientContact: string;
}

// Presentation metadata per template; the actual catalogue (names,
// descriptions, report types) is fetched from /report-templates/.
const TEMPLATE_META: Record<string, { icon: any; color: string }> = {
  qaqc: { icon: Shield, color: "from-blue-600 to-blue-800" },
  progress: { icon: BarChart3, color: "from-emerald-600 to-emerald-800" },
  deviation: { icon: Zap, color: "from-amber-500 to-orange-600" },
  earthworks: { icon: Mountain, color: "from-orange-500 to-amber-700" },
  compliance: { icon: FileCheck, color: "from-teal-600 to-teal-800" },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; sla: string }> = {
  critical: { label: "CRITICAL", color: "text-red-600", bg: "bg-red-100", sla: "2-day SLA" },
  high:     { label: "HIGH",     color: "text-orange-600", bg: "bg-orange-100", sla: "7-day SLA" },
  medium:   { label: "MEDIUM",   color: "text-amber-600", bg: "bg-amber-100", sla: "10-day SLA" },
  low:      { label: "LOW",      color: "text-emerald-700", bg: "bg-emerald-100", sla: "14-day SLA" },
};

export default function Reports() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [templates, setTemplates] = useState<ReportTemplateItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("qaqc");
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [pendingDownloadId, setPendingDownloadId] = useState<string | null>(null);
  const [coverForm, setCoverForm] = useState<CoverPageForm>({
    clientName: "",
    projectNumber: "",
    siteAddress: "",
    clientContact: "",
  });
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const downloadTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [sessionsRes, reportsRes, templatesRes] = await Promise.all([
        api.get("/scans/sessions/").catch(() => ({ data: [] })),
        api.get("/quality-reports/").catch(() => ({ data: [] })),
        api.get("/report-templates/").catch(() => ({ data: [] })),
      ]);
      const sessionList = sessionsRes.data || [];
      const qualityReports = reportsRes.data?.results || reportsRes.data || [];
      const templateList = (templatesRes.data?.results || templatesRes.data || [])
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setSessions(sessionList);
      setTemplates(templateList);

      // Latest generated report per session supplies the real metrics.
      const latestBySession = new Map<string, any>();
      for (const qr of qualityReports) {
        if (qr.session_id && !latestBySession.has(qr.session_id)) {
          latestBySession.set(qr.session_id, qr);
        }
      }

      const templateName = (type: string) =>
        templateList.find((t: any) => t.report_type === type)?.name || type;

      const generatedReports: ReportItem[] = sessionList.map((s: any) => {
        const qr = latestBySession.get(s.id);
        return {
          id: s.id,
          title: s.name || `Scan Session ${s.id.substring(0, 8)}`,
          type: qr ? templateName(qr.report_type) : "QA/QC Summary",
          date: new Date(qr?.generated_at || s.created_at).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric"
          }),
          size: "PDF",
          project: s.project_name || s.project || "Unknown Project",
          status: qr?.status || s.status || "completed",
          defects: qr?.defect_count ?? null,
          anomalies: qr?.anomaly_count ?? null,
          confidence: qr?.overall_ai_confidence ?? null,
        };
      });

      setReports(generatedReports);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  const initiateDownload = (reportId: string) => {
    setPendingDownloadId(reportId);
    setShowCoverModal(true);
  };

  const handleConfirmDownload = async () => {
    if (!pendingDownloadId) return;
    setShowCoverModal(false);
    await handleGenerateAndDownload(pendingDownloadId);
    setPendingDownloadId(null);
  };

  const handleGenerateAndDownload = async (sessionId: string) => {
    try {
      setGeneratingFor(sessionId);
      setDownloadProgress((p) => ({ ...p, [sessionId]: 10 }));

      const tick = (pct: number, delay: number) => {
        downloadTimers.current[sessionId] = setTimeout(() => {
          setDownloadProgress((p) => ({ ...p, [sessionId]: pct }));
        }, delay);
      };
      tick(30, 800);
      tick(55, 1800);
      tick(75, 3200);

      // Persist the report with the selected template, then render the PDF
      // with the cover-page overrides from the customisation form.
      await api.post(`/scans/${sessionId}/report/`, { report_type: selectedTemplate });
      setDownloadProgress((p) => ({ ...p, [sessionId]: 85 }));

      const params = new URLSearchParams({ template: selectedTemplate });
      if (coverForm.clientName.trim()) params.set("client_name", coverForm.clientName.trim());
      if (coverForm.projectNumber.trim()) params.set("project_number", coverForm.projectNumber.trim());
      if (coverForm.siteAddress.trim()) params.set("site_address", coverForm.siteAddress.trim());
      if (coverForm.clientContact.trim()) params.set("client_contact", coverForm.clientContact.trim());

      const response = await api.get(`/scans/${sessionId}/report/pdf/?${params.toString()}`, {
        responseType: "blob",
      });

      setDownloadProgress((p) => ({ ...p, [sessionId]: 100 }));

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `nexucon-report-${sessionId.substring(0, 8)}-${selectedTemplate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      notify("Report generated and downloaded.", "success");
      // Refresh so the list reflects the newly persisted report.
      fetchReports();

      setTimeout(() => {
        setDownloadProgress((p) => {
          const np = { ...p };
          delete np[sessionId];
          return np;
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to generate or download report", error);
      notify("Failed to generate report. Please try again.", "error");
      setDownloadProgress((p) => {
        const np = { ...p };
        delete np[sessionId];
        return np;
      });
    } finally {
      setGeneratingFor(null);
    }
  };

  // Group by project
  const projects = Array.from(new Set(reports.map((r) => r.project)));
  const filteredReports = currentProject
    ? reports.filter((r) => r.project === currentProject)
    : reports;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider"><CheckCircle size={10} /> Ready</span>;
      case "processing":
        return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider"><Loader2 size={10} className="animate-spin" /> Processing</span>;
      case "failed":
        return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full uppercase tracking-wider"><AlertTriangle size={10} /> Failed</span>;
      default:
        return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider"><Clock size={10} /> Pending</span>;
    }
  };

  return (
    <div className="w-full min-h-screen">
      {/* ── PAGE HEADER ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">
            Reports &amp; Deliverables
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Generate, customise, and download professional AI-powered engineering reports aligned to Nigerian Standards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <button
            onClick={() => setShowNewReportModal(true)}
            disabled={loading || sessions.length === 0}
            title={sessions.length === 0 ? "No scan sessions available yet" : "Generate a report for a scan session"}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            <Plus size={18} />
            <span className="font-medium">Generate New Report</span>
          </button>
        </div>
      </div>

      {/* ── SLA LEGEND ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Remediation SLAs:</span>
        {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
          <span key={key} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.color}`}>
            <span className="w-2 h-2 rounded-full bg-current opacity-70" />
            {cfg.label} — {cfg.sla}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── MAIN REPORTS PANEL ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => { setCurrentProject(null); setPreviewReport(null); }}
              className={`flex items-center gap-2 transition-colors ${
                currentProject ? "text-gray-500 hover:text-blue-600" : "text-blue-600 font-semibold"
              }`}
            >
              <FolderOpen size={16} />
              Projects
            </button>
            {currentProject && (
              <>
                <ChevronRight size={14} className="text-gray-400" />
                <span className="text-blue-600 font-semibold flex items-center gap-2">
                  <Folder size={16} />
                  {currentProject}
                </span>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#022C4F] to-[#044c8c]">
              <h2 className="text-base font-bold text-white">
                {currentProject ? `Reports in ${currentProject}` : "Available Projects"}
              </h2>
              <span className="text-xs text-blue-200">
                {currentProject
                  ? `${filteredReports.length} report(s)`
                  : `${projects.length} project(s)`}
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-400">Loading reports...</p>
                </div>
              ) : currentProject === null ? (
                /* PROJECT FOLDERS VIEW */
                projects.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Folder size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No projects available yet.</p>
                    <p className="text-xs mt-1">Start a scan session to generate your first report.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6">
                    {projects.map((project) => {
                      const count = reports.filter((r) => r.project === project).length;
                      const hasCritical = reports.filter(r => r.project === project && (r.defects ?? 0) > 0).length > 0;
                      return (
                        <motion.div
                          key={project}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setCurrentProject(project)}
                          className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group relative overflow-hidden"
                        >
                          {hasCritical && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          )}
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#022C4F] to-[#044c8c] flex items-center justify-center mb-3 shadow-lg group-hover:shadow-blue-900/30 transition-shadow">
                            <Folder className="text-white" size={28} />
                          </div>
                          <h3 className="font-bold text-gray-800 text-center text-sm">{project}</h3>
                          <p className="text-xs text-gray-500 mt-1">{count} Report{count !== 1 ? "s" : ""}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* REPORTS LIST VIEW */
                filteredReports.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No reports available for this project.</p>
                  </div>
                ) : (
                  filteredReports.map((report, idx) => {
                    const progress = downloadProgress[report.id];
                    const isGenerating = generatingFor === report.id;
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={report.id}
                        className={`p-5 hover:bg-blue-50/30 transition-colors cursor-pointer group ${
                          previewReport?.id === report.id ? "bg-blue-50/50 border-l-4 border-blue-500" : ""
                        }`}
                        onClick={() => setPreviewReport(report)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            {/* PDF icon */}
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-200">
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors text-sm truncate">
                                {report.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                {getStatusBadge(report.status)}
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                  <Calendar size={12} /> {report.date}
                                </span>
                                {(report.defects ?? 0) > 0 && (
                                  <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                                    <AlertTriangle size={11} /> {report.defects} defect{report.defects !== 1 ? "s" : ""}
                                  </span>
                                )}
                                {(report.anomalies ?? 0) > 0 && (
                                  <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                                    <Thermometer size={11} /> {report.anomalies} anomaly
                                  </span>
                                )}
                                {report.confidence != null && (
                                  <span className="text-xs text-gray-400">
                                    AI: {(report.confidence * 100).toFixed(0)}%
                                  </span>
                                )}
                              </div>

                              {/* Download progress bar */}
                              {isGenerating && progress != null && (
                                <div className="mt-2 w-48">
                                  <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                                    <span>Generating PDF…</span>
                                    <span>{progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <motion.div
                                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progress}%` }}
                                      transition={{ duration: 0.5 }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); setPreviewReport(report); }}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-700 bg-white border border-gray-200 hover:border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors"
                            >
                              <Eye size={13} /> Preview
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); initiateDownload(report.id); }}
                              disabled={isGenerating}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#022C4F] to-[#044c8c] hover:from-[#033c6c] hover:to-[#055baa] disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-blue-900/20"
                            >
                              {isGenerating ? (
                                <><Loader2 size={13} className="animate-spin" /> Generating…</>
                              ) : (
                                <><Download size={13} /> Download PDF</>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Preview Panel */}
          <AnimatePresence mode="wait">
            {previewReport ? (
              <motion.div
                key={previewReport.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="bg-gradient-to-br from-[#022C4F] to-[#044c8c] p-5 text-white relative">
                  <button
                    onClick={() => setPreviewReport(null)}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                    <FileText size={20} />
                  </div>
                  <h3 className="font-bold text-sm leading-tight">{previewReport.title}</h3>
                  <p className="text-blue-200 text-xs mt-1">{previewReport.project}</p>
                </div>

                <div className="p-5 space-y-3">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-red-600">{previewReport.defects ?? 0}</p>
                      <p className="text-xs text-red-400 mt-0.5">Defects</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-amber-600">{previewReport.anomalies ?? 0}</p>
                      <p className="text-xs text-amber-400 mt-0.5">Thermal Anomalies</p>
                    </div>
                  </div>

                  {previewReport.confidence != null && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>AI Confidence</span>
                        <span className="font-bold text-gray-700">{(previewReport.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${previewReport.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 space-y-1.5 pt-1 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-gray-400 shrink-0" />
                      <span>{previewReport.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={12} className="text-gray-400 shrink-0" />
                      <span>Nigerian Standards Referenced (NIS, SON)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-gray-400 shrink-0" />
                      <span>SLA Tiers: 2 / 7 / 10 / 14 day</span>
                    </div>
                  </div>

                  <button
                    onClick={() => initiateDownload(previewReport.id)}
                    disabled={generatingFor === previewReport.id}
                    className="w-full py-2.5 bg-gradient-to-r from-[#022C4F] to-[#044c8c] text-white text-sm font-semibold rounded-xl hover:from-[#033c6c] hover:to-[#055baa] transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-60"
                  >
                    {generatingFor === previewReport.id ? (
                      <><Loader2 size={15} className="animate-spin" /> Generating…</>
                    ) : (
                      <><Download size={15} /> Download Full PDF Report</>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gradient-to-br from-[#022C4F] to-[#044c8c] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <FileText size={100} />
                </div>
                <h3 className="text-base font-bold mb-2 relative z-10">Report Preview</h3>
                <p className="text-sm text-blue-100 mb-4 relative z-10 leading-relaxed">
                  Click any report in the list to see a preview of key metrics before downloading.
                </p>
                <div className="space-y-2 relative z-10">
                  {["Branded Cover Page", "Nigerian Standards (NIS/SON)", "Color-Coded Severity Bands", "SLA Remediation Tiers"].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-blue-100">
                      <CheckCircle size={12} className="text-cyan-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Report Templates */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
              <FileCheck size={18} className="text-emerald-500" />
              Report Templates
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              Pick a template — it is applied when you next generate or download a report.
            </p>
            <div className="space-y-3">
              {templates.length === 0 ? (
                <div className="text-xs text-gray-400 py-2">
                  {loading ? "Loading templates…" : "No templates available."}
                </div>
              ) : templates.map((tpl) => {
                const meta = TEMPLATE_META[tpl.report_type] || TEMPLATE_META.qaqc;
                const Icon = meta.icon;
                const isSelected = selectedTemplate === tpl.report_type;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.report_type)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-start gap-3 ${
                      isSelected
                        ? "border-blue-400 bg-blue-50/60 ring-1 ring-blue-300"
                        : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/40"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-800 text-xs group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                        {tpl.name}
                        {isSelected && <CheckCircle size={12} className="text-blue-600 shrink-0" />}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{tpl.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standards reference card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-emerald-600" />
              <h4 className="font-bold text-emerald-800 text-sm">Nigerian Standards Referenced</h4>
            </div>
            <ul className="space-y-1.5 text-xs text-emerald-700">
              {[
                "NIS 87 — Structural Concrete",
                "NIS 439 — Steel Reinforcement",
                "NIS 412 — Thermal Performance",
                "SON General Construction Standards",
                "Nigeria National Building Code 2006",
                "ISO 19650 — BIM Data Management",
              ].map((std) => (
                <li key={std} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {std}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── COVER PAGE CUSTOMISATION MODAL ───────────────────────────── */}
      <AnimatePresence>
        {showCoverModal && (
          <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-[#022C4F] to-[#044c8c] px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <FileText size={18} />
                  <h3 className="font-bold">Customise Report Cover Page</h3>
                </div>
                <button
                  onClick={() => { setShowCoverModal(false); setPendingDownloadId(null); }}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-500 mb-5">
                  Optionally enter project and client details that will appear on the report cover page.
                  Leave blank to use the data already saved against this project.
                </p>

                {/* Template selection */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <FileCheck size={12} /> Report Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#022C4F]/30 focus:border-[#022C4F] text-sm transition-all bg-white"
                  >
                    {templates.length === 0 && (
                      <option value="qaqc">QA/QC Summary</option>
                    )}
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.report_type}>{tpl.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Building, label: "Client / Company Name", key: "clientName", placeholder: "e.g. Nexucon Client Ltd" },
                    { icon: Hash, label: "Project Number", key: "projectNumber", placeholder: "e.g. PRJ-2026-001" },
                    { icon: MapPin, label: "Site Address", key: "siteAddress", placeholder: "e.g. Plot 24, Lekki Phase 1, Lagos" },
                    { icon: User, label: "Client Contact", key: "clientContact", placeholder: "e.g. Eng. Abdulwahab Onike" },
                  ].map(({ icon: Icon, label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                        <Icon size={12} /> {label}
                      </label>
                      <input
                        type="text"
                        value={coverForm[key as keyof CoverPageForm]}
                        onChange={(e) => setCoverForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#022C4F]/30 focus:border-[#022C4F] text-sm transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => { setShowCoverModal(false); setPendingDownloadId(null); }}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDownload}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#022C4F] to-[#044c8c] text-white rounded-xl font-semibold text-sm hover:from-[#033c6c] transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={15} />
                    Generate &amp; Download
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── NEW REPORT / SESSION PICKER MODAL ─────────────────────────── */}
      <AnimatePresence>
        {showNewReportModal && (
          <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="bg-gradient-to-r from-[#022C4F] to-[#044c8c] px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Plus size={18} />
                  <h3 className="font-bold">Generate New Report</h3>
                </div>
                <button
                  onClick={() => setShowNewReportModal(false)}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <p className="text-sm text-gray-500 mb-4">
                  Choose the scan session to report on. You can customise the cover page in the next step.
                </p>
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setShowNewReportModal(false);
                        setPendingDownloadId(s.id);
                        setShowCoverModal(true);
                      }}
                      className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#022C4F] to-[#044c8c] flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">
                          {s.name || `Scan Session ${s.id.substring(0, 8)}`}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {s.project_name || s.project || "Unknown Project"} · {" "}
                          {s.created_at ? new Date(s.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric"
                          }) : "—"}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
