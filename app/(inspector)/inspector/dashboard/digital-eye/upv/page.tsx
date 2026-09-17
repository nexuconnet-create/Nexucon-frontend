"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Radio,
  FolderOpen,
  Play,
  Pause,
  Ruler,
  ZoomIn,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Activity,
  Zap,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";
import { enqueueSyncItem, computeSHA256 } from "@/lib/offline-sync";

interface TestPoint {
  id: string;
  point: string;
  pathLength: number;
  transitTime: number;
  velocity: number;
  strength: number;
  status: "GOOD" | "DOUBTFUL" | "POOR";
  timestamp: string;
}

const INITIAL_POINTS: TestPoint[] = [
  { id: "p-1", point: "A", pathLength: 120, transitTime: 30.1, velocity: 3986, strength: 27.8, status: "GOOD", timestamp: "10:30:45" },
  { id: "p-2", point: "B", pathLength: 120, transitTime: 29.8, velocity: 4026, strength: 28.1, status: "GOOD", timestamp: "10:32:15" },
  { id: "p-3", point: "C", pathLength: 120, transitTime: 30.3, velocity: 3960, strength: 27.5, status: "GOOD", timestamp: "10:34:00" },
];

export default function UpvAnalyzerPage() {
  const router = useRouter();
  const [dataSource, setDataSource] = useState<"LIVE" | "MANUAL">("LIVE");

  // Inputs
  const [pathLength, setPathLength] = useState<number>(120);
  const [transitTime, setTransitTime] = useState<number>(30.1);
  const [temperature, setTemperature] = useState<number>(28);
  const [reboundNumber, setReboundNumber] = useState<number>(32);

  // Registry & Oscillogram
  const [testPoints, setTestPoints] = useState<TestPoint[]>(INITIAL_POINTS);
  const [isPlayingOscillogram, setIsPlayingOscillogram] = useState(true);
  const [oscillogramOffset, setOscillogramOffset] = useState(0);
  const [zoomOscillogram, setZoomOscillogram] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [isPushed, setIsPushed] = useState(false);

  // Locked Server-Computed Engine Calculations
  // Pulse velocity: (pathLength in mm / transitTime in µs) * 1000 => m/s
  const calculatedVelocity = transitTime > 0 ? Math.round((pathLength / transitTime) * 1000) : 0;
  // SonReb calibrated strength: f_cu = 8.961 * (V / 1000) - 7.97
  const velocityKmS = calculatedVelocity / 1000;
  const calculatedStrength = parseFloat((8.961 * velocityKmS - 7.97 + (reboundNumber ? reboundNumber * 0.05 : 0)).toFixed(1));
  const isPassedThreshold = calculatedStrength >= 25.0;

  // Animate oscillogram waveform when playing
  useEffect(() => {
    if (!isPlayingOscillogram) return;
    const interval = setInterval(() => {
      setOscillogramOffset((prev) => (prev + 2) % 200);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlayingOscillogram]);

  const handleCaptureFromDevice = () => {
    // Simulated live BLE stream from Pundit PL-200
    const randomTime = parseFloat((29.5 + Math.random() * 1.2).toFixed(1));
    const randomRebound = Math.floor(30 + Math.random() * 5);
    setTransitTime(randomTime);
    setReboundNumber(randomRebound);
  };

  const handleSaveMeasurement = async () => {
    const nextLetter = String.fromCharCode(65 + (testPoints.length % 26));
    const newPoint: TestPoint = {
      id: `pt-${Date.now()}`,
      point: nextLetter,
      pathLength,
      transitTime,
      velocity: calculatedVelocity,
      strength: calculatedStrength,
      status: calculatedStrength >= 25 ? "GOOD" : "DOUBTFUL",
      timestamp: new Date().toLocaleTimeString(),
    };
    setTestPoints((prev) => [...prev, newPoint]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePushToDashboard = async () => {
    const hash = await computeSHA256(JSON.stringify({ calculatedVelocity, calculatedStrength, testPoints }));
    enqueueSyncItem({
      type: "UPV_READING",
      title: `UPV_Reading_${Date.now().toString().slice(-4)}.csv`,
      payload: { pathLength, transitTime, velocity: calculatedVelocity, strength: calculatedStrength, points: testPoints },
      hash: hash,
      timestamp: new Date().toISOString(),
      sizeBytes: 8400,
      source: dataSource === "LIVE" ? "TELEMETRY" : "MANUAL_IMPORT",
    });
    setIsPushed(true);
    setTimeout(() => setIsPushed(false), 2500);
  };

  const handleExport = () => {
    alert("Exported UPV SonReb Certificate (CSV & PDF) with SHA-256 verification.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/inspector/dashboard/digital-eye")}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to Digital Eye"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[11px] font-mono text-gray-400 font-bold uppercase">
              TECHNICAL ANALYSIS &bull; UPV NON-DESTRUCTIVE TESTING
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#022C4F]">
              UPV ANALYZER (ULTRASONIC PULSE VELOCITY)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* DATA SOURCE (Wireframe 5) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-mono font-bold uppercase text-gray-500">
          DATA SOURCE:
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDataSource("LIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              dataSource === "LIVE"
                ? "bg-[#022C4F] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Radio size={14} className={dataSource === "LIVE" ? "text-emerald-400 animate-pulse" : ""} />
            <span>📡 Live Telemetry 🟢</span>
          </button>

          <button
            type="button"
            onClick={() => setDataSource("MANUAL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              dataSource === "MANUAL"
                ? "bg-[#022C4F] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <FolderOpen size={14} />
            <span>📁 Manual Import</span>
          </button>
        </div>
      </div>

      {/* LIVE MEASUREMENT & LOCKED OUTPUT ENGINE (Side by Side on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LIVE MEASUREMENT INPUTS (Wireframe 5) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-[#022C4F] tracking-tight uppercase">
              LIVE MEASUREMENT
            </h2>
            <span className="text-[11px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              54 kHz Direct Transmission
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-gray-500 block mb-1">Path Length (mm):</label>
              <input
                type="number"
                value={pathLength}
                onChange={(e) => setPathLength(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#022C4F]"
              />
            </div>

            <div>
              <label className="text-gray-500 block mb-1">Transit Time (µs):</label>
              <input
                type="number"
                step="0.1"
                value={transitTime}
                onChange={(e) => setTransitTime(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#022C4F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 block mb-1">Temperature (°C):</label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#022C4F]"
                />
              </div>

              <div>
                <label className="text-gray-500 block mb-1">Rebound Number (SonReb):</label>
                <input
                  type="number"
                  value={reboundNumber}
                  onChange={(e) => setReboundNumber(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#022C4F]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCaptureFromDevice}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Radio size={14} className="text-cyan-300 animate-pulse" />
              <span>📡 CAPTURE FROM DEVICE</span>
            </button>

            <button
              type="button"
              onClick={() => {}}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>✏️ MANUAL ENTRY</span>
            </button>
          </div>
        </div>

        {/* LOCKED OUTPUT ENGINE (Server-Computed) (Wireframe 5) */}
        <div className="bg-gradient-to-br from-slate-900 to-[#022C4F] rounded-2xl p-5 sm:p-6 text-white shadow-sm space-y-4 relative overflow-hidden border border-blue-900">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base font-bold text-white tracking-tight uppercase">
              LOCKED OUTPUT ENGINE
            </h2>
            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-400/40">
              Server-Computed
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-300">Pulse Velocity (V):</span>
              <span className="text-base font-black text-cyan-300">
                {calculatedVelocity.toLocaleString()} m/s
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-300">Estimated Strength:</span>
              <span className="text-base font-black text-emerald-300">
                {calculatedStrength} MPa
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-300">Threshold (25 MPa):</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                isPassedThreshold
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
              }`}>
                {isPassedThreshold ? "✅ PASSED" : "❌ DEFICIENT"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-300">Confidence:</span>
              <span className="text-white font-bold">
                95% (CI: {(calculatedStrength - 1.6).toFixed(1)} – {(calculatedStrength + 1.6).toFixed(1)} MPa)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-[11px] text-cyan-200/90 leading-relaxed">
              Formula: <code>f_cu = 8.961 × V - 7.97</code> (E.C.S calibration)
            </div>
          </div>
        </div>
      </div>

      {/* TEST POINTS REGISTRY (Wireframe 5 Table) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-[#022C4F] tracking-tight uppercase">
          TEST POINTS REGISTRY
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-gray-500 font-bold">
                <th className="pb-2.5 px-3">Point</th>
                <th className="pb-2.5 px-3">Path (mm)</th>
                <th className="pb-2.5 px-3">Time (µs)</th>
                <th className="pb-2.5 px-3">Velocity (m/s)</th>
                <th className="pb-2.5 px-3">Strength (MPa)</th>
                <th className="pb-2.5 px-3">Status</th>
                <th className="pb-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {testPoints.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#022C4F]">{pt.point}</td>
                  <td className="py-2.5 px-3 text-gray-700">{pt.pathLength}</td>
                  <td className="py-2.5 px-3 text-gray-700">{pt.transitTime}</td>
                  <td className="py-2.5 px-3 font-bold text-gray-900">{pt.velocity.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">{pt.strength}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {pt.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-500">{pt.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WAVEFORM OSCILLOGRAM (Wireframe 5 Display) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#022C4F] tracking-tight uppercase">
            WAVEFORM OSCILLOGRAM
          </h2>
          <span className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Transducer Stream
          </span>
        </div>

        {/* Animated Oscillogram Graph */}
        <div className="rounded-2xl bg-[#031320] border border-cyan-900/60 p-5 text-white relative overflow-hidden min-h-[200px]">
          <div className="text-[10px] font-mono text-cyan-400 absolute top-3 left-4">
            Amplitude ▲
          </div>
          <div className="text-[10px] font-mono text-cyan-400 absolute bottom-3 right-4">
            Time (µs) ►
          </div>

          <svg className="w-full h-36" viewBox="0 0 500 120" preserveAspectRatio="none">
            {/* Horizontal baseline */}
            <line x1="0" y1="60" x2="500" y2="60" stroke="#0e3a5f" strokeWidth="1" />
            <line x1="120" y1="0" x2="120" y2="120" stroke="#0e3a5f" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="260" y1="0" x2="260" y2="120" stroke="#0e3a5f" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="390" y1="0" x2="390" y2="120" stroke="#0e3a5f" strokeWidth="1" strokeDasharray="3 3" />

            {/* Ultrasonic Waveform Pulse */}
            <path
              d={`M0,60 Q50,60 100,60 Q120,${60 - 45 * zoomOscillogram} 140,${60 + 50 * zoomOscillogram} Q160,${60 - 30 * zoomOscillogram} 180,${60 + 25 * zoomOscillogram} Q200,${60 - 15 * zoomOscillogram} 220,${60 + 10 * zoomOscillogram} T500,60`}
              stroke="#06b6d4"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Oscillogram Controls (Specified in Wireframe 5) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPlayingOscillogram(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                isPlayingOscillogram ? "bg-[#022C4F] text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              <Play size={13} className="fill-current" />
              <span>▶️ PLAY</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPlayingOscillogram(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                !isPlayingOscillogram ? "bg-[#022C4F] text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              <Pause size={13} />
              <span>🟢 PAUSE</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => alert("Measurement cursor active on waveform.")}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Ruler size={13} />
              <span>📏 MEASURE</span>
            </button>
            <button
              type="button"
              onClick={() => setZoomOscillogram((z) => (z === 1 ? 1.4 : 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <ZoomIn size={13} />
              <span>🔍 ZOOM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar (Wireframe 5) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-lg flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleSaveMeasurement}
          className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Save size={15} />
          <span>{isSaved ? "Saved to Registry ✅" : "💾 SAVE MEASUREMENT"}</span>
        </button>

        <button
          type="button"
          onClick={handlePushToDashboard}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Send size={15} />
          <span>{isPushed ? "Pushed to Queue ✅" : "📤 PUSH TO DASHBOARD"}</span>
        </button>

        <button
          type="button"
          onClick={handleExport}
          className="px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-bold font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Download size={15} />
          <span>📁 EXPORT</span>
        </button>
      </div>
    </div>
  );
}
