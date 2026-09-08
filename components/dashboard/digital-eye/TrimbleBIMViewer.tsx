"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Maximize2,
  Minimize2,
  RotateCcw,
  Loader2,
  Info,
  XCircle,
} from "lucide-react";
import { BIMStructuralElement, TrimbleConnection, getBIMModelGeometry, BIMModelGeometry } from "@/services/digitalEye";
import BIMGeometryCanvas, { computeBounds, ModelBounds } from "./BIMGeometryCanvas";

interface TrimbleBIMViewerProps {
  /** Project whose imported BIM model is rendered (tessellated geometry from
   *  /digital-eye/bim-elements/geometry/ — the same source the data-collection
   *  3D preview uses). */
  projectId?: string;
  elements: BIMStructuralElement[];
  selectedElement?: BIMStructuralElement | null;
  onSelectElement?: (element: BIMStructuralElement) => void;
  trimbleStatus?: TrimbleConnection | null;
}

type GeometryState = 'loading' | 'ready' | 'no-model' | 'error';

/**
 * Trimble workspace 3D BIM viewer. Renders the project's REAL imported model
 * (server-tessellated IFC geometry — RVT uploads are translated via Autodesk
 * first) with the selected structural element highlighted amber; the element
 * inspector beside it lists the recorded IFC metadata and NDT clearance
 * statuses. Surfaces that had no real data behind them (fake deviation
 * heatmaps, X-ray overlays, GPR pin markers, a hardcoded model filename) were
 * removed rather than fabricated (B8).
 */
export default function TrimbleBIMViewer({
  projectId,
  elements,
  selectedElement,
  onSelectElement,
  trimbleStatus,
}: TrimbleBIMViewerProps) {
  const [activeMode, setActiveMode] = useState<"solid" | "wireframe">("solid");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotating, setIsRotating] = useState(true);

  const [geometry, setGeometry] = useState<BIMModelGeometry | null>(null);
  const [geomState, setGeomState] = useState<GeometryState>('no-model');

  useEffect(() => {
    if (!projectId) {
      setGeometry(null);
      setGeomState('no-model');
      return;
    }
    let cancelled = false;
    setGeomState('loading');
    getBIMModelGeometry(projectId)
      .then((data) => {
        if (cancelled) return;
        if (!data || !data.elements || data.elements.length === 0) {
          setGeometry(null);
          setGeomState('no-model');
          return;
        }
        setGeometry(data);
        setGeomState('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setGeometry(null);
        // 404 = no model imported for this project — the honest empty state.
        setGeomState('no-model');
      });
    return () => { cancelled = true; };
  }, [projectId]);

  const bounds: ModelBounds | null = useMemo(
    () => (geometry ? computeBounds(geometry.elements) : null),
    [geometry],
  );

  // The geometry elements carry IFC GUIDs; the pages select by element id —
  // translate between the two so a mesh click selects the registry record.
  const handleMeshSelect = (guid: string) => {
    const el = elements.find(e => e.element_guid === guid);
    if (el && onSelectElement) onSelectElement(el);
  };

  const cdeConnected = trimbleStatus?.status === 'CONNECTED';

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 flex flex-col' : 'min-h-[620px] flex flex-col'}`}>

      {/* Viewer Header Toolbar */}
      <div className="bg-slate-900 text-white rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Box size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-100">Trimble Connect 3D BIM Viewer</h3>
              {trimbleStatus && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  cdeConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {cdeConnected ? 'CDE Connected' : `CDE ${trimbleStatus.status_display || trimbleStatus.status}`}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {geomState === 'ready' && geometry
                ? `${geometry.source_file}${geometry.translated_from_rvt ? ' (translated from Revit via Autodesk)' : ''} • ${geometry.elements.length} element(s)`
                : geomState === 'loading'
                  ? 'Loading model geometry…'
                  : 'No BIM model imported for this project'}
            </p>
          </div>
        </div>

        {/* Render mode + view toggles — only modes the real geometry supports. */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveMode("solid")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${activeMode === "solid" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Solid
            </button>
            <button
              onClick={() => setActiveMode("wireframe")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${activeMode === "wireframe" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Wireframe
            </button>
          </div>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${isRotating ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}
            title="Toggle Auto-Rotation"
          >
            <RotateCcw size={14} className={isRotating ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Canvas + Properties Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 bg-slate-950 relative overflow-hidden rounded-b-2xl">

        {/* 3D Canvas Area (Cols 1-3) */}
        <div className="lg:col-span-3 relative h-[450px] lg:h-[540px]">
          {geomState === 'ready' && geometry && bounds && (
            <BIMGeometryCanvas
              elements={geometry.elements}
              bounds={bounds}
              selectedGuid={selectedElement?.element_guid ?? null}
              onSelect={onSelectElement ? handleMeshSelect : undefined}
              wireframe={activeMode === 'wireframe'}
              autoRotate={isRotating}
            />
          )}

          {geomState === 'ready' && (
            <div className="absolute top-3 left-3 bg-slate-900/80 text-slate-300 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-slate-700 z-10 pointer-events-none flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#f59e0b' }} />
              <span>Selected target element</span>
              <span className="text-slate-600 mx-1">|</span>
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#8f9bab', opacity: 0.45 }} />
              <span>Other elements</span>
            </div>
          )}

          {geomState === 'ready' && (
            <div className="absolute bottom-3 right-3 bg-slate-900/80 text-slate-400 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-slate-700 z-10 pointer-events-none">
              Drag to orbit · scroll to zoom · click an element to select it
            </div>
          )}

          {geomState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-slate-800 p-4 rounded-xl flex items-center gap-3 border border-slate-700">
                <Loader2 size={18} className="animate-spin text-blue-400" />
                <span className="text-slate-300 text-sm font-mono">Loading model geometry…</span>
              </div>
            </div>
          )}

          {(geomState === 'no-model' || geomState === 'error') && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="bg-slate-800 p-5 rounded-xl flex flex-col items-center gap-2 border border-slate-700 max-w-sm text-center">
                {geomState === 'error' ? <XCircle size={20} className="text-rose-400" /> : <Info size={20} className="text-slate-400" />}
                <span className="text-slate-300 text-sm font-mono">No BIM model imported for this project</span>
                <span className="text-slate-500 text-xs font-mono">
                  Import the project IFC/RVT model on the Digital Eye data-collection page — its
                  tessellated geometry renders here.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Structural Element Inspection Panel (Col 4) */}
        <div className="lg:col-span-1 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 text-white flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">BIM Element Inspector</span>
            </div>

            {selectedElement ? (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-base text-slate-100">{selectedElement.name}</h4>
                  <p className="font-mono text-[11px] text-slate-400 mt-0.5">{selectedElement.element_guid}</p>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl space-y-2 border border-slate-700/60">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-semibold text-slate-200">{selectedElement.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Grid Location:</span>
                    <span className="font-mono text-slate-200">{selectedElement.grid_location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elevation:</span>
                    <span className="font-mono text-slate-200">
                      {selectedElement.elevation_level_m ?? selectedElement.coordinates_3d?.z ?? '—'} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Concrete Spec:</span>
                    <span className="font-semibold text-slate-200">
                      {selectedElement.concrete_grade_specified || selectedElement.designed_concrete_grade || '—'}
                    </span>
                  </div>
                </div>

                {/* GPR & PUNDIT NDT clearance — recorded statuses from the platform. */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-slate-300 font-medium">GPR Radar:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedElement.gpr_clearance_status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    }`}>
                      {selectedElement.gpr_clearance_status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-slate-300 font-medium">PUNDIT UPV:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedElement.pundit_clearance_status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    }`}>
                      {selectedElement.pundit_clearance_status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Box size={32} className="mx-auto mb-2 opacity-50" />
                <p>Click any structural element in the model, or choose one from the header selector, to view its IFC metadata &amp; NDT links.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
