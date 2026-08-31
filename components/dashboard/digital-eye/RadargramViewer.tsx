"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Radio, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Download, 
  Box, 
  Share2, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { GPRScan } from "@/services/digitalEye";

interface RadargramViewerProps {
  scan: GPRScan;
  onClose?: () => void;
  onLinkToBIM?: () => void;
  onEscalateNCR?: () => void;
}

export default function RadargramViewer({
  scan,
  onClose,
  onLinkToBIM,
  onEscalateNCR
}: RadargramViewerProps) {
  const [permittivity, setPermittivity] = useState<number>(scan.dielectric_permittivity || 6.2);
  const [selectedDepthSlice, setSelectedDepthSlice] = useState<string>("100-200");
  const [gainLevel, setGainLevel] = useState<number>(35);
  const [activeTab, setActiveTab] = useState<"bscan" | "cscan" | "rebar">("bscan");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Speed of light in vacuum = 0.3 m/ns
  // Velocity in medium v = c / sqrt(er)
  const radarVelocity = (0.3 / Math.sqrt(permittivity)).toFixed(3); // in m/ns or mm/ps

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw Radargram B-Scan
    ctx.fillStyle = "#0B1120";
    ctx.fillRect(0, 0, width, height);

    // Time-depth scale lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let y = 30; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Depth labels
      const depthMm = Math.round((y / height) * 600);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "10px monospace";
      ctx.fillText(`${depthMm}mm`, 5, y + 3);
    }

    // Distance scale lines (x-axis)
    for (let x = 60; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      const distM = ((x / width) * scan.transect_length_m).toFixed(1);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "10px monospace";
      ctx.fillText(`${distM}m`, x - 10, height - 5);
    }

    // Draw hyperbolic reflections (Rebars and Tendons)
    const rebarPositions = [
      { x: 120, y: 140, width: 70, height: 40, label: "#1" },
      { x: 230, y: 150, width: 75, height: 45, label: "#2" },
      { x: 340, y: 145, width: 70, height: 42, label: "#3" },
      { x: 450, y: 160, width: 80, height: 50, label: "#4 (Wide Gap)" },
      { x: 600, y: 142, width: 70, height: 40, label: "#5" },
      { x: 710, y: 148, width: 75, height: 44, label: "#6" },
    ];

    rebarPositions.forEach((rb) => {
      // Hyperbola curve
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(rb.x - rb.width / 2, rb.y + rb.height);
      ctx.quadraticCurveTo(rb.x, rb.y - 15, rb.x + rb.width / 2, rb.y + rb.height);
      ctx.strokeStyle = rb.label.includes("Wide") ? "#f43f5e" : "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Infill glow
      ctx.fillStyle = rb.label.includes("Wide") ? "rgba(244, 63, 94, 0.15)" : "rgba(56, 189, 248, 0.15)";
      ctx.fill();

      // Apex Marker
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(rb.x, rb.y - 3, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = rb.label.includes("Wide") ? "#fda4af" : "#bae6fd";
      ctx.font = "bold 10px monospace";
      ctx.fillText(rb.label, rb.x - 15, rb.y - 12);
      ctx.restore();
    });

    // Void / Defect Zone
    ctx.save();
    ctx.strokeStyle = "rgba(234, 179, 8, 0.8)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(480, 220, 110, 60);
    ctx.fillStyle = "rgba(234, 179, 8, 0.1)";
    ctx.fillRect(480, 220, 110, 60);
    ctx.fillStyle = "#fde047";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("Anomalous Phase Inversion (Void)", 485, 240);
    ctx.restore();

  }, [permittivity, gainLevel, scan]);

  return (
    <div className={`w-full bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 p-4 flex flex-col' : ''}`}>
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Radio size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-100">{scan.scan_reference}</h3>
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                {scan.antenna_frequency.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400">{scan.project_name} • Axis: {scan.grid_axis} ({scan.transect_length_m}m)</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab("bscan")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${activeTab === "bscan" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              B-Scan Profile
            </button>
            <button
              onClick={() => setActiveTab("cscan")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${activeTab === "cscan" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              C-Scan Depth Slice
            </button>
            <button
              onClick={() => setActiveTab("rebar")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${activeTab === "rebar" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Rebar Meter
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Canvas & Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4">
        
        {/* Canvas Display (Cols 1-3) */}
        <div className="lg:col-span-3 p-4 bg-slate-950 flex flex-col justify-between">
          <div className="relative w-full h-[380px] sm:h-[420px] rounded-xl overflow-hidden border border-slate-800">
            <canvas
              ref={canvasRef}
              width={800}
              height={420}
              className="w-full h-full object-cover"
            />

            {/* In-Canvas Live Velocity Badge */}
            <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 text-xs space-y-1">
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">EM Velocity (v):</span>
                <span className="font-mono text-cyan-400 font-bold">{radarVelocity} m/ns</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Relative εr:</span>
                <span className="font-mono text-slate-200">{permittivity.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Measured Spacing</span>
              <span className="text-sm font-bold text-rose-400 font-mono">{scan.measured_rebar_spacing_mm} mm</span>
              <span className="text-[10px] text-rose-300 block">Design Spec: {scan.specified_rebar_spacing_mm} mm (Failed)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Cover Depth</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{scan.measured_cover_depth_mm} mm</span>
              <span className="text-[10px] text-emerald-300 block">Min Required: 35 mm (Pass)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
              <span className="text-sm font-bold text-rose-400 uppercase font-mono">{scan.status}</span>
              <span className="text-[10px] text-slate-400 block">Requires NCR Escalation</span>
            </div>
          </div>
        </div>

        {/* Sidebar Controls & Calibration (Col 4) */}
        <div className="lg:col-span-1 p-5 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Geophysics Inversion Controls
            </h4>

            {/* Dielectric Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Dielectric Permittivity (εr)</span>
                <span className="font-mono text-cyan-400 font-bold">{permittivity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="12.0"
                step="0.1"
                value={permittivity}
                onChange={(e) => setPermittivity(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Dry Concrete (4.5)</span>
                <span>Moist/Reinforced (9.0)</span>
              </div>
            </div>

            {/* Gain Curve Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Time-Gain Compensation (TGC)</span>
                <span className="font-mono text-cyan-400 font-bold">{gainLevel} dB</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={gainLevel}
                onChange={(e) => setGainLevel(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Depth Slice Picker */}
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5">C-Scan Depth Slice (Horizontal)</label>
              <select
                value={selectedDepthSlice}
                onChange={(e) => setSelectedDepthSlice(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none"
              >
                <option value="0-100">0 – 100 mm (Surface Layer)</option>
                <option value="100-200">100 – 200 mm (Primary Rebar Mat)</option>
                <option value="200-300">200 – 300 mm (Secondary Rebar)</option>
                <option value="300-500">300 – 500 mm (Post-Tension Tendons)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            {onLinkToBIM && (
              <button
                onClick={onLinkToBIM}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Box size={14} />
                <span>Anchor Scan to BIM Element</span>
              </button>
            )}

            {onEscalateNCR && (
              <button
                onClick={onEscalateNCR}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldAlert size={14} />
                <span>Issue NCR for Rebar Deficiency</span>
              </button>
            )}

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Exported raw SEG-Y & DZT radar package for ${scan.scan_reference}`, type: "info" } }))}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Export Raw SEG-Y</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
