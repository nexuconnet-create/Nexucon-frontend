"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
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
  Compass,
  X
} from "lucide-react";
import {
  PunditTest,
  downloadNdtReport,
  formatVelocityMs,
  BUILTIN_CURVE_SNAPSHOT,
  evalCurveSnapshot,
  getActiveCurve,
  CurveSnapshot,
} from "@/services/digitalEye";

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
  const [transducerFreq, setTransducerFreq] = useState<number>(test.transducer_frequency_khz || 0);
  const [appliedGain, setAppliedGain] = useState<number>(20);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Ultrasonic Physics States (Path Length L is Constant; Transit Time t is Variable)
  const [pathLengthMm, setPathLengthMm] = useState<number>(test.path_length_mm || 0);
  const [transitTimeUs, setTransitTimeUs] = useState<number>(test.transit_time_us || 0);
  const [isAutomatedPicking, setIsAutomatedPicking] = useState<boolean>(true);
  const [transducerMode, setTransducerMode] = useState<'DIRECT' | 'SEMI_DIRECT' | 'INDIRECT' | ''>(
    test.transducer_type || ''
  );

  // The useState initialisers above only run on FIRST mount. When the parent
  // hands us a different test (e.g. the user clicks another registry row), the
  // prop changes but this state would keep holding the previous station's
  // values — so the canvas kept drawing the old oscillogram. Re-sync whenever
  // the selected test's identity changes.
  useEffect(() => {
    setTransducerFreq(test.transducer_frequency_khz || 0);
    setPathLengthMm(test.path_length_mm || 0);
    setTransitTimeUs(test.transit_time_us || 0);
    setTransducerMode(test.transducer_type || '');
    setIsAutomatedPicking(true);
    setAppliedGain(20);
  }, [test.id]);

  // Dynamic Physics Calculation: Velocity V = Path Length (L) / Transit Time (t)
  const computedVelocity = transitTimeUs > 0 ? Math.round(pathLengthMm / (transitTimeUs / 1000)) : 0; // in m/s

  // Active Nexucon Link calibration curve for this station's project — the
  // same curve the server applied to the stored strengths. Falls back to the
  // built-in BS 1881-203 laboratory curve (fcu = 8.961·V − 7.97, valid
  // 2.0–5.0 km/s only, never extrapolated) until it resolves.
  const [activeCurve, setActiveCurve] = useState<CurveSnapshot>(BUILTIN_CURVE_SNAPSHOT);

  useEffect(() => {
    let cancelled = false;
    if (!test.project) {
      setActiveCurve(BUILTIN_CURVE_SNAPSHOT);
      return;
    }
    getActiveCurve(test.project)
      .then((info) => { if (!cancelled) setActiveCurve(info?.curve_snapshot ?? BUILTIN_CURVE_SNAPSHOT); })
      .catch(() => { if (!cancelled) setActiveCurve(BUILTIN_CURVE_SNAPSHOT); });
    return () => { cancelled = true; };
  }, [test.project]);

  const computedFcuRaw = evalCurveSnapshot(activeCurve, computedVelocity, test.rebound_number ?? null);
  const computedFcu = computedFcuRaw != null ? Number(computedFcuRaw.toFixed(1)) : null;

  // Dynamic Modulus of Elasticity Ed (GPa) assuming density = 2400 kg/m3, Poisson's ratio = 0.2
  const computedEdGpa = computedVelocity > 0
    ? Number(((2400 * Math.pow(computedVelocity, 2) * (1 + 0.2) * (1 - 2 * 0.2) / (1 - 0.2)) / 1e9).toFixed(1))
    : 0;

  // Dynamic Concrete Quality Classification
  const getDynamicQuality = (velocity: number) => {
    if (velocity <= 0) return { rating: "NOT ASSESSED", badge: "bg-slate-500/20 text-slate-300 border-slate-500/30", color: "#94a3b8" };
    if (velocity >= 4500) return { rating: "EXCELLENT", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", color: "#34d399" };
    if (velocity >= 3500) return { rating: "GOOD", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30", color: "#60a5fa" };
    if (velocity >= 3000) return { rating: "DOUBTFUL", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30", color: "#fbbf24" };
    return { rating: "POOR", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30", color: "#f87171" };
  };

  const quality = getDynamicQuality(computedVelocity);

  // Multi-point (A/B/C…) readings — 8 Sep meeting: show every point's
  // waveform SIMULTANEOUSLY (compressed), not one at a time.
  const multiReadings = (test.readings || []).filter(
    (r) => r.transit_time_us != null && r.transit_time_us > 0
  );
  const [isOverlayMode, setIsOverlayMode] = useState<boolean>(false);

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

    // Raw A-scan samples exported by the field device, when available. When
    // the device only reported a transit time we do NOT synthesise a
    // waveform — the scope shows the grid, the recorded t₀ marker and an
    // explicit "no raw waveform recorded" notice instead.
    const samples = test.waveform_samples;

    if (samples && samples.length > 1) {
      // Real recorded waveform: normalise to the canvas and scale by the
      // operator's amplifier gain.
      const maxAbs = Math.max(...samples.map((s) => Math.abs(s)), 1e-9);
      const scale = ((height / 2 - 18) * (appliedGain / 40)) / maxAbs;
      ctx.beginPath();
      ctx.strokeStyle = quality.color;
      ctx.lineWidth = 2.5;
      samples.forEach((s, i) => {
        const x = (i / (samples.length - 1)) * width;
        const y = height / 2 - s * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // First arrival marker (t0 Arrival Marker)
    ctx.strokeStyle = isAutomatedPicking ? "#38BDF8" : "#fbbf24";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(t0_pixel, 15);
    ctx.lineTo(t0_pixel, height - 15);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrival Label & Picker Indicator
    ctx.fillStyle = isAutomatedPicking ? "#38BDF8" : "#fbbf24";
    ctx.font = "bold 11px monospace";
    ctx.fillText(
      `${isAutomatedPicking ? '⏱ Recorded t₀ (device-reported)' : '👆 Manual Pick'}: ${transitTimeUs.toFixed(1)} µs`,
      Math.min(width - 180, t0_pixel + 8),
      35
    );

    // Honest disclosure: raw samples are only drawn when the device exported
    // them; otherwise the scope shows the recorded t₀ marker and nothing else.
    ctx.fillStyle = samples && samples.length > 1
      ? "rgba(52, 211, 153, 0.8)"
      : "rgba(251, 191, 36, 0.75)";
    ctx.font = "9px monospace";
    ctx.fillText(
      samples && samples.length > 1
        ? `RECORDED WAVEFORM — ${samples.length} device samples`
        : 'NO RAW WAVEFORM RECORDED — t₀ marker shown from recorded transit time',
      12,
      16
    );

    // Path Length & Physics Annotation
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "10px monospace";
    ctx.fillText(`L = ${pathLengthMm} mm | V = ${formatVelocityMs(computedVelocity)} m/s`, 12, height - 14);

  }, [appliedGain, pathLengthMm, transitTimeUs, isAutomatedPicking, quality, test.waveform_samples]);

  const handleResetAutomated = () => {
    setIsAutomatedPicking(true);
    setTransitTimeUs(test.transit_time_us || 0);
    setPathLengthMm(test.path_length_mm || 0);
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
          {/* E5: in full-screen mode the station list is hidden behind the
              overlay — give the operator an explicit way back to it. */}
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={12} />
              <span>Back to Waveform Stations</span>
            </button>
          )}
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

          {/* Close the oscillogram and return to the station list */}
          {onClose && (
            <button
              onClick={onClose}
              title="Close oscillogram"
              className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl border border-rose-500/30 cursor-pointer flex items-center gap-1.5"
            >
              <X size={14} />
              <span className="text-xs font-semibold">Cancel</span>
            </button>
          )}
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
            Velocity: <span className="text-amber-400 font-bold text-sm">{formatVelocityMs(computedVelocity)} m/s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Threshold (25 MPa):</span>
            {computedFcu == null ? (
              <span className="bg-slate-500/20 text-slate-300 border border-slate-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1 text-[11px]">
                <Info size={12} className="text-slate-400" />
                <span>{computedVelocity > 0 ? 'OUTSIDE CALIBRATION RANGE' : 'NOT RECORDED'}</span>
              </span>
            ) : computedFcu >= 25 ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>{computedFcu} MPa (PASS ≥ 25)</span>
              </span>
            ) : (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1 text-[11px] animate-pulse">
                <AlertTriangle size={12} className="text-rose-400" />
                <span>{computedFcu} MPa (DEFICIENT &lt; 25)</span>
              </span>
            )}
          </div>
          <div className="text-slate-300 hidden sm:block" title="Ed = ρV²(1+ν)(1−2ν)/(1−ν) using the measured pulse velocity and an assumed concrete density ρ = 2400 kg/m³, ν = 0.2 (density is not recorded per test).">
            Modulus (Ed): <span className="text-sky-400 font-bold text-sm">{computedEdGpa} GPa</span>
            <span className="text-slate-500 text-[10px]"> (assumed ρ = 2400 kg/m³)</span>
          </div>
        </div>
      </div>

      {/* Main Waveform Canvas & Diagnostics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4">
        
        {/* Oscilloscope Canvas (Cols 1-3) */}
        <div className="lg:col-span-3 p-4 bg-slate-950 flex flex-col justify-between">
          {/* Simultaneous A/B/C waveforms (8 Sep meeting): every test point
              rendered at once, compressed — the interactive single-trace
              scope below still handles the forensic manual-pick workflow. */}
          {multiReadings.length > 1 && (
            <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Layers size={13} className="text-amber-400" />
                  <span>
                    Simultaneous Waveforms — {multiReadings.length} Test Points (A–
                    {String.fromCharCode(64 + multiReadings.length)})
                  </span>
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Element mean V: {formatVelocityMs(test.pulse_velocity_ms)} m/s
                  </span>
                  <button
                    onClick={() => setIsOverlayMode((v) => !v)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Layers size={11} />
                    <span>{isOverlayMode ? "Separate traces" : "Overlay on one axis"}</span>
                  </button>
                </div>
              </div>

              {isOverlayMode ? (
                <OverlayTraceCanvas
                  readings={multiReadings}
                  fallbackPathMm={test.path_length_mm}
                  gain={appliedGain}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {multiReadings.map((r, i) => (
                    <ReadingTrace
                      key={r.id || i}
                      index={i}
                      label={r.point_label || String.fromCharCode(65 + i)}
                      transitTimeUs={r.transit_time_us as number}
                      pathLengthMm={r.path_length_mm ?? test.path_length_mm}
                      gain={appliedGain}
                      velocityKmS={r.velocity_km_s}
                      ecsMpa={r.ecs_mpa}
                    />
                  ))}
                </div>
              )}
              <p className="mt-2 text-[10px] text-slate-500 font-mono">
                t₀ markers rendered from each point&apos;s recorded transit time — per-point V and f_cu as
                computed server-side through the active calibration curve.
              </p>
            </div>
          )}

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
                <span className="text-amber-400 font-bold">{formatVelocityMs(computedVelocity)} m/s</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Est. Compressive (fcu):</span>
                <span className={`font-bold ${computedFcu == null ? 'text-slate-400' : computedFcu >= 25 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {computedFcu != null ? `${computedFcu} MPa ${computedFcu >= 25 ? '(≥25 MPa ✓)' : '(<25 MPa ✗)'}` : '— (outside 2.0–5.0 km/s)'}
                </span>
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
                  {isAutomatedPicking ? 'Device-Reported t₀' : 'Manual Cursor (local)'}
                </span>
              </div>
            </div>
          </div>

          {/* Standards Benchmark Scale */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <span>BS 1881-203 / ASTM C597 Velocity Classification Scale</span>
              <span>Observed Velocity: {formatVelocityMs(computedVelocity)} m/s</span>
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
                  ? "Showing the transit time recorded by the field device."
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
                {![25, 54, 150, 250].includes(transducerFreq) && (
                  <option value={transducerFreq}>Not recorded</option>
                )}
                <option value={25}>25 kHz (Mass Concrete / Long Acoustic Paths / Foundations)</option>
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
                <span className="font-bold text-slate-200">{transducerMode ? (transducerMode === 'DIRECT' ? 'DIRECT (Face-to-Face)' : transducerMode) : 'NOT RECORDED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Zero-Offset Calibration:</span>
                <span className="font-mono text-slate-400">Not recorded</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coupling Medium:</span>
                <span className="text-slate-400">Not recorded</span>
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
              onClick={() => {
                if (!test.project) {
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '⚠️ No project linked to this test — cannot generate the official NDT report.', type: "error" } }));
                  return;
                }
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Generating official BS 1881-203 NDT report PDF…', type: "info" } }));
                downloadNdtReport(test.project)
                  .then((filename) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Downloaded ${filename} (includes ${test.test_reference}).`, type: "success" } })))
                  .catch((err: any) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `⚠️ ${err?.response?.data?.detail || err?.message || 'Report generation failed.'}`, type: "error" } })));
              }}
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

// Trace colour per test point (A, B, C, D, E…).
const TRACE_COLORS = ["#38BDF8", "#FBBF24", "#34D399", "#F472B6", "#A78BFA"];

/** Draw one compressed scope (grid + baseline + recorded t₀ marker; the
 *  device's raw samples when they were exported) into a canvas of the given
 *  size. No trace is synthesised when no samples exist — the arrival marker
 *  alone is drawn. */
function drawTrace(
  ctx: CanvasRenderingContext2D,
  opts: {
    width: number;
    height: number;
    transitTimeUs: number;
    gain: number;
    color: string;
    t0MarkerColor: string;
    samples?: number[] | null;
  }
) {
  const { width, height, transitTimeUs, gain, color, t0MarkerColor, samples } = opts;
  ctx.fillStyle = "#090D16";
  ctx.fillRect(0, 0, width, height);

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
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  const t0_pixel = Math.min(width - 60, Math.max(60, Math.round((transitTimeUs / 150) * width)));

  // Raw device samples, when exported — normalised and gain-scaled. Readings
  // without a waveform export render the t₀ marker only (no fake trace).
  if (samples && samples.length > 1) {
    const maxAbs = Math.max(...samples.map((s) => Math.abs(s)), 1e-9);
    const scale = ((height / 2 - 10) * (gain / 40)) / maxAbs;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    samples.forEach((s, i) => {
      const x = (i / (samples.length - 1)) * width;
      const y = height / 2 - s * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  ctx.strokeStyle = t0MarkerColor;
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(t0_pixel, 10);
  ctx.lineTo(t0_pixel, height - 10);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** One compressed per-point trace (A/B/C…) with its recorded transit time,
 *  server-computed velocity and f_cu. */
function ReadingTrace({
  index,
  label,
  transitTimeUs,
  pathLengthMm,
  gain,
  velocityKmS,
  ecsMpa,
}: {
  index: number;
  label: string;
  transitTimeUs: number;
  pathLengthMm: number;
  gain: number;
  velocityKmS: number | null;
  ecsMpa: number | null;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const color = TRACE_COLORS[index % TRACE_COLORS.length];
    drawTrace(ctx, {
      width: canvas.width,
      height: canvas.height,
      transitTimeUs,
      gain,
      color,
      t0MarkerColor: "#38BDF8",
    });
    ctx.fillStyle = color;
    ctx.font = "bold 11px monospace";
    ctx.fillText(`POINT ${label}`, 10, 16);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "10px monospace";
    ctx.fillText(
      `t₀ = ${transitTimeUs.toFixed(1)} µs · L = ${pathLengthMm} mm`,
      10,
      canvas.height - 10
    );
    ctx.fillStyle = "rgba(251, 191, 36, 0.75)";
    ctx.font = "9px monospace";
    ctx.fillText("t₀ marker from recorded transit time", canvas.width - 218, 16);
  }, [index, label, transitTimeUs, pathLengthMm, gain]);

  const velocityMs = velocityKmS != null ? velocityKmS * 1000 : null;

  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-950">
      <div className="px-2.5 py-1.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] font-mono">
        <span className="font-bold" style={{ color: TRACE_COLORS[index % TRACE_COLORS.length] }}>
          POINT {label}
        </span>
        <span className="text-slate-400">t₀ {transitTimeUs.toFixed(1)} µs</span>
        <span className="text-amber-300 font-bold">
          {velocityMs != null ? `${formatVelocityMs(velocityMs)} m/s` : "—"}
        </span>
        <span className={ecsMpa != null ? (ecsMpa >= 25 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold") : "text-slate-500"}>
          {ecsMpa != null ? `f_cu ${ecsMpa.toFixed(2)} MPa` : "f_cu —"}
        </span>
      </div>
      <canvas ref={ref} width={800} height={120} className="w-full h-[110px] block" />
    </div>
  );
}

/** All A/B/C traces overlaid on one shared time axis — the direct visual
 *  comparison view (arrival-time offsets between points). */
function OverlayTraceCanvas({
  readings,
  fallbackPathMm,
  gain,
}: {
  readings: Array<{
    id?: string;
    point_label: string;
    transit_time_us: number | null;
    path_length_mm: number | null;
    velocity_km_s: number | null;
  }>;
  fallbackPathMm: number;
  gain: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#090D16";
    ctx.fillRect(0, 0, width, height);
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
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    readings.forEach((r, i) => {
      if (r.transit_time_us == null) return;
      const color = TRACE_COLORS[i % TRACE_COLORS.length];
      drawTrace(ctx, {
        width,
        height,
        transitTimeUs: r.transit_time_us,
        gain: gain * 0.55, // compressed so overlaid traces stay readable
        color,
        t0MarkerColor: color,
      });
    });

    ctx.fillStyle = "rgba(251, 191, 36, 0.75)";
    ctx.font = "9px monospace";
    ctx.fillText("t₀ markers from recorded transit times; no raw waveforms stored", 12, 16);
  }, [readings, gain]);

  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-950">
      <canvas ref={ref} width={800} height={280} className="w-full h-[260px] block" />
      <div className="px-2.5 py-1.5 bg-slate-900 border-t border-slate-800 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono">
        {readings.map((r, i) => {
          const vMs = r.velocity_km_s != null ? r.velocity_km_s * 1000 : null;
          return (
            <span key={r.id || i} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: TRACE_COLORS[i % TRACE_COLORS.length] }}
              />
              <span className="text-slate-300 font-bold">
                {r.point_label || String.fromCharCode(65 + i)}
              </span>
              <span className="text-slate-400">
                t₀ {(r.transit_time_us ?? 0).toFixed(1)} µs
              </span>
              <span className="text-amber-300">{vMs != null ? `${formatVelocityMs(vMs)} m/s` : "—"}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
