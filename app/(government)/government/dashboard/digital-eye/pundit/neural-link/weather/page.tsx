"use client";

import React, { useState } from "react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import NexuconLinkNav from "@/components/dashboard/digital-eye/NexuconLinkNav";
import SiteWeatherLogPanel from "@/components/dashboard/digital-eye/SiteWeatherLogPanel";
import { Sun, CloudSun, ShieldCheck, Thermometer, Droplets, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NeuralLinkWeatherPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");

  return (
    <div className="w-full min-h-screen pb-16 animate-in fade-in duration-300 bg-slate-50/50">
      <DigitalEyeHeader
        activePillar="PUNDIT: Site Weather & Environmental Telemetry"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
      />

      {/* Neural Link Navigation Ribbon */}
      <div className="mb-6">
        <NexuconLinkNav subtitle="Testing Day Climate & Atmospheric Telemetry" />
      </div>

      <div className="space-y-6">
        {/* Executive Overview Banner */}
        <div className="bg-gradient-to-r from-[#022C4F] via-[#0A192F] to-[#0F172A] rounded-2xl p-6 text-white shadow-xl border border-slate-700/60">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 flex items-center gap-1">
                  <Sun size={12} className="text-amber-400" />
                  <span>Atmospheric Audit System</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>BS 1881-203 §3.1 Compliant</span>
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">
                Site Testing Day Weather Telemetry
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ultrasonic pulse velocity (UPV) propagation speeds and acoustic couplant integrity are strongly influenced by
                ambient temperature, direct solar radiation, and surface moisture. This console captures and synchronizes
                the environmental conditions for every day testing was conducted, directly populating Section 3.1 of official NDT Dossiers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/government/dashboard/digital-eye/pundit/neural-link/report"
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-950/30 transition-all cursor-pointer"
              >
                <FileText size={15} />
                <span>View Section 3.1 In Dossier</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Standards Guidance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
              <Thermometer size={16} />
              <span>Thermal Thresholds (ASTM C597)</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Temperatures between 10°C and 30°C require no velocity correction. Above 35°C, rapid couplant evaporation can introduce transit time false lags.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs">
              <Droplets size={16} />
              <span>Moisture & Surface Saturation</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Saturated surface concrete yields up to 5% faster pulse velocities than dry concrete of identical compressive strength per BS 1881-203.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <ShieldCheck size={16} />
              <span>Two-Way Station Synchronization</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Saving conditions for any testing date automatically annotates all PUNDIT station scans recorded on that date and injects into the AI Fact Pack.
            </p>
          </div>
        </div>

        {/* Weather Input Console */}
        <SiteWeatherLogPanel projectId={selectedProjectId} />
      </div>
    </div>
  );
}
