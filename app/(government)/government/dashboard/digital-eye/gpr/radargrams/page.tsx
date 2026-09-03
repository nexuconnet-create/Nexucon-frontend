"use client";

import React, { useState, useEffect } from "react";
import { Radio, Search, Filter, Eye, RefreshCw, Box, AlertTriangle, CheckCircle2 } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import RadargramViewer from "@/components/dashboard/digital-eye/RadargramViewer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import { GPRScan, getGPRScans, linkGPRSurveyToElement, getBIMStructuralElements } from "@/services/digitalEye";

export default function GPRRadargramsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [scans, setScans] = useState<GPRScan[]>([]);
  const [activeScan, setActiveScan] = useState<GPRScan | null>(null);
  const [isCreateFindingOpen, setIsCreateFindingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    getGPRScans({ project: selectedProjectId, element_id: selectedElementId })
      .then(res => {
        setScans(res);
        if (res.length > 0 && !activeScan) setActiveScan(res[0]);
      })
      .catch((err: any) => {
        setScans([]);
        setLoadError(err?.response?.data?.detail || err?.message || 'Failed to load GPR surveys from the server.');
      })
      .finally(() => setIsLoading(false));
  }, [selectedProjectId, selectedElementId]);

  const handleLinkToBIM = async () => {
    if (!activeScan) return;
    if (!selectedElementId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '⚠️ Select a BIM element in the header before anchoring.', type: "error" } }));
      return;
    }
    try {
      const elements = await getBIMStructuralElements({ project: selectedProjectId || undefined });
      const element = elements.find(el => el.id === selectedElementId);
      if (!element) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '⚠️ Selected BIM element could not be resolved.', type: "error" } }));
        return;
      }
      const updated = await linkGPRSurveyToElement(activeScan.id, element.name);
      setScans(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      setActiveScan(updated);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Anchored ${updated.survey_reference} to BIM element ${element.name}.`, type: "success" } }));
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `⚠️ Anchor failed: ${err?.response?.data?.detail || err?.message || 'The server rejected this update.'}`, type: "error" } }));
    }
  };

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
            onLinkToBIM={handleLinkToBIM}
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

        {isLoading ? (
          <div className="py-12 text-center text-xs font-semibold text-gray-400 animate-pulse">
            Loading GPR surveys from server…
          </div>
        ) : loadError ? (
          <div className="py-10 text-center text-xs font-bold text-rose-600">{loadError}</div>
        ) : scans.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">
            No GPR surveys recorded for this {selectedElementId ? 'element' : 'project'} yet.
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scans.map((s) => {
            const rebarCover = s.anomalies
              .filter(a => a.anomaly_type === 'rebar' && a.rebar_cover_mm != null)
              .map(a => a.rebar_cover_mm!);
            return (
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
                  <span className="font-mono font-bold text-xs text-gray-900">{s.survey_reference}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === 'completed' ? 'bg-emerald-100 text-emerald-800'
                      : s.status === 'processing' ? 'bg-amber-100 text-amber-800'
                      : s.status === 'failed' ? 'bg-rose-100 text-rose-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {s.status_display || s.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-700">{s.title}</p>
                <p className="text-[10px] text-gray-500">{s.survey_area || 'Survey area not recorded'}</p>
                <div className="flex justify-between text-[10px] text-gray-500 mt-3 pt-2 border-t border-gray-200/60">
                  <span>Anomalies: <strong>{s.anomaly_count}</strong></span>
                  <span>Rebar cover: <strong>{rebarCover.length > 0 ? `${Math.min(...rebarCover)}mm (min)` : '—'}</strong></span>
                </div>
              </div>
            );
          })}
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
