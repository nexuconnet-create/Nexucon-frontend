"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Satellite,
  Radio,
  MapPin,
  Activity,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Plus,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Navigation,
} from "lucide-react";
import { computeSHA256, enqueueSyncItem } from "@/lib/offline-sync";

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

export default function GnssPage() {
  const [isLive, setIsLive] = useState(true);
  const [satellitesCount, setSatellitesCount] = useState(32);
  const [pdop, setPdop] = useState(1.1);
  const [fixType, setFixType] = useState<"RTK_FIXED" | "RTK_FLOAT" | "DGPS">("RTK_FIXED");
  const [hRms, setHRms] = useState(5.8);
  const [vRms, setVRms] = useState(11.2);
  const [currentLat, setCurrentLat] = useState(6.428192);
  const [currentLng, setCurrentLng] = useState(3.421945);
  const [currentElevation, setCurrentElevation] = useState(14.28);

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

  // Simulate real-time micro-drift
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setCurrentLat((prev) => prev + (Math.random() - 0.5) * 0.000004);
      setCurrentLng((prev) => prev + (Math.random() - 0.5) * 0.000004);
      setHRms(Number((5.5 + Math.random() * 0.8).toFixed(1)));
      setVRms(Number((10.8 + Math.random() * 1.2).toFixed(1)));
    }, 2000);
    return () => clearInterval(interval);
  }, [isLive]);

  const handleLogBenchmark = async () => {
    const nextNum = controlPoints.length + 1;
    const id = `CP-0${nextNum}`;
    const rawData = `GNSS_${id}_${currentLat}_${currentLng}_${Date.now()}`;
    const hash = await computeSHA256(rawData);

    const newPoint: ControlPoint = {
      id,
      name: `Site Control Monument #${nextNum}`,
      northing: `${(710800 + nextNum * 35).toFixed(3)} m`,
      easting: `${(546700 + nextNum * 28).toFixed(3)} m`,
      elevation: `${currentElevation.toFixed(3)} m`,
      hRms: `±${hRms} mm`,
      vRms: `±${vRms} mm`,
      fixType,
      timestamp: "Just now",
      sha256: hash,
    };

    setControlPoints([newPoint, ...controlPoints]);

    enqueueSyncItem({
      type: "TELEMETRY_LOG",
      title: `GNSS Control Benchmark ${id}`,
      payload: { ...newPoint },
    });

    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: {
          message: `Control Benchmark ${id} logged with ±${hRms}mm RTK accuracy!`,
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
            <Link href="/inspector/dashboard/digital-eye/ts-1" className="hover:underline">Digital Eye</Link>
            <ChevronRight size={13} />
            <span>Tersus GNSS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight flex items-center gap-3">
            <Satellite className="text-[#0284C7]" />
            Tersus GNSS Geodetic Positioning
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Centimeter-accurate RTK site control, multi-constellation satellite tracking, and geodetic reference monuments.
          </p>
        </div>

        {/* RTK Live Status & Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>RTK FIX: 32 SATS</span>
          </div>

          <button
            type="button"
            onClick={handleLogBenchmark}
            className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#033B6B] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>Log RTK Benchmark Point</span>
          </button>
        </div>
      </div>

      {/* Main GNSS Telemetry Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Geodetic Radar & Coordinate Readout */}
        <div className="lg:col-span-2 bg-[#08121F] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                ROVER RECEIVER TELEMETRY
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                Tersus Oscar Ultimate RTK
              </h2>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                NTRIP: <strong className="text-emerald-400">CONNECT-LAG-01</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Base Dist: <strong className="text-white">1.42 km</strong>
              </span>
            </div>
          </div>

          {/* Large Coordinate Readout Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Latitude (WGS84)</span>
              <p className="text-xl font-mono font-bold text-cyan-300 mt-1">
                {currentLat.toFixed(6)}° N
              </p>
              <span className="text-[10px] text-gray-500 font-mono">Precision: ±{hRms} mm</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Longitude (WGS84)</span>
              <p className="text-xl font-mono font-bold text-cyan-300 mt-1">
                {currentLng.toFixed(6)}° E
              </p>
              <span className="text-[10px] text-gray-500 font-mono">Precision: ±{hRms} mm</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Ellipsoid Elevation</span>
              <p className="text-xl font-mono font-bold text-emerald-400 mt-1">
                +{currentElevation.toFixed(2)} m
              </p>
              <span className="text-[10px] text-gray-500 font-mono">Vertical: ±{vRms} mm</span>
            </div>
          </div>

          {/* Simulated Geodetic Polar Skyplot */}
          <div className="relative w-full h-[260px] rounded-2xl bg-[#040911] border border-slate-800 flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 500 240">
              {/* Concentric Elevation Rings */}
              <circle cx="250" cy="120" r="100" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" fill="none" />
              <circle cx="250" cy="120" r="65" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" fill="none" />
              <circle cx="250" cy="120" r="30" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" fill="none" />

              {/* Crosshairs */}
              <line x1="150" y1="120" x2="350" y2="120" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />
              <line x1="250" y1="20" x2="250" y2="220" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />

              {/* Polar Compass Labels */}
              <text x="245" y="15" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">N</text>
              <text x="355" y="123" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">E</text>
              <text x="246" y="235" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">S</text>
              <text x="135" y="123" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">W</text>

              {/* Satellites in View (GPS, Galileo, GLONASS, BeiDou) */}
              {[
                { x: 220, y: 70, name: "G14", c: "#22C55E" },
                { x: 280, y: 80, name: "E08", c: "#38BDF8" },
                { x: 210, y: 150, name: "R03", c: "#F59E0B" },
                { x: 290, y: 160, name: "B21", c: "#A855F7" },
                { x: 190, y: 100, name: "G29", c: "#22C55E" },
                { x: 310, y: 110, name: "B33", c: "#A855F7" },
                { x: 245, y: 50, name: "E12", c: "#38BDF8" },
              ].map((sat) => (
                <g key={sat.name} transform={`translate(${sat.x}, ${sat.y})`}>
                  <circle cx="0" cy="0" r="4" fill={sat.c} />
                  <text x="7" y="3" fill="#FFFFFF" fontSize="9" fontFamily="monospace">{sat.name}</text>
                </g>
              ))}

              {/* Rover Center Pin */}
              <circle cx="250" cy="120" r="5" fill="#EF4444" />
              <circle cx="250" cy="120" r="9" stroke="#EF4444" strokeWidth="1.5" fill="none" className="animate-ping" opacity="0.6" />
            </svg>

            {/* Satellite Constellation Legend */}
            <div className="absolute bottom-3 right-3 flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-black/60 px-3 py-1.5 rounded-lg">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> GPS (10)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Galileo (8)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> GLONASS (6)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> BeiDou (8)</span>
            </div>
          </div>
        </div>

        {/* Right Col: GNSS Status & Quality Gauges */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
              <Activity size={16} className="text-[#0284C7]" />
              RTK Precision Metrics
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <span className="text-gray-500 font-medium">PDOP (Geometric Dilution)</span>
                <span className="font-mono font-bold text-emerald-600">{pdop} (Ideal &lt; 2.0)</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <span className="text-gray-500 font-medium">Horizontal Accuracy</span>
                <span className="font-mono font-bold text-emerald-600">±{hRms} mm</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <span className="text-gray-500 font-medium">Vertical Accuracy</span>
                <span className="font-mono font-bold text-emerald-600">±{vRms} mm</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <span className="text-gray-500 font-medium">RTK Correction Latency</span>
                <span className="font-mono font-bold text-[#022C4F]">0.8 sec</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <span className="text-gray-500 font-medium">Coordinate System</span>
                <span className="font-mono font-bold text-[#022C4F]">Minna / UTM Zone 31N</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-[#022C4F] rounded-3xl p-6 text-white shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
              <ShieldCheck size={16} />
              <span>Surveyor Integrity Seal</span>
            </div>
            <p className="text-xs text-blue-100">
              Each recorded benchmark is automatically stamped with geodetic satellite time and client-side SHA-256 for court-admissible site verification.
            </p>
          </div>
        </div>
      </div>

      {/* Control Points Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
              <MapPin size={18} className="text-[#0284C7]" />
              Site Geodetic Control Benchmarks
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Approved ground control points for structural alignment and SLAM trajectory anchoring.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("show-toast", {
                  detail: { message: "Exporting GNSS Survey Points (CSV/LandXML)...", type: "info" },
                })
              )
            }
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Export LandXML / CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Point ID</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Northing (Y)</th>
                <th className="py-3 px-4">Easting (X)</th>
                <th className="py-3 px-4">Elevation (Z)</th>
                <th className="py-3 px-4">Horiz RMS</th>
                <th className="py-3 px-4">SHA-256 Hash</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {controlPoints.map((cp) => (
                <tr key={cp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#022C4F]">{cp.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{cp.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{cp.northing}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{cp.easting}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{cp.elevation}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{cp.hRms}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    <span title={cp.sha256}>
                      {cp.sha256.substring(0, 8)}...{cp.sha256.substring(cp.sha256.length - 6)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      FIXED
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
