"use client";

import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Search, 
  Filter, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  Box
} from "lucide-react";
import { motion } from "framer-motion";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import FindingDetailDrawer from "@/components/dashboard/digital-eye/FindingDetailDrawer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import PunditWaveformViewer from "@/components/dashboard/digital-eye/PunditWaveformViewer";
import PunditAnalysisReviewPanel from "@/components/dashboard/digital-eye/PunditAnalysisReviewPanel";
import {
  ElementFolderList,
  FolderViewToggle,
  FloorStationTreeBody,
  RATING_SEVERITY,
  StationSummary,
  useFloorStationFolders,
} from "@/components/dashboard/digital-eye/PunditFolderTree";
import { DigitalEyeFinding, getDigitalEyeFindings, PunditTest, getPunditTests, getPunditAIAnalyses, PunditAIAnalysis, PunditProjectAnalysis, analyzePunditProject, getBIMStructuralElements, BIMStructuralElement, formatVelocityMs } from "@/services/digitalEye";

/** One element-verdict row (a test's server-computed element means). */
interface ElementVerdict {
  id: string;
  reference: string;
  element: string;
  floor: string;
  points: number;
  pointLabels: string;
  meanVelocity: number;
  meanFcu: number | null;
  grade: string;
}

export default function PunditAIAnalysisPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [findings, setFindings] = useState<DigitalEyeFinding[]>([]);
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [analyses, setAnalyses] = useState<PunditAIAnalysis[]>([]);
  const [elements, setElements] = useState<BIMStructuralElement[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<DigitalEyeFinding | null>(null);
  const [inspectTest, setInspectTest] = useState<PunditTest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // D1: real AI narrative — the run button hits the backend analysis
  // endpoint; the record it stores is rendered back verbatim.
  const [isRunningAnalysis, setIsRunningAnalysis] = useState<boolean>(false);
  const [freshRun, setFreshRun] = useState<PunditProjectAnalysis | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedElements = await getBIMStructuralElements({ project: selectedProjectId || undefined });
      setElements(fetchedElements);
      const selected = fetchedElements.find(el => el.id === selectedElementId) || null;
      const [fetchedFindings, fetchedTests, fetchedAnalyses] = await Promise.all([
        getDigitalEyeFindings({ project: selectedProjectId || undefined, element_name: selected?.name }),
        getPunditTests({ project: selectedProjectId || undefined, element_name: selected?.name }),
        getPunditAIAnalyses({ project: selectedProjectId || undefined }),
      ]);
      setFindings(fetchedFindings);
      setTests(fetchedTests);
      setAnalyses(fetchedAnalyses);
    } catch (err: any) {
      setFindings([]);
      setTests([]);
      setAnalyses([]);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load AI analysis data from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [selectedProjectId, selectedElementId]);

  // Real computed metrics — no fabricated figures
  const analyzedTests = tests.filter(t => t.pulse_velocity_ms > 0);
  const meanVelocity = analyzedTests.length > 0
    ? Math.round(analyzedTests.reduce((sum, t) => sum + t.pulse_velocity_ms, 0) / analyzedTests.length)
    : null;
  const assessedTests = tests.filter(t => t.estimated_compressive_strength_mpa != null);
  const meanFcu = assessedTests.length > 0
    ? Number((assessedTests.reduce((sum, t) => sum + (t.estimated_compressive_strength_mpa as number), 0) / assessedTests.length).toFixed(1))
    : null;
  const analysisCoverage = tests.length > 0 ? Math.round((analyzedTests.length / tests.length) * 100) : null;
  const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

  const filteredFindings = findings.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.finding_reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Run the project-level analysis: deterministic BS 1881-203 pass over every
  // test + one AI narrative, all server-side. The response is shown verbatim —
  // nothing is composed client-side.
  const handleRunAnalysis = async () => {
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: '⚠️ Select a project before running the AI analysis.', type: "error" }
      }));
      return;
    }
    if (tests.length === 0) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: '⚠️ No PUNDIT tests recorded for this project yet — record field measurements first.', type: "error" }
      }));
      return;
    }
    setIsRunningAnalysis(true);
    try {
      const result = await analyzePunditProject(selectedProjectId);
      setFreshRun(result);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `AI analysis complete — ${result.tests_analysed} test${result.tests_analysed === 1 ? '' : 's'} analysed (${result.model_provider || 'deterministic engine'}).`, type: "success" }
      }));
      await refresh(); // pull the stored analysis record back from the registry
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `⚠️ ${err?.response?.data?.detail || err?.message || 'The analysis run failed.'}`, type: "error" }
      }));
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  const normalizeLines = (val: unknown): string[] => {
    if (Array.isArray(val)) {
      return val.map(item => (typeof item === 'string' ? item : JSON.stringify(item))).filter(Boolean);
    }
    if (typeof val === 'string' && val.trim()) {
      return val.split('\n').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const normalizeRecs = (val: unknown): Array<{ priority: string; recommendation: string } | string> => {
    if (Array.isArray(val)) {
      return val as Array<{ priority: string; recommendation: string } | string>;
    }
    if (typeof val === 'string' && val.trim()) {
      return val.split('\n').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  // What the output panel shows: the run that just happened, else the latest
  // stored analysis record for this project.
  const shownAnalysis: {
    reference: string;
    observations: string[];
    recommendations: Array<{ priority: string; recommendation: string } | string>;
    reasoningLog: string[];
    riskLevel: string;
    provider: string;
    model: string;
    testsAnalysed: number;
    confidence: number | null;
  } | null = freshRun
    ? {
        reference: freshRun.analysis_id,
        observations: normalizeLines(freshRun.observations),
        recommendations: normalizeRecs(freshRun.recommendations),
        reasoningLog: normalizeLines(freshRun.reasoning_log),
        riskLevel: freshRun.risk_level,
        provider: freshRun.model_provider,
        model: freshRun.model_version,
        testsAnalysed: freshRun.tests_analysed,
        confidence: freshRun.confidence ?? null,
      }
    : latestAnalysis
      ? {
          reference: latestAnalysis.analysis_reference,
          observations: normalizeLines(latestAnalysis.observations),
          recommendations: normalizeRecs(latestAnalysis.recommendations),
          reasoningLog: normalizeLines(latestAnalysis.reasoning_log),
          riskLevel: latestAnalysis.risk_level,
          provider: latestAnalysis.model_provider,
          model: latestAnalysis.model_version,
          testsAnalysed: tests.length,
          confidence: latestAnalysis.confidence ?? null,
        }
      : null;

  // The record's real UUID — the review endpoint addresses it directly.
  const shownAnalysisId = freshRun ? freshRun.analysis_id : (latestAnalysis?.id || null);

  // Per-element reading summaries: each test's velocity / E.C.S IS the
  // element mean across its A/B/C… points when readings exist. Floor and
  // element are kept raw ('' when not recorded) — the folder grouping puts
  // them in honest "not recorded / not named" buckets.
  const elementSummaries: ElementVerdict[] = tests
    .filter(t => t.pulse_velocity_ms > 0)
    .map(t => ({
      id: t.id,
      reference: t.test_reference,
      element: (t.structural_element_name || t.test_location || '').trim(),
      floor: (t.floor || '').trim(),
      points: t.readings.length > 0 ? t.readings.length : 1,
      pointLabels: t.readings.length > 0
        ? t.readings.map(r => r.point_label).join('/')
        : 'A',
      meanVelocity: t.pulse_velocity_ms,
      meanFcu: t.estimated_compressive_strength_mpa,
      grade: t.concrete_quality_rating,
    }));

  // Same folder structure as the UPV Test Registry: Floor -> Station (the
  // element) -> verdicts, with the station's mean values and worst grade.
  const verdictFloorOf = (v: ElementVerdict) => v.floor || 'Floor not recorded';
  const verdictStationOf = (v: ElementVerdict) => v.element || 'Station not named';
  const verdictFolders = useFloorStationFolders(elementSummaries, verdictFloorOf, verdictStationOf);
  // Mean of the station's verdict means + worst grade across them.
  const verdictStationSummary = (rows: ElementVerdict[]): StationSummary => {
    const vs = rows.map(r => r.meanVelocity).filter(v => v > 0);
    const fs = rows.map(r => r.meanFcu).filter((f): f is number => f != null);
    return {
      meanV: vs.length ? vs.reduce((s, v) => s + v, 0) / vs.length : null,
      meanF: fs.length ? fs.reduce((s, f) => s + f, 0) / fs.length : null,
      remark: rows.reduce((worst, r) => {
        const a = RATING_SEVERITY.indexOf(r.grade);
        const b = RATING_SEVERITY.indexOf(worst);
        return a < b ? r.grade : worst;
      }, 'EXCELLENT' as string),
    };
  };

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: AI Acoustic Tomography & Pulse Velocity Inversion"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
        onNewFindingClick={() => setIsCreateOpen(true)}
      />

      {/* AI TELEMETRY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
              <BrainCircuit size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Tomography Model
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">AI Waveforms Inferred</span>
          <p className="text-3xl font-bold text-gray-900 font-mono mt-1">{tests.length}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {latestAnalysis ? `${latestAnalysis.model_provider || 'Platform'} ${latestAnalysis.model_version || ''}`.trim() : 'No AI analysis run yet'}
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <TrendingUp size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              BS 1881-203
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">Mean Velocity (AI Calibrated)</span>
          <p className="text-3xl font-bold text-emerald-600 font-mono mt-1">{meanVelocity != null ? `${formatVelocityMs(meanVelocity)} m/s` : '—'}</p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            {meanFcu != null ? `Est. Strength: ${meanFcu} MPa (E.C.S)` : 'No assessed stations yet'}
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
              <AlertTriangle size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
              Core Extraction
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">Doubtful / Low Velocity Zones</span>
          <p className="text-3xl font-bold text-rose-600 font-mono mt-1">{findings.length}</p>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">Velocity &lt; 3,500 m/s</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
              <Zap size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              First-Break Peak
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">Transit-Time Auto-Picker</span>
          <p className="text-3xl font-bold text-purple-600 font-mono mt-1">{analysisCoverage != null ? `${analysisCoverage}%` : '—'}</p>
          <span className="text-[11px] text-purple-700 font-medium mt-1 block">{analyzedTests.length} of {tests.length} stations analyzed</span>
        </motion.div>
      </div>

      {/* AI ANALYSIS RUNNER + OUTPUT (D1) — real backend narrative, shown verbatim */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
              <BrainCircuit className="text-amber-500" size={20} />
              Project AI Analysis
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Deterministic BS 1881-203 pass over every recorded test, then one AI narrative written strictly from the real measurements — no fabricated figures.
            </p>
          </div>
          <button
            onClick={handleRunAnalysis}
            disabled={isRunningAnalysis || isLoading}
            className="px-5 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Sparkles size={14} className={isRunningAnalysis ? "animate-pulse" : ""} />
            <span>{isRunningAnalysis ? 'Running Analysis…' : 'Run AI Analysis'}</span>
          </button>
        </div>

        {shownAnalysis ? (
          <div className="p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                RECORD {shownAnalysis.reference || '—'}
              </span>
              <span className={`px-2.5 py-1 rounded-lg border ${
                shownAnalysis.riskLevel === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : shownAnalysis.riskLevel === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                RISK: {(shownAnalysis.riskLevel || '—').toUpperCase()}
              </span>
              <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-lg">
                {shownAnalysis.testsAnalysed} TEST{shownAnalysis.testsAnalysed === 1 ? '' : 'S'} ANALYSED
              </span>
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg">
                MODEL: {shownAnalysis.provider ? `${shownAnalysis.provider}${shownAnalysis.model ? ` · ${shownAnalysis.model}` : ''}` : 'DETERMINISTIC ENGINE'}
              </span>
              {shownAnalysis.confidence != null && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
                  EVIDENCE CONFIDENCE: {Math.round(shownAnalysis.confidence * 100)}%
                </span>
              )}
            </div>

            {/* Engineer review (client principle 5): the AI output is
                decision-support — a qualified engineer corroborates it or
                returns it for revision. Pending until a review exists. */}
            {shownAnalysisId && (
              <PunditAnalysisReviewPanel analysisId={shownAnalysisId} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity size={13} className="text-amber-500" /> AI Observations
                </h4>
                {shownAnalysis.observations.length > 0 ? (
                  <ul className="space-y-2">
                    {shownAnalysis.observations.map((obs, i) => (
                      <li key={i} className="text-xs text-gray-700 bg-slate-50 border border-gray-100 rounded-xl p-3 leading-relaxed">
                        {obs}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">No observations recorded in this analysis.</p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-500" /> Recommendations
                </h4>
                {shownAnalysis.recommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {shownAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-gray-700 bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 leading-relaxed">
                        {typeof rec === 'string' ? rec : `${rec.priority ? `[${rec.priority}] ` : ''}${rec.recommendation}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">No recommendations recorded in this analysis.</p>
                )}
              </div>
            </div>

            {shownAnalysis.reasoningLog.length > 0 && (
              <details className="text-xs">
                <summary className="font-bold text-gray-600 cursor-pointer select-none">
                  Reasoning Log ({shownAnalysis.reasoningLog.length} entries — deterministic BS 1881-203 math trace)
                </summary>
                <div className="mt-2 p-4 bg-slate-950 text-slate-300 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1 max-h-64 overflow-y-auto">
                  {shownAnalysis.reasoningLog.map((line, i) => (
                    <div key={i}>&gt; {line}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gray-500">
            No AI analysis has been run for this project yet — click <strong>Run AI Analysis</strong> to analyse the recorded PUNDIT tests.
          </div>
        )}
      </div>

      {/* PER-ELEMENT READING SUMMARIES (A1) — element means across A/B/C…
          points, in the same Floor -> Station folder structure as the
          registry (with a Folders / Flat list toggle). */}
      {elementSummaries.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
                <Box className="text-amber-500" size={20} />
                Element Verdicts (Test-Point Means)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Each element&apos;s velocity and E.C.S are the server-computed means across its test points (A, B, C…).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FolderViewToggle viewMode={verdictFolders.viewMode} onChange={verdictFolders.setViewMode} />
              <span className="text-xs text-gray-500 font-mono">{elementSummaries.length} Verdict{elementSummaries.length === 1 ? '' : 's'}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            {verdictFolders.viewMode === 'flat' ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-600 text-[10px] uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-bold">Element</th>
                  <th className="text-left px-4 py-3 font-bold">Test Reference</th>
                  <th className="text-left px-4 py-3 font-bold">Floor</th>
                  <th className="text-center px-4 py-3 font-bold">Points</th>
                  <th className="text-right px-4 py-3 font-bold">Mean Velocity</th>
                  <th className="text-right px-4 py-3 font-bold">Mean E.C.S</th>
                  <th className="text-center px-6 py-3 font-bold">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {elementSummaries.map(e => (
                  <VerdictRow key={e.id} e={e} />
                ))}
              </tbody>
            </table>
            ) : (
            <FloorStationTreeBody
              groups={verdictFolders.groups}
              openFloors={verdictFolders.openFloors}
              openStations={verdictFolders.openStations}
              toggleFloor={verdictFolders.toggleFloor}
              toggleStation={verdictFolders.toggleStation}
              stationSummary={verdictStationSummary}
              renderStationBody={(rows) => (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-gray-600 text-[10px] uppercase tracking-wider">
                      <th className="text-left px-6 py-2.5 font-bold">Element</th>
                      <th className="text-left px-4 py-2.5 font-bold">Test Reference</th>
                      <th className="text-center px-4 py-2.5 font-bold">Points</th>
                      <th className="text-right px-4 py-2.5 font-bold">Mean Velocity</th>
                      <th className="text-right px-4 py-2.5 font-bold">Mean E.C.S</th>
                      <th className="text-center px-6 py-2.5 font-bold">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map(e => (
                      <VerdictRow key={e.id} e={e} showFloor={false} />
                    ))}
                  </tbody>
                </table>
              )}
            />
            )}
          </div>
        </div>
      )}

      {/* AI ANOMALIES FEED */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} />
              AI Acoustic Defect & Low Velocity Inversion Feed
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Automated identification of internal honeycombs, deep micro-cracks, and doubtful strength pockets.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search UPV anomalies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none w-48 sm:w-60"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-12 text-center text-xs font-semibold text-gray-400 animate-pulse">
              Loading AI correlation findings from server…
            </div>
          ) : error ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs font-bold text-rose-600">{error}</p>
              <button onClick={refresh} className="px-4 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold">
                Retry
              </button>
            </div>
          ) : filteredFindings.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">
              {findings.length === 0
                ? 'No AI correlation findings recorded yet. Findings are generated by the platform correlation engine when an analysis runs for this project.'
                : 'No findings match your search.'}
            </div>
          ) : (
          /* Findings carry no floor (DigitalEyeFinding has only the structural
             element) — the honest deepest grouping is a one-level Element →
             findings folder tree, in the same folder styling as the registry. */
          <ElementFolderList
            items={filteredFindings}
            getGroup={(f) => (f.structural_element_name || '').trim() || 'Element not linked'}
            renderItem={(finding) => (
              <div
                key={finding.id}
                onClick={() => {
                  setSelectedFinding(finding);
                  setIsDrawerOpen(true);
                }}
                className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono font-bold text-xs text-gray-500">{finding.finding_reference}</span>
                      <span className="text-gray-300">•</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        {finding.severity}
                      </span>
                      {finding.confidence_score > 0 && (
                        <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                          Evidence Confidence: {finding.confidence_score}%
                        </span>
                      )}
                      {finding.status === 'CONVERTED_TO_NCR' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          CONVERTED TO NCR
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-amber-700 transition-colors">{finding.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 max-w-2xl">{finding.description}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFinding(finding);
                    setIsDrawerOpen(true);
                  }}
                  className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Inspect UPV & NCR →</span>
                </button>
              </div>
            )}
            itemNoun="finding"
          />
          )}
        </div>
      </div>

      <FindingDetailDrawer
        finding={selectedFinding}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        punditTests={tests}
      />

      <CreateFindingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultProjectId={selectedProjectId}
        defaultElementId={selectedElementId}
      />
    </div>
  );
}

/** One element-verdict row (shared by the flat table and the folder view —
 *  the folder's station table omits the Floor column, like the registry). */
function VerdictRow({ e, showFloor = true }: { e: ElementVerdict; showFloor?: boolean }) {
  return (
    <tr className="hover:bg-slate-50/60">
      <td className="px-6 py-3 font-semibold text-gray-900">{e.element || '—'}</td>
      <td className="px-4 py-3 font-mono text-gray-500">{e.reference}</td>
      {showFloor && <td className="px-4 py-3 text-gray-600">{e.floor || '—'}</td>}
      <td className="px-4 py-3 text-center font-mono text-gray-700">{e.pointLabels} <span className="text-gray-400">({e.points})</span></td>
      <td className="px-4 py-3 text-right font-mono font-bold text-amber-700">{formatVelocityMs(e.meanVelocity)} m/s</td>
      <td className="px-4 py-3 text-right font-mono font-bold text-gray-800">{e.meanFcu != null ? `${e.meanFcu.toFixed(1)} MPa` : '—'}</td>
      <td className="px-6 py-3 text-center">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          e.grade === 'EXCELLENT' || e.grade === 'GOOD' ? 'bg-emerald-100 text-emerald-800'
            : e.grade === 'PENDING' ? 'bg-gray-100 text-gray-600'
            : 'bg-rose-100 text-rose-800'
        }`}>
          {e.grade}
        </span>
      </td>
    </tr>
  );
}
