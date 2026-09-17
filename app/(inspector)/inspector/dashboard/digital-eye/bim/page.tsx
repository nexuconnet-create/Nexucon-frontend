"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Layers,
  Box,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Eye,
  Activity,
  ArrowRight,
} from "lucide-react";

export default function BimDeviationPage() {
  const router = useRouter();
  const [toleranceMm, setToleranceMm] = useState<number>(10);
  const [activeElement, setActiveElement] = useState<string>("Column C4");

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
              TECHNICAL ANALYSIS &bull; AS-BUILT VS IFC DESIGN
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#022C4F]">
              BIM DEVIATION VIEWER
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/inspector/dashboard/findings/find-001/swo"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle size={14} />
            <span>Escalate to SWO</span>
          </Link>
        </div>
      </div>

      {/* Main Comparison Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#022C4F] tracking-tight uppercase">
            3D SPATIAL DEVIATION HEATMAP
          </h2>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-gray-500">Tolerance Limit:</span>
            <span className="font-bold text-rose-600 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
              &plusmn;{toleranceMm}mm
            </span>
          </div>
        </div>

        {/* 3D As-Built vs Design Model Simulation */}
        <div className="relative rounded-2xl bg-[#091522] border border-slate-700 p-6 text-white min-h-[360px] flex items-center justify-center overflow-hidden">
          <div className="relative w-72 h-72">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* IFC Model Ideal Design Ghost (Light Cyan Outline) */}
              <rect x="80" y="50" width="140" height="200" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3" opacity="0.8" />
              <text x="85" y="42" fill="#38bdf8" fontSize="10" fontFamily="monospace">IFC Design Model: Plumb</text>

              {/* As-Built Point Cloud Actual Envelope (Displaced Column C4) */}
              <polygon points="94,50 234,50 220,250 80,250" fill="rgba(244,63,94,0.18)" stroke="#f43f5e" strokeWidth="2.5" />
              <text x="140" y="275" fill="#f43f5e" fontSize="11" fontWeight="bold" fontFamily="monospace">
                Actual Scan: +14.2mm Delta
              </text>

              {/* Deviation Callout Pin */}
              <line x1="220" y1="50" x2="260" y2="30" stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx="260" cy="30" r="4" fill="#f43f5e" />
            </svg>
          </div>

          {/* Floating Anomaly Badge */}
          <div className="absolute top-4 right-4 p-3 rounded-xl bg-rose-950/90 border border-rose-500/50 backdrop-blur-md text-xs font-mono space-y-1">
            <div className="text-rose-400 font-black">CRITICAL DEVIATION DETECTED</div>
            <div className="text-white">Target: Column C4 (Sector 4)</div>
            <div className="text-amber-300">Measured Delta: 14.2mm (Tolerance: 10mm)</div>
            <div className="text-rose-300 font-bold">Exceeds Statutory Threshold!</div>
          </div>
        </div>

        {/* Tolerance Color Scale */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-gray-500 font-bold">DEVIATION SCALE:</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>0 to 5mm (Compliant)</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-bold">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>5 to 10mm (Warning)</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-bold">
              <span className="w-3 h-3 rounded-full bg-rose-600" />
              <span>&gt;10mm (Stop-Work Order)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
