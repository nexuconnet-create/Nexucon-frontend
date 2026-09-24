"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  Scan,
  Activity,
  Radio,
  Box,
  MapPin,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Sparkles,
  Wifi,
  BatteryCharging,
  FileText,
  Search,
} from "lucide-react";
import {
  getFieldDevices,
  getPunditTests,
  getGPRScans,
  getEvidenceSpatialPoints,
  FieldDeviceRecord,
  PunditTest,
  GPRScan,
  EvidenceSpatialPoint,
  formatVelocityMs,
} from "@/services/digitalEye";
import { dateOr, orDash } from "@/lib/display";

function DigitalEyeHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // If redirected with legacy tab params, seamlessly navigate to the appropriate dedicated page
  useEffect(() => {
    const tab = searchParams.get("tab");
    const action = searchParams.get("action");
    if (tab === "pundit") {
      router.replace(`/inspector/dashboard/digital-eye/pundit${action ? `?action=${action}` : ""}`);
    } else if (tab === "gpr") {
      router.replace("/inspector/dashboard/digital-eye/gpr");
    } else if (tab === "bim") {
      router.replace("/inspector/dashboard/digital-eye/trimble");
    } else if (tab === "spatial") {
      router.replace("/inspector/dashboard/digital-eye/spatial");
    } else if (tab === "sessions") {
      router.replace("/inspector/dashboard/digital-eye/audit-vault");
    }
  }, [searchParams, router]);

  const [devices, setDevices] = useState<FieldDeviceRecord[]>([]);
  const [punditTests, setPunditTests] = useState<PunditTest[] | null>(null);
  const [gprScans, setGprScans] = useState<GPRScan[] | null>(null);
  const [spatialPoints, setSpatialPoints] = useState<EvidenceSpatialPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadHubData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [deviceRes, testsRes, scansRes, spatialRes] = await Promise.allSettled([
        getFieldDevices(),
        getPunditTests(),
        getGPRScans(),
        getEvidenceSpatialPoints(),
      ]);

      if (deviceRes.status === "fulfilled" && Array.isArray(deviceRes.value)) {
        setDevices(deviceRes.value);
      }
      if (testsRes.status === "fulfilled" && Array.isArray(testsRes.value)) {
        setPunditTests(testsRes.value);
      }
      if (scansRes.status === "fulfilled" && Array.isArray(scansRes.value)) {
        setGprScans(scansRes.value);
      }
      if (spatialRes.status === "fulfilled" && Array.isArray(spatialRes.value)) {
        setSpatialPoints(spatialRes.value);
      }
    } catch (err: any) {
      setErrorMsg("Failed to synchronize some telemetry data with the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHubData();
  }, []);

  const deviceCards = devices.map((d) => {
    const statusLabel = d.status_display || d.status || "";
    const online = /connect|active|online|fixed|ready/i.test(statusLabel) && d.is_active;
    return {
      id: d.id,
      name: d.name || d.model || d.device_id || "Field Device",
      type: d.device_type_display || d.device_type || "Instrument",
      serial: d.device_reference || d.device_id || "Unregistered",
      battery: d.battery_level,
      status: statusLabel || (online ? "ONLINE" : "STANDBY"),
      online,
    };
  });

  const onlineCount = deviceCards.filter((d) => d.online).length;

  const SUBMODULES = [
    {
      id: "ts-1",
      title: "T-S1 MVP",
      subtitle: "LiDAR SLAM & 3D Spatial Scanner",
      description: "Real-time 3D point cloud generation, centimeter-grade SLAM trajectory tracking, drift error monitoring (±4.2mm), and LAS/E57 datasets.",
      href: "/inspector/dashboard/digital-eye/ts-1",
      icon: Scan,
      badge: "TS-1 Primary",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      stats: "SLAM Active • 4K RGB",
      accentColor: "from-blue-600 to-indigo-700",
    },
    {
      id: "pundit",
      title: "PUNDIT Ultrasonic NDT",
      subtitle: "Pulse Velocity (UPV) & Strength Analysis",
      description: "Non-destructive concrete homogeneity assessment, BS 1881-203:1986 compliance, live PZT waveform oscillograms, and test registries.",
      href: "/inspector/dashboard/digital-eye/pundit",
      icon: Activity,
      badge: "BS 1881-203",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      stats: punditTests ? `${punditTests.length} UPV Tests Recorded` : "UPV Ingestion Ready",
      accentColor: "from-emerald-600 to-teal-700",
    },
    {
      id: "gpr",
      title: "GPR Radargram Analysis",
      subtitle: "Subsurface Radar & Rebar Cover",
      description: "High-frequency electromagnetic radargram imaging (400 MHz–2.0 GHz), hyperbolic reflection profiling, rebar cover depth, and subsurface void detection.",
      href: "/inspector/dashboard/digital-eye/gpr",
      icon: Radio,
      badge: "Subsurface Radar",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      stats: gprScans ? `${gprScans.length} GPR Profiles` : "400MHz Transducer",
      accentColor: "from-amber-600 to-orange-700",
    },
    {
      id: "trimble",
      title: "Trimble Connect 3D BIM Viewer",
      subtitle: "IFC Models & As-Built Deviation",
      description: "Common Data Environment (CDE) sync, IFC 4.3 structural geometry, 3D tolerance deviation heatmaps, and BCF issue collaboration.",
      href: "/inspector/dashboard/digital-eye/trimble",
      icon: Box,
      badge: "Live 3D IFC",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      stats: "CDE Linked • LOD 350",
      accentColor: "from-indigo-600 to-violet-700",
    },
    {
      id: "spatial",
      title: "Spatial Evidence Map",
      subtitle: "Geospatial Canvas & RTK Benchmarks",
      description: "Minna Datum / UTM Zone 31N coordinates, ground control points (GCPs), Tersus GNSS RTK Rover telemetry, and multi-layer defect plotting.",
      href: "/inspector/dashboard/digital-eye/spatial",
      icon: MapPin,
      badge: "UTM Zone 31N",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      stats: spatialPoints ? `${spatialPoints.length} Plotted Points` : "RTK Fixed Fix",
      accentColor: "from-purple-600 to-fuchsia-700",
    },
    {
      id: "audit-vault",
      title: "Audit & SHA-256 Vault",
      subtitle: "Cryptographic Tamper-Evidence Ledger",
      description: "Immutable SHA-256 cryptographic seal verification, sensor file integrity audits, and statutory court-admissible certificate generation.",
      href: "/inspector/dashboard/digital-eye/audit-vault",
      icon: ShieldCheck,
      badge: "100% Sealed",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      stats: "Cryptographic Proofs",
      accentColor: "from-teal-600 to-cyan-700",
    },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#022C4F] via-[#033E6E] to-[#01182B] text-white p-7 sm:p-10 shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Hardware Integration Suite
              </span>
              <span className="text-xs font-mono text-white/50">v2.6 Enterprise</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Digital Eye Inspection Ecosystem
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Unified multi-modal field device integration terminal. Captures 3D LiDAR SLAM point clouds, ultrasonic pulse velocities, subsurface GPR radargrams, and GNSS RTK geospatial evidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={loadHubData}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              <span>Sync Telemetry</span>
            </button>
            <Link
              href="/inspector/dashboard/digital-eye/pundit?action=new"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
            >
              <Zap size={14} />
              <span>Record UPV Test</span>
            </Link>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] font-mono text-cyan-200 uppercase font-semibold">Active Instruments</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {onlineCount} <span className="text-xs font-normal text-white/60">/ {deviceCards.length} online</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] font-mono text-cyan-200 uppercase font-semibold">Recorded UPV Tests</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {punditTests ? punditTests.length : "—"}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] font-mono text-cyan-200 uppercase font-semibold">GPR Radargrams</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {gprScans ? gprScans.length : "—"}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] font-mono text-cyan-200 uppercase font-semibold">Geospatial Evidence</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {spatialPoints ? spatialPoints.length : "—"} <span className="text-xs font-normal text-white/60">points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Telemetry Fleet Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-[#022C4F]" />
            <h2 className="text-sm font-bold text-[#022C4F] uppercase tracking-wider">
              Connected Field Hardware Telemetry
            </h2>
          </div>
          <Link
            href="/inspector/dashboard/sync/devices"
            className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1"
          >
            <span>Manage Fleet</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {deviceCards.length > 0 ? (
            deviceCards.map((dev) => (
              <div
                key={dev.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 truncate">{dev.name}</span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${dev.online ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {dev.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono truncate">{dev.serial}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
                  <span>{dev.type}</span>
                  {dev.battery !== null && dev.battery !== undefined && (
                    <span className="font-mono font-bold text-slate-700">{dev.battery}% Batt</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-6 text-center text-xs text-slate-400 font-mono">
              Loading hardware telemetry registry...
            </div>
          )}
        </div>
      </div>

      {/* Main 6 Submodules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#022C4F] tracking-tight">
              Integrated Device Workspaces
            </h2>
            <p className="text-xs text-slate-500">
              Select an instrument pipeline to inspect waveforms, point clouds, or generate compliance certificates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBMODULES.map((sub) => {
            const Icon = sub.icon;
            return (
              <Link
                key={sub.id}
                href={sub.href}
                className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1"
              >
                {/* Subtle top accent gradient */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${sub.accentColor}`}
                />

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#022C4F] group-hover:scale-110 transition-transform">
                      <Icon size={24} className="text-[#022C4F]" />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${sub.badgeColor}`}
                    >
                      {sub.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#022C4F] group-hover:text-[#0284C7] transition-colors flex items-center gap-1.5">
                      <span>{sub.title}</span>
                      <ArrowUpRight
                        size={15}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </h3>
                    <div className="text-[11px] font-semibold text-slate-400 mb-2">
                      {sub.subtitle}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-bold text-slate-500">
                    {sub.stats}
                  </span>
                  <span className="font-bold text-[#022C4F] group-hover:text-[#0284C7] flex items-center gap-1 text-[11px]">
                    <span>Open Module</span>
                    <ChevronRight size={13} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DigitalEyeHubPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400 font-mono">
          Loading Digital Eye Hub...
        </div>
      }
    >
      <DigitalEyeHubContent />
    </Suspense>
  );
}
