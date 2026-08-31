"use client";

import React, { useState, useEffect } from "react";
import { Radio, Search, Filter, Eye, RefreshCw, Box, AlertTriangle, CheckCircle2 } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import RadargramViewer from "@/components/dashboard/digital-eye/RadargramViewer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import { GPRScan, getGPRScans } from "@/services/digitalEye";

export default function GPRRadargramsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [scans, setScans] = useState<GPRScan[]>([]);
  const [activeScan, setActiveScan] = useState<GPRScan | null>(null);
  const [isCreateFindingOpen, setIsCreateFindingOpen] = useState(false);

  useEffect(() => {
    getGPRScans({ project: selectedProjectId, element_id: selectedElementId }).then(res => {
      setScans(res);
      if (res.length > 0 && !activeScan) setActiveScan(res[0]);
    });
  }, [selectedProjectId, selectedElementId]);

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="GPR: Radargram B-Scan Inspector"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
        onNewFindingClick={() => setIsCreateFindingOpen(true)}
      />

      {activeScan && (
        <div className="mb-8">
          <RadargramViewer
            scan={activeScan}
            onLinkToBIM={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Linked GPR Scan to active BIM Structural Element!", type: "success" } }))}
            onEscalateNCR={() => setIsCreateFindingOpen(true)}
          />
        </div>
      )}

      {/* Scans Selector Grid */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-[#022C4F] mb-4 text-base flex items-center gap-2">
          <Radio size={18} className="text-cyan-600" />
          Available Subsurface Radar Transects
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scans.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveScan(s)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeScan?.id === s.id 
                  ? 'bg-cyan-50/60 border-cyan-400 shadow-sm' 
                  : 'bg-slate-50/40 border-gray-100 hover:border-cyan-200'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-mono font-bold text-xs text-gray-900">{s.scan_reference}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  s.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {s.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-700">{s.grid_axis}</p>
              <div className="flex justify-between text-[10px] text-gray-500 mt-3 pt-2 border-t border-gray-200/60">
                <span>Spacing: <strong>{s.measured_rebar_spacing_mm}mm</strong></span>
                <span>Cover: <strong>{s.measured_cover_depth_mm}mm</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateFindingModal
        isOpen={isCreateFindingOpen}
        onClose={() => setIsCreateFindingOpen(false)}
        defaultProjectId={selectedProjectId}
        defaultElementId={selectedElementId}
      />
    </div>
  );
}
