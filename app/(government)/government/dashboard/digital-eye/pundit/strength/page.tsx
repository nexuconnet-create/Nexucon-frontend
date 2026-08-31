"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Activity, CheckCircle2, AlertTriangle, Box } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import { PunditTest, getPunditTests } from "@/services/digitalEye";

export default function PunditStrengthPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [tests, setTests] = useState<PunditTest[]>([]);

  useEffect(() => {
    getPunditTests({ project: selectedProjectId, element_id: selectedElementId }).then(setTests);
  }, [selectedProjectId, selectedElementId]);

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: Concrete Compressive Strength Estimation (fcu)"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Avg Pulse Velocity</span>
          <p className="text-3xl font-bold text-amber-600 mt-1 font-mono">4,120 m/s</p>
          <span className="text-xs text-gray-400 mt-1 block">Good Structural Homogeneity</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Est. Compressive Strength</span>
          <p className="text-3xl font-bold text-gray-900 mt-1 font-mono">42.5 MPa</p>
          <span className="text-xs text-emerald-600 mt-1 font-bold block">Meets C35/45 Requirement</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Doubtful / Low Core Zone</span>
          <p className="text-3xl font-bold text-rose-600 mt-1 font-mono">1 Station</p>
          <span className="text-xs text-gray-400 mt-1 block">Bored Pile P-42 (3,480 m/s)</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#022C4F]">Acoustic Velocity to Compressive Strength Curve</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                <th className="py-3 px-5">Station Reference</th>
                <th className="py-3 px-5">Target Element</th>
                <th className="py-3 px-5">Path (mm)</th>
                <th className="py-3 px-5">Transit (µs)</th>
                <th className="py-3 px-5">Velocity (m/s)</th>
                <th className="py-3 px-5">Est. fcu (MPa)</th>
                <th className="py-3 px-5">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5 font-bold font-mono text-gray-900">{t.test_reference}</td>
                  <td className="py-3.5 px-5 text-gray-700">{t.structural_element_name || t.test_location}</td>
                  <td className="py-3.5 px-5 font-mono text-gray-600">{t.path_length_mm} mm</td>
                  <td className="py-3.5 px-5 font-mono text-gray-600">{t.transit_time_us} µs</td>
                  <td className="py-3.5 px-5 font-mono font-bold text-amber-700">{t.pulse_velocity_ms} m/s</td>
                  <td className="py-3.5 px-5 font-mono font-bold text-gray-900">{t.estimated_compressive_strength_mpa} MPa</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.concrete_quality_rating === 'EXCELLENT' || t.concrete_quality_rating === 'GOOD'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {t.concrete_quality_rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
