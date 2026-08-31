"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Download, Eye } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import PunditWaveformViewer from "@/components/dashboard/digital-eye/PunditWaveformViewer";
import { PunditTest, getPunditTests } from "@/services/digitalEye";

export default function PunditTestsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [activeTest, setActiveTest] = useState<PunditTest | null>(null);

  useEffect(() => {
    getPunditTests({ project: selectedProjectId }).then(setTests);
  }, [selectedProjectId]);

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: Ultrasonic Pulse Velocity Test Registry"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-[#022C4F]">Proceq Pundit PL-200 NDT Test Records</h2>
          <span className="text-xs text-gray-500 font-mono">{tests.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                <th className="py-3 px-5">Test Ref</th>
                <th className="py-3 px-5">Project & Location</th>
                <th className="py-3 px-5">Transducer Mode</th>
                <th className="py-3 px-5">Velocity (m/s)</th>
                <th className="py-3 px-5">Strength (MPa)</th>
                <th className="py-3 px-5">Grade</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-gray-900">{t.test_reference}</td>
                  <td className="py-3.5 px-5 text-gray-700">{t.project_name} - {t.test_location}</td>
                  <td className="py-3.5 px-5 font-mono text-gray-600">{t.transducer_type} ({t.transducer_frequency_khz}kHz)</td>
                  <td className="py-3.5 px-5 font-mono font-bold text-amber-700">{t.pulse_velocity_ms} m/s</td>
                  <td className="py-3.5 px-5 font-mono font-bold text-gray-800">{t.estimated_compressive_strength_mpa} MPa</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.concrete_quality_rating === 'EXCELLENT' || t.concrete_quality_rating === 'GOOD'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {t.concrete_quality_rating}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveTest(t)}
                      className="px-3 py-1 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold"
                    >
                      Oscillogram
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Downloading test cert for ${t.test_reference}...`, type: "info" } }))}
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

      {activeTest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full my-auto">
            <PunditWaveformViewer test={activeTest} onClose={() => setActiveTest(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
