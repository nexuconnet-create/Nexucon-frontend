"use client";

import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Sliders, 
  Activity, 
  Eye, 
  Search, 
  Filter,
  Sparkles,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import FindingDetailDrawer from "@/components/dashboard/digital-eye/FindingDetailDrawer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import { DigitalEyeFinding, getDigitalEyeFindings, GPRScan, getGPRScans } from "@/services/digitalEye";

export default function GPRAIAnalysisPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [findings, setFindings] = useState<DigitalEyeFinding[]>([]);
  const [scans, setScans] = useState<GPRScan[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<DigitalEyeFinding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  useEffect(() => {
    getDigitalEyeFindings({ project: selectedProjectId, element_id: selectedElementId }).then(res => {
      setFindings(res.filter(f => 
        f.taxonomy === 'REBAR_SPACING_DEFICIENCY' || 
        f.taxonomy === 'INSUFFICIENT_CONCRETE_COVER' || 
        f.taxonomy === 'SUBSURFACE_VOID' || 
        f.taxonomy === 'CONCRETE_HONEYCOMBING' ||
        f.taxonomy === 'UNMAPPED_UTILITY_CONDUIT'
      ));
    });
    getGPRScans({ project: selectedProjectId, element_id: selectedElementId }).then(setScans);
  }, [selectedProjectId, selectedElementId]);

  const filteredFindings = findings.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.finding_reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || f.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  // Real aggregate telemetry from the recorded surveys and anomalies — the
  // adapter's confidence values are per-detection; nothing is invented.
  const allAnomalies = scans.flatMap(s => s.anomalies);
  const confidenceValues = allAnomalies.map(a => a.confidence).filter((c): c is number => c != null);
  const averageConfidence = confidenceValues.length > 0
    ? Math.round((confidenceValues.reduce((sum, c) => sum + c, 0) / confidenceValues.length) * 1000) / 10
    : null;
  const antennas = Array.from(new Set(scans.map(s => s.antenna_frequency_mhz).filter((f): f is number => f != null))).sort((a, b) => a - b);
  const deepestAnomaly = allAnomalies.reduce((max, a) => (a.depth_m != null && a.depth_m > (max?.depth_m ?? 0) ? a : max), null as typeof allAnomalies[number] | null);

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="GPR: AI Subsurface Anomaly & Hyperbolic Inversion"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
        onNewFindingClick={() => setIsCreateOpen(true)}
      />

      {/* AI TELEMETRY METRICS — real aggregates from recorded surveys/anomalies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl">
              <BrainCircuit size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full">
              Inversion Active
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">GPR Surveys Ingested</span>
          <p className="text-3xl font-bold text-gray-900 font-mono mt-1">{scans.length}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">{scans.length > 0 ? 'Real /digital-eye/gpr-surveys/ records' : 'No surveys recorded yet'}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
              <AlertTriangle size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
              Action Req.
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">Flagged Subsurface Anomalies</span>
          <p className="text-3xl font-bold text-rose-600 font-mono mt-1">{findings.length}</p>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">{allAnomalies.length} anomaly record(s) on surveys</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Zap size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Detection Record
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">Average Detection Confidence</span>
          <p className="text-3xl font-bold text-emerald-600 font-mono mt-1">{averageConfidence != null ? `${averageConfidence}%` : '—'}</p>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">{confidenceValues.length > 0 ? `${confidenceValues.length} confidence-scored detection(s)` : 'No confidence-scored detections yet'}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <Radio size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Antenna Log
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">Antenna Frequencies In Use</span>
          <p className="text-xl font-bold text-gray-900 font-mono mt-2">{antennas.length > 0 ? antennas.map(f => `${f}MHz`).join(' / ') : '—'}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">{deepestAnomaly?.depth_m != null ? `Deepest recorded anomaly: ${deepestAnomaly.depth_m.toFixed(2)}m` : 'No depth-recorded anomalies yet'}</span>
        </motion.div>
      </div>

      {/* AI ANOMALIES FEED */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
              <BrainCircuit className="text-cyan-600" size={20} />
              AI-Detected Subsurface Inversion Findings
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Automated phase-inversion flags, rebar pitch deficiencies, and void geometry predictions.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search AI findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none w-44 sm:w-56"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredFindings.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No GPR-related AI findings recorded for this {selectedElementId ? 'element' : 'project'} yet. Findings appear here once the correlation engine links GPR evidence.
            </div>
          ) : filteredFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => {
                setSelectedFinding(finding);
                setIsDrawerOpen(true);
              }}
              className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  finding.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono font-bold text-xs text-gray-500">{finding.finding_reference}</span>
                    <span className="text-gray-300">•</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      finding.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {finding.severity}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded font-semibold">
                      AI Confidence: {finding.confidence_score}%
                    </span>
                    {finding.depth_mm && (
                      <span className="text-[10px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        Depth: {finding.depth_mm}mm
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-cyan-700 transition-colors">{finding.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 max-w-2xl">{finding.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFinding(finding);
                    setIsDrawerOpen(true);
                  }}
                  className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Examine & Issue NCR →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FindingDetailDrawer
        finding={selectedFinding}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
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
