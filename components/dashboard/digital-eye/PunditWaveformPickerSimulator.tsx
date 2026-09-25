"use client";

import React, { useState, useMemo } from "react";
import { 
  Zap, 
  Activity, 
  Sliders, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Radio, 
  Cpu, 
  Sparkles 
} from "lucide-react";
import { formatVelocityMs } from "@/services/digitalEye";

interface PunditWaveformPickerSimulatorProps {
  initialTransitTime?: number;
  initialPathLength?: number;
  onCommitPick?: (pick: { transitTimeUs: number; pathLengthMm: number; velocityMs: number; fcuMpa: number }) => void;
  className?: string;
}

export default function PunditWaveformPickerSimulator({
  initialTransitTime = 94.2,
  initialPathLength = 400,
  onCommitPick,
  className = "",
}: PunditWaveformPickerSimulatorProps) {
  const [transitTimeUs, setTransitTimeUs] = useState<number>(initialTransitTime);
  const [pathLengthMm, setPathLengthMm] = useState<number>(initialPathLength);
  const [transducerFreq, setTransducerFreq] = useState<number>(54); // 54 kHz standard
  const [noiseLevel, setNoiseLevel] = useState<number>(12); // % noise
  const [committed, setCommitted] = useState<boolean>(false);

  // Compute velocity V = L / t (m/s)
  // L in mm, t in us: (L * 1000) / t = (400 * 1000) / 94.2 ≈ 4246.3 m/s
  const velocityMs = useMemo(() => {
    if (transitTimeUs <= 0) return 0;
    return Math.round((pathLengthMm * 1000) / transitTimeUs);
  }, [pathLengthMm, transitTimeUs]);

  // Compute fcu MPa via standard exponential calibration curve: fcu = 0.015 * exp(0.0018 * V)
  const fcuMpa = useMemo(() => {
    if (velocityMs < 2000) return 0;
    const est = 0.015 * Math.exp(0.0018 * velocityMs);
    return Number(est.toFixed(1));
  }, [velocityMs]);

  // Quality rating
  const quality = useMemo(() => {
    if (velocityMs >= 4500) return { label: "EXCELLENT", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    if (velocityMs >= 3500) return { label: "GOOD", badge: "bg-blue-100 text-blue-800 border-blue-300" };
    if (velocityMs >= 3000) return { label: "DOUBTFUL", badge: "bg-amber-100 text-amber-800 border-amber-300" };
    return { label: "POOR", badge: "bg-rose-100 text-rose-800 border-rose-300" };
  }, [velocityMs]);

  // Generate synthetic waveform path matching transit time
  const waveformPath = useMemo(() => {
    const points: string[] = [];
    const width = 600;
    const height = 140;
    const midY = height / 2;
    const totalDurationUs = 160;

    // First-break x coordinate
    const pickX = (transitTimeUs / totalDurationUs) * width;

    for (let x = 0; x <= width; x += 3) {
      let y = midY;
      if (x < pickX) {
        // Pre-arrival baseline with subtle ambient acoustic noise
        const noise = (Math.sin(x * 0.4) + Math.cos(x * 0.7)) * (noiseLevel * 0.15);
        y = midY + noise;
      } else {
        // Post-arrival damped ultrasonic packet wave
        const dx = x - pickX;
        const decay = Math.exp(-dx / 70);
        const wave = Math.sin(dx * 0.18) * 55 * decay;
        const noise = (Math.sin(x * 0.5)) * (noiseLevel * 0.1);
        y = midY - wave + noise;
      }
      points.push(`${x},${y.toFixed(1)}`);
    }

    return points.join(" ");
  }, [transitTimeUs, noiseLevel]);

  const pickPositionPct = Math.min(100, Math.max(0, (transitTimeUs / 160) * 100));

  const handleCommit = () => {
    onCommitPick?.({
      transitTimeUs,
      pathLengthMm,
      velocityMs,
      fcuMpa,
    });
    setCommitted(true);
    setTimeout(() => setCommitted(false), 3000);
  };

  const handleReset = () => {
    setTransitTimeUs(initialTransitTime);
    setPathLengthMm(initialPathLength);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
              <Zap size={16} />
            </span>
            <h3 className="font-black text-slate-900 text-base tracking-tight">
              Acoustic Waveform First-Break Peak &amp; Transit-Time Picker
            </h3>
            <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
              Interactive Simulator
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate or fine-tune acoustic arrival points ($t_0$). Drag the arrival threshold to inspect resulting velocity $V = L / t$ and calibrated compressive strength.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleCommit}
            className="px-3.5 py-1.5 bg-[#022C4F] hover:bg-[#03467B] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <CheckCircle2 size={13} />
            <span>{committed ? "Pick Staged!" : "Stage Calibration Pick"}</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Oscilloscope Waveform Display */}
        <div className="bg-[#090D16] p-4 sm:p-5 rounded-2xl border border-slate-800 relative overflow-hidden shadow-inner">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-2 text-cyan-400 font-bold">
              <Activity size={14} className="animate-pulse" />
              <span>A-SCAN TRANSIENT ACOUSTIC TRACE ({transducerFreq} kHz)</span>
            </span>
            <span>Window: 0.0 – 160.0 µs</span>
          </div>

          {/* SVG Waveform Trace */}
          <div className="relative h-36 w-full bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:30px_20px]" />

            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 600 140"
              preserveAspectRatio="none"
            >
              {/* Baseline center line */}
              <line x1="0" y1="70" x2="600" y2="70" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

              {/* Dynamic waveform polyline */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={waveformPath}
              />
            </svg>

            {/* Draggable/Interactive First-Break Arrival Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] z-10 transition-all duration-75"
              style={{ left: `${pickPositionPct}%` }}
            >
              <div className="absolute -top-1 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-1.5 py-0.5 rounded shadow-sm">
                t₀: {transitTimeUs.toFixed(1)} µs
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
            <span>0 µs</span>
            <span className="text-amber-400 font-bold">Pick Point: {transitTimeUs.toFixed(1)} µs</span>
            <span>160 µs</span>
          </div>
        </div>

        {/* Interactive Sliders & Live Physics Computation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Sliders Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1 font-semibold">
                <span className="text-slate-700">Transit Time (t):</span>
                <span className="font-mono font-black text-amber-700">{transitTimeUs.toFixed(1)} µs</span>
              </div>
              <input
                type="range"
                min={50.0}
                max={150.0}
                step={0.2}
                value={transitTimeUs}
                onChange={(e) => setTransitTimeUs(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 font-semibold">
                <span className="text-slate-700">Acoustic Path Length (L):</span>
                <span className="font-mono font-black text-blue-700">{pathLengthMm} mm</span>
              </div>
              <input
                type="range"
                min={100}
                max={800}
                step={10}
                value={pathLengthMm}
                onChange={(e) => setPathLengthMm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              <span>Transducer Frequency:</span>
              <div className="flex gap-1.5 font-mono">
                {[24, 54, 150].map((khz) => (
                  <button
                    key={khz}
                    type="button"
                    onClick={() => setTransducerFreq(khz)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      transducerFreq === khz
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {khz} kHz
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Computed Physics Telemetry Card */}
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Computed Velocity V = L / t</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${quality.badge}`}>
                {quality.label}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-cyan-400">
                  {formatVelocityMs(velocityMs)}
                </span>
                <span className="text-xs text-slate-400 ml-1.5">m/s</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-amber-300">
                  {fcuMpa > 0 ? `${fcuMpa} MPa` : "—"}
                </span>
                <span className="text-[10px] text-slate-400 block">Est. Comp. Strength</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1 border-t border-slate-800/80">
              Formula: V = ({pathLengthMm} mm × 1000) / {transitTimeUs.toFixed(1)} µs = {formatVelocityMs(velocityMs)} m/s.
              {velocityMs >= 3500
                ? " Meets British Standard BS 1881-203 homogeneous density threshold."
                : " Falls within doubtful/void range; warrants secondary core test."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
