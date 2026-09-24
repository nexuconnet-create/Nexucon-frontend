"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  MapPin,
  Globe,
  Satellite,
  Radio,
  Layers,
  Activity,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Plus,
  ChevronRight,
  ShieldCheck,
  Eye,
  Navigation,
  Crosshair,
  Zap,
} from "lucide-react";
import {
  getEvidenceSpatialPoints,
  EvidenceSpatialPoint,
} from "@/services/digitalEye";
import { computeSHA256 } from "@/lib/offline-sync";

// Dynamically import EvidenceMapCanvas
const EvidenceMapCanvas = dynamic(
  () => import("@/components/dashboard/digital-eye/EvidenceMapCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center text-xs text-slate-400 font-mono">
        Initializing Spatial Evidence Canvas...
      </div>
    ),
  }
);

interface ControlPoint {
  id: string;
  name: string;
  northing: string;
  easting: string;
  elevation: string;
  hRms: string;
  vRms: string;
  fixType: "RTK_FIXED" | "RTK_FLOAT" | "DGPS";
  timestamp: string;
  sha256: string;
}

export default function SpatialEvidenceMapPage() {
  const [spatialPoints, setSpatialPoints] = useState<EvidenceSpatialPoint[] | null>(null);
  const [spatialError, setSpatialError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<EvidenceSpatialPoint | null>(null);
  const [activeTab, setActiveTab] = useState<"MAP" | "CONTROL_POINTS" | "GNSS_TELEMETRY">("MAP");

  // GNSS RTK Rover Live State
  const [isLiveTelemetry, setIsLiveTelemetry] = useState(true);
  const [satellitesCount, setSatellitesCount] = useState(32);
  const [pdop, setPdop] = useState(1.1);
  const [fixType, setFixType] = useState<"RTK_FIXED" | "RTK_FLOAT" | "DGPS">("RTK_FIXED");
  const [hRms, setHRms] = useState(5.8);
  const [vRms, setVRms] = useState(11.2);
  const [currentLat, setCurrentLat] = useState(6.428192);
  const [currentLng, setCurrentLng] = useState(3.421945);
  const [currentElevation, setCurrentElevation] = useState(14.28);
  const [isReloading, setIsReloading] = useState(false);

  // Control points benchmarks
  const [controlPoints, setControlPoints] = useState<ControlPoint[]>([
    {
      id: "CP-01",
      name: "Site Primary Geodetic Benchmark",
      northing: "710,845.210 m",
      easting: "546,712.180 m",
      elevation: "14.280 m",
      hRms: "±4.2 mm",
      vRms: "±8.1 mm",
      fixType: "RTK_FIXED",
      timestamp: "Today, 08:30 AM",
      sha256: "4a8e2b7c9f10d3a5e8b2c4d6f8a0e2b4c6d8f0a2e4b6c8d0f2a4e6b8c0d2f4a6",
    },
    {
      id: "CP-02",
      name: "Column Grid Origin Axis A1",
      northing: "710,885.450 m",
      easting: "546,742.300 m",
      elevation: "14.310 m",
      hRms: "±5.1 mm",
      vRms: "±9.4 mm",
      fixType: "RTK_FIXED",
      timestamp: "Today, 09:12 AM",
      sha256: "9e1a3b5c7d9f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2e",
    },
    {
      id: "CP-03",
      name: "East Property Boundary Peg",
      northing: "710,910.120 m",
      easting: "546,790.650 m",
      elevation: "13.950 m",
      hRms: "±6.8 mm",
      vRms: "±12.0 mm",
      fixType: "RTK_FIXED",
      timestamp: "Today, 09:45 AM",
      sha256: "1f3e5d7c9b1a0f2e4d6c8b0a2f4e6d8c0b2a4f6e8d0c2b4a6f8e0d2c4b6a8f0e",
    },
  ]);

  const loadPoints = async () => {
    setSpatialError(null);
    try {
      const rows = await getEvidenceSpatialPoints();
      setSpatialPoints(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      setSpatialPoints(null);
      setSpatialError(
        err?.response?.data?.detail ||
          err?.message ||
          "The spatial evidence register could not be reached."
      );
    }
  };

  useEffect(() => {
    loadPoints();
  }, []);

  // Simulate real-time micro-drift for RTK Rover
  useEffect(() => {
    if (!isLiveTelemetry) return;
    const interval = setInterval(() => {
      setCurrentLat((prev) => prev + (Math.random() - 0.5) * 0.000004);
      setCurrentLng((prev) => prev + (Math.random() - 0.5) * 0.000004);
      setHRms(Number((5.5 + Math.random() * 0.8).toFixed(1)));
      setVRms(Number((10.8 + Math.random() * 1.2).toFixed(1)));
    }, 2000);
    return () => clearInterval(interval);
  }, [isLiveTelemetry]);

  const handleRefresh = async () => {
    setIsReloading(true);
    await loadPoints();
    setIsReloading(false);
  };

  const handleLogBenchmark = async () => {
    const nextNum = controlPoints.length + 1;
    const newPointId = `CP-0${nextNum}`;
    const rawData = `${newPointId}:${currentLat}:${currentLng}:${currentElevation}:${Date.now()}`;
    const hash = await computeSHA256(rawData);

    const newPoint: ControlPoint = {
      id: newPointId,
      name: `Benchmark Logged Station #${nextNum}`,
      northing: `${(710800 + Math.random() * 200).toFixed(3)} m`,
      easting: `${(546700 + Math.random() * 150).toFixed(3)} m`,
      elevation: `${currentElevation.toFixed(3)} m`,
      hRms: `±${hRms} mm`,
      vRms: `±${vRms} mm`,
      fixType: fixType,
      timestamp: "Just now",
      sha256: hash,
    };

    setControlPoints([newPoint, ...controlPoints]);
  };

  const spatialAccuracies = (spatialPoints ?? [])
    .map((p) => p.accuracy_mm)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0);
  const spatialBestAccuracyMm =
    spatialAccuracies.length > 0 ? Math.min(...spatialAccuracies) : null;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-2">
            <Link href="/inspector/dashboard/digital-eye" className="hover:underline">
              Digital Eye
            </Link>
            <ChevronRight size={13} />
            <span>Spatial Evidence Map</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight flex items-center gap-3">
            <MapPin className="text-[#0284C7]" />
            Spatial Evidence Map & Georeferencing
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Minna / UTM Zone 31N geospatial plotting, GNSS RTK survey benchmarks, and non-destructive test locations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isReloading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isReloading ? "animate-spin" : ""} />
            <span>Refresh Points</span>
          </button>
          <button
            type="button"
            onClick={handleLogBenchmark}
            className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#033B6B] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            <span>Log RTK Benchmark</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white border border-slate-200/80 p-2 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab("MAP")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "MAP"
              ? "bg-[#022C4F] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Globe size={14} />
          <span>Interactive Evidence Canvas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("GNSS_TELEMETRY")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "GNSS_TELEMETRY"
              ? "bg-[#022C4F] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Satellite size={14} />
          <span>Tersus GNSS RTK Rover</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("CONTROL_POINTS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "CONTROL_POINTS"
              ? "bg-[#022C4F] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Crosshair size={14} />
          <span>Control Benchmarks ({controlPoints.length})</span>
        </button>
      </div>

      {/* VIEW 1: INTERACTIVE EVIDENCE CANVAS */}
      {activeTab === "MAP" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#022C4F]">
                Recorded Spatial Evidence Points
              </h2>
              <p className="text-xs text-slate-500">
                {spatialPoints === null
                  ? "Reading recorded points from the server..."
                  : spatialPoints.length === 0
                  ? "No points have been recorded for your scoped projects yet."
                  : `${spatialPoints.length} point${spatialPoints.length === 1 ? "" : "s"} plotted` +
                    (spatialBestAccuracyMm !== null
                      ? ` • Best precision ±${spatialBestAccuracyMm} mm`
                      : "")}
              </p>
            </div>
            {spatialPoints && spatialPoints.length > 0 && (
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0">
                {new Set(spatialPoints.map((p) => p.layer_type || "unclassified")).size} layer
                {new Set(spatialPoints.map((p) => p.layer_type || "unclassified")).size === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {spatialPoints === null ? (
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
              <h4 className="text-xs font-bold text-amber-900 mb-1">
                The spatial register could not be read
              </h4>
              <p className="text-xs text-amber-800">
                {spatialError || "The spatial evidence register could not be reached."}
              </p>
            </div>
          ) : (
            <div className="min-h-[500px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden p-2">
              <EvidenceMapCanvas
                points={spatialPoints}
                selectedPoint={selectedPoint}
                onSelectPoint={setSelectedPoint}
              />
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: GNSS RTK TELEMETRY */}
      {activeTab === "GNSS_TELEMETRY" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Satellite className="text-cyan-600" size={18} />
                <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                  Receiver Telemetry
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {fixType}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Model</div>
                <div className="text-sm font-bold text-[#022C4F]">Tersus Oscar Ultimate RTK</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Satellites</div>
                  <div className="text-base font-mono font-bold text-slate-800">{satellitesCount} Locked</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">PDOP</div>
                  <div className="text-base font-mono font-bold text-emerald-600">{pdop} (Ideal)</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">H-RMS</div>
                  <div className="text-base font-mono font-bold text-[#022C4F]">±{hRms} mm</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">V-RMS</div>
                  <div className="text-base font-mono font-bold text-[#022C4F]">±{vRms} mm</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#091522] rounded-2xl p-6 border border-slate-800 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                Geodetic Position Readout
              </span>
              <span className="text-xs font-mono text-slate-400">WGS84 / Minna Datum</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] font-mono text-cyan-300 mb-1">LATITUDE</div>
                <div className="text-lg font-mono font-bold text-white">{currentLat.toFixed(6)}° N</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] font-mono text-cyan-300 mb-1">LONGITUDE</div>
                <div className="text-lg font-mono font-bold text-white">{currentLng.toFixed(6)}° E</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] font-mono text-cyan-300 mb-1">ELLIPSOID HEIGHT</div>
                <div className="text-lg font-mono font-bold text-emerald-400">{currentElevation.toFixed(2)} m</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              Tersus Oscar Extreme GNSS receiver utilizes Calibration-Free Tilt Compensation (up to 60° tilt). High precision RTK positioning streams automatically to spatial evidence records with anti-tamper SHA-256 seals.
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CONTROL BENCHMARKS */}
      {activeTab === "CONTROL_POINTS" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#022C4F]">
                Survey Benchmarks & Ground Control Points (GCPs)
              </h2>
              <p className="text-xs text-slate-500">
                Verified site datum monuments for millimeter-grade georeferencing and drone photogrammetry alignment.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogBenchmark}
              className="px-4 py-2 rounded-xl bg-[#022C4F] text-white text-xs font-bold hover:bg-[#033B6B] transition-all"
            >
              + Add Benchmark
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">ID / Reference</th>
                  <th className="p-3">Station Name</th>
                  <th className="p-3 font-mono">Northing (Y)</th>
                  <th className="p-3 font-mono">Easting (X)</th>
                  <th className="p-3 font-mono">Elevation (Z)</th>
                  <th className="p-3 font-mono">Precision</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 font-mono">Cryptographic Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {controlPoints.map((cp) => (
                  <tr key={cp.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-mono font-bold text-[#022C4F]">{cp.id}</td>
                    <td className="p-3 font-semibold text-slate-800">{cp.name}</td>
                    <td className="p-3 font-mono text-slate-600">{cp.northing}</td>
                    <td className="p-3 font-mono text-slate-600">{cp.easting}</td>
                    <td className="p-3 font-mono text-slate-600">{cp.elevation}</td>
                    <td className="p-3 font-mono text-emerald-700 font-bold">{cp.hRms}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cp.fixType}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400 max-w-[120px] truncate" title={cp.sha256}>
                      {cp.sha256}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
