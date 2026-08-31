"use client";

import React, { useState, useEffect } from "react";
import { Radio, AlertTriangle, Box, Eye, ShieldAlert } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import FindingDetailDrawer from "@/components/dashboard/digital-eye/FindingDetailDrawer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import { DigitalEyeFinding, getDigitalEyeFindings } from "@/services/digitalEye";

export default function GPRVoidsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [findings, setFindings] = useState<DigitalEyeFinding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<DigitalEyeFinding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    getDigitalEyeFindings({ project: selectedProjectId, element_id: selectedElementId }).then(res => {
      setFindings(res.filter(f => f.taxonomy === 'SUBSURFACE_VOID' || f.taxonomy === 'INTER_LAYER_DELAMINATION' || f.taxonomy === 'REBAR_SPACING_DEFICIENCY'));
    });
  }, [selectedProjectId, selectedElementId]);

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="GPR: Subsurface Voids & Honeycomb Anomalies"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
        onNewFindingClick={() => setIsCreateOpen(true)}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#022C4F] flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-600" />
            Detected Subsurface Voids & Honeycomb Pockets
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Phase-inversion radar reflections signaling structural air/water voids.</p>
        </div>

        <div className="p-5 space-y-4">
          {findings.map((f) => (
            <div
              key={f.id}
              onClick={() => {
                setSelectedFinding(f);
                setIsDrawerOpen(true);
              }}
              className="p-4 rounded-xl border border-gray-100 hover:border-rose-300 bg-slate-50/50 hover:bg-rose-50/20 transition-all cursor-pointer flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xs text-gray-500">{f.finding_reference}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                    Depth: {f.depth_mm || 180} mm
                  </span>
                </div>
                <h4 className="font-bold text-sm text-gray-900">{f.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{f.description}</p>
              </div>

              <button className="px-3 py-1.5 bg-[#022C4F] text-white rounded-xl text-xs font-bold shadow-sm">
                Inspect Void & NCR →
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
      />
    </div>
  );
}
