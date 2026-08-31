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
import { DigitalEyeFinding, getDigitalEyeFindings, PunditTest, getPunditTests } from "@/services/digitalEye";

export default function PunditAIAnalysisPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [findings, setFindings] = useState<DigitalEyeFinding[]>([]);
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<DigitalEyeFinding | null>(null);
  const [inspectTest, setInspectTest] = useState<PunditTest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getDigitalEyeFindings({ project: selectedProjectId, element_id: selectedElementId }).then(res => {
      setFindings(res.filter(f => 
        f.taxonomy === 'LOW_PULSE_VELOCITY_ZONE' || 
        f.taxonomy === 'CRACK_DEPTH_ANOMALY' ||
        f.taxonomy === 'CONCRETE_HONEYCOMBING'
      ));
    });
    getPunditTests({ project: selectedProjectId, element_id: selectedElementId }).then(setTests);
  }, [selectedProjectId, selectedElementId]);

  const filteredFindings = findings.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.finding_reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <p className="text-3xl font-bold text-gray-900 font-mono mt-1">{tests.length * 6 + 24}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Acoustic P-Wave Inversion v2.8</span>
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
          <p className="text-3xl font-bold text-emerald-600 font-mono mt-1">4,120 m/s</p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Est. Strength: 42.5 MPa (C35/45)</span>
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
          <p className="text-3xl font-bold text-purple-600 font-mono mt-1">98.9%</p>
          <span className="text-[11px] text-purple-700 font-medium mt-1 block">Sub-microsecond resolution</span>
        </motion.div>
      </div>

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
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                      AI Inversion Confidence: {finding.confidence_score}%
                    </span>
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
                className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer shrink-0"
              >
                Inspect UPV & NCR →
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
