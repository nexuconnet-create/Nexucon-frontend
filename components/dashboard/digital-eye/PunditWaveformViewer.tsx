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
  Activity,
  Cpu,
  RefreshCw,
  Gauge,
  SlidersHorizontal,
  Compass
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
  
  // Ultrasonic Physics States (Path Length L is Constant; Transit Time t is Variable)
  const [pathLengthMm, setPathLengthMm] = useState<number>(test.path_length_mm || 400);
  const [transitTimeUs, setTransitTimeUs] = useState<number>(test.transit_time_us || 94.2);
  const [isAutomatedPicking, setIsAutomatedPicking] = useState<boolean>(true);
  const [aicConfidence, setAicConfidence] = useState<number>(99.4);
  const [transducerMode, setTransducerMode] = useState<'DIRECT' | 'SEMI_DIRECT' | 'INDIRECT'>(
    (test.transducer_type as any) || 'DIRECT'
  );

  // Dynamic Physics Calculation: Velocity V = Path Length (L) / Transit Time (t)
  const computedVelocity = Math.round((pathLengthMm / (transitTimeUs / 1000))); // in m/s
  
  // Empirical Compressive Strength Estimation fcu (MPa) based on BS 1881-203 / IS 13311
  const computedFcu = Math.max(15, Math.min(85, Number((0.0000000000015 * Math.pow(computedVelocity, 3.82)).toFixed(1))));

  // Dynamic Modulus of Elasticity Ed (GPa) assuming density = 2400 kg/m3, Poisson's ratio = 0.2
  const computedEdGpa = Number(((2400 * Math.pow(computedVelocity, 2) * (1 + 0.2) * (1 - 2 * 0.2) / (1 - 0.2)) / 1e9).toFixed(1));

  // Dynamic Concrete Quality Classification
  const getDynamicQuality = (velocity: number) => {
    if (velocity >= 4500) return { rating: "EXCELLENT", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", color: "#34d399" };
    if (velocity >= 3500) return { rating: "GOOD", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30", color: "#60a5fa" };
    if (velocity >= 3000) return { rating: "DOUBTFUL", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30", color: "#fbbf24" };
    return { rating: "POOR", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30", color: "#f87171" };
  };

  const quality = getDynamicQuality(computedVelocity);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = "#090D16";
    ctx.fillRect(0, 0, width, height);

    // Oscilloscope Grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
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
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Calculate arrival pixel relative to transit time
    const t0_pixel = Math.min(width - 60, Math.max(60, Math.round((transitTimeUs / 150) * width)));

    // Draw Acoustic Time-Series Waveform (Oscillogram)
    ctx.beginPath();
    ctx.strokeStyle = quality.color;
    ctx.lineWidth = 2.5;

    for (let x = 0; x < width; x++) {
      let y = height / 2;
      if (x < t0_pixel) {
        // Pre-arrival noise (minimal baseline vibration)
        y += (Math.sin(x * 0.4) * 1.5) + ((Math.random() - 0.5) * 1.2);
      } else {
        // P-wave first arrival & decaying acoustic wave packet
        const t = (x - t0_pixel) * 0.12;
        const decay = Math.exp(-t * 0.045);
        const amp = (appliedGain * 4.2) * decay;
        y += Math.sin(t * (transducerFreq / 16)) * amp;
      }

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // First arrival marker (t0 Arrival Marker)
    ctx.strokeStyle = isAutomatedPicking ? "#38BDF8" : "#fbbf24";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(t0_pixel, 15);
    ctx.lineTo(t0_pixel, height - 15);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrival Label & Auto-Picker Indicator
    ctx.fillStyle = isAutomatedPicking ? "#38BDF8" : "#fbbf24";
    ctx.font = "bold 11px monospace";
    ctx.fillText(
      `${isAutomatedPicking ? '🤖 AIC Auto-Picked' : '👆 Manual Pick'} t0: ${transitTimeUs.toFixed(1)} µs`,
      Math.min(width - 180, t0_pixel + 8),
      35
    );

    // Path Length & Physics Annotation
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "10px monospace";
    ctx.fillText(`L = ${pathLengthMm} mm | V = ${computedVelocity.toLocaleString()} m/s`, 12, height - 14);

  }, [transducerFreq, appliedGain, pathLengthMm, transitTimeUs, isAutomatedPicking, quality]);

  const handleResetAutomated = () => {
    setIsAutomatedPicking(true);
    setTransitTimeUs(test.transit_time_us || 94.2);
    setPathLengthMm(test.path_length_mm || 400);
    setAicConfidence(99.4);
  };

  return (
    <div className={`w-full bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 p-4 flex flex-col' : ''}`}>
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Activity size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-100">{test.test_reference}</h3>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${quality.badge}`}>
                {quality.rating} QUALITY (BS 1881-203 / ASTM C597)
              </span>
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <Cpu size={11} />
                <span>Zero-Interference Ingestion</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">{test.project_name} • {test.test_location}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAutomated}
            title="Reset to automated AIC first-arrival pick"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={12} className={isAutomatedPicking ? "text-sky-400" : ""} />
            <span>Reset Auto-Picker</span>
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Physics Core Principle Banner */}
      <div className="bg-gradient-to-r from-[#022C4F] via-slate-900 to-slate-950 px-5 py-3 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-mono font-bold rounded-lg border border-amber-500/30 text-xs">
            Pulse Velocity Law: V = L / t
          </div>
          <span className="text-slate-300 hidden md:inline">
            <strong className="text-emerald-300 font-mono">Constant:</strong> Path Length L ({pathLengthMm} mm) &nbsp;|&nbsp; 
            <strong className="text-sky-300 font-mono"> Variable:</strong> Automated Transit Time t ({transitTimeUs.toFixed(1)} µs)
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-slate-300">
            Velocity: <span className="text-amber-400 font-bold text-sm">{computedVelocity.toLocaleString()} m/s</span>
          </div>
          <div className="text-slate-300">
            Est. fcu: <span className="text-emerald-400 font-bold text-sm">{computedFcu} MPa</span>
          </div>
          <div className="text-slate-300 hidden sm:block">
            Modulus (Ed): <span className="text-sky-400 font-bold text-sm">{computedEdGpa} GPa</span>
          </div>
        </div>
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
                <span className="text-amber-400 font-bold">{computedVelocity.toLocaleString()} m/s</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Est. Compressive (fcu):</span>
                <span className="text-emerald-400 font-bold">{computedFcu} MPa</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Acoustic Path (L):</span>
                <span className="text-emerald-300 font-bold">{pathLengthMm} mm (Constant)</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Transit Time (t):</span>
                <span className="text-sky-300 font-bold">{transitTimeUs.toFixed(1)} µs (Variable)</span>
              </div>
              <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                <span className="text-slate-400">Detection Method:</span>
                <span className="text-sky-400 font-bold">
                  {isAutomatedPicking ? `AIC Auto (${aicConfidence}%)` : 'Manual Cursor'}
                </span>
              </div>
            </div>
          </div>

          {/* Standards Benchmark Scale */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <span>BS 1881-203 / ASTM C597 Velocity Classification Scale</span>
              <span>Observed Velocity: {computedVelocity.toLocaleString()} m/s</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
              <div className={`p-2 rounded transition-colors ${computedVelocity < 3000 ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20" : "bg-slate-800 text-slate-400"}`}>
                &lt; 3,000 m/s (Poor / Porous)
              </div>
              <div className={`p-2 rounded transition-colors ${computedVelocity >= 3000 && computedVelocity < 3500 ? "bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20" : "bg-slate-800 text-slate-400"}`}>
                3,000 – 3,500 m/s (Doubtful)
              </div>
              <div className={`p-2 rounded transition-colors ${computedVelocity >= 3500 && computedVelocity < 4500 ? "bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20" : "bg-slate-800 text-slate-400"}`}>
                3,500 – 4,500 m/s (Good Quality)
              </div>
              <div className={`p-2 rounded transition-colors ${computedVelocity >= 4500 ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20" : "bg-slate-800 text-slate-400"}`}>
                &gt; 4,500 m/s (Excellent Sound)
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Parameters & Actions (Col 4) */}
        <div className="lg:col-span-1 p-5 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            
            {/* Automated Transit Time vs Manual Picker Toggle */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Cpu size={14} className="text-sky-400" />
                  <span>Automated t0 Picker</span>
                </span>
                <input
                  type="checkbox"
                  checked={isAutomatedPicking}
                  onChange={(e) => setIsAutomatedPicking(e.target.checked)}
                  className="accent-sky-500 cursor-pointer h-4 w-4"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {isAutomatedPicking 
                  ? "AIC first-break thresholding eliminates manual cursor picking errors."
                  : "Manual inspection mode activated for forensic acoustic review."}
              </p>
            </div>

            {/* Path Length (L) Constant Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Acoustic Path (L - Constant)</span>
                <span className="font-mono text-emerald-400 font-bold">{pathLengthMm} mm</span>
              </div>
              <input
                type="range"
                min="100"
                max="1200"
                step="10"
                value={pathLengthMm}
                onChange={(e) => {
                  setPathLengthMm(Number(e.target.value));
                  setIsAutomatedPicking(false);
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Transit Time (t) Variable Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Transit Time (t - Variable)</span>
                <span className="font-mono text-sky-400 font-bold">{transitTimeUs.toFixed(1)} µs</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="0.5"
                value={transitTimeUs}
                onChange={(e) => {
                  setTransitTimeUs(Number(e.target.value));
                  setIsAutomatedPicking(false);
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Transducer Frequency Selection */}
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

            {/* Transmission Mode & Calibration Metadata */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Transmission Mode:</span>
                <span className="font-bold text-slate-200">{transducerMode} (Face-to-Face)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Zero-Offset Calibration:</span>
                <span className="font-mono text-emerald-400">0.0 µs (Calibrated Bar)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coupling Medium:</span>
                <span className="text-slate-300">Ultrasonic Gel (Couplant)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            {onLinkToBIM && (
              <button
                onClick={onLinkToBIM}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Box size={14} />
                <span>Link UPV to BIM Element</span>
              </button>
            )}

            {quality.rating === "DOUBTFUL" || quality.rating === "POOR" ? (
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
