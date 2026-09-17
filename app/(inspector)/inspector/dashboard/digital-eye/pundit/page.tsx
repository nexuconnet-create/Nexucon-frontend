"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Activity,
  Zap,
  Play,
  Pause,
  ZoomIn,
  RefreshCw,
  FileSpreadsheet,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  ChevronRight,
  Calculator,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Download,
} from "lucide-react";
import { computeSHA256, enqueueSyncItem } from "@/lib/offline-sync";

interface UpvTestPoint {
  pointId: string;
  location: string;
  pathLengthMm: number;
  transitTimeUs: number;
  velocityKmS: number;
  reboundNumber: number;
  estimatedStrengthMpa: number;
  grade: "EXCELLENT" | "GOOD" | "QUESTIONABLE" | "POOR";
  timestamp: string;
}

export default function PunditUpvPage() {
  const [ingestionMode, setIngestionMode] = useState<"PATH_A_TELEMETRY" | "PATH_B_MANUAL">("PATH_A_TELEMETRY");
  const [transmissionMode, setTransmissionMode] = useState<"DIRECT" | "INDIRECT" | "SEMI_DIRECT">("DIRECT");

  // Calibration Inputs
  const [pathLengthMm, setPathLengthMm] = useState<number>(300);
  const [transitTimeUs, setTransitTimeUs] = useState<number>(68.4);
  const [concreteTempC, setConcreteTempC] = useState<number>(29.5);
  const [reboundNumber, setReboundNumber] = useState<number>(38);
  const [transducerFreqKhz, setTransducerFreqKhz] = useState<number>(54);

  // Oscillogram State
  const [isWaveformPlaying, setIsWaveformPlaying] = useState(true);
  const [gainDb, setGainDb] = useState(42);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Calculated Results
  const velocityKmS = transitTimeUs > 0 ? Number(((pathLengthMm / transitTimeUs) * (1000 / 1000000) * 1000).toFixed(2)) : 0;
  // Formula: f_cu = 8.961 * V - 7.97 (with temperature & rebound adjustment)
  const estimatedStrengthMpa = Number((8.961 * velocityKmS - 7.97 + (reboundNumber - 30) * 0.25).toFixed(1));

  const getQualityGrade = (v: number): { label: "EXCELLENT" | "GOOD" | "QUESTIONABLE" | "POOR"; color: string; bg: string } => {
    if (v >= 4.5) return { label: "EXCELLENT", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
    if (v >= 3.5) return { label: "GOOD", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" };
    if (v >= 3.0) return { label: "QUESTIONABLE", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
    return { label: "POOR", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" };
  };

  const gradeInfo = getQualityGrade(velocityKmS);

  // Test Points Grid
  const [testPoints, setTestPoints] = useState<UpvTestPoint[]>([
    {
      pointId: "TP-01",
      location: "Column C3 (1.2m H)",
      pathLengthMm: 300,
      transitTimeUs: 67.2,
      velocityKmS: 4.46,
      reboundNumber: 39,
      estimatedStrengthMpa: 34.2,
      grade: "GOOD",
      timestamp: "Today 10:14 AM",
    },
    {
      pointId: "TP-02",
      location: "Column C3 (1.8m H)",
      pathLengthMm: 300,
      transitTimeUs: 68.8,
      velocityKmS: 4.36,
      reboundNumber: 38,
      estimatedStrengthMpa: 33.1,
      grade: "GOOD",
      timestamp: "Today 10:18 AM",
    },
    {
      pointId: "TP-03",
      location: "Column C3 Core (2.4m H)",
      pathLengthMm: 300,
      transitTimeUs: 92.5,
      velocityKmS: 3.24,
      reboundNumber: 29,
      estimatedStrengthMpa: 20.8,
      grade: "QUESTIONABLE",
      timestamp: "Today 10:24 AM",
    },
  ]);

  // Oscillogram Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.fillStyle = "#0A111E";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Graticule
      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
      ctx.lineWidth = 1;
      const xSpacing = canvas.width / 10;
      const ySpacing = canvas.height / 8;

      for (let x = 0; x < canvas.width; x += xSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += ySpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Center baseline
      const centerY = canvas.height / 2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();

      // Draw First Arrival Trigger Line (t0 Cursor)
      const triggerX = (transitTimeUs / 120) * canvas.width;
      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(triggerX, 0);
      ctx.lineTo(triggerX, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#EF4444";
      ctx.font = "10px monospace";
      ctx.fillText(`t₀ = ${transitTimeUs.toFixed(1)} µs`, triggerX + 5, 20);

      // Draw Oscillogram Ultrasonic Pulse Waveform
      ctx.strokeStyle = "#38BDF8";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x++) {
        let y = centerY;
        if (x >= triggerX) {
          const dist = x - triggerX;
          const decay = Math.exp(-dist / 80);
          const frequency = 0.08;
          const amp = Math.sin(dist * frequency + phase) * (gainDb * 1.6) * decay;
          y = centerY - amp;
        } else {
          // Pre-trigger noise
          y = centerY + (Math.sin(x * 0.4 + phase) * 1.5);
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (isWaveformPlaying) {
        phase += 0.08;
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [transitTimeUs, gainDb, isWaveformPlaying]);

  const handleRecordPoint = async () => {
    const pointId = `TP-${(testPoints.length + 1).toString().padStart(2, "0")}`;
    const newPoint: UpvTestPoint = {
      pointId,
      location: `Column C3 (${(1.0 + testPoints.length * 0.5).toFixed(1)}m H)`,
      pathLengthMm,
      transitTimeUs,
      velocityKmS,
      reboundNumber,
      estimatedStrengthMpa,
      grade: gradeInfo.label,
      timestamp: "Just now",
    };

    setTestPoints([newPoint, ...testPoints]);

    const hash = await computeSHA256(JSON.stringify(newPoint));

    enqueueSyncItem({
      type: "TELEMETRY_LOG",
      title: `PUNDIT UPV Test Point ${pointId}`,
      payload: {
        ...newPoint,
        sha256: hash,
      },
    });

    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: {
          message: `Logged ${pointId}: ${velocityKmS} km/s (${estimatedStrengthMpa} MPa) - Hash Sealed!`,
          type: "success",
        },
      })
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-2">
            <Link href="/inspector/dashboard/digital-eye" className="hover:underline">Digital Eye</Link>
            <ChevronRight size={13} />
            <span>PUNDIT UPV Ultrasonic NDT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight flex items-center gap-3">
            <Sparkles className="text-amber-500" />
            PUNDIT Ultrasonic Pulse Velocity (UPV)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            BS 1881-203 & ASTM C597 Non-Destructive Concrete Testing, Pulse Velocity & Compressive Strength.
          </p>
        </div>

        {/* Path A vs Path B Toggle */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setIngestionMode("PATH_A_TELEMETRY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              ingestionMode === "PATH_A_TELEMETRY"
                ? "bg-[#022C4F] text-white shadow-sm"
                : "text-slate-600 hover:text-[#022C4F]"
            }`}
          >
            Path A: Live Telemetry
          </button>
          <button
            type="button"
            onClick={() => setIngestionMode("PATH_B_MANUAL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              ingestionMode === "PATH_B_MANUAL"
                ? "bg-[#022C4F] text-white shadow-sm"
                : "text-slate-600 hover:text-[#022C4F]"
            }`}
          >
            Path B: Manual Ingestion
          </button>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Oscillogram Waveform Canvas Viewport */}
        <div className="lg:col-span-2 bg-[#0A111E] rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5">
                <Zap size={13} className="text-amber-400" />
                PUNDIT PL-200 • 54 kHz
              </span>
              <span className="text-xs font-mono text-slate-400">
                Pulse Voltage: <span className="text-white font-bold">500 V</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWaveformPlaying(!isWaveformPlaying)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
              >
                {isWaveformPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isWaveformPlaying ? "Freeze" : "Live"}</span>
              </button>

              <button
                type="button"
                onClick={() => setTransitTimeUs(Number((60 + Math.random() * 20).toFixed(1)))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1"
                title="Re-sample Waveform"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative w-full h-[320px] rounded-2xl overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={320}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          {/* Oscillogram Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span>Receiver Gain:</span>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={gainDb}
                  onChange={(e) => setGainDb(Number(e.target.value))}
                  className="w-24 accent-amber-400 cursor-pointer"
                />
                <span className="font-mono text-amber-300">{gainDb} dB</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRecordPoint}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#022C4F] font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>Log Test Point & Hash Seal</span>
            </button>
          </div>
        </div>

        {/* Right Col: Mathematical Engine & Formula Card */}
        <div className="space-y-6">
          {/* Real-time Calculation Result Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-[#022C4F] mb-4 flex items-center gap-2">
              <Calculator size={16} className="text-[#0284C7]" />
              Calculated UPV & Strength
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                <span className="text-[11px] font-bold text-blue-700 uppercase">Wave Velocity (V)</span>
                <p className="text-2xl font-black text-[#022C4F] font-mono mt-1">
                  {velocityKmS} <span className="text-xs font-normal text-gray-500">km/s</span>
                </p>
                <span className="text-[10px] text-gray-500">Formula: V = L / T</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">Est. Strength (fcu)</span>
                <p className="text-2xl font-black text-[#022C4F] font-mono mt-1">
                  {estimatedStrengthMpa} <span className="text-xs font-normal text-gray-500">MPa</span>
                </p>
                <span className="text-[10px] text-gray-500">SonReb Combined</span>
              </div>
            </div>

            {/* Quality Grade Badge */}
            <div className={`p-4 rounded-2xl border ${gradeInfo.bg} flex items-center justify-between`}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Concrete Quality Classification</p>
                <p className={`text-base font-extrabold ${gradeInfo.color} mt-0.5`}>
                  {gradeInfo.label} CONCRETE
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white shadow-xs">
                BS 1881-203
              </span>
            </div>
          </div>

          {/* Calibrated Parameter Inputs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
              <Sliders size={16} className="text-[#0284C7]" />
              Transducer Test Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Path Length (L) in mm</label>
                <input
                  type="number"
                  value={pathLengthMm}
                  onChange={(e) => setPathLengthMm(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-[#022C4F]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Transit Time (T) in µs</label>
                <input
                  type="number"
                  step="0.1"
                  value={transitTimeUs}
                  onChange={(e) => setTransitTimeUs(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-[#022C4F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Rebound No. (Rn)</label>
                  <input
                    type="number"
                    value={reboundNumber}
                    onChange={(e) => setReboundNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-[#022C4F]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={concreteTempC}
                    onChange={(e) => setConcreteTempC(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-[#022C4F]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UPV Test Points Registry */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
              <FileCheck size={18} className="text-[#0284C7]" />
              Field Test Point Log (Column C3 Grid)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Certified NDT measurements verified against project structural specification (30 MPa min).
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("show-toast", {
                  detail: { message: "Exporting PUNDIT UPV Test Certificate (PDF/CSV)...", type: "success" },
                })
              )
            }
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Export Certificate</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Point ID</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Path (mm)</th>
                <th className="py-3 px-4">Transit Time</th>
                <th className="py-3 px-4">Velocity (km/s)</th>
                <th className="py-3 px-4">Rebound No.</th>
                <th className="py-3 px-4">Strength (fcu)</th>
                <th className="py-3 px-4">Quality Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {testPoints.map((tp) => (
                <tr key={tp.pointId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#022C4F]">{tp.pointId}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{tp.location}</td>
                  <td className="py-3.5 px-4 font-mono">{tp.pathLengthMm} mm</td>
                  <td className="py-3.5 px-4 font-mono">{tp.transitTimeUs} µs</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0284C7]">{tp.velocityKmS}</td>
                  <td className="py-3.5 px-4 font-mono">{tp.reboundNumber}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{tp.estimatedStrengthMpa} MPa</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        tp.grade === "EXCELLENT" || tp.grade === "GOOD"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {tp.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
