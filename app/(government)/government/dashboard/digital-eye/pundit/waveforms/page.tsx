"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Eye, Download, Box, AlertTriangle } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import PunditWaveformViewer from "@/components/dashboard/digital-eye/PunditWaveformViewer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import {
  PunditTest,
  getPunditTests,
  getBIMStructuralElements,
  BIMStructuralElement,
  linkPunditTestToElement,
} from "@/services/digitalEye";

export default function PunditWaveformsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [elements, setElements] = useState<BIMStructuralElement[]>([]);
  const [activeTest, setActiveTest] = useState<PunditTest | null>(null);
  const [isCreateFindingOpen, setIsCreateFindingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedElements = await getBIMStructuralElements({ project: selectedProjectId || undefined });
      setElements(fetchedElements);
      const selected = fetchedElements.find(el => el.id === selectedElementId) || null;
      const fetchedTests = await getPunditTests({
        project: selectedProjectId || undefined,
        element_name: selected?.name,
      });
      setTests(fetchedTests);
      setActiveTest(prev => prev && fetchedTests.some(t => t.id === prev.id)
        ? fetchedTests.find(t => t.id === prev.id)!
        : (fetchedTests[0] || null));
    } catch (err: any) {
      setTests([]);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load waveform stations from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
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
            onLinkToBIM={() => {
              if (!selectedElement) {
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '⚠️ Select a BIM element in the header before linking.', type: "error" } }));
                return;
              }
              linkPunditTestToElement(activeTest.id, selectedElement.name)
                .then((updated) => {
                  setTests(prev => prev.map(t => (t.id === updated.id ? updated : t)));
                  setActiveTest(updated);
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Linked ${updated.test_reference} to BIM element ${selectedElement.name}.`, type: "success" } }));
                })
                .catch((err: any) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `⚠️ ${err?.response?.data?.detail || err?.message || 'BIM link failed.'}`, type: "error" } })));
            }}
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

        {isLoading ? (
          <div className="py-12 text-center text-xs font-semibold text-gray-400 animate-pulse">
            Loading test stations from server…
          </div>
        ) : error ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-xs font-bold text-rose-600">{error}</p>
            <button onClick={refresh} className="px-4 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold">
              Retry
            </button>
          </div>
        ) : tests.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">
            No PUNDIT test stations recorded{selectedElement ? ` for ${selectedElement.name}` : ' for this project'} yet.
          </div>
        ) : (
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
                    : t.concrete_quality_rating === 'PENDING'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-rose-100 text-rose-800'
                }`}>
                  {t.concrete_quality_rating}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-700">{t.structural_element_name || t.test_location || '—'}</p>
              <div className="flex justify-between text-[10px] text-gray-500 mt-3 pt-2 border-t border-gray-200/60 font-mono">
                <span>Velocity: <strong className="text-amber-700">{t.pulse_velocity_ms ? `${t.pulse_velocity_ms.toLocaleString()} m/s` : 'Pending'}</strong></span>
                <span>fcu: <strong className="text-gray-800">{t.estimated_compressive_strength_mpa != null ? `${t.estimated_compressive_strength_mpa.toFixed(1)} MPa` : '—'}</strong></span>
              </div>
            </div>
          ))}
        </div>
        )}
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
