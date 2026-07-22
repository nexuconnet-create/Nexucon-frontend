"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Scan, Camera, Ruler, AlertTriangle, ChevronLeft, 
  Settings2, Activity, MapPin, X, CheckCircle2, QrCode
} from "lucide-react";

export default function ARIntegrationWorkflow() {
  const [activeTool, setActiveTool] = useState<string | null>("overlay");
  const [isSpatialAnchoring, setIsSpatialAnchoring] = useState(false);
  const [showDeviationPanel, setShowDeviationPanel] = useState(true);

  // Simulated live field deviations
  const [deviations, setDeviations] = useState([
    { id: "DEV-01", element: "Beam B3", issue: "Rebar spacing < 200mm limit", status: "FAIL", synced: false },
    { id: "DEV-02", element: "HVAC Duct D4", issue: "Clash with sprinkler pipe", status: "FAIL", synced: false },
    { id: "DEV-03", element: "Column C2", issue: "Alignment within tolerance", status: "PASS", synced: true },
  ]);

  const handleSyncTask = (id: string) => {
    setDeviations(prev => prev.map(d => d.id === id ? { ...d, synced: true } : d));
    // In a real app, this would trigger an API call to create a revision task
  };

  const tools = [
    { id: 'overlay', icon: Camera, label: 'Physical Site Overlay' },
    { id: 'anchor', icon: MapPin, label: 'Azure Spatial Anchors' },
    { id: 'qr', icon: QrCode, label: 'QR Model Alignment' },
    { id: 'measure', icon: Ruler, label: 'Point-to-Point Measurement' },
    { id: 'clash', icon: AlertTriangle, label: 'Deviation Clash Visualization' },
  ];

  return (
    <div className="fixed inset-0 z-[100] w-full h-screen bg-black animate-in fade-in duration-500 overflow-hidden">
      
      {/* Simulated Camera/AR View Background */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: "url('https://res.cloudinary.com/depeqzb6z/image/upload/v1784648022/3d-rendering-of-a-residential-building-on-transparent-background-png_y1ovmh.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: activeTool === 'overlay' ? "brightness(0.6) sepia(0.2)" : "none"
        }}
      />
      
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 h-16 bg-white/10 backdrop-blur-xl border-b border-white/20 z-30 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/professional/dashboard/workspace">
            <button className="p-2 rounded-full hover:bg-white/20 text-white transition-colors">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <div className="flex flex-col text-white">
            <h1 className="text-[16px] font-extrabold leading-tight flex items-center gap-2">
              <Scan size={16} className="text-green-400" /> SiteSupervise AR Inspection
            </h1>
            <span className="text-[11px] text-white/70 font-medium">Trimble XR10 Live Feed • Victoria Heights</span>
          </div>
        </div>
      </div>

      {/* Main AR UI Overlay */}
      <div className="relative w-full h-full mt-16 flex items-center justify-between pointer-events-none p-6">
        
        {/* Left Tools Palette */}
        <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex flex-col gap-4 shadow-2xl">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(isActive ? null : tool.id)}
                className={`p-3 rounded-xl transition-all group relative ${
                  isActive 
                    ? tool.id === 'clash' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
                    : 'text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-[11px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {tool.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Center Canvas Reticle / Visualizations */}
        <div className="flex-1 h-full relative flex items-center justify-center">
          {/* Alignment Reticle */}
          <div className="w-16 h-16 border-2 border-white/30 rounded-full flex items-center justify-center relative">
            <div className="w-1 h-4 bg-white/50 absolute top-0" />
            <div className="w-1 h-4 bg-white/50 absolute bottom-0" />
            <div className="w-4 h-1 bg-white/50 absolute left-0" />
            <div className="w-4 h-1 bg-white/50 absolute right-0" />
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          </div>

          {/* Simulated Point-to-Point Measurement */}
          {activeTool === 'measure' && (
            <div className="absolute top-1/3 left-1/4 w-64 h-px bg-yellow-400 rotate-12 flex items-center justify-center shadow-[0_0_8px_rgba(250,204,21,0.8)]">
              <div className="absolute left-0 w-3 h-3 bg-white rounded-full border-2 border-yellow-400 -translate-x-1/2" />
              <div className="absolute right-0 w-3 h-3 bg-white rounded-full border-2 border-yellow-400 translate-x-1/2" />
              <div className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full -translate-y-4">
                2.45m
              </div>
            </div>
          )}

          {/* Simulated Clash/Deviation Visualization */}
          {activeTool === 'clash' && (
            <div className="absolute top-[40%] right-[30%]">
              <div className="w-32 h-32 bg-red-500/20 border-2 border-red-500 animate-pulse rounded-lg relative">
                <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                  <AlertTriangle size={12} /> DEV-01
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right AR Deviation Sync Panel */}
        {showDeviationPanel && (
          <div className="pointer-events-auto w-[360px] h-full max-h-[700px] bg-white/95 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden shrink-0">
            
            <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-[14px] font-extrabold text-[#022C4F] flex items-center gap-2">
                <Activity size={18} className="text-blue-600" /> Live Inspection Sync
              </h3>
              <span className="flex items-center gap-1.5 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Connected
              </span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              <p className="text-[11px] text-gray-500 font-medium mb-2">
                Real-time deviations captured via Trimble XR10 on site. Sync FAIL items to create revision tasks for the engineering team.
              </p>

              {deviations.map((dev) => (
                <div key={dev.id} className={`p-4 rounded-2xl border transition-all ${
                  dev.status === 'FAIL' 
                    ? 'bg-red-50/50 border-red-200' 
                    : 'bg-green-50/50 border-green-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[12px] font-bold text-[#0F181F]">{dev.element}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      dev.status === 'FAIL' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {dev.status}
                    </span>
                  </div>
                  
                  <p className="text-[12px] text-gray-600 mb-4">{dev.issue}</p>
                  
                  {dev.status === 'FAIL' && !dev.synced && (
                    <button 
                      onClick={() => handleSyncTask(dev.id)}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle size={14} /> Create Revision Task
                    </button>
                  )}
                  {dev.status === 'FAIL' && dev.synced && (
                    <div className="w-full py-2 bg-gray-100 text-gray-500 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border border-gray-200">
                      <CheckCircle2 size={14} /> Task Created
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
