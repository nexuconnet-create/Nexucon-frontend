"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Rotate3d,
  Layers,
  Sparkles,
  Compass,
  Radio,
  Eye,
  CheckCircle2,
  RefreshCw,
  Box,
} from "lucide-react";

export default function SlamViewerPage() {
  const router = useRouter();
  const [pointDensity, setPointDensity] = useState("HIGH");
  const [elevationLayer, setElevationLayer] = useState("ALL");
  const [isRotating, setIsRotating] = useState(true);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
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
              TECHNICAL ANALYSIS &bull; 3D POINT CLOUD
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#022C4F]">
              TERSUS SLAM VIEWER
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => alert("Point cloud LAS/E57 package exported.")}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Export Cloud</span>
          </button>
        </div>
      </div>

      {/* 3D Point Cloud Canvas Simulation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#022C4F] tracking-tight uppercase">
            SPATIAL LIDAR POINT CLOUD DISPLAY
          </h2>
          <span className="text-xs font-mono text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            2,450,000 Points Rendered
          </span>
        </div>

        <div className="relative rounded-2xl bg-[#031320] border border-cyan-900/60 p-6 text-white min-h-[420px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent_70%)]" />

          {/* Perspective 3D Cube & Scatter Wireframe */}
          <div className={`relative w-80 h-80 transition-transform duration-700 ${isRotating ? "animate-[spin_20s_linear_infinite]" : ""}`}>
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* Outer structural bounds */}
              <polygon points="150,30 270,100 270,220 150,290 30,220 30,100" fill="none" stroke="#0e3a5f" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="150" y1="30" x2="150" y2="290" stroke="#0e3a5f" strokeWidth="1" opacity="0.6" />
              <line x1="30" y1="100" x2="270" y2="100" stroke="#0e3a5f" strokeWidth="1" opacity="0.6" />

              {/* Point Cloud Scatter Dots (Elevation gradient) */}
              {[
                { cx: 145, cy: 90, c: "#38bdf8" },
                { cx: 160, cy: 110, c: "#38bdf8" },
                { cx: 120, cy: 130, c: "#06b6d4" },
                { cx: 180, cy: 140, c: "#06b6d4" },
                { cx: 150, cy: 160, c: "#34d399" },
                { cx: 110, cy: 180, c: "#34d399" },
                { cx: 190, cy: 190, c: "#fbbf24" },
                { cx: 140, cy: 210, c: "#fbbf24" },
                { cx: 165, cy: 230, c: "#f87171" },
                { cx: 130, cy: 245, c: "#f87171" },
                { cx: 90, cy: 150, c: "#38bdf8" },
                { cx: 210, cy: 160, c: "#38bdf8" },
                { cx: 75, cy: 120, c: "#06b6d4" },
                { cx: 225, cy: 130, c: "#06b6d4" },
                { cx: 150, cy: 100, c: "#a855f7" },
              ].map((dot, i) => (
                <circle key={i} cx={dot.cx} cy={dot.cy} r="3.5" fill={dot.c} className="animate-pulse" />
              ))}
            </svg>
          </div>

          {/* Floating Telemetry Stats */}
          <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-xs font-mono space-y-1">
            <div className="text-cyan-400 font-bold">TERSU SLAM TEL-09</div>
            <div className="text-slate-300">Drift Variance: &plusmn;4.2mm</div>
            <div className="text-slate-300">Coordinate: 6.4281° N, 3.4219° E</div>
            <div className="text-emerald-400">GNSS RTK Fix: FIXED</div>
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRotating((r) => !r)}
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 hover:bg-slate-800 text-xs font-mono font-bold text-white transition-colors"
            >
              {isRotating ? "⏸️ Pause Rotation" : "▶️ Auto Rotate"}
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-bold">DENSITY:</span>
            {["HIGH", "MEDIUM", "LOW"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setPointDensity(d)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  pointDensity === d ? "bg-[#022C4F] text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-bold">ELEVATION SLICE:</span>
            {["ALL", "GROUND (+0.0m)", "SLAB (+3.2m)", "ROOF (+12.5m)"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setElevationLayer(l)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  elevationLayer === l ? "bg-[#022C4F] text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
