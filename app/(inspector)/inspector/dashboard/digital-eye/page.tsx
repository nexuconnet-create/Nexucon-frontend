"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Eye,
  Box,
  Radio,
  Activity,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { GPRScan, PunditTest } from "@/services/digitalEye";

// Dynamically import heavy 3D and canvas components for optimal performance
const RadargramViewer = dynamic(
  () => import("@/components/dashboard/digital-eye/RadargramViewer"),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-xs text-slate-400 font-mono">Loading Radargram Engine...</div> }
);

const PunditWaveformViewer = dynamic(
  () => import("@/components/dashboard/digital-eye/PunditWaveformViewer"),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-xs text-slate-400 font-mono">Loading Ultrasonic Engine...</div> }
);

const TrimbleBIMViewer = dynamic(
  () => import("@/components/dashboard/digital-eye/TrimbleBIMViewer"),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-xs text-slate-400 font-mono">Connecting Trimble Connect 3D Viewer...</div> }
);

const EvidenceMapCanvas = dynamic(
  () => import("@/components/dashboard/digital-eye/EvidenceMapCanvas"),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-xs text-slate-400 font-mono">Initializing GNSS Spatial Canvas...</div> }
);

const sampleGprScan: GPRScan = {
  id: "gpr-1",
  survey_reference: "GPR-2026-LKK-0014",
  project: "prj-1",
  project_name: "Lekki Pearl Residences",
  title: "Basement Slab & Pile Cap Subsurface Radar Profile",
  survey_area: "Grid A1 to D4 Basement Level 1",
  structural_element: "FND-PILE-CAP-04",
  antenna_frequency_mhz: 1600,
  depth_range_m: 0.8,
  grid_spacing_m: 0.15,
  operator_name: "Engr. A. Adeleke",
  status: "completed",
  status_display: "Completed",
  notes: "1.6 GHz antenna run across Grid A1-D4. Detected 8 rebar layers and 1 potential air void anomaly.",
  anomaly_count: 1,
  anomalies: [],
  raw_file_urls: [],
  created_at: new Date().toISOString(),
};

const samplePunditTest: PunditTest = {
  id: "pundit-1",
  test_reference: "UPV-2026-0042",
  project: "prj-2",
  project_name: "Eko Atlantic Tower D",
  test_type: "pulse_velocity",
  test_location: "Grid D-7 Core Section Column C-24",
  transducer_type: "DIRECT",
  transducer_frequency_khz: 54,
  path_length_mm: 400,
  transit_time_us: 94.2,
  readings: [
    {
      point_label: "A",
      path_length_mm: 400,
      transit_time_us: 94.2,
      uncracked_transit_time_us: null,
      surface_condition: "Smooth Formwork Finish",
      velocity_km_s: 4.25,
      ecs_mpa: 42.5,
      crack_depth_mm: null,
    },
    {
      point_label: "B",
      path_length_mm: 400,
      transit_time_us: 96.8,
      uncracked_transit_time_us: null,
      surface_condition: "Smooth Formwork Finish",
      velocity_km_s: 4.13,
      ecs_mpa: 39.8,
      crack_depth_mm: null,
    },
  ],
  weather_condition: "Dry / 29°C",
  floor: "Level 3",
  crack_path_length_mm: 0,
  crack_pulse_time_us: 0,
  uncracked_pulse_time_us: 0,
  surface_condition: "Smooth finish",
  surface_temperature_c: 29.5,
  pulse_velocity_ms: 4190,
  estimated_compressive_strength_mpa: 41.2,
  concrete_quality_rating: "GOOD",
  operator_name: "Engr. A. Adeleke",
  test_date: "2026-09-08",
  created_at: new Date().toISOString(),
  file_count: 2,
};

export default function InspectorDigitalEyePage() {
  const [activeSubmodule, setActiveSubmodule] = useState<"bim" | "gpr" | "pundit" | "spatial">("gpr");

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <Eye size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
              Digital Eye Technical Workspace
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Correlate structural BIM models, GPR subsurface radar profiles, and ultrasonic UPV test results with advisory AI interpretation.
          </p>
        </div>
      </div>

      {/* Submodule Navigation */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto">
        {[
          { id: "gpr", label: "GPR Radargram Radar", icon: Radio, desc: "Rebar & Void Profile" },
          { id: "pundit", label: "PUNDIT UPV Ultrasonic", icon: Activity, desc: "Concrete Pulse Velocity" },
          { id: "bim", label: "3D BIM IFC Geometry", icon: Box, desc: "Trimble Connect" },
          { id: "spatial", label: "Spatial Evidence Map", icon: MapPin, desc: "GNSS Telemetry" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubmodule(tab.id as any)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 shadow-sm ${
              activeSubmodule === tab.id
                ? "bg-[#022C4F] text-white font-bold"
                : "bg-white text-slate-600 hover:text-[#022C4F] hover:bg-slate-50 border border-slate-200/80 font-medium"
            }`}
          >
            <tab.icon size={16} />
            <div className="text-left">
              <div>{tab.label}</div>
              <div className="text-[10px] font-normal opacity-80">{tab.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Primary Technical Viewer Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        {activeSubmodule === "gpr" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#022C4F]">GPR Radargram Analysis</h2>
                <p className="text-xs text-slate-500">Profile Scan #GPR-2026-LKK-0014 &bull; 1.6 GHz High-Frequency Antenna</p>
              </div>
              <span className="text-[11px] font-semibold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                Depth Range: 0.8m
              </span>
            </div>

            <div className="min-h-[380px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
              <RadargramViewer scan={sampleGprScan} />
            </div>
          </div>
        )}

        {activeSubmodule === "pundit" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#022C4F]">PUNDIT Ultrasonic Pulse Velocity (UPV)</h2>
                <p className="text-xs text-slate-500">Direct transmission 54 kHz transducers &bull; BS 1881-203 Compliance</p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Mean: 4190 m/s
              </span>
            </div>

            <div className="min-h-[380px] bg-slate-950 rounded-xl border border-slate-800 p-2">
              <PunditWaveformViewer test={samplePunditTest} />
            </div>
          </div>
        )}

        {activeSubmodule === "bim" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#022C4F]">Trimble Connect 3D BIM Viewer</h2>
                <p className="text-xs text-slate-500">Federated architectural & structural IFC model</p>
              </div>
              <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                LOD 350
              </span>
            </div>

            <div className="min-h-[420px] bg-slate-950 rounded-xl border border-slate-800 p-2">
              <TrimbleBIMViewer projectId="prj-1" elements={[]} />
            </div>
          </div>
        )}

        {activeSubmodule === "spatial" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#022C4F]">Spatial Telemetry Canvas</h2>
                <p className="text-xs text-slate-500">GNSS coordinates of sensor surveys and inspection check-ins</p>
              </div>
            </div>

            <div className="min-h-[420px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden p-2">
              <EvidenceMapCanvas points={[]} />
            </div>
          </div>
        )}

        {/* Advisory AI Panel */}
        <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#022C4F]" />
              <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                Advisory AI Anomaly Analysis
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Confidence: 89% (Moderate)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm">
              <span className="text-slate-500 text-[11px] block font-medium">1. Measured Signal</span>
              <span className="text-slate-800 font-bold">Radar delay: 14.2 ns</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm">
              <span className="text-slate-500 text-[11px] block font-medium">2. Processed Value</span>
              <span className="text-slate-800 font-bold">Cover: 22mm (Nominal: 40mm)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm sm:col-span-2">
              <span className="text-slate-500 text-[11px] block font-medium">3. AI Interpretation</span>
              <span className="text-slate-700 font-medium leading-relaxed">
                Potential rebar displacement detected near column ST-024 junction. High risk of moisture penetration.
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500 italic">
              AI recommendations remain advisory. Formal regulatory enforcement requires official Inspector decision.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Dismiss
              </button>
              <Link
                href="/inspector/dashboard/findings"
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                Create Regulatory Finding
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
