"use client";
import React from "react";
import { Activity, AlertTriangle, ShieldAlert, FileText, Download, TrendingDown } from "lucide-react";

export default function StructuralRiskIndex() {
  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Structural Risk Index & Reports</h1>
          <p className="text-gray-500 mt-1">AI-driven risk scoring to predict building collapse probabilities.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
          <Download size={18} />
          <span className="font-medium">Export Leadership Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20"><ShieldAlert size={120}/></div>
          <h3 className="font-medium text-rose-100">Critical Risk Projects</h3>
          <div className="text-5xl font-black mt-2">2</div>
          <p className="text-sm text-rose-200 mt-4 flex items-center gap-1"><AlertTriangle size={14}/> Immediate intervention required</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-medium text-gray-500">Average Risk Score</h3>
          <div className="text-4xl font-bold text-amber-500 mt-2">42 / 100</div>
          <p className="text-sm text-gray-400 mt-4">Across all active monitored sites</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-medium text-gray-500">Anomalies Detected (30d)</h3>
          <div className="text-4xl font-bold text-gray-900 mt-2">18</div>
          <p className="text-sm text-emerald-500 mt-4 flex items-center gap-1"><TrendingDown size={14}/> -12% vs last month</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Activity className="text-rose-500"/> Risk Assessment Matrix</h3>
        <div className="space-y-4">
          <div className="p-5 border-2 border-rose-100 bg-rose-50 rounded-xl flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-900 text-lg">Downtown Metro Station</h4>
                <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded">Risk Index: 89/100</span>
              </div>
              <p className="text-sm text-gray-600">Major deviation in load-bearing columns (Thermal Anomaly + LiDAR Deviation)</p>
            </div>
            <button className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-bold shadow-sm hover:bg-rose-100">
              Generate Risk Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
