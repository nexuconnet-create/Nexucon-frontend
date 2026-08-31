"use client";

import React, { useState } from "react";
import { 
  Map, 
  Layers, 
  Crosshair, 
  MapPin, 
  Radio, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Maximize2, 
  Minimize2,
  ZoomIn,
  ZoomOut,
  Navigation,
  Info
} from "lucide-react";
import { EvidenceSpatialPoint } from "@/services/digitalEye";

interface EvidenceMapCanvasProps {
  points?: EvidenceSpatialPoint[];
  selectedPoint?: EvidenceSpatialPoint | null;
  onSelectPoint?: (point: EvidenceSpatialPoint) => void;
  onOpenGprDetail?: (point: EvidenceSpatialPoint) => void;
  onOpenPunditDetail?: (point: EvidenceSpatialPoint) => void;
}

export default function EvidenceMapCanvas({
  points = [],
  selectedPoint,
  onSelectPoint,
  onOpenGprDetail,
  onOpenPunditDetail
}: EvidenceMapCanvasProps) {
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    gnss: true,
    gpr: true,
    pundit: true,
    ai: true,
    heatmap: true
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeHoverPoint, setActiveHoverPoint] = useState<EvidenceSpatialPoint | null>(null);

  const toggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const filteredPoints = points.filter(p => {
    if (p.layer_type === 'GNSS_RTK_BEACON' && !activeLayers.gnss) return false;
    if (p.layer_type === 'GPR_TRANSECT' && !activeLayers.gpr) return false;
    if (p.layer_type === 'PUNDIT_STATION' && !activeLayers.pundit) return false;
    if (p.layer_type === 'AI_ANOMALY' && !activeLayers.ai) return false;
    return true;
  });

  const activeInspect = selectedPoint || activeHoverPoint || (filteredPoints.length > 0 ? filteredPoints[0] : null);

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 flex flex-col' : 'min-h-[580px] flex flex-col'}`}>
      
      {/* Header Bar */}
      <div className="bg-slate-900 text-white rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Map size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Multi-Modal Technical Evidence Map</h3>
            <p className="text-xs text-slate-400">Minna Datum (EPSG:26391 / UTM 31N) & WGS84 Spatial Layer</p>
          </div>
        </div>

        {/* Layer Switches */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => toggleLayer('gnss')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeLayers.gnss ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-500"
            }`}
          >
            <Crosshair size={12} />
            <span>RTK Beacons</span>
          </button>

          <button
            onClick={() => toggleLayer('gpr')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeLayers.gpr ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-slate-800 text-slate-500"
            }`}
          >
            <Radio size={12} />
            <span>GPR Transects</span>
          </button>

          <button
            onClick={() => toggleLayer('pundit')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeLayers.pundit ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-slate-800 text-slate-500"
            }`}
          >
            <Sparkles size={12} />
            <span>UPV Test Points</span>
          </button>

          <button
            onClick={() => toggleLayer('ai')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeLayers.ai ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-slate-800 text-slate-500"
            }`}
          >
            <AlertTriangle size={12} />
            <span>Defects</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors ml-2"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 bg-slate-950 relative overflow-hidden rounded-b-2xl border-x border-b border-slate-900">
        
        {/* Interactive Simulated GIS Map Canvas (Cols 1-3) */}
        <div className="lg:col-span-3 relative h-[420px] lg:h-[500px] flex items-center justify-center overflow-hidden">
          
          {/* GIS Satellite Texture Background */}
          <div 
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(56, 189, 248, 0.25) 1px, transparent 0)',
              backgroundSize: `${32 * zoomLevel}px ${32 * zoomLevel}px`
            }}
          />

          {/* Simulated Site Boundary Contour Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
            {/* Site Polygon Perimeter */}
            <polygon
              points="140,80 620,90 740,410 200,430"
              fill="rgba(2, 44, 79, 0.15)"
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="6,4"
            />
            {/* GPR Grid Scan Line Tracks */}
            {activeLayers.gpr && (
              <g stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8">
                <line x1="220" y1="140" x2="580" y2="150" />
                <line x1="210" y1="190" x2="590" y2="200" />
                <line x1="200" y1="240" x2="600" y2="250" />
                <line x1="190" y1="290" x2="610" y2="300" />
              </g>
            )}
          </svg>

          {/* Render Spatial Interactive Pins */}
          {filteredPoints.map((pt, i) => {
            const isSelected = activeInspect?.id === pt.id;
            
            // Map coordinates to percentage positions
            const leftPct = 25 + (i * 14) % 65;
            const topPct = 20 + (i * 22) % 60;

            const getPinColor = () => {
              if (pt.layer_type === 'GNSS_RTK_BEACON') return 'bg-emerald-500 shadow-emerald-500/50';
              if (pt.layer_type === 'GPR_TRANSECT') return 'bg-cyan-500 shadow-cyan-500/50';
              if (pt.layer_type === 'PUNDIT_STATION') return 'bg-amber-500 shadow-amber-500/50';
              return 'bg-rose-500 shadow-rose-500/50 animate-bounce';
            };

            return (
              <div
                key={pt.id}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                onClick={() => {
                  if (onSelectPoint) onSelectPoint(pt);
                  setActiveHoverPoint(pt);
                }}
                onMouseEnter={() => setActiveHoverPoint(pt)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg ${getPinColor()} border-2 border-white`}>
                  {pt.layer_type === 'GNSS_RTK_BEACON' && <Crosshair size={11} />}
                  {pt.layer_type === 'GPR_TRANSECT' && <Radio size={11} />}
                  {pt.layer_type === 'PUNDIT_STATION' && <Sparkles size={11} />}
                  {pt.layer_type === 'AI_ANOMALY' && <AlertTriangle size={11} />}
                </div>
                
                {isSelected && (
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] whitespace-nowrap border border-slate-700 font-mono shadow-md">
                    {pt.title || pt.name}
                  </div>
                )}
              </div>
            );
          })}

          {/* Floating Controls HUD */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white p-3 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2">
              <Navigation size={12} className="text-emerald-400" />
              <span className="font-mono text-[11px]">Datum: Minna (UTM 31N)</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              E: 541,209m • N: 714,032m • Z: 18.2m
            </div>
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 flex items-center gap-1 text-white">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.0))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
          </div>
        </div>

        {/* Selected Evidence Point Metadata Panel (Col 4) */}
        <div className="lg:col-span-1 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 text-white flex flex-col justify-between overflow-y-auto">
          {activeInspect ? (
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Spatial Evidence Point
                </span>
                <h4 className="font-bold text-sm text-slate-100">{activeInspect.title || activeInspect.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{activeInspect.project_name || activeInspect.project}</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl space-y-2 border border-slate-700/60 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Layer Type:</span>
                  <span className="text-cyan-400 font-bold">{activeInspect.layer_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Minna Coordinates:</span>
                  <span className="text-slate-200">{(activeInspect.latitude ?? activeInspect.lat).toFixed(4)}°N, {(activeInspect.longitude ?? activeInspect.lng).toFixed(4)}°E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Elevation:</span>
                  <span className="text-slate-200">+{activeInspect.elevation_m} m</span>
                </div>
                {(activeInspect.accuracy_cm || activeInspect.accuracy_mm) && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">RTK Precision:</span>
                    <span className="text-emerald-400 font-bold">±{activeInspect.accuracy_cm ?? Math.round(activeInspect.accuracy_mm / 10)} cm</span>
                  </div>
                )}
              </div>

              <p className="text-slate-300 leading-relaxed text-xs">
                {activeInspect.description}
              </p>

              {/* Action Triggers to open Radargram or Waveform */}
              <div className="space-y-2 pt-2">
                {activeInspect.layer_type === 'GPR_TRANSECT' && onOpenGprDetail && (
                  <button
                    onClick={() => onOpenGprDetail(activeInspect)}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Radio size={13} />
                    <span>Open GPR Radargram</span>
                  </button>
                )}

                {activeInspect.layer_type === 'PUNDIT_STATION' && onOpenPunditDetail && (
                  <button
                    onClick={() => onOpenPunditDetail(activeInspect)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>Open UPV Waveform</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <MapPin size={32} className="mx-auto mb-2 opacity-50" />
              <p>Select any evidence beacon on the map to inspect geodetic metadata & raw sensor waveforms.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
