"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Scan,
  Activity,
  Layers,
  Camera,
  Flame,
  Radio,
  Download,
  Share2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Compass,
  FileCode,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Sliders,
  Database,
  ArrowUpRight,
} from "lucide-react";
import { computeSHA256, enqueueSyncItem } from "@/lib/offline-sync";

interface ScanSessionRecord {
  id: string;
  name: string;
  location: string;
  pointsCount: string;
  fileSize: string;
  duration: string;
  driftError: string;
  sha256: string;
  status: "COMPLETED" | "SYNCED" | "PROCESSING";
  timestamp: string;
}

export default function TS1MvpScannerPage() {
  const [activeTab, setActiveTab] = useState<"LIVE_SLAM" | "DATASETS" | "SETTINGS">("LIVE_SLAM");
  const [isScanning, setIsScanning] = useState(false);
  const [scanPoints, setScanPoints] = useState(482190);
  const [pointDensity, setPointDensity] = useState(75);
  const [colorMode, setColorMode] = useState<"ELEVATION" | "INTENSITY" | "RGB" | "THERMAL">("ELEVATION");
  const [sliceHeight, setSliceHeight] = useState(2.8);
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [rtkFixStatus, setRtkFixStatus] = useState("RTK_FIXED");
  const [lastHash, setLastHash] = useState("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [scanHistory, setScanHistory] = useState<ScanSessionRecord[]>([
    {
      id: "TS1-SCAN-2026-004",
      name: "Level 4 Slab & Column Reinforcement",
      location: "Eko Atlantic Tower • Grid B2-E5",
      pointsCount: "1,428,900 pts",
      fileSize: "142 MB (LAS)",
      duration: "14m 22s",
      driftError: "±4.2 mm",
      sha256: "9a2f7c01b45de89f1092a832c9183b0f5e1284d720c24f61e7a5b3d90218fa22",
      status: "SYNCED",
      timestamp: "Today, 09:15 AM",
    },
    {
      id: "TS1-SCAN-2026-003",
      name: "Shear Wall SW-01 Verticality Inspection",
      location: "Eko Atlantic Tower • Core Zone 1",
      pointsCount: "980,450 pts",
      fileSize: "98 MB (LAS)",
      duration: "08m 45s",
      driftError: "±3.1 mm",
      sha256: "5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d",
      status: "SYNCED",
      timestamp: "Yesterday, 04:30 PM",
    },
    {
      id: "TS1-SCAN-2026-002",
      name: "Foundation Piles As-Built Deviation",
      location: "Eko Atlantic Tower • Sub-Basement",
      pointsCount: "2,150,000 pts",
      fileSize: "215 MB (E57)",
      duration: "21m 10s",
      driftError: "±6.5 mm",
      sha256: "b7e41982a1c034fe659d8213bfa401e95c47812ea03d154fae892c530189b741",
      status: "COMPLETED",
      timestamp: "15 Sep 2026",
    },
  ]);

  // Point Cloud Canvas Visualizer Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = 0;

    const render = () => {
      ctx.fillStyle = "#070E18";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = "rgba(14, 165, 233, 0.15)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const numPoints = Math.floor((pointDensity / 100) * 350);

      // Draw Simulated 3D LiDAR Point Cloud Rotated in Real Time
      for (let i = 0; i < numPoints; i++) {
        const radius = 60 + ((i * 19) % 180);
        const theta = (i * 0.15) + angle;
        const z = ((i * 7) % 140) - 70;

        // Perspective projection
        const projX = centerX + Math.cos(theta) * radius;
        const projY = centerY + Math.sin(theta) * (radius * 0.45) - z;

        if (projY < canvas.height && projY > 0) {
          // Color based on elevation or mode
          if (colorMode === "ELEVATION") {
            const hue = 180 + ((z + 70) / 140) * 140; // Cyan to Magenta
            ctx.fillStyle = `hsl(${hue}, 85%, 60%)`;
          } else if (colorMode === "THERMAL") {
            const hue = 30 + ((z + 70) / 140) * 60; // Orange to Yellow
            ctx.fillStyle = `hsl(${hue}, 95%, 55%)`;
          } else {
            ctx.fillStyle = "rgba(56, 189, 248, 0.85)";
          }

          const pointSize = Math.max(1, 2.5 - Math.abs(z) * 0.015);
          ctx.beginPath();
          ctx.arc(projX, projY, pointSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // SLAM Trajectory Track
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 20, 110, 45, angle * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Scanner Position Origin Marker
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(centerX, centerY + 20, 5, 0, Math.PI * 2);
      ctx.fill();

      // Laser Sweep Arc
      ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 20);
      ctx.arc(centerX, centerY + 20, 160, angle * 1.5, angle * 1.5 + 0.6);
      ctx.closePath();
      ctx.stroke();

      angle += isScanning ? 0.018 : 0.005;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isScanning, pointDensity, colorMode]);

  const handleStartStopScan = async () => {
    if (!isScanning) {
      setIsScanning(true);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message: "T-S1 LiDAR Survey started. Real-time SLAM tracking active.", type: "info" },
        })
      );
    } else {
      setIsScanning(false);
      const generatedHash = await computeSHA256(`TS1_POINTCLOUD_${Date.now()}_${scanPoints}`);
      setLastHash(generatedHash);

      const newScan: ScanSessionRecord = {
        id: `TS1-SCAN-${Date.now().toString().slice(-4)}`,
        name: "Level 4 North Column Grid Verification",
        location: "Eko Atlantic Tower • Grid D4",
        pointsCount: `${(scanPoints / 1000).toFixed(0)}k pts`,
        fileSize: "78 MB (LAS)",
        duration: "04m 12s",
        driftError: "±2.8 mm",
        sha256: generatedHash,
        status: "COMPLETED",
        timestamp: "Just now",
      };

      setScanHistory([newScan, ...scanHistory]);

      enqueueSyncItem({
        type: "TELEMETRY_LOG",
        title: `T-S1 LiDAR Point Cloud - ${newScan.name}`,
        payload: {
          pointsCount: scanPoints,
          driftError: newScan.driftError,
          hash: generatedHash,
        },
      });

      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message: "T-S1 Scan Completed & Cryptographically Stamped with SHA-256!", type: "success" },
        })
      );
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header & Sub-Navigation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-2">
            <Link href="/inspector/dashboard/digital-eye" className="hover:underline">Digital Eye</Link>
            <ChevronRight size={13} />
            <span>T-S1 MVP (Tersus LiDAR SLAM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight flex items-center gap-3">
            <Scan className="text-[#0284C7]" />
            Tersus T-S1 MVP Spatial Scanner
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Handheld 3D LiDAR SLAM, Panoramic 4K RGB, and Centimeter-Grade As-Built Spatial Capture.
          </p>
        </div>

        {/* Live Hardware Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>T-S1: ONLINE</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            <Radio size={14} className="text-blue-600" />
            <span>{rtkFixStatus} (8mm RMS)</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            <Activity size={14} className="text-[#022C4F]" />
            <span>Batt: {batteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* Main Viewport & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 3D Point Cloud Canvas Viewport */}
        <div className="lg:col-span-2 bg-[#070E18] rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Canvas HUD Overlay Top */}
          <div className="flex flex-wrap items-center justify-between gap-3 z-10 mb-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5">
                <Activity size={13} className="animate-spin text-cyan-400" />
                SLAM V3.4 • 600k pts/sec
              </span>
              <span className="text-xs font-mono text-slate-400">
                Live Points: <span className="text-white font-bold">{scanPoints.toLocaleString()}</span>
              </span>
            </div>

            {/* Visualizer Filters */}
            <div className="flex items-center gap-2">
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as any)}
                className="bg-slate-900/90 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
              >
                <option value="ELEVATION">Elevation Color Ramp</option>
                <option value="INTENSITY">LiDAR Intensity</option>
                <option value="THERMAL">Thermal Heatmap</option>
                <option value="RGB">Natural RGB</option>
              </select>

              <button
                type="button"
                onClick={() => setScanPoints((prev) => prev + 25000)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                title="Refresh Frame"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Canvas Element */}
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={800}
              height={420}
              className="w-full h-full object-cover rounded-2xl cursor-grab active:cursor-grabbing"
            />

            {/* Real-time Watermark */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-mono text-cyan-300 border border-cyan-500/20">
              Grid: Eko-Atl-L4 • Coordinate: 6.42812°N, 3.42191°E • Elevation: +14.22m
            </div>
          </div>

          {/* Canvas Bottom Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-800 z-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleStartStopScan}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  isScanning
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-[#0284C7] hover:bg-[#0369A1] text-white"
                }`}
              >
                {isScanning ? (
                  <>
                    <Square size={14} className="fill-white" />
                    <span>Stop & Seal Survey</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-white" />
                    <span>Start T-S1 SLAM Capture</span>
                  </>
                )}
              </button>

              <span className="text-xs text-slate-400 hidden sm:inline">
                {isScanning ? "Mapping active trajectory..." : "Ready to initialize scan session"}
              </span>
            </div>

            {/* Density Slider */}
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sliders size={13} className="text-cyan-400" />
              <span>Density:</span>
              <input
                type="range"
                min={20}
                max={100}
                value={pointDensity}
                onChange={(e) => setPointDensity(Number(e.target.value))}
                className="w-24 accent-cyan-400 cursor-pointer"
              />
              <span className="font-mono text-cyan-300">{pointDensity}%</span>
            </div>
          </div>
        </div>

        {/* Right Col: Scanner Control & Sensor Parameters */}
        <div className="space-y-6">
          {/* Multi-Sensor Payload Suite */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-[#022C4F] mb-4 flex items-center gap-2">
              <Layers size={16} className="text-[#0284C7]" />
              Integrated Sensor Telemetry
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-700">
                    <Scan size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#022C4F]">HESAI PandarXT LiDAR</p>
                    <p className="text-[11px] text-gray-500">32-Beam • 120m Range</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
                    <Camera size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#022C4F]">Dual 4K RGB Cameras</p>
                    <p className="text-[11px] text-gray-500">Panoramic Photogrammetry</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600">60 FPS</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                    <Flame size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#022C4F]">FLIR Boson Thermal</p>
                    <p className="text-[11px] text-gray-500">640x512 Radiometric</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600">28.4°C</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-xl text-cyan-700">
                    <Radio size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#022C4F]">Tersus RTK Base Link</p>
                    <p className="text-[11px] text-gray-500">Correction via NTRIP</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600">Fixed</span>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Seal Card */}
          <div className="bg-gradient-to-br from-[#022C4F] to-[#011C33] rounded-3xl p-6 text-white shadow-md border border-cyan-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-1.5">
                <ShieldCheck size={15} /> Cryptographic Seal
              </span>
              <span className="text-[10px] bg-cyan-400/20 text-cyan-200 px-2 py-0.5 rounded-full font-mono">
                SHA-256
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Every captured spatial point cloud is sealed with an immutable SHA-256 hash before syncing to the State Directorate.
            </p>

            <div className="p-3 bg-black/40 rounded-xl border border-white/10 font-mono text-[11px] text-cyan-200 break-all">
              {lastHash}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
              <span>Tamper Resistance:</span>
              <span className="text-emerald-400 font-bold">100% Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Point Cloud Sessions History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
              <Database size={18} className="text-[#0284C7]" />
              Captured T-S1 Point Cloud Datasets
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Immutable spatial records ready for BIM deviation analysis and inspection verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/inspector/dashboard/digital-eye/trimble"
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#022C4F] text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Analyze in BIM</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Session ID & Name</th>
                <th className="py-3 px-4">Points & Size</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Drift Error</th>
                <th className="py-3 px-4">SHA-256 Hash</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scanHistory.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#022C4F]">{scan.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{scan.id} • {scan.location}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium">
                    <p className="text-[#022C4F] font-bold">{scan.pointsCount}</p>
                    <p className="text-[11px] text-gray-500">{scan.fileSize}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{scan.duration}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">{scan.driftError}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    <span title={scan.sha256}>
                      {scan.sha256.substring(0, 10)}...{scan.sha256.substring(scan.sha256.length - 8)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {scan.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("show-toast", {
                            detail: { message: `Exporting ${scan.name} LAS file...`, type: "info" },
                          })
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#022C4F] transition-colors"
                      title="Download Point Cloud"
                    >
                      <Download size={15} />
                    </button>
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
