"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Search,
  Filter,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  X,
  Activity,
  Layers,
  Zap,
} from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import PunditAiNav from "@/components/dashboard/digital-eye/PunditAiNav";
import FindingDetailDrawer from "@/components/dashboard/digital-eye/FindingDetailDrawer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import PaginationBar from "@/components/dashboard/PaginationBar";
import {
  DigitalEyeFinding,
  getDigitalEyeFindings,
  PunditTest,
  getPunditTests,
  escalateFindingToNCR,
} from "@/services/digitalEye";

export default function PunditAIDefectsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [findings, setFindings] = useState<DigitalEyeFinding[]>([]);
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<DigitalEyeFinding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [escalatingId, setEscalatingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [findingsData, testsData] = await Promise.all([
        getDigitalEyeFindings({ project: selectedProjectId || undefined }),
        getPunditTests({ project: selectedProjectId || undefined }),
      ]);
      setFindings(findingsData);
      setTests(testsData);
    } catch (err: any) {
      setFindings([]);
      setTests([]);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load defect records from the server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProjectId, severityFilter, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const critical = findings.filter((f) => f.severity === "CRITICAL" || f.severity === "HIGH").length;
    const medium = findings.filter((f) => f.severity === "MEDIUM").length;
    const ncrCount = findings.filter((f) => f.status === "CONVERTED_TO_NCR").length;

    return {
      total: findings.length,
      critical,
      medium,
      ncrCount,
    };
  }, [findings]);

  // Filtered findings
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (severityFilter !== "ALL" && f.severity !== severityFilter) return false;
      if (statusFilter === "NCR" && f.status !== "CONVERTED_TO_NCR") return false;
      if (statusFilter === "OPEN" && f.status === "CONVERTED_TO_NCR") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          f.title.toLowerCase().includes(q) ||
          f.finding_reference.toLowerCase().includes(q) ||
          (f.structural_element_name || "").toLowerCase().includes(q) ||
          (f.description || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [findings, severityFilter, statusFilter, searchQuery]);

  const paginatedFindings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFindings.slice(start, start + pageSize);
  }, [filteredFindings, currentPage, pageSize]);

  const handleQuickEscalate = async (e: React.MouseEvent, finding: DigitalEyeFinding) => {
    e.stopPropagation();
    setEscalatingId(finding.id);
    try {
      await escalateFindingToNCR(finding.id, {
        corrective_action: `Core extraction and acoustic tomography verification required for ${finding.finding_reference}.`,
        root_cause: `Acoustic velocity below critical threshold (< 3,500 m/s) detected during PUNDIT NDT inspection.`,
        deadline_days: 14,
      });
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: `Finding ${finding.finding_reference} converted to Non-Conformance Report (NCR).`,
            type: "success",
          },
        })
      );
      await loadData();
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: `⚠️ ${err?.response?.data?.detail || err?.message || "Failed to escalate finding."}`,
            type: "error",
          },
        })
      );
    } finally {
      setEscalatingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen pb-16 animate-in fade-in duration-300 bg-slate-50/50">
      <DigitalEyeHeader
        activePillar="PUNDIT AI: Acoustic Defect & Anomaly Radar"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        onNewFindingClick={() => setIsCreateOpen(true)}
      />

      {/* AI Analysis Navigation Ribbon */}
      <div className="mb-6">
        <PunditAiNav subtitle="Defect Radar" />
      </div>

      {/* Executive Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Detected Anomalies
            </span>
            <span className="text-xl font-black text-slate-900 font-mono">{stats.total}</span>
          </div>
          <AlertTriangle size={18} className="text-amber-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Critical &amp; High Risk
            </span>
            <span className="text-xl font-black text-rose-600 font-mono">{stats.critical}</span>
          </div>
          <ShieldAlert size={18} className="text-rose-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Medium / Low Severity
            </span>
            <span className="text-xl font-black text-amber-600 font-mono">{stats.medium}</span>
          </div>
          <Activity size={18} className="text-amber-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Converted to NCR
            </span>
            <span className="text-xl font-black text-purple-600 font-mono">{stats.ncrCount}</span>
          </div>
          <ShieldCheck size={18} className="text-purple-500" />
        </div>
      </div>

      {/* Main Defect Console */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <span>Acoustic Void &amp; Honeycomb Radar Feed</span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                {findings.length} findings cataloged
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated correlation of acoustic pulse velocity dropoffs with internal concrete honeycombing and delaminations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-[#022C4F] hover:bg-[#03467B] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Record Anomaly Ticket</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 sm:px-5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by defect title, reference, or element..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open Anomalies</option>
                <option value="NCR">Converted to NCR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Feed */}
        {isLoading ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400 animate-pulse flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin mb-2 text-slate-400" size={24} />
            <span>Scanning acoustic telemetry for internal anomalies…</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600 bg-rose-50/50 flex flex-col items-center justify-center">
            <AlertTriangle className="mb-2 text-rose-500" size={24} />
            <span className="font-bold">Error loading defect feed</span>
            <span className="text-[11px] text-rose-500 mt-1">{error}</span>
          </div>
        ) : filteredFindings.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <CheckCircle2 className="mb-2 text-emerald-400" size={32} />
            <span className="text-xs font-semibold">No acoustic defects or low-velocity anomalies detected.</span>
            <span className="text-[11px] text-slate-400 mt-1">All scanned stations conform to homogeneous velocity thresholds.</span>
          </div>
        ) : (
          <div>
            <div className="divide-y divide-slate-100">
              {paginatedFindings.map((finding) => {
                const isCritical = finding.severity === "CRITICAL" || finding.severity === "HIGH";
                const isNCR = finding.status === "CONVERTED_TO_NCR";

                return (
                  <div
                    key={finding.id}
                    onClick={() => {
                      setSelectedFinding(finding);
                      setIsDrawerOpen(true);
                    }}
                    className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isCritical
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}
                      >
                        <AlertTriangle size={18} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-slate-500">
                            {finding.finding_reference}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              isCritical
                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }`}
                          >
                            {finding.severity}
                          </span>

                          {finding.confidence_score > 0 && (
                            <span className="text-[10px] font-mono text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded font-semibold">
                              Confidence: {finding.confidence_score}%
                            </span>
                          )}

                          {isNCR ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              CONVERTED TO NCR
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              OPEN DEFECT
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                          {finding.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                          {finding.description}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                          <span>Element: {finding.structural_element_name || "Unlinked"}</span>
                          {finding.created_at && (
                            <span>Recorded: {new Date(finding.created_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {!isNCR && (
                        <button
                          type="button"
                          onClick={(e) => handleQuickEscalate(e, finding)}
                          disabled={escalatingId === finding.id}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ShieldAlert size={13} />
                          <span>{escalatingId === finding.id ? "Escalating…" : "1-Click NCR"}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFinding(finding);
                          setIsDrawerOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#022C4F] hover:bg-[#03467B] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <span>Evidence Drawer</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {filteredFindings.length > 0 && (
              <PaginationBar
                currentPage={currentPage}
                totalItems={filteredFindings.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            )}
          </div>
        )}
      </div>

      <FindingDetailDrawer
        finding={selectedFinding}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRefresh={loadData}
        punditTests={tests}
      />

      <CreateFindingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultProjectId={selectedProjectId}
      />
    </div>
  );
}
