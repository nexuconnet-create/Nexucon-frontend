"use client";

import React, { useState, useEffect } from "react";
import { Radio, Download, Search, Filter, Eye } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import RadargramViewer from "@/components/dashboard/digital-eye/RadargramViewer";
import { GPRScan, getGPRScans } from "@/services/digitalEye";

export default function GPRLibraryPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [scans, setScans] = useState<GPRScan[]>([]);
  const [activeScan, setActiveScan] = useState<GPRScan | null>(null);

  useEffect(() => {
    getGPRScans({ project: selectedProjectId }).then(setScans);
  }, [selectedProjectId]);

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="GPR: Raw Survey Library (.DZT / .SGY)"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-[#022C4F]">Subsurface Radar Data Packages</h2>
          <span className="text-xs text-gray-500 font-mono">{scans.length} Packages</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                <th className="py-3 px-5">Scan Ref</th>
                <th className="py-3 px-5">Project</th>
                <th className="py-3 px-5">Antenna Frequency</th>
                <th className="py-3 px-5">Length / Grid</th>
                <th className="py-3 px-5">Operator</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scans.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5 font-bold font-mono text-gray-900">{s.scan_reference}</td>
                  <td className="py-3.5 px-5 text-gray-700">{s.project_name}</td>
                  <td className="py-3.5 px-5 font-mono text-cyan-700 font-semibold">{s.antenna_frequency.replace('_', ' ')}</td>
                  <td className="py-3.5 px-5 text-gray-600">{s.grid_axis} ({s.transect_length_m}m)</td>
                  <td className="py-3.5 px-5 text-gray-600">{s.operator_name}</td>
                  <td className="py-3.5 px-5 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveScan(s)}
                      className="px-3 py-1 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Downloading ${s.scan_reference} raw package...`, type: "info" } }))}
                      className="p-1 border border-gray-200 hover:bg-slate-100 rounded-lg text-gray-600"
                    >
                      <Download size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeScan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-5xl w-full my-auto">
            <RadargramViewer scan={activeScan} onClose={() => setActiveScan(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
