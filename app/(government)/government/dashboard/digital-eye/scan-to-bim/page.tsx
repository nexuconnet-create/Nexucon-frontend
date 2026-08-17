"use client";

import React, { useState } from "react";
import {
  Box,
  Layers,
  Settings,
  Eye,
  Maximize,
  Download,
  AlertTriangle,
  MapPin,
  CheckCircle,
  Crosshair
} from "lucide-react";

export default function ScanToBIMPage() {
  const [selectedScan, setSelectedScan] = useState("SCN-2026-042");

  return (
    <div className="w-full h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Box className="text-blue-600" size={32} />
            Scan-to-BIM Comparison
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-[#022C4F] rounded-xl hover:bg-slate-50 transition-colors font-medium flex items-center gap-2 shadow-sm">
            <Download size={18} /> Export Alignment Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        {/* Left Panel - Controls & Selection */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-[#022C4F] mb-4 flex items-center gap-2">
              <Layers size={18} /> Overlay Selection
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">BIM Model (IFC)</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none">
                  <option>Eko_Atlantic_Tower_v4.ifc</option>
                  <option>Eko_Atlantic_Tower_v3.ifc</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">SLAM Point Cloud</label>
                <select
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none"
                  value={selectedScan}
                  onChange={(e) => setSelectedScan(e.target.value)}
                >
                  <option value="SCN-2026-042">SCN-2026-042 (Today, 09:15 AM)</option>
                  <option value="SCN-2026-041">SCN-2026-041 (Yesterday, 14:30 PM)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1">
            <h3 className="font-bold text-[#022C4F] mb-4 flex items-center gap-2">
              <Settings size={18} /> Display Controls
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500">BIM Opacity</label>
                  <span className="text-xs font-medium text-slate-400">40%</span>
                </div>
                <input type="range" className="w-full accent-blue-600" defaultValue="40" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500">Scan Opacity (Points)</label>
                  <span className="text-xs font-medium text-slate-400">100%</span>
                </div>
                <input type="range" className="w-full accent-blue-600" defaultValue="100" />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Crosshair size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">GNSS Lock (±2cm)</span>
                  </div>
                  <CheckCircle size={16} className="text-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">
                  Coordinates anchored via Tersus MVP S1
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - 3D Viewer Mockup */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl overflow-hidden relative shadow-lg flex flex-col border border-slate-800">
          {/* Viewer Toolbar */}
          <div className="p-3 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between z-10">
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded transition-colors">Top</button>
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded transition-colors">Front</button>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors">Isometric</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> BIM Model
                <span className="w-2 h-2 rounded-full bg-blue-400 ml-2"></span> SLAM Scan
              </div>
              <button className="text-slate-400 hover:text-white transition-colors">
                <Maximize size={18} />
              </button>
            </div>
          </div>

          {/* 3D Canvas Placeholder */}
          <div className="flex-1 relative flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            {/* Mock overlay visualization */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-blue-900/20"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-64 h-64 border-4 border-blue-500/30 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center relative">
                <div className="w-48 h-48 border-4 border-emerald-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Box size={48} className="text-slate-600/50" />
                </div>
              </div>
              <div className="mt-6 bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700 backdrop-blur-md">
                <p className="text-sm text-blue-300 font-mono flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Rendering Point Cloud (1.2M points)
                </p>
              </div>
            </div>

            {/* Simulated Tooltips */}
            <div className="absolute top-1/3 left-1/4 bg-slate-800/90 border border-slate-600 text-white px-3 py-2 rounded shadow-xl text-xs font-mono">
              X: 53241.12<br />Y: 12093.88<br />Z: 14.50
            </div>
            <div className="absolute bottom-1/3 right-1/4 bg-red-900/90 border border-red-500 text-white px-3 py-2 rounded shadow-xl text-xs flex items-start gap-2">
              <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block">Deviation Detected</span>
                Column C4 alignment +45mm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
