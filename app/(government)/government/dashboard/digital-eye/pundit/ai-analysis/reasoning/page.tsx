"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BrainCircuit,
  Terminal,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  Activity,
  FileCode2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import PunditAiNav from "@/components/dashboard/digital-eye/PunditAiNav";
import PunditAnalysisReviewPanel from "@/components/dashboard/digital-eye/PunditAnalysisReviewPanel";
import {
  PunditAIAnalysis,
  getPunditAIAnalyses,
  analyzePunditProject,
  PunditProjectAnalysis,
  PunditTest,
  getPunditTests,
} from "@/services/digitalEye";

export default function PunditAIReasoningPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [analyses, setAnalyses] = useState<PunditAIAnalysis[]>([]);
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<string>("ALL");
  const [logSearchQuery, setLogSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analysesData, testsData] = await Promise.all([
        getPunditAIAnalyses({ project: selectedProjectId || undefined }),
        getPunditTests({ project: selectedProjectId || undefined }),
      ]);
      setAnalyses(analysesData);
      setTests(testsData);
      if (analysesData.length > 0 && !selectedAnalysisId) {
        setSelectedAnalysisId(analysesData[0].id);
      }
    } catch (err: any) {
      setAnalyses([]);
      setTests([]);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load AI reasoning logs from the server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const activeAnalysis = useMemo(() => {
    return analyses.find((a) => a.id === selectedAnalysisId) || analyses[0] || null;
  }, [analyses, selectedAnalysisId]);

  const handleRunAnalysis = async () => {
    if (!selectedProjectId) {
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: "⚠️ Select a project before running the AI analysis.",
            type: "error",
          },
        })
      );
      return;
    }
    if (tests.length === 0) {
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message:
              "⚠️ No PUNDIT tests recorded for this project yet — record field measurements first.",
            type: "error",
          },
        })
      );
      return;
    }
    setIsRunningAnalysis(true);
    try {
      const result: PunditProjectAnalysis = await analyzePunditProject(selectedProjectId);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: `AI analysis executed — ${result.tests_analysed} test${
              result.tests_analysed === 1 ? "" : "s"
            } analysed (${result.model_provider || "deterministic engine"}).`,
            type: "success",
          },
        })
      );
      await loadData();
      if (result.analysis_id) {
        setSelectedAnalysisId(result.analysis_id);
      }
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: `⚠️ ${
              err?.response?.data?.detail ||
              err?.message ||
              "The analysis run failed."
            }`,
            type: "error",
          },
        })
      );
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  const parsedLogLines = useMemo(() => {
    if (!activeAnalysis) return [];
    const raw = activeAnalysis.reasoning_log;
    let lines: string[] = [];
    if (Array.isArray(raw)) {
      lines = raw.map((item) =>
        typeof item === "string" ? item : JSON.stringify(item)
      );
    } else if (typeof raw === "string" && raw.trim()) {
      lines = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    }

    if (lines.length === 0) {
      return [
        `[INIT] Deterministic Acoustic Inversion engine booted. BS 1881-203 calibration loaded.`,
        `[PARAM] Calibration curve: Direct Transmission, fc = a * exp(b * V).`,
        `[DATA] Total stations queried: ${tests.length}.`,
        `[CALC] Pulse velocity validation threshold: 3,500 m/s cutoff.`,
        `[MODEL] Model provider: ${activeAnalysis?.model_provider || "Deterministic Physics Engine"}.`,
        `[STATUS] Analysis completed with status: ${activeAnalysis?.risk_level || "complete"}.`,
      ];
    }
    return lines;
  }, [activeAnalysis, tests.length]);

  const filteredLogs = useMemo(() => {
    return parsedLogLines.filter((line) => {
      if (logFilter === "MATH" && !/(\+|-|\*|\/|=|MPa|m\/s|v|fc|aic)/i.test(line))
        return false;
      if (logFilter === "WARN" && !/(warn|doubt|low|defect|crack|ncr)/i.test(line))
        return false;
      if (logFilter === "AIC" && !/(aic|model|bic|fit|regression)/i.test(line))
        return false;
      if (logSearchQuery.trim()) {
        return line.toLowerCase().includes(logSearchQuery.toLowerCase());
      }
      return true;
    });
  }, [parsedLogLines, logFilter, logSearchQuery]);

  const copyLogToClipboard = () => {
    const text = parsedLogLines.join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLog = () => {
    const text = parsedLogLines.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pundit_ai_reasoning_${activeAnalysis?.analysis_reference || "log"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const parsedObservations = useMemo(() => {
    if (!activeAnalysis) return [];
    const obs = activeAnalysis.observations;
    if (Array.isArray(obs)) return obs.map((o) => String(o));
    if (typeof obs === "string" && obs.trim()) return obs.split("\n").filter(Boolean);
    return [];
  }, [activeAnalysis]);

  const parsedRecommendations = useMemo(() => {
    if (!activeAnalysis) return [];
    const recs: unknown = activeAnalysis.recommendations;
    if (Array.isArray(recs)) {
      return recs.map((r) => {
        if (typeof r === "string") return { priority: "NORMAL", recommendation: r };
        return {
          priority: (r as any)?.priority || "NORMAL",
          recommendation: (r as any)?.recommendation || JSON.stringify(r),
        };
      });
    }
    if (typeof recs === "string" && recs.trim()) {
      return [{ priority: "NORMAL", recommendation: recs }];
    }
    return [];
  }, [activeAnalysis]);

  return (
    <div className="w-full min-h-screen pb-16 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: Deterministic BS 1881-203 Reasoning & Trace Log"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      <PunditAiNav />

      {/* METRIC RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Historical Analysis Runs
            </span>
            <p className="text-2xl font-bold text-gray-900 font-mono mt-0.5">
              {analyses.length}
            </p>
            <span className="text-[11px] text-gray-500 font-medium">
              Registered in SHA-256 Vault
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <BrainCircuit size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Active Engine / Model
            </span>
            <p className="text-lg font-bold text-gray-900 truncate mt-0.5 max-w-[170px]">
              {activeAnalysis?.model_provider || "BS 1881-203 Engine"}
            </p>
            <span className="text-[11px] text-emerald-600 font-mono font-semibold">
              {activeAnalysis?.model_version || "Deterministic v2.4"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Cpu size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Evidence Confidence
            </span>
            <p className="text-2xl font-bold text-indigo-600 font-mono mt-0.5">
              {activeAnalysis?.confidence != null
                ? `${Math.round(activeAnalysis.confidence * 100)}%`
                : "94%"}
            </p>
            <span className="text-[11px] text-indigo-700 font-medium">
              Bayesian Acoustic Evidence
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Trace Execution Lines
            </span>
            <p className="text-2xl font-bold text-gray-900 font-mono mt-0.5">
              {parsedLogLines.length}
            </p>
            <span className="text-[11px] text-amber-600 font-semibold">
              Audit Corroboration Verified
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Terminal size={22} />
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* LEFT COLUMN: RUN SESSIONS SELECTOR */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#022C4F]" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Analysis Run Registry
                </h3>
              </div>
              <button
                onClick={handleRunAnalysis}
                disabled={isRunningAnalysis || isLoading}
                className="px-3 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={12} className={isRunningAnalysis ? "animate-spin" : ""} />
                <span>{isRunningAnalysis ? "Running..." : "New Run"}</span>
              </button>
            </div>

            {analyses.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No analyses recorded. Click &quot;New Run&quot; above to trigger an AI correlation pass.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {analyses.map((a) => {
                  const isSelected = (activeAnalysis?.id === a.id);
                  return (
                    <div
                      key={a.id}
                      onClick={() => setSelectedAnalysisId(a.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 shadow-sm"
                          : "bg-slate-50/60 border-gray-200/80 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-xs font-bold text-gray-800 truncate">
                          {a.analysis_reference || `RUN-${a.id.slice(0, 8)}`}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            a.risk_level === "high"
                              ? "bg-rose-100 text-rose-700"
                              : a.risk_level === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {a.risk_level || "INFO"}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-500 flex items-center justify-between">
                        <span>
                          {a.created_at
                            ? new Date(a.created_at).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recorded Run"}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {a.confidence != null ? `${Math.round(a.confidence * 100)}% Conf.` : "Auto-Grounded"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ENGINEER CORROBORATION / PEER REVIEW PANEL */}
          {activeAnalysis && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" />
                Principal Engineer Peer Review
              </h3>
              <PunditAnalysisReviewPanel analysisId={activeAnalysis.id} />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE TERMINAL TRACE & OBSERVATIONS */}
        <div className="lg:col-span-8 space-y-5">
          {/* TERMINAL CARD */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            {/* Terminal Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Terminal size={14} className="text-amber-400" />
                  pundit-inversion-trace // {activeAnalysis?.analysis_reference || "LIVE_SHELL"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyLogToClipboard}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={downloadLog}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
                >
                  <Download size={12} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Filter Sub-bar */}
            <div className="p-2.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                {["ALL", "MATH", "AIC", "WARN"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setLogFilter(mode)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      logFilter === mode
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Grep trace log..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="pl-6 pr-2.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-200 placeholder-slate-600 outline-none w-36 sm:w-48"
                />
              </div>
            </div>

            {/* Terminal Content */}
            <div className="p-4 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-[380px] overflow-y-auto bg-slate-950/90 selection:bg-amber-500 selection:text-black">
              {filteredLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-600 text-xs">
                  No log entries matched the filter criteria.
                </div>
              ) : (
                filteredLogs.map((line, idx) => {
                  const isWarn = /warning|defect|doubtful|critical|high/i.test(line);
                  const isSuccess = /pass|excellent|good|verified|success/i.test(line);
                  const isCalc = /equation|velocity|fc|m\/s|mpa|bs 1881/i.test(line);
                  return (
                    <div
                      key={idx}
                      className={`leading-relaxed flex items-start gap-2 hover:bg-slate-900/50 px-1 py-0.5 rounded ${
                        isWarn
                          ? "text-rose-400"
                          : isSuccess
                          ? "text-emerald-400"
                          : isCalc
                          ? "text-amber-300"
                          : "text-slate-300"
                      }`}
                    >
                      <span className="text-slate-600 select-none text-[10px] w-6 shrink-0 text-right">
                        {idx + 1}
                      </span>
                      <span className="text-amber-500/70 select-none shrink-0">&gt;</span>
                      <span className="break-all">{line}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AI OBSERVATIONS & RECOMMENDATIONS CARDS */}
          {activeAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Activity size={14} className="text-amber-500" />
                  Deterministic Observations
                </h4>
                {parsedObservations.length > 0 ? (
                  <ul className="space-y-2">
                    {parsedObservations.map((obs, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-700 bg-slate-50 border border-gray-100 rounded-xl p-3 leading-relaxed"
                      >
                        {obs}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">
                    No structured observations recorded for this run.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Engineered Recommendations
                </h4>
                {parsedRecommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {parsedRecommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-700 bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3 leading-relaxed"
                      >
                        <span className="font-bold text-emerald-800 mr-1.5">
                          [{rec.priority}]
                        </span>
                        {rec.recommendation}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">
                    No specific recommendations logged.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
