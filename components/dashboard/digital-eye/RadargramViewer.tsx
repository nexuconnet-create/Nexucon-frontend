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
  const [permittivity, setPermittivity] = useState<number>(6.2);
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

    // Draw Radargram B-Scan frame
    ctx.fillStyle = "#0B1120";
    ctx.fillRect(0, 0, width, height);

    // The recorded depth range drives the vertical scale — never invented.
    const maxDepthM = scan.depth_range_m && scan.depth_range_m > 0
      ? scan.depth_range_m
      : Math.max(0.5, ...scan.anomalies.map(a => a.depth_m ?? 0));

    // Time-depth scale lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let y = 30; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      const depthMm = Math.round((y / height) * maxDepthM * 1000);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "10px monospace";
      ctx.fillText(`${depthMm}mm`, 5, y + 3);
    }

    // Distance scale lines (x-axis) — grid spacing recorded on the survey.
    if (scan.grid_spacing_m && scan.grid_spacing_m > 0) {
      for (let x = 60; x < width; x += 60) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        const distM = ((x / width) * (scan.grid_spacing_m * 10)).toFixed(1);
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "10px monospace";
        ctx.fillText(`${distM}m`, x - 10, height - 5);
      }
    }

    if (scan.anomalies.length === 0) {
      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("No subsurface anomalies recorded on this survey yet.", width / 2, height / 2 - 10);
      ctx.font = "11px monospace";
      ctx.fillText("Recorded anomalies (voids, rebar, delamination…) plot here with their measured depths.", width / 2, height / 2 + 12);
      ctx.textAlign = "left";
      return;
    }

    // Plot the REAL recorded anomalies — position comes from each anomaly's
    // recorded depth (y) and grid coordinates (x) when present; the marker is
    // colour-coded by severity and labelled with the anomaly type.
    const SEVERITY_COLORS: Record<string, string> = {
      critical: "#f43f5e",
      high: "#fb923c",
      medium: "#fde047",
      low: "#38bdf8",
    };
    scan.anomalies.forEach((a, i) => {
      const depthM = a.depth_m ?? 0;
      const y = 40 + (Math.min(depthM, maxDepthM) / maxDepthM) * (height - 80);
      const coords = a.coordinates;
      const x = coords?.x != null
        ? 60 + (Number(coords.x) % 1) * (width - 120)
        : 70 + (i * ((width - 140) / Math.max(1, scan.anomalies.length - 1 || 1)));
      const color = SEVERITY_COLORS[a.severity] ?? "#38bdf8";

      // Hyperbola reflection marker at the recorded depth
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x - 30, y + 18);
      ctx.quadraticCurveTo(x, y - 10, x + 30, y + 18);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = `${color}26`;
      ctx.fill();

      // Apex marker
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Label: type @ depth (confidence when recorded)
      ctx.fillStyle = color;
      ctx.font = "bold 10px monospace";
      ctx.fillText(
        `${a.anomaly_type_display || a.anomaly_type} @ ${(depthM).toFixed(2)}m${a.confidence != null ? ` (${Math.round(a.confidence * 100)}%)` : ''}`,
        Math.min(x - 20, width - 200), y - 14,
      );
      ctx.restore();
    });
  }, [scan]);

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
              <h3 className="font-bold text-sm text-slate-100">{scan.survey_reference}</h3>
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                {scan.antenna_frequency_mhz ? `${scan.antenna_frequency_mhz} MHz` : 'ANTENNA NOT RECORDED'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{scan.project_name} • {scan.survey_area || 'Survey area not recorded'}</p>
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

          {/* Quick Stats Bar — real recorded values only */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Recorded Anomalies</span>
              <span className="text-sm font-bold text-cyan-400 font-mono">{scan.anomaly_count}</span>
              <span className="text-[10px] text-slate-400 block">{scan.anomaly_count === 0 ? 'None recorded' : 'Plotted on B-Scan'}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Rebar Cover (detected)</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {scan.anomalies.filter(a => a.anomaly_type === 'rebar' && a.rebar_cover_mm != null).length > 0
                  ? `${Math.min(...scan.anomalies.filter(a => a.anomaly_type === 'rebar' && a.rebar_cover_mm != null).map(a => a.rebar_cover_mm!))} mm (min)`
                  : '—'}
              </span>
              <span className="text-[10px] text-slate-400 block">From rebar anomaly records</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Survey Status</span>
              <span className="text-sm font-bold text-cyan-400 uppercase font-mono">{scan.status_display || scan.status}</span>
              <span className="text-[10px] text-slate-400 block">{scan.anomaly_count > 0 ? 'Review anomalies before clearance' : 'No anomalies recorded'}</span>
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

            {scan.raw_file_urls.length > 0 && (
              <button
                onClick={() => window.open(scan.raw_file_urls[0], '_blank')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Download Raw Data Package ({scan.raw_file_urls.length})</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
