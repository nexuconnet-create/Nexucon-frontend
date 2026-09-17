"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ZoomIn,
  ZoomOut,
  Ruler,
  MapPin,
  Tag,
  Radio,
  FolderOpen,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  RefreshCw,
  Hash,
  Activity,
} from "lucide-react";

interface Anomaly {
  id: number;
  depth: string;
  type: "Void" | "Rebar" | "Utility";
  severity: "HIGH" | "MEDIUM" | "LOW";
  location: string;
  details: string;
}

const SAMPLE_ANOMALIES: Anomaly[] = [
  { id: 1, depth: "1.0m", type: "Void", severity: "HIGH", location: "Grid B4", details: "Subsurface void pocket near Column C4 boundary." },
  { id: 2, depth: "1.8m", type: "Rebar", severity: "MEDIUM", location: "Grid C2", details: "Irregular rebar bundle reflection with 40mm cover variance." },
  { id: 3, depth: "2.2m", type: "Utility", severity: "LOW", location: "Grid A1", details: "Cast iron drainage conduit reflection." },
];

export default function GprRadargramPage() {
  const router = useRouter();
  const [dataSource, setDataSource] = useState<"LIVE" | "MANUAL">("LIVE");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(SAMPLE_ANOMALIES[0]);
  const [activeTool, setActiveTool] = useState<"SELECT" | "MEASURE" | "MARKER" | "TAG">("SELECT");
  const [customMarkers, setCustomMarkers] = useState<Array<{ x: number; y: number; label: string }>>([
    { x: 340, y: 110, label: "Anomaly Pin #1" },
  ]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));

  const handleExport = () => {
    alert("Exporting Radargram DZT slice and SHA-256 validation report.");
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-2">
            <Link href="/inspector/dashboard/digital-eye/ts-1" className="hover:underline">Digital Eye</Link>
            <span className="text-gray-400">/</span>
            <span>GPR Radargram Radar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight flex items-center gap-3">
            <Radio className="text-[#0284C7]" />
            GPR Radargram Analysis
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            High-frequency subsurface radar imaging (400 MHz–2.0 GHz) for concrete rebar spacing, void detection, and cover validation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Export DZT / Report</span>
          </button>
        </div>
      </div>

      {/* DATA SOURCE SELECTOR (Wireframe 4) */}
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

      {/* RADARGRAM VIEWER (Canvas / Interactive Visualizer) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#022C4F] tracking-tight uppercase">
            RADARGRAM VIEWER
          </h2>
          <span className="text-xs font-mono text-gray-500">
            Zoom: {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* Interactive Radargram Display Canvas */}
        <div className="relative rounded-2xl bg-[#091522] border border-slate-700 p-6 text-white overflow-hidden min-h-[380px] select-none">
          {/* Top Frequency & Antenna Banner */}
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 pb-3 border-b border-cyan-900/50 mb-3">
            <span>TRANSDUCER: 400 MHz BISTATIC</span>
            <span>BANDWIDTH: 100 - 800 MHz</span>
            <span>TIME-ZERO: 4.2 ns</span>
          </div>

          <div className="flex">
            {/* Depth Scale (0.0 to 2.5m) */}
            <div className="w-16 shrink-0 flex flex-col justify-between py-2 text-[11px] font-mono text-cyan-400 border-r border-cyan-800/70 select-none">
              <span className="font-bold text-white text-[10px]">Depth (m)</span>
              <span>0.0 ├</span>
              <span>0.5 ├</span>
              <span className="text-rose-400 font-bold">1.0 ├</span>
              <span>1.5 ├</span>
              <span>2.0 ├</span>
              <span>2.5 ├</span>
            </div>

            {/* Radargram Waveform Canvas Simulation */}
            <div
              className="flex-1 relative overflow-hidden transition-transform duration-200 origin-center min-h-[280px]"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Synthetic GPR Reflections Pattern */}
              <div className="absolute inset-0 opacity-80 bg-[radial-gradient(ellipse_at_30%_40%,rgba(6,182,212,0.35),transparent_40%),radial-gradient(ellipse_at_65%_70%,rgba(244,63,94,0.35),transparent_45%)]" />

              {/* Hyperbolic reflection waves */}
              <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 600 240">
                {/* Surface stratum */}
                <path d="M0,20 Q150,22 300,20 T600,22" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.6" />
                <path d="M0,45 Q150,47 300,45 T600,46" stroke="#0284c7" strokeWidth="1" fill="none" opacity="0.4" />

                {/* Hyperbolic Anomaly Reflection at Depth 1.0m (Y=100) */}
                <path
                  d="M160,140 Q250,90 340,140"
                  stroke="#fb7185"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="4 2"
                />
                <path
                  d="M170,145 Q250,98 330,145"
                  stroke="#fb7185"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.8"
                />
                <path
                  d="M185,150 Q250,106 315,150"
                  stroke="#fb7185"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.6"
                />

                {/* Secondary reflection at 1.8m (Y=180) */}
                <path
                  d="M380,210 Q440,175 500,210"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.7"
                />
              </svg>

              {/* Pinpoint Target Anomaly Marker at 1.0m */}
              <div
                className="absolute z-20"
                style={{ top: "90px", left: "240px" }}
              >
                <div className="relative group cursor-pointer" onClick={() => setSelectedAnomaly(SAMPLE_ANOMALIES[0])}>
                  <span className="absolute -inset-2 rounded-full bg-rose-500/50 animate-ping" />
                  <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-[0_0_15px_rgba(244,63,94,0.9)]">
                    ●
                  </div>
                  <div className="absolute top-8 -left-24 bg-slate-900/95 border border-rose-500 text-white text-[11px] font-mono px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                    ● Anomaly at 1.0m depth - Possible void or rebar congestion
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Anomaly Callout Legend */}
          <div className="mt-4 pt-3 border-t border-cyan-900/60 flex items-center justify-between text-xs font-mono">
            <span className="text-rose-400 font-bold flex items-center gap-1.5">
              <span>●</span>
              <span>Anomaly at 1.0m depth - Possible void or rebar congestion</span>
            </span>
            <span className="text-cyan-400">Velocity: 0.12 m/ns (Concrete)</span>
          </div>
        </div>

        {/* Toolbar Controls (Specified in Wireframe 4) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleZoomIn}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ZoomIn size={14} />
              <span>Zoom In</span>
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ZoomOut size={14} />
              <span>Zoom Out</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTool("MEASURE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                activeTool === "MEASURE" ? "bg-[#022C4F] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Ruler size={14} />
              <span>Measure</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool("MARKER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                activeTool === "MARKER" ? "bg-[#022C4F] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <MapPin size={14} />
              <span>Add Marker</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool("TAG")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                activeTool === "TAG" ? "bg-[#022C4F] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Tag size={14} />
              <span>Tag Anomaly</span>
            </button>
          </div>
        </div>
      </div>

      {/* DETECTED ANOMALIES TABLE (Specified in Wireframe 4) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#022C4F] tracking-tight uppercase">
          DETECTED ANOMALIES
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-gray-500 font-bold">
                <th className="pb-2.5 px-3">#</th>
                <th className="pb-2.5 px-3">Depth</th>
                <th className="pb-2.5 px-3">Type</th>
                <th className="pb-2.5 px-3">Severity</th>
                <th className="pb-2.5 px-3">Location</th>
                <th className="pb-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SAMPLE_ANOMALIES.map((a) => (
                <tr
                  key={a.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    selectedAnomaly?.id === a.id ? "bg-blue-50/50" : ""
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-gray-900">{a.id}</td>
                  <td className="py-3 px-3 font-bold text-gray-800">{a.depth}</td>
                  <td className="py-3 px-3 text-gray-700">{a.type}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.severity === "HIGH"
                        ? "bg-rose-100 text-rose-800"
                        : a.severity === "MEDIUM"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-800">{a.location}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedAnomaly(a)}
                      className="px-3 py-1 rounded-lg bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      VIEW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* METADATA BLOCK (Specified in Wireframe 4) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2 text-xs font-mono">
        <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2">
          METADATA
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-600">
          <div>Device: <strong className="text-gray-900">GSSI Conquest 100</strong></div>
          <div>Antenna: <strong className="text-gray-900">400 MHz</strong></div>
          <div>Path Length: <strong className="text-gray-900">120mm</strong></div>
          <div>Operator: <strong className="text-gray-900">Badge #LAG-INS-042</strong></div>
          <div className="sm:col-span-2">Timestamp: <strong className="text-gray-900">2026-09-16 10:30:45 WAT</strong></div>
          <div className="sm:col-span-3 text-[11px] pt-1 border-t border-slate-100 text-slate-500">
            SHA-256: <span className="font-bold text-[#022C4F]">a3f5b8c2d1e4f7a9b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
