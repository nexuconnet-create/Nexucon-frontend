"use client";

import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  Box, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Activity, 
  Search, 
  Filter, 
  Layers, 
  ShieldCheck, 
  Zap,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import FindingDetailDrawer from "@/components/dashboard/digital-eye/FindingDetailDrawer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import {
  DigitalEyeFinding,
  getDigitalEyeFindings,
  BIMStructuralElement,
  getBIMStructuralElements
} from "@/services/digitalEye";

export default function TrimbleAIAnalysisPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [findings, setFindings] = useState<DigitalEyeFinding[]>([]);
  const [elements, setElements] = useState<BIMStructuralElement[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<DigitalEyeFinding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getDigitalEyeFindings({ project: selectedProjectId, element_id: selectedElementId }).then(res => {
      setFindings(res.filter(f =>
        f.taxonomy === 'BIM_GEOMETRIC_DEVIATION' ||
        f.taxonomy === 'UNMAPPED_UTILITY_CONDUIT'
      ));
    }).catch(() => setFindings([]));
    getBIMStructuralElements({ project: selectedProjectId }).then(setElements).catch(() => setElements([]));
  }, [selectedProjectId, selectedElementId]);

  const filteredFindings = findings.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.finding_reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Metric-card figures are computed from the loaded records only — no
  // fabricated compliance/accuracy percentages (B8 honesty rule).
  const highSeverityCount = findings.filter(f => f.severity === 'HIGH' || f.severity === 'CRITICAL').length;
  const openCount = findings.filter(f => f.status === 'OPEN').length;

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="Trimble Connect: AI Scan-to-BIM Clash & Deviation Engine"
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
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <BrainCircuit size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              IFC Segmentation
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">BIM Elements Evaluated</span>
          <p className="text-3xl font-bold text-gray-900 font-mono mt-1">{elements.length}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Revit / Tekla IFC4 Synchronized</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
              <ShieldCheck size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Review Required
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">High-Severity Outliers</span>
          <p className="text-3xl font-bold text-amber-600 font-mono mt-1">{highSeverityCount}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">HIGH / CRITICAL severity findings recorded</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
              <AlertTriangle size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
              Action Queue
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">Open Geometric Outliers</span>
          <p className="text-3xl font-bold text-rose-600 font-mono mt-1">{openCount}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">Findings not yet resolved</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <Zap size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
              Correlation
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">Findings With Recorded Confidence</span>
          <p className="text-3xl font-bold text-indigo-600 font-mono mt-1">
            {findings.filter(f => (f.confidence_score ?? 0) > 0).length}
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">Carry an evidence-based AI confidence score</span>
        </motion.div>
      </div>

      {/* AI ANOMALIES FEED */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
              <Box className="text-blue-600" size={20} />
              AI-Detected Scan-to-BIM Geometric Clashes
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Automated clash classification against Trimble Connect 3D structural model.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search BIM clashing findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none w-48 sm:w-60"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => {
                setSelectedFinding(finding);
                setIsDrawerOpen(true);
              }}
              className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Box size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono font-bold text-xs text-gray-500">{finding.finding_reference}</span>
                    <span className="text-gray-300">•</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {finding.severity}
                    </span>
                    {(finding.confidence_score ?? 0) > 0 ? (
                      <span className="text-[10px] font-mono text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                        AI Confidence: {finding.confidence_score}%
                      </span>
                    ) : (
                      <span
                        className="text-[10px] font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded"
                        title="Confidence is only shown when the platform has computed an evidence-based score for this finding"
                      >
                        Confidence: not yet assessed
                      </span>
                    )}
                    {finding.deviation_mm && (
                      <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">
                        Variance: +{finding.deviation_mm}mm
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">{finding.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 max-w-2xl">{finding.description}</p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFinding(finding);
                  setIsDrawerOpen(true);
                }}
                className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer shrink-0"
              >
                Inspect BIM BCF →
              </button>
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
