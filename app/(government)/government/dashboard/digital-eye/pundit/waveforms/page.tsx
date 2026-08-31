"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Eye, Download, Box, AlertTriangle } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import PunditWaveformViewer from "@/components/dashboard/digital-eye/PunditWaveformViewer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import { PunditTest, getPunditTests } from "@/services/digitalEye";

export default function PunditWaveformsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [activeTest, setActiveTest] = useState<PunditTest | null>(null);
  const [isCreateFindingOpen, setIsCreateFindingOpen] = useState(false);

  useEffect(() => {
    getPunditTests({ project: selectedProjectId, element_id: selectedElementId }).then(res => {
      setTests(res);
      if (res.length > 0 && !activeTest) setActiveTest(res[0]);
    });
  }, [selectedProjectId, selectedElementId]);

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: Waveform Oscillograms"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
        onNewFindingClick={() => setIsCreateFindingOpen(true)}
      />

      {activeTest && (
        <div className="mb-8">
          <PunditWaveformViewer
            test={activeTest}
            onLinkToBIM={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Linked UPV Waveform to active BIM Structural Element!", type: "success" } }))}
            onEscalateNCR={() => setIsCreateFindingOpen(true)}
          />
        </div>
      )}

      {/* Test Station Grid */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-[#022C4F] mb-4 text-base flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" />
          Ultrasonic Pulse Velocity Test Stations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveTest(t)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeTest?.id === t.id 
                  ? 'bg-amber-50/60 border-amber-400 shadow-sm' 
                  : 'bg-slate-50/40 border-gray-100 hover:border-amber-200'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-mono font-bold text-xs text-gray-900">{t.test_reference}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  t.concrete_quality_rating === 'EXCELLENT' || t.concrete_quality_rating === 'GOOD' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {t.concrete_quality_rating}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-700">{t.test_location}</p>
              <div className="flex justify-between text-[10px] text-gray-500 mt-3 pt-2 border-t border-gray-200/60 font-mono">
                <span>Velocity: <strong className="text-amber-700">{t.pulse_velocity_ms} m/s</strong></span>
                <span>fcu: <strong className="text-gray-800">{t.estimated_compressive_strength_mpa} MPa</strong></span>
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
