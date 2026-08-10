"use client";

import React from "react";
import {
  Map,
  Download,
  AlertTriangle,
  ArrowUpRight,
  Maximize,
  Layers,
  Thermometer
} from "lucide-react";

export default function DeviationHeatmapPage() {
  const hotspots = [
    { id: "HS-01", location: "Level 4, Column C4", deviation: "+45mm", severity: "critical", type: "Verticality" },
    { id: "HS-02", location: "Level 4, Beam B2", deviation: "-22mm", severity: "high", type: "Deflection" },
    { id: "HS-03", location: "Level 3, Slab S1", deviation: "+12mm", severity: "medium", type: "Flatness" },
    { id: "HS-04", location: "Level 4, Wall W1", deviation: "+18mm", severity: "medium", type: "Alignment" },
  ];

  return (
    <div className="w-full h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Map className="text-orange-500" size={32} />
            Deviation Heatmap
          </h1>
          <p className="text-gray-500 mt-1">
            Visual analysis of geometric variance between SLAM point cloud and BIM model.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors font-medium flex items-center gap-2 shadow-sm">
            <Download size={18} /> Export PDF Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        {/* Left Panel - Legend & Hotspots */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-[#022C4F] mb-4 flex items-center gap-2">
              <Thermometer size={18} /> Tolerance Legend
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-500"></div>
                  <span className="text-sm text-slate-600 font-medium">In Tolerance</span>
                </div>
                <span className="text-xs font-bold text-slate-400">±5mm</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-400"></div>
                  <span className="text-sm text-slate-600 font-medium">Minor Variance</span>
                </div>
                <span className="text-xs font-bold text-slate-400">±15mm</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500"></div>
                  <span className="text-sm text-slate-600 font-medium">Major Variance</span>
                </div>
                <span className="text-xs font-bold text-slate-400">±20mm</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-600 animate-pulse"></div>
                  <span className="text-sm text-slate-600 font-medium">Critical</span>
                </div>
                <span className="text-xs font-bold text-slate-400">20mm</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Global Tolerance Threshold</label>
              <input type="range" className="w-full accent-orange-500" defaultValue="15" min="1" max="50" />
              <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
                <span>1mm</span>
                <span>±15mm</span>
                <span>50mm</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1">
            <h3 className="font-bold text-[#022C4F] mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> Critical Hotspots
            </h3>
            <div className="space-y-3">
              {hotspots.map((spot) => (
                <div key={spot.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-500">{spot.id}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase
                      ${spot.severity === 'critical' ? 'bg-red-100 text-red-700' : ''}
                      ${spot.severity === 'high' ? 'bg-orange-100 text-orange-700' : ''}
                      ${spot.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                    `}>
                      {spot.deviation}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">{spot.location}</p>
                  <p className="text-xs text-slate-500 mt-1">{spot.type} Error</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Heatmap Viewer Mockup */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl overflow-hidden relative shadow-lg flex flex-col border border-slate-800">
          {/* Viewer Toolbar */}
          <div className="p-3 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between z-10">
            <div className="flex gap-2">
              <select className="bg-slate-700 text-white text-xs font-medium rounded px-2 py-1.5 outline-none">
                <option>Floor Plan View</option>
                <option>Elevation View</option>
                <option>Section Box</option>
              </select>
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded transition-colors"><Layers size={14} /></button>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-slate-400 hover:text-white transition-colors">
                <Maximize size={18} />
              </button>
            </div>
          </div>

          {/* Heatmap Canvas Placeholder */}
          <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 z-0"></div>

            {/* Mock Floorplan structure */}
            <div className="relative z-10 w-3/4 h-3/4 border-2 border-slate-700 grid grid-cols-4 grid-rows-3 gap-1 p-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border border-slate-600 relative overflow-hidden group">
                  {/* Base Green/In-Tolerance */}
                  <div className="absolute inset-0 bg-emerald-500/20"></div>

                  {/* Simulated Hotspots */}
                  {i === 2 && <div className="absolute inset-0 bg-gradient-to-br from-red-500/80 to-transparent animate-pulse"></div>}
                  {i === 5 && <div className="absolute inset-0 bg-gradient-to-tl from-yellow-400/60 to-transparent"></div>}
                  {i === 10 && <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-orange-500/70 blur-md"></div>}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/50 backdrop-blur-sm">
                    <span className="text-white text-[10px] font-mono">Zone {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 left-4 bg-slate-800/90 border border-slate-600 text-white px-3 py-2 rounded shadow-xl text-xs font-mono">
              Heatmap Scale: 1px = 10mm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
