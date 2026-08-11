"use client";
import React from "react";
import { CheckCircle, ShieldCheck, Download, Award, Box } from "lucide-react";

export default function ApprovedBIM() {
  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Digitally Certified BIM Models</h1>
          <p className="text-gray-500 mt-1">Read-only, timestamped BIM models with official government approval stamps.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl h-[500px] relative overflow-hidden flex flex-col items-center justify-center border-4 border-emerald-500/20">
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm border border-emerald-500/30 flex items-center gap-2 font-bold backdrop-blur">
            <Award size={18}/> OFFICIALLY STAMPED & LOCKED
          </div>
          <Box size={64} className="text-emerald-500/50 mb-6"/>
          <p className="text-emerald-300/70 font-mono text-sm">WebGL Viewer: Certified IFC Model</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <ShieldCheck size={32}/>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Downtown Metro - Final</h2>
          <p className="text-sm text-gray-500 mb-6">IFC Model ID: MDL-8821A</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Status</span>
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={14}/> Certified</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Approved By</span>
              <span className="text-sm font-bold text-gray-900">Dir. O. Adeleke</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Timestamp</span>
              <span className="text-sm font-bold text-gray-900">Oct 12, 2026</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Hash Signature</span>
              <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 rounded">0x3f8a...c91</span>
            </div>
          </div>
          
          <button className="w-full mt-auto bg-[#022C4F] hover:bg-[#033c6c] text-white py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors">
            <Download size={18}/> Download Stamped Model
          </button>
        </div>
      </div>
    </div>
  );
}
