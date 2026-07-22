"use client";

import React, { useState } from "react";
import { 
  Box, Maximize, MousePointer2, Move, Ruler, 
  MessageSquare, AlertTriangle, Users, ChevronLeft, 
  Search, Video, CheckCircle2, Layers, SplitSquareHorizontal
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ModelViewerPage() {
  const [activeTool, setActiveTool] = useState("orbit");
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [federatedModels, setFederatedModels] = useState({
    architectural: true,
    structural: true,
    mep: false
  });

  const annotations = [
    { id: 1, user: "Sarah Chen", role: "Structural Eng.", text: "Check column C4 alignment with the beam.", time: "2m ago" },
    { id: 2, user: "David Johnson", role: "MEP Eng.", text: "HVAC duct clashes with lighting fixture here.", time: "15m ago" }
  ];

  const clashes = [
    { id: 1, type: "Hard Clash", elements: "Structural vs MEP", severity: "High", status: "Unresolved" },
    { id: 2, type: "Soft Clash", elements: "Architecture vs MEP", severity: "Medium", status: "In Progress" }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/professional/dashboard/workspace"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-[#022C4F]" />
          </Link>
          <div>
            <h1 className="text-[20px] font-extrabold text-[#022C4F] flex items-center gap-3">
              Victoria Heights - Master Model
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                Live Sync
              </span>
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">LOD 350 • Last updated: Just now</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2 mr-2">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative">
                <img src={`https://res.cloudinary.com/depeqzb6z/image/upload/v1779870104/user_n8222a.jpg`} alt="Active User" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-[#022C4F]">
              +2
            </div>
          </div>
          <Button 
            variant="outline" 
            className={`h-10 px-4 gap-2 transition-colors ${isCompareMode ? 'bg-[#022C4F] text-white' : 'border-[#022C4F] text-[#022C4F]'}`}
            onClick={() => setIsCompareMode(!isCompareMode)}
          >
            <SplitSquareHorizontal size={16} />
            Compare Versions
          </Button>
          <Button variant="outline" className="border-[#022C4F] text-[#022C4F] h-10 px-4 gap-2">
            <Video size={16} />
            Start Model Review
          </Button>
          <Button variant="primary" className="h-10 px-6">
            Export Issue Report
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 mt-6 gap-6 min-h-0">
        
        {/* 3D Viewer Area */}
        <div className="flex-1 bg-[#F5F7F9] rounded-3xl border border-gray-200 relative overflow-hidden flex items-center justify-center">
          
          {/* Placeholder for actual WebGL / ThreeJS / IFC.js canvas */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#022C4F 1px, transparent 1px), linear-gradient(90deg, #022C4F 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          {isCompareMode ? (
            <div className="absolute inset-0 flex">
              {/* Left View - Previous Version */}
              <div className="flex-1 border-r-2 border-red-500 relative">
                <img 
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784687425/3d-building-model-placeholder.png" 
                  alt="Version 3.0"
                  className="w-full h-full object-cover opacity-60 mix-blend-multiply drop-shadow-2xl"
                  style={{ filter: "sepia(20%) hue-rotate(-30deg)" }}
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-[12px] font-bold text-[#0F181F]">V3.0 (Previous)</span>
                </div>
                {/* Deletion Highlight */}
                <div className="absolute top-[50%] left-[30%] w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-lg animate-pulse" />
              </div>
              
              {/* Right View - Current Version */}
              <div className="flex-1 relative">
                <img 
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784687425/3d-building-model-placeholder.png" 
                  alt="Version 4.0"
                  className="w-full h-full object-cover opacity-80 mix-blend-multiply drop-shadow-2xl"
                  style={{ filter: "grayscale(20%) sepia(10%) hue-rotate(180deg)" }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-[12px] font-bold text-[#0F181F]">V4.0 (Current)</span>
                </div>
                {/* Addition Highlight */}
                <div className="absolute top-[50%] left-[30%] w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-lg animate-pulse" />
              </div>
              
              {/* Center Divider handle */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-400 cursor-ew-resize flex items-center justify-center -ml-[2px] z-10">
                <div className="w-6 h-12 bg-white border border-gray-300 rounded flex flex-col items-center justify-center gap-1 shadow-md">
                  <div className="w-0.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <div className="w-0.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <div className="w-0.5 h-1.5 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <img 
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784687425/3d-building-model-placeholder.png" 
                alt="3D Model"
                className="w-full h-full object-cover opacity-80 mix-blend-multiply drop-shadow-2xl"
                style={{ filter: "grayscale(20%) sepia(10%) hue-rotate(180deg)" }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h2 className="text-[#022C4F]/40 font-extrabold text-[40px] tracking-widest uppercase">Interactive 3D Viewer</h2>
              </div>
    
              {/* Model Pins/Annotations (Simulated) */}
              <div className="absolute top-[40%] left-[45%] flex flex-col items-center animate-bounce">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 cursor-pointer hover:scale-110 transition-transform">
                  <AlertTriangle size={16} />
                </div>
                <div className="w-1 h-12 bg-red-500 origin-top"></div>
              </div>
            </>
          )}

          <div className="absolute top-[60%] left-[30%] flex flex-col items-center">
            <div className="w-8 h-8 bg-[#022C4F] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#022C4F]/30 cursor-pointer hover:scale-110 transition-transform">
              <MessageSquare size={16} />
            </div>
            <div className="w-1 h-8 bg-[#022C4F] origin-top"></div>
          </div>

          {/* Viewer Toolbar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-white/50">
            <button onClick={() => setActiveTool('orbit')} className={`p-2.5 rounded-xl transition-colors ${activeTool === 'orbit' ? 'bg-[#022C4F] text-white' : 'text-[#022C4F] hover:bg-[#022C4F]/10'}`}>
              <Box size={20} />
            </button>
            <button onClick={() => setActiveTool('pan')} className={`p-2.5 rounded-xl transition-colors ${activeTool === 'pan' ? 'bg-[#022C4F] text-white' : 'text-[#022C4F] hover:bg-[#022C4F]/10'}`}>
              <Move size={20} />
            </button>
            <button onClick={() => setActiveTool('select')} className={`p-2.5 rounded-xl transition-colors ${activeTool === 'select' ? 'bg-[#022C4F] text-white' : 'text-[#022C4F] hover:bg-[#022C4F]/10'}`}>
              <MousePointer2 size={20} />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button onClick={() => setActiveTool('measure')} className={`p-2.5 rounded-xl transition-colors ${activeTool === 'measure' ? 'bg-[#022C4F] text-white' : 'text-[#022C4F] hover:bg-[#022C4F]/10'}`}>
              <Ruler size={20} />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button className="p-2.5 rounded-xl text-[#022C4F] hover:bg-[#022C4F]/10 transition-colors">
              <Maximize size={20} />
            </button>
          </div>
        </div>

        {/* Right Collaboration Panel */}
        <div className="w-[380px] shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-6">
          
          {/* Federated Models */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-extrabold text-[#022C4F] flex items-center gap-2">
                <Layers size={16} /> Federated Models
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                <input 
                  type="checkbox" 
                  checked={federatedModels.architectural}
                  onChange={(e) => setFederatedModels({...federatedModels, architectural: e.target.checked})}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
                />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#0F181F]">Architectural Model</span>
                  <span className="text-[11px] text-gray-500">V4.0 (Master)</span>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                <input 
                  type="checkbox" 
                  checked={federatedModels.structural}
                  onChange={(e) => setFederatedModels({...federatedModels, structural: e.target.checked})}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
                />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#0F181F]">Structural Model</span>
                  <span className="text-[11px] text-gray-500">V3.2 (Approved)</span>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                <input 
                  type="checkbox" 
                  checked={federatedModels.mep}
                  onChange={(e) => setFederatedModels({...federatedModels, mep: e.target.checked})}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
                />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#0F181F]">MEP Model</span>
                  <span className="text-[11px] text-gray-500">V2.6 (Under Review)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-extrabold text-[#022C4F] flex items-center gap-2">
                <Users size={16} /> Active Collaborators
              </h3>
              <span className="text-[12px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">5 Online</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img src={`https://res.cloudinary.com/depeqzb6z/image/upload/v1779870104/user_n8222a.jpg`} alt="User" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-[#0F181F]">Sarah Chen</p>
                  <p className="text-[11px] text-gray-500">Structural Eng. • Editing level 4</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <img src={`https://res.cloudinary.com/depeqzb6z/image/upload/v1779870104/user_n8222a.jpg`} alt="User" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-[#0F181F]">David Johnson</p>
                  <p className="text-[11px] text-gray-500">MEP Eng. • Viewing Master Model</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clash Detection */}
          <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -z-10" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-extrabold text-[#022C4F] flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" /> Clash Detection
              </h3>
              <span className="text-[12px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">2 Issues</span>
            </div>
            
            <div className="flex flex-col gap-3">
              {clashes.map(clash => (
                <div key={clash.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-red-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[13px] font-bold text-[#0F181F]">{clash.type}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-1.5 py-0.5 rounded">{clash.severity}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mb-2">{clash.elements}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-orange-500">{clash.status}</span>
                    <button className="text-[11px] font-bold text-[#022C4F] hover:underline">Focus in View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Annotations & Comments */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-[15px] font-extrabold text-[#022C4F] flex items-center gap-2">
                <MessageSquare size={16} /> Model Annotations
              </h3>
            </div>
            
            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {annotations.map(note => (
                <div key={note.id} className="flex gap-3 cursor-pointer group">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[12px]">
                    {note.user.charAt(0)}
                  </div>
                  <div className="flex flex-col flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none border border-gray-100 group-hover:border-[#022C4F]/30 transition-colors">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[12px] font-bold text-[#0F181F]">{note.user}</span>
                      <span className="text-[10px] text-gray-400">{note.time}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 mb-2">{note.role}</span>
                    <p className="text-[13px] text-gray-700 leading-relaxed">{note.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Pin a comment to the model..." 
                  className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-300 text-[13px] focus:outline-none focus:border-[#022C4F]"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#022C4F] text-white flex items-center justify-center">
                  <MessageSquare size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
