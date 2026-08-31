"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Box, 
  Share2,
  ShieldAlert,
  Activity
} from "lucide-react";
import { PunditTest } from "@/services/digitalEye";

interface PunditWaveformViewerProps {
  test: PunditTest;
  onClose?: () => void;
  onLinkToBIM?: () => void;
  onEscalateNCR?: () => void;
}

export default function PunditWaveformViewer({
  test,
  onClose,
  onLinkToBIM,
  onEscalateNCR
}: PunditWaveformViewerProps) {
  const [transducerFreq, setTransducerFreq] = useState<number>(test.transducer_frequency_khz || 54);
  const [appliedGain, setAppliedGain] = useState<number>(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(0, 0, width, height);

    // Oscilloscope Grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Baseline zero-axis
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw Acoustic Time-Series Waveform (Oscillogram)
    ctx.beginPath();
    ctx.strokeStyle = test.concrete_quality_rating === "EXCELLENT" || test.concrete_quality_rating === "GOOD" ? "#34d399" : "#f87171";
    ctx.lineWidth = 2.5;

    const t0_pixel = 140; // t0 Arrival point

    for (let x = 0; x < width; x++) {
      let y = height / 2;
      if (x < t0_pixel) {
        // Flat baseline noise before acoustic P-wave arrival
        y += (Math.random() - 0.5) * 3;
      } else {
        // High frequency decaying acoustic sine packet
        const t = (x - t0_pixel) * 0.1;
        const decay = Math.exp(-t * 0.05);
        const amp = (appliedGain * 4.5) * decay;
        y += Math.sin(t * (transducerFreq / 18)) * amp;
      }

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // First arrival marker (t0)
    ctx.strokeStyle = "#fbbf24";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(t0_pixel, 20);
    ctx.lineTo(t0_pixel, height - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Marker label
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`t0 Arrival: ${test.transit_time_us} µs`, t0_pixel + 8, 35);

  }, [transducerFreq, appliedGain, test]);

  // Quality rating pill color
  const getQualityBadge = (rating: string) => {
    switch (rating) {
      case "EXCELLENT": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "GOOD": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "DOUBTFUL": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default: return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    }
  };

  return (
    <div className={`w-full bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 p-4 flex flex-col' : ''}`}>
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-100">{test.test_reference}</h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getQualityBadge(test.concrete_quality_rating)}`}>
                {test.concrete_quality_rating} QUALITY (BS 1881-203)
              </span>
            </div>
            <p className="text-xs text-slate-400">{test.project_name} • {test.test_location}</p>
          </div>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Main Waveform Canvas & Diagnostics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4">
        
        {/* Oscilloscope Canvas (Cols 1-3) */}
        <div className="lg:col-span-3 p-4 bg-slate-950 flex flex-col justify-between">
          <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-slate-800">
            <canvas
              ref={canvasRef}
              width={800}
              height={360}
              className="w-full h-full object-cover"
            />

            {/* In-Canvas Calculations Badge */}
            <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Pulse Velocity (V):</span>
                <span className="text-amber-400 font-bold">{test.pulse_velocity_ms.toLocaleString()} m/s</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Est. Compressive (fcu):</span>
                <span className="text-emerald-400 font-bold">{test.estimated_compressive_strength_mpa} MPa</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Transit Time:</span>
                <span className="text-slate-200">{test.transit_time_us} µs</span>
              </div>
            </div>
          </div>

          {/* Standards Benchmark Scale */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <span>BS 1881-203 Velocity Scale</span>
              <span>Observed: {test.pulse_velocity_ms} m/s</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
              <div className={`p-1.5 rounded ${test.pulse_velocity_ms < 3000 ? "bg-rose-500 text-white font-bold" : "bg-slate-800 text-slate-400"}`}>
                &lt;3000 m/s (Poor)
              </div>
              <div className={`p-1.5 rounded ${test.pulse_velocity_ms >= 3000 && test.pulse_velocity_ms < 3500 ? "bg-amber-500 text-white font-bold" : "bg-slate-800 text-slate-400"}`}>
                3000-3500 (Doubtful)
              </div>
              <div className={`p-1.5 rounded ${test.pulse_velocity_ms >= 3500 && test.pulse_velocity_ms < 4500 ? "bg-blue-500 text-white font-bold" : "bg-slate-800 text-slate-400"}`}>
                3500-4500 (Good)
              </div>
              <div className={`p-1.5 rounded ${test.pulse_velocity_ms >= 4500 ? "bg-emerald-500 text-white font-bold" : "bg-slate-800 text-slate-400"}`}>
                &gt;4500 (Excellent)
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Parameters & Actions (Col 4) */}
        <div className="lg:col-span-1 p-5 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Acoustic Transducer Settings
            </h4>

            {/* Frequency Selection */}
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">Transducer Frequency</label>
              <select
                value={transducerFreq}
                onChange={(e) => setTransducerFreq(Number(e.target.value))}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none"
              >
                <option value={54}>54 kHz (Standard Structural Concrete)</option>
                <option value={150}>150 kHz (High Precision Mortar / Core)</option>
                <option value={250}>250 kHz (Micro-Crack Depth Measurement)</option>
              </select>
            </div>

            {/* Gain Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Amplifier Gain</span>
                <span className="font-mono text-amber-400 font-bold">{appliedGain} dB</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={appliedGain}
                onChange={(e) => setAppliedGain(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Transmission Mode:</span>
                <span className="font-bold text-slate-200">{test.transducer_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Acoustic Path:</span>
                <span className="font-mono text-slate-200">{test.path_length_mm} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Calibration Factor:</span>
                <span className="font-mono text-emerald-400">1.002 (Calibrated)</span>
              </div>
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
                <span>Link UPV to BIM Element</span>
              </button>
            )}

            {test.concrete_quality_rating === "DOUBTFUL" || test.concrete_quality_rating === "POOR" ? (
              onEscalateNCR && (
                <button
                  onClick={onEscalateNCR}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldAlert size={14} />
                  <span>Issue Low Strength NCR</span>
                </button>
              )
            ) : null}

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Exported NDT Test Certificate for ${test.test_reference}`, type: "success" } }))}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Export Test Certificate</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
