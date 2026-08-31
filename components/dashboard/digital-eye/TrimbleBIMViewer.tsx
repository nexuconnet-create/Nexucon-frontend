"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Box, 
  Layers, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Eye, 
  Sliders, 
  Compass, 
  Download, 
  Share2, 
  RefreshCw,
  Sparkles,
  Radio,
  FileText
} from "lucide-react";
import { BIMStructuralElement, TrimbleConnection, GPRScan, PunditTest } from "@/services/digitalEye";

interface TrimbleBIMViewerProps {
  elements: BIMStructuralElement[];
  selectedElement?: BIMStructuralElement | null;
  onSelectElement?: (element: BIMStructuralElement) => void;
  trimbleStatus?: TrimbleConnection | null;
  linkedGprScans?: GPRScan[];
  linkedPunditTests?: PunditTest[];
  onOpenGprDetail?: (scan: GPRScan) => void;
  onOpenPunditDetail?: (test: PunditTest) => void;
}

export default function TrimbleBIMViewer({
  elements,
  selectedElement,
  onSelectElement,
  trimbleStatus,
  linkedGprScans = [],
  linkedPunditTests = [],
  onOpenGprDetail,
  onOpenPunditDetail
}: TrimbleBIMViewerProps) {
  const [activeMode, setActiveMode] = useState<"solid" | "wireframe" | "heatmap" | "xray">("solid");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("Structural");
  const [showNDTOverlays, setShowNDTOverlays] = useState<boolean>(true);
  const [rotationAngle, setRotationAngle] = useState({ x: 22, y: 45 });
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotating, setIsRotating] = useState(true);

  // Canvas ref for drawing interactive 3D model projection
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let currentAngle = rotationAngle.y;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = "rgba(15, 23, 42, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 30 * zoom;
      const offsetX = (width / 2) % gridSize;
      const offsetY = (height / 2) % gridSize;

      for (let x = offsetX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isRotating) {
        currentAngle += 0.3;
      }

      const rad = (currentAngle * Math.PI) / 180;
      const pitchRad = (rotationAngle.x * Math.PI) / 180;
      const cx = width / 2;
      const cy = height / 2 + 20;

      // 3D Box projections for structural elements
      const baseElements = [
        { name: "Transfer Slab TS-04", w: 260, h: 25, d: 220, yOffset: 60, color: "#022C4F", status: "FLAGGED" },
        { name: "Column C-102", w: 35, h: 140, d: 35, yOffset: -30, color: "#0369a1", status: "VERIFIED" },
        { name: "Shear Wall SW-01", w: 18, h: 160, d: 140, yOffset: -40, color: "#475569", status: "VERIFIED" },
        { name: "Foundation Pile Cap P-42", w: 100, h: 45, d: 100, yOffset: 120, color: "#e11d48", status: "FLAGGED" }
      ];

      baseElements.forEach((el, index) => {
        const isSel = selectedElement?.name === el.name;
        const w = el.w * zoom;
        const h = el.h * zoom;
        const d = el.d * zoom;
        const yOff = el.yOffset * zoom;

        ctx.save();
        ctx.translate(cx, cy + yOff);

        const cosY = Math.cos(rad + index * 0.2);
        const sinY = Math.sin(rad + index * 0.2);

        // Fill style based on active render mode
        if (activeMode === "wireframe") {
          ctx.strokeStyle = isSel ? "#2563eb" : "rgba(30, 41, 59, 0.7)";
          ctx.lineWidth = isSel ? 2.5 : 1.2;
          ctx.strokeRect(-w / 2 * cosY, -h / 2, w * cosY, h);
        } else if (activeMode === "heatmap") {
          ctx.fillStyle = el.status === "FLAGGED" ? "rgba(225, 29, 72, 0.75)" : "rgba(16, 185, 129, 0.75)";
          ctx.fillRect(-w / 2 * cosY, -h / 2, w * cosY, h);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-w / 2 * cosY, -h / 2, w * cosY, h);
        } else if (activeMode === "xray") {
          ctx.fillStyle = isSel ? "rgba(37, 99, 235, 0.4)" : "rgba(2, 44, 79, 0.25)";
          ctx.fillRect(-w / 2 * cosY, -h / 2, w * cosY, h);
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-w / 2 * cosY, -h / 2, w * cosY, h);
        } else {
          // Solid render
          ctx.fillStyle = isSel ? "#1d4ed8" : el.color;
          ctx.fillRect(-w / 2 * cosY, -h / 2, w * cosY, h);
          ctx.strokeStyle = isSel ? "#93c5fd" : "rgba(255,255,255,0.4)";
          ctx.lineWidth = isSel ? 2 : 1;
          ctx.strokeRect(-w / 2 * cosY, -h / 2, w * cosY, h);
        }

        // Draw NDT Target Markers if enabled
        if (showNDTOverlays && (index === 0 || index === 3)) {
          ctx.fillStyle = index === 0 ? "#06b6d4" : "#f59e0b";
          ctx.beginPath();
          ctx.arc(0, 0, 7 * zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.restore();
      });

      if (isRotating) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [rotationAngle, zoom, activeMode, showNDTOverlays, selectedElement, isRotating]);

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
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 size={10} /> CDE Connected
              </span>
            </div>
            <p className="text-xs text-slate-400">Eko_Atlantic_Tower_v4.2.ifc • Model Integrity: 99.8%</p>
          </div>
        </div>

        {/* Mode & Layer Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveMode("solid")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${activeMode === "solid" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Solid
            </button>
            <button
              onClick={() => setActiveMode("wireframe")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${activeMode === "wireframe" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Wireframe
            </button>
            <button
              onClick={() => setActiveMode("heatmap")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${activeMode === "heatmap" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Deviation
            </button>
            <button
              onClick={() => setActiveMode("xray")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${activeMode === "xray" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              X-Ray NDT
            </button>
          </div>

          <button
            onClick={() => setShowNDTOverlays(!showNDTOverlays)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${showNDTOverlays ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-slate-800 text-slate-400"}`}
          >
            <Radio size={13} />
            <span>GPR / UPV Pins</span>
          </button>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-2 rounded-xl text-xs font-semibold transition-colors ${isRotating ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}
            title="Toggle Auto-Rotation"
          >
            <RotateCcw size={14} className={isRotating ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Canvas + Properties Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 bg-slate-950 relative overflow-hidden rounded-b-2xl">
        
        {/* 3D Canvas Area (Cols 1-3) */}
        <div className="lg:col-span-3 relative h-[450px] lg:h-[540px] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={540}
            className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
          />

          {/* Quick HUD Overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white p-3 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2">
              <Compass size={13} className="text-blue-400" />
              <span className="font-mono">Rotation: {Math.round(rotationAngle.y)}°</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Zoom:</span>
              <span className="font-mono">{zoom.toFixed(1)}x</span>
            </div>
          </div>

          {/* Zoom In/Out Floating Controls */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.5))}
              className="px-2.5 py-1 text-slate-300 hover:text-white text-xs font-bold"
            >
              +
            </button>
            <span className="text-slate-400 text-xs px-1 font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.6))}
              className="px-2.5 py-1 text-slate-300 hover:text-white text-xs font-bold"
            >
              -
            </button>
          </div>
        </div>

        {/* Structural Element Inspection Panel (Col 4) */}
        <div className="lg:col-span-1 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 text-white flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">BIM Element Inspector</span>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">IFC 4x3</span>
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
                    <span className="font-mono text-slate-200">+{selectedElement.elevation_level_m ?? selectedElement.coordinates_3d?.z ?? 0} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Concrete Spec:</span>
                    <span className="font-semibold text-slate-200">{selectedElement.concrete_grade_specified || selectedElement.designed_concrete_grade || "C35/45"}</span>
                  </div>
                </div>

                {/* GPR & PUNDIT NDT Clearance Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Radio size={14} className="text-cyan-400" />
                      <span className="text-slate-300 font-medium">GPR Radar:</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedElement.gpr_clearance_status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    }`}>
                      {selectedElement.gpr_clearance_status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-400" />
                      <span className="text-slate-300 font-medium">PUNDIT UPV:</span>
                    </div>
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
                <p>Click on any structural element or choose from the list to view IFC metadata & NDT links.</p>
              </div>
            )}
          </div>

          {/* Export / BCF Buttons */}
          <div className="pt-4 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Exported BCF Issue XML topic to Trimble Connect", type: "success" } }))}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 size={13} />
              <span>Export BCF</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Exporting IFC 3D Snapshot...", type: "info" } }))}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
              title="Download Snapshot"
            >
              <Download size={14} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
