"use client";
import React from "react";
import { Layers, AlertCircle, Maximize2, Plus } from "lucide-react";

export default function ClashDetection() {
  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Clash Detection (BIM)</h1>
          <p className="text-gray-500 mt-1">Identify and assign multi-disciplinary model clashes.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-900/20">
          <Plus size={18} />
          <span className="font-medium">Run Clash Matrix</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl h-[600px] relative overflow-hidden flex flex-col">
          <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-white/10">
            <Layers size={16}/> 3D Viewer: Structural vs MEP
          </div>
          <button className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur text-white rounded-lg border border-white/10 hover:bg-white/20 transition-colors">
            <Maximize2 size={16}/>
          </button>
          
          <div className="flex-1 flex items-center justify-center flex-col text-slate-500">
            {/* Fake 3D Viewer Placeholder */}
            <div className="w-48 h-48 rounded-full border-4 border-rose-500/30 flex items-center justify-center animate-pulse mb-6 relative">
              <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 absolute -translate-x-8 translate-y-4"></div>
              <AlertCircle size={32} className="text-rose-500 z-10"/>
            </div>
            <p className="font-medium text-slate-300">WebGL Viewer Rendering...</p>
            <p className="text-sm mt-1">Highlighting Clash: Hard interference between Ducting and Concrete Beam</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-slate-50 font-bold text-gray-900 flex justify-between items-center">
            Identified Clashes
            <span className="bg-rose-100 text-rose-600 text-xs px-2 py-1 rounded-full">3 Active</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className={`p-4 rounded-xl border ${i===1 ? 'border-rose-300 bg-rose-50' : 'border-gray-100 hover:border-blue-200'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Clash {200+i}</span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 rounded-full">Hard Clash</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">MEP Pipe vs Structural Column</h4>
                <p className="text-xs text-gray-500 mb-3">Tolerance exceeded by 45mm. Z-Index: 12.4m</p>
                <button className="w-full py-1.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  Convert to Issue
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
