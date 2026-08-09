"use client";

import React, { useState } from "react";
import { 
  BrainCircuit,
  AlertTriangle,
  Info,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  Eye,
  CheckSquare
} from "lucide-react";
import { motion } from "framer-motion";

export default function AIAnalysis() {
  const anomalies = [
    { id: "ANM-001", project: "Highway Bridge A4", type: "Structural Deviation", severity: "high", confidence: 94, status: "open", desc: "Pillar 3 exhibits a 4mm deviation from BIM model." },
    { id: "ANM-002", project: "Highway Bridge A4", type: "Missing Reinforcement", severity: "critical", confidence: 88, status: "open", desc: "Rebar mesh density lower than specification in Sector B." },
    { id: "ANM-003", project: "Downtown Metro", type: "Surface Spalling", severity: "medium", confidence: 76, status: "investigating", desc: "Potential concrete spalling detected on eastern wall." },
    { id: "ANM-004", project: "Riverside Complex", type: "Thermal Leak", severity: "low", confidence: 91, status: "resolved", desc: "HVAC duct showing anomalous heat signature." },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <BrainCircuit className="text-blue-600" size={32} />
            AI Analysis & Inference
          </h1>
          <p className="text-gray-500 mt-1">Review automated anomaly detections comparing As-Built scans to BIM models.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scans Processed</div>
            <div className="text-xl font-bold text-[#022C4F]">142</div>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Anomalies Found</div>
            <div className="text-xl font-bold text-red-600">18</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Anomaly List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Detected Issues</h2>
              <div className="flex gap-2">
                <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Filter size={16} /></button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" placeholder="Search issues..." className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm w-48" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {anomalies.map((anm, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={anm.id} 
                  className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white relative overflow-hidden group cursor-pointer"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    anm.severity === 'critical' ? 'bg-red-600' :
                    anm.severity === 'high' ? 'bg-orange-500' :
                    anm.severity === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                  }`}></div>
                  
                  <div className="flex justify-between items-start pl-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400">{anm.id}</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{anm.project}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{anm.type}</h3>
                      <p className="text-sm text-gray-600 mt-1">{anm.desc}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        anm.status === 'open' ? 'bg-red-100 text-red-700' :
                        anm.status === 'investigating' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {anm.status}
                      </span>
                      
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 mt-2">
                        <BrainCircuit size={12} className="text-blue-500" />
                        {anm.confidence}% Confidence
                      </div>
                    </div>
                  </div>
                  
                  <div className="pl-3 mt-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"><Eye size={14}/> View in 3D Viewer</button>
                    <button className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700"><CheckSquare size={14}/> Mark Resolved</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Model Metrics */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Model Performance</h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-600">Structural Deviation Model</span>
                  <span className="font-bold text-gray-900">v2.4.1</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "94%" }}></div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 w-8">94%</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-600">Thermal Anomaly Model</span>
                  <span className="font-bold text-gray-900">v1.1.0</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: "82%" }}></div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 w-8">82%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-600">Rebar Detection Model</span>
                  <span className="font-bold text-gray-900">v3.0.2</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "89%" }}></div>
                  </div>
                  <span className="text-xs font-bold text-purple-600 w-8">89%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#022C4F] to-[#044c8c] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Info size={20} className="text-blue-300" />
              <h3 className="font-bold text-lg">AI Feedback Loop</h3>
            </div>
            <p className="text-sm text-blue-100 mb-6 leading-relaxed">
              When you manually resolve or dismiss anomalies, the Digital Eye inference engine retrains in the background, improving precision for future scans.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="text-xs text-blue-200 mb-1">False Positives</div>
                <div className="text-xl font-bold flex items-center gap-2">
                  1.2% <TrendingDown size={16} className="text-emerald-400" />
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="text-xs text-blue-200 mb-1">True Positives</div>
                <div className="text-xl font-bold flex items-center gap-2">
                  98.1% <TrendingUp size={16} className="text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
