"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  MessageSquare,
  Sparkles,
  Sliders,
  Maximize2,
  Plus,
} from "lucide-react";
import { enqueueSyncItem } from "@/lib/offline-sync";

interface BcfIssue {
  id: string;
  title: string;
  element: string;
  deviationMm: number;
  toleranceMm: number;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
  priority: "CRITICAL" | "HIGH" | "NORMAL";
  author: string;
  timestamp: string;
}

export default function TrimbleConnectPage() {
  const [modelType, setModelType] = useState<"STRUCTURAL" | "ARCHITECTURAL" | "MEP" | "COMBINED">("STRUCTURAL");
  const [viewMode, setViewMode] = useState<"AS_BUILT_VS_IFC" | "HEATMAP" | "WIREFRAME">("AS_BUILT_VS_IFC");
  const [selectedIssue, setSelectedIssue] = useState<BcfIssue | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [bcfIssues, setBcfIssues] = useState<BcfIssue[]>([
    {
      id: "BCF-2026-089",
      title: "Column C4 Out-of-Plumb Deviation",
      element: "IFCColumn:C4_L4_AxisB",
      deviationMm: 18.4,
      toleranceMm: 10.0,
      status: "OPEN",
      priority: "CRITICAL",
      author: "Inspector #LAG-INS-042",
      timestamp: "Today, 10:45 AM",
    },
    {
      id: "BCF-2026-088",
      title: "Beam B-12 Rebar Clearance Violation",
      element: "IFCBeam:B12_Span4",
      deviationMm: 12.2,
      toleranceMm: 10.0,
      status: "OPEN",
      priority: "HIGH",
      author: "Inspector #LAG-INS-042",
      timestamp: "Today, 09:20 AM",
    },
    {
      id: "BCF-2026-087",
      title: "Slab Opening Misalignment on Shaft 2",
      element: "IFCSlab:Slab_L4_Core",
      deviationMm: -6.5,
      toleranceMm: 10.0,
      status: "RESOLVED",
      priority: "NORMAL",
      author: "Lead Engineer Okafor",
      timestamp: "Yesterday",
    },
  ]);

  const handleSyncTrimble = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: "Trimble Connect CDE Synced! 2 BCF Topics pushed to Project Team.",
            type: "success",
          },
        })
      );
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-2">
            <Link href="/inspector/dashboard/digital-eye" className="hover:underline">Digital Eye</Link>
            <ChevronRight size={13} />
            <span>Trimble Connect BIM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight flex items-center gap-3">
            <Box className="text-[#0284C7]" />
            Trimble Connect 3D BIM & CDE
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Common Data Environment synchronization, IFC 4.3 structural models, and As-Built tolerance heatmap analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSyncTrimble}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#033B6B] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? "Syncing CDE..." : "Sync Trimble CDE"}</span>
          </button>

          <a
            href="https://connect.trimble.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>Open Trimble Web</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Main Viewport & Issue Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 3D BIM Viewer Canvas & Deviation Heatmap */}
        <div className="lg:col-span-2 bg-[#091522] rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Top Canvas Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5">
                <Box size={13} className="text-blue-400" />
                IFC4 • Eko_Tower_Rev08.ifc
              </span>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                Elements: <span className="text-white font-bold">14,280</span>
              </span>
            </div>

            {/* View Mode Filters */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setViewMode("AS_BUILT_VS_IFC")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === "AS_BUILT_VS_IFC"
                    ? "bg-[#0284C7] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Deviation Comparison
              </button>
              <button
                type="button"
                onClick={() => setViewMode("HEATMAP")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === "HEATMAP"
                    ? "bg-[#0284C7] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Heatmap
              </button>
              <button
                type="button"
                onClick={() => setViewMode("WIREFRAME")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === "WIREFRAME"
                    ? "bg-[#0284C7] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Wireframe
              </button>
            </div>
          </div>

          {/* Interactive 3D Model Simulation Canvas */}
          <div className="relative w-full h-[400px] rounded-2xl bg-[#040C16] border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* 3D Wireframe / Isometric SVG Grid Simulation */}
            <svg className="w-full h-full" viewBox="0 0 600 360" fill="none">
              {/* Floor Slab Grid */}
              <path d="M100 240 L300 320 L500 240 L300 160 Z" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" fill="rgba(2, 44, 79, 0.4)" />
              <path d="M100 120 L300 200 L500 120 L300 40 Z" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" fill="rgba(2, 132, 199, 0.1)" />

              {/* Columns */}
              <line x1="200" y1="280" x2="200" y2="160" stroke="#38BDF8" strokeWidth="4" />
              <line x1="400" y1="280" x2="400" y2="160" stroke="#38BDF8" strokeWidth="4" />
              <line x1="300" y1="320" x2="300" y2="200" stroke="#38BDF8" strokeWidth="5" />

              {/* Deviated Column C4 Highlighted in Red */}
              <line x1="300" y1="200" x2="318" y2="80" stroke="#F43F5E" strokeWidth="6" />
              <circle cx="318" cy="80" r="8" fill="#F43F5E" className="animate-ping" opacity="0.75" />
              <circle cx="318" cy="80" r="5" fill="#EF4444" />

              {/* Beams */}
              <line x1="200" y1="160" x2="300" y2="200" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="3" />
              <line x1="300" y1="200" x2="400" y2="160" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="3" />

              {/* Annotation Flag */}
              <g transform="translate(325, 60)">
                <rect width="130" height="40" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#F43F5E" strokeWidth="1.5" />
                <text x="10" y="18" fill="#FFFFFF" fontSize="11" fontWeight="bold">Column C4 Axis B</text>
                <text x="10" y="32" fill="#FDA4AF" fontSize="10" fontFamily="monospace">+18.4mm (Tolerance: ±10mm)</text>
              </g>
            </svg>

            {/* Tolerance Gauge Legend Bottom Left */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-[11px] font-mono text-slate-300 space-y-1.5">
              <span className="font-bold text-white block text-[10px] uppercase">LASBCA Tolerance Scale</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Within Spec (0 to 5 mm)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span>Warning (5 to 10 mm)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-rose-500" />
                <span>Out of Tolerance (&gt; 10 mm)</span>
              </div>
            </div>
          </div>

          {/* Canvas Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Selected Model: <strong className="text-white">Structural IFC Level 4</strong> &bull; Updated 2h ago
            </span>

            <Link
              href="/inspector/dashboard/findings/FIN-2026-089/swo"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <AlertTriangle size={14} />
              <span>Escalate Column C4 to SWO</span>
            </Link>
          </div>
        </div>

        {/* Right Col: BCF Topics & Collaboration Tracker */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
                <MessageSquare size={16} className="text-[#0284C7]" />
                Trimble BCF Topics
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                2 Deviations
              </span>
            </div>

            <div className="space-y-3">
              {bcfIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    issue.priority === "CRITICAL"
                      ? "bg-rose-50/40 border-rose-200 hover:bg-rose-50"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-gray-500">{issue.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        issue.status === "OPEN"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {issue.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#022C4F] mb-1">{issue.title}</h4>
                  <p className="text-[11px] font-mono text-gray-500 mb-2">{issue.element}</p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 font-mono">
                    <span>Deviation: <strong className="text-rose-600">+{issue.deviationMm} mm</strong></span>
                    <span className="text-gray-400">Tol: ±{issue.toleranceMm} mm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Federation Metadata */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-[#022C4F] uppercase tracking-wider text-[11px]">
              Trimble CDE Connection
            </h4>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Project ID:</span>
                <strong className="text-[#022C4F] font-mono">TC-PRJ-EKO-771</strong>
              </div>
              <div className="flex justify-between">
                <span>IFC Schema:</span>
                <strong className="text-[#022C4F] font-mono">IFC4 Design Transfer</strong>
              </div>
              <div className="flex justify-between">
                <span>Coordinate CRS:</span>
                <strong className="text-[#022C4F] font-mono">EPSG:26331 (Minna / UTM 31N)</strong>
              </div>
              <div className="flex justify-between">
                <span>Last Cloud Push:</span>
                <strong className="text-emerald-600 font-medium">10 mins ago</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
