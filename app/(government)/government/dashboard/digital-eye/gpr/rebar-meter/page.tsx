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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    getGPRScans({ project: selectedProjectId, element_id: selectedElementId })
      .then(setScans)
      .catch((err: any) => {
        setScans([]);
        setLoadError(err?.response?.data?.detail || err?.message || 'Failed to load GPR surveys from the server.');
      })
      .finally(() => setIsLoading(false));
  }, [selectedProjectId, selectedElementId]);

  // Real rebar detections from the recorded GPR anomalies — no fabricated values.
  const rebarRows = scans.flatMap(s => s.anomalies
    .filter(a => a.anomaly_type === 'rebar')
    .map(a => ({ survey: s, anomaly: a })));
  const coverValues = rebarRows.map(r => r.anomaly.rebar_cover_mm).filter((v): v is number => v != null);
  const averageCover = coverValues.length > 0
    ? Math.round(coverValues.reduce((sum, v) => sum + v, 0) / coverValues.length)
    : null;
  const minCover = coverValues.length > 0 ? Math.min(...coverValues) : null;

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
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Rebar Detections Recorded</span>
          <p className="text-3xl font-bold text-gray-900 mt-1 font-mono">{rebarRows.length}</p>
          <span className="text-xs text-gray-400 mt-1 block">From {scans.length} GPR survey(s)</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Average Cover Depth (measured)</span>
          <p className="text-3xl font-bold text-emerald-600 mt-1 font-mono">{averageCover != null ? `${averageCover} mm` : '—'}</p>
          <span className="text-xs text-gray-400 mt-1 block">{coverValues.length > 0 ? `${coverValues.length} cover measurement(s)` : 'No rebar cover measurements recorded yet'}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Minimum Cover Detected</span>
          <p className="text-3xl font-bold text-blue-600 mt-1 font-mono">{minCover != null ? `${minCover} mm` : '—'}</p>
          <span className="text-xs text-gray-400 mt-1 block">{minCover != null ? 'Statutory minimum: ≥ 35 mm' : 'Awaiting rebar anomaly records'}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#022C4F]">Rebar Grid Compliance Matrix</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Cover depths come from recorded rebar anomaly detections. Rebar spacing is not recorded by the survey schema — it is shown as “—” until a measurement standard is defined.
          </p>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-semibold text-gray-400 animate-pulse">
              Loading rebar detections from server…
            </div>
          ) : loadError ? (
            <div className="py-10 text-center text-xs font-bold text-rose-600">{loadError}</div>
          ) : rebarRows.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No rebar detections recorded for this {selectedElementId ? 'element' : 'project'} yet. Rebar anomalies appear here once recorded on a GPR survey.
            </div>
          ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                <th className="py-3 px-5">Survey Transect</th>
                <th className="py-3 px-5">Structural Element</th>
                <th className="py-3 px-5">Measured Spacing</th>
                <th className="py-3 px-5">Design Target</th>
                <th className="py-3 px-5">Cover Depth</th>
                <th className="py-3 px-5">Depth Detected</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rebarRows.map(({ survey, anomaly }) => {
                const cover = anomaly.rebar_cover_mm;
                const isCompliant = cover != null && cover >= 35;
                return (
                  <tr key={anomaly.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5 font-bold font-mono text-gray-900">{survey.survey_reference}</td>
                    <td className="py-3.5 px-5 text-gray-700">{survey.structural_element || 'Unassigned'}</td>
                    <td className="py-3.5 px-5 font-mono text-gray-400">—</td>
                    <td className="py-3.5 px-5 font-mono text-gray-400">—</td>
                    <td className={`py-3.5 px-5 font-mono font-semibold ${cover == null ? 'text-gray-400' : isCompliant ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {cover != null ? `${cover} mm` : '—'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-gray-600">{anomaly.depth_m != null ? `${(anomaly.depth_m * 1000).toFixed(0)} mm` : '—'}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cover == null ? 'bg-gray-100 text-gray-500' : isCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {cover == null ? 'COVER NOT MEASURED' : isCompliant ? 'COMPLIANT (≥35MM)' : 'DEFICIENT (<35MM)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
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
