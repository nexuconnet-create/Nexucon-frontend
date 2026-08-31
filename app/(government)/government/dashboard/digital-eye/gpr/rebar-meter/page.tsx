"use client";

import React, { useState, useEffect } from "react";
import { Radio, ShieldCheck, AlertTriangle, CheckCircle2, Sliders, Box } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import { GPRScan, getGPRScans } from "@/services/digitalEye";

export default function GPRRebarMeterPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [scans, setScans] = useState<GPRScan[]>([]);
  const [isCreateFindingOpen, setIsCreateFindingOpen] = useState(false);

  useEffect(() => {
    getGPRScans({ project: selectedProjectId, element_id: selectedElementId }).then(setScans);
  }, [selectedProjectId, selectedElementId]);

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="GPR: Rebar Spacing & Concrete Cover Meter"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
        onNewFindingClick={() => setIsCreateFindingOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Average Rebar Spacing</span>
          <p className="text-3xl font-bold text-gray-900 mt-1 font-mono">198 mm</p>
          <span className="text-xs text-gray-400 mt-1 block">Design Code: ≤ 200 mm</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Average Cover Depth</span>
          <p className="text-3xl font-bold text-emerald-600 mt-1 font-mono">42 mm</p>
          <span className="text-xs text-gray-400 mt-1 block">Min Statutory Cover: ≥ 35 mm</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Cover Compliance Pass Rate</span>
          <p className="text-3xl font-bold text-blue-600 mt-1 font-mono">96.4%</p>
          <span className="text-xs text-gray-400 mt-1 block">1 Outlier Flagged (TS-04)</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#022C4F]">Rebar Grid Compliance Matrix</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                <th className="py-3 px-5">Scan Transect</th>
                <th className="py-3 px-5">Structural Element</th>
                <th className="py-3 px-5">Measured Spacing</th>
                <th className="py-3 px-5">Design Target</th>
                <th className="py-3 px-5">Cover Depth</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scans.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5 font-bold font-mono text-gray-900">{s.scan_reference}</td>
                  <td className="py-3.5 px-5 text-gray-700">{s.structural_element_name || "Unassigned"}</td>
                  <td className="py-3.5 px-5 font-mono font-semibold text-gray-800">{s.measured_rebar_spacing_mm} mm</td>
                  <td className="py-3.5 px-5 font-mono text-gray-500">{s.specified_rebar_spacing_mm || 200} mm</td>
                  <td className="py-3.5 px-5 font-mono text-emerald-600 font-semibold">{s.measured_cover_depth_mm} mm</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
