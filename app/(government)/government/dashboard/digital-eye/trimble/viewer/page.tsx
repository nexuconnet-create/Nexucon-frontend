"use client";

import React, { useState, useEffect } from "react";
import { Box, Sliders, RefreshCw, Share2, Layers, Download } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import TrimbleBIMViewer from "@/components/dashboard/digital-eye/TrimbleBIMViewer";
import RadargramViewer from "@/components/dashboard/digital-eye/RadargramViewer";
import PunditWaveformViewer from "@/components/dashboard/digital-eye/PunditWaveformViewer";
import { 
  BIMStructuralElement, 
  TrimbleConnection, 
  GPRScan, 
  PunditTest,
  getBIMStructuralElements, 
  getTrimbleConnectionStatus, 
  getGPRScans, 
  getPunditTests 
} from "@/services/digitalEye";

export default function TrimbleViewerPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [elements, setElements] = useState<BIMStructuralElement[]>([]);
  const [trimbleStatus, setTrimbleStatus] = useState<TrimbleConnection | null>(null);
  const [gprScans, setGprScans] = useState<GPRScan[]>([]);
  const [punditTests, setPunditTests] = useState<PunditTest[]>([]);
  const [toleranceThresholdMm, setToleranceThresholdMm] = useState<number>(20);

  const [inspectGprScan, setInspectGprScan] = useState<GPRScan | null>(null);
  const [inspectPunditTest, setInspectPunditTest] = useState<PunditTest | null>(null);

  useEffect(() => {
    getBIMStructuralElements({ project: selectedProjectId }).then(setElements);
    getTrimbleConnectionStatus(selectedProjectId).then(setTrimbleStatus);
    getGPRScans({ project: selectedProjectId }).then(setGprScans);
    getPunditTests({ project: selectedProjectId }).then(setPunditTests);
  }, [selectedProjectId]);

  const activeElement = elements.find(e => e.id === selectedElementId) || (elements.length > 0 ? elements[0] : null);

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="Trimble Connect: 3D BIM Viewer"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-1 mb-8">
        <TrimbleBIMViewer
          elements={elements}
          selectedElement={activeElement}
          onSelectElement={(elem) => setSelectedElementId(elem.id)}
          trimbleStatus={trimbleStatus}
          linkedGprScans={gprScans}
          linkedPunditTests={punditTests}
          onOpenGprDetail={(scan) => setInspectGprScan(scan)}
          onOpenPunditDetail={(test) => setInspectPunditTest(test)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-[#022C4F] flex items-center gap-2 text-sm">
              <Sliders size={16} className="text-blue-600" />
              Statutory Tolerance Envelope
            </h3>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              ±{toleranceThresholdMm} mm
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1.5 font-medium">
              <span>Allowable Variance:</span>
              <span className="font-bold">{toleranceThresholdMm} mm (NBC 2020)</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={toleranceThresholdMm}
              onChange={(e) => setToleranceThresholdMm(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <h3 className="font-bold text-[#022C4F] flex items-center gap-2 text-sm">
              <Box size={16} className="text-blue-600" />
              Structural Element Correlation Matrix
            </h3>
            <span className="text-xs text-gray-500">{elements.length} Elements</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
                  <th className="py-2.5 px-3">Element</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Level / Grid</th>
                  <th className="py-2.5 px-3">GPR Radar</th>
                  <th className="py-2.5 px-3">PUNDIT UPV</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {elements.map((elem) => {
                  const isSelected = activeElement?.id === elem.id;
                  return (
                    <tr 
                      key={elem.id} 
                      onClick={() => setSelectedElementId(elem.id)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${isSelected ? "bg-blue-50/60 font-semibold" : ""}`}
                    >
                      <td className="py-3 px-3 font-bold text-gray-900">{elem.name}</td>
                      <td className="py-3 px-3">{elem.category}</td>
                      <td className="py-3 px-3 text-gray-600">{elem.grid_location}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          elem.gpr_clearance_status === "VERIFIED" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          {elem.gpr_clearance_status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          elem.pundit_clearance_status === "VERIFIED" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          {elem.pundit_clearance_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElementId(elem.id);
                          }}
                          className="px-2.5 py-1 bg-white border border-gray-200 text-blue-600 rounded-lg text-[11px] font-bold shadow-sm"
                        >
                          Focus 3D
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {inspectGprScan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-5xl w-full my-auto">
            <RadargramViewer scan={inspectGprScan} onClose={() => setInspectGprScan(null)} />
          </div>
        </div>
      )}

      {inspectPunditTest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full my-auto">
            <PunditWaveformViewer test={inspectPunditTest} onClose={() => setInspectPunditTest(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
